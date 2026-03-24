const { Worker } = require('bullmq');
const db = require('../config/db');
const { redisConnection } = require('../config/queue');
const blockchainService = require('../services/blockchain.service');
const ipfsService = require('../services/ipfs.service');
const certificateService = require('../services/certificate.service');
const crypto = require('crypto');
const fs = require('fs');

// Initialize blockchain service
blockchainService.init();

/**
 * Content Processing Worker
 * Handles the async pipeline: Fingerprint → IPFS → Blockchain → Certificate
 */
const worker = new Worker('content-processing', async (job) => {
  const { contentId, filePath, fileName, mimeType, contentType, creatorId, creatorWallet } = job.data;

  console.log(`\n🔄 Processing content: ${contentId}`);

  try {
    // ─── Step 1: AI Fingerprinting ─────────────────────────
    await updateStatus(contentId, 'FINGERPRINTING', 10);
    job.updateProgress(10);

    let fingerprint;
    try {
      // Call AI service
      const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('content_type', contentType);

      const response = await fetch(`${aiUrl}/fingerprint`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        fingerprint = data.fingerprint;
      } else {
        throw new Error('AI service unavailable');
      }
    } catch (err) {
      // Fallback: local hash-based fingerprint
      console.log('⚠️  AI service unavailable, using local fingerprint');
      const fileBuffer = fs.readFileSync(filePath);
      fingerprint = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    }

    console.log(`   ✅ Fingerprint: ${fingerprint.substring(0, 20)}...`);

    // ─── Step 2: Similarity Check ──────────────────────────
    await updateStatus(contentId, 'PROCESSING', 25);
    job.updateProgress(25);

    let isDuplicate = false;
    try {
      const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
      const compareResponse = await fetch(`${aiUrl}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint, content_type: contentType }),
      });

      if (compareResponse.ok) {
        const compareData = await compareResponse.json();
        isDuplicate = compareData.is_duplicate;
        if (isDuplicate) {
          await updateStatus(contentId, 'REJECTED', 100);
          await db.query(
            'UPDATE content SET rejection_reason = $1, similarity_score = $2 WHERE id = $3',
            [`Duplicate of: ${compareData.match_id}`, compareData.similarity, contentId]
          );
          return { status: 'rejected', reason: 'duplicate' };
        }
      }
    } catch (err) {
      console.log('⚠️  Similarity check skipped (AI service unavailable)');
    }

    // Store fingerprint
    await db.query(
      'UPDATE content SET fingerprint_hash = $1 WHERE id = $2',
      [fingerprint, contentId]
    );

    // ─── Step 3: Upload to IPFS ────────────────────────────
    await updateStatus(contentId, 'UPLOADING_IPFS', 40);
    job.updateProgress(40);

    const ipfsResult = await ipfsService.uploadFile(filePath);
    console.log(`   ✅ IPFS CID: ${ipfsResult.cid}`);

    await db.query(
      'UPDATE content SET ipfs_cid = $1, ipfs_url = $2 WHERE id = $3',
      [ipfsResult.cid, ipfsResult.localUrl || ipfsResult.url, contentId]
    );

    // ─── Step 4: Register on Blockchain ────────────────────
    await updateStatus(contentId, 'REGISTERING_BLOCKCHAIN', 60);
    job.updateProgress(60);

    const contentHash = blockchainService.generateContentHash(ipfsResult.cid);
    const fingerprintHashBytes = blockchainService.generateFingerprintHash(fingerprint);
    const termsURI = `ipfs://${ipfsResult.cid}/terms`;

    const blockchainResult = await blockchainService.registerRights(
      contentHash, fingerprintHashBytes, termsURI, 1000
    );
    console.log(`   ✅ TX Hash: ${blockchainResult.txHash.substring(0, 20)}...`);

    await db.query(
      'UPDATE content SET content_hash = $1, tx_hash = $2, block_number = $3 WHERE id = $4',
      [contentHash, blockchainResult.txHash, blockchainResult.blockNumber, contentId]
    );

    // ─── Step 5: Generate Certificate ──────────────────────
    job.updateProgress(80);

    // Get creator info
    const creatorResult = await db.query(
      'SELECT name FROM users WHERE id = $1',
      [creatorId]
    );
    const contentResult = await db.query(
      'SELECT title FROM content WHERE id = $1',
      [contentId]
    );

    const cert = await certificateService.generateCertificate({
      title: contentResult.rows[0]?.title || 'Untitled',
      creatorName: creatorResult.rows[0]?.name || 'Unknown',
      creatorWallet: creatorWallet,
      timestamp: new Date().toISOString(),
      ipfsCid: ipfsResult.cid,
      fingerprintHash: fingerprint,
      txHash: blockchainResult.txHash,
      blockNumber: blockchainResult.blockNumber,
    });
    console.log(`   ✅ Certificate: ${cert.fileName}`);

    // Upload certificate to IPFS too
    const certIpfs = await ipfsService.uploadFile(cert.filePath);

    await db.query(
      'UPDATE content SET certificate_cid = $1, certificate_url = $2 WHERE id = $3',
      [certIpfs.cid, cert.url, contentId]
    );

    // ─── Step 6: Mark as Registered ────────────────────────
    await updateStatus(contentId, 'REGISTERED', 100);
    job.updateProgress(100);

    // Store fingerprint in AI service for future comparisons
    try {
      const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
      await fetch(`${aiUrl}/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId,
          fingerprint,
          content_type: contentType,
        }),
      });
    } catch (err) {
      console.log('⚠️  Fingerprint storage in AI service skipped');
    }

    console.log(`   🎉 Content ${contentId} fully registered!\n`);

    return {
      status: 'registered',
      contentId,
      ipfsCid: ipfsResult.cid,
      txHash: blockchainResult.txHash,
      certificateUrl: cert.url,
    };

  } catch (err) {
    console.error(`   ❌ Processing failed: ${err.message}`);
    await updateStatus(contentId, 'FAILED', 0);
    throw err;
  }
}, {
  connection: redisConnection,
  concurrency: 3,
  limiter: { max: 10, duration: 60000 },
});

/**
 * Update content status in database
 */
async function updateStatus(contentId, status, progress) {
  await db.query(
    `UPDATE content SET status = $1, updated_at = NOW()${status === 'REGISTERED' ? ', registered_at = NOW()' : ''} WHERE id = $2`,
    [status, contentId]
  );
  await db.query(
    `UPDATE jobs SET status = $1, progress = $2, updated_at = NOW() WHERE content_id = $3`,
    [status.toLowerCase(), progress, contentId]
  );
}

// Worker event listeners
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('🔧 Content processing worker started');

module.exports = worker;
