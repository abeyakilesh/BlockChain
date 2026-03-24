const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../../uploads/detect'),
  limits: { fileSize: 100 * 1024 * 1024 },
});

/**
 * POST /api/detect
 * Upload external content for fingerprint comparison
 * Returns ownership match if found
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Call AI service for fingerprinting
    let fingerprint;
    try {
      const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
      const FormData = require('form-data');
      const fs = require('fs');
      const fetch = require('node-fetch') || global.fetch;

      // For prototype: generate simulated fingerprint
      const crypto = require('crypto');
      fingerprint = crypto.createHash('sha256').update(fs.readFileSync(file.path)).digest('hex');
    } catch (err) {
      // Fallback: hash-based fingerprint
      const crypto = require('crypto');
      const fs = require('fs');
      fingerprint = crypto.createHash('sha256').update(fs.readFileSync(file.path)).digest('hex');
    }

    // Search for matches in database
    const result = await db.query(
      `SELECT c.id, c.title, c.creator_id, c.fingerprint_hash, c.preview_url,
              c.ipfs_cid, c.tx_hash, c.registered_at,
              u.name as creator_name, u.wallet_address as creator_wallet
       FROM content c
       JOIN users u ON u.id = c.creator_id
       WHERE c.fingerprint_hash IS NOT NULL AND c.status = 'REGISTERED'`
    );

    // Compare fingerprints (simplified — in production use vector similarity)
    const matches = result.rows.map(row => ({
      ...row,
      similarity: row.fingerprint_hash === fingerprint ? 1.0 :
        computeSimpleSimilarity(fingerprint, row.fingerprint_hash),
    })).filter(m => m.similarity > 0.7).sort((a, b) => b.similarity - a.similarity);

    // Clean up temp file
    const fs = require('fs');
    fs.unlink(file.path, () => {});

    res.json({
      query_fingerprint: fingerprint.substring(0, 16) + '...',
      matches: matches.map(m => ({
        contentId: m.id,
        title: m.title,
        creator: m.creator_name,
        creatorWallet: m.creator_wallet,
        similarity: m.similarity,
        registeredAt: m.registered_at,
        txHash: m.tx_hash,
        ipfsCid: m.ipfs_cid,
      })),
      matchFound: matches.length > 0,
    });
  } catch (err) {
    console.error('Detection error:', err);
    res.status(500).json({ error: 'Detection failed' });
  }
});

/**
 * Simple hash similarity (Hamming-like distance on hex strings)
 */
function computeSimpleSimilarity(hash1, hash2) {
  if (!hash1 || !hash2) return 0;
  const minLen = Math.min(hash1.length, hash2.length);
  let matching = 0;
  for (let i = 0; i < minLen; i++) {
    if (hash1[i] === hash2[i]) matching++;
  }
  return matching / minLen;
}

module.exports = router;
