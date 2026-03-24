const express = require('express');
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const merkleService = require('../services/merkle.service');

const router = express.Router();

/**
 * GET /api/royalty/earnings
 * Get creator's earnings summary
 */
router.get('/earnings', authMiddleware, async (req, res) => {
  try {
    // Total earnings
    const totalResult = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM earnings WHERE creator_id = $1',
      [req.user.id]
    );

    // Earnings by content
    const byContentResult = await db.query(
      `SELECT c.title, c.id as content_id, COALESCE(SUM(e.amount), 0) as earned,
              COUNT(e.id) as license_count
       FROM content c
       LEFT JOIN earnings e ON e.content_id = c.id
       WHERE c.creator_id = $1
       GROUP BY c.id, c.title
       ORDER BY earned DESC`,
      [req.user.id]
    );

    // Recent earnings (last 30 days, raw events)
    const recentResult = await db.query(
      `SELECT created_at as timestamp, amount, source as type
       FROM earnings
       WHERE creator_id = $1 AND created_at > NOW() - INTERVAL '30 days'
       ORDER BY created_at ASC`,
      [req.user.id]
    );

    // Total claimed
    const claimedResult = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total_claimed
       FROM royalty_claims
       WHERE user_id = $1 AND status = 'claimed'`,
      [req.user.id]
    );

    // Auto-generate Merkle tree for all creators so we can provide a valid proof to the client
    const allEarnings = await db.query(
      `SELECT u.wallet_address, COALESCE(SUM(e.amount), 0) as total_earned
       FROM users u
       JOIN earnings e ON e.creator_id = u.id
       GROUP BY u.wallet_address
       HAVING SUM(e.amount) > 0`
    );
    let proof = [];
    if (allEarnings.rows.length > 0) {
      await merkleService.generateMerkleRoot(allEarnings.rows);
      const proofObj = merkleService.getProof(req.user.walletAddress);
      if (proofObj) proof = proofObj.proof;
    }

    res.json({
      totalEarnings: parseFloat(totalResult.rows[0].total),
      totalClaimed: parseFloat(claimedResult.rows[0].total_claimed),
      unclaimed: parseFloat(totalResult.rows[0].total) - parseFloat(claimedResult.rows[0].total_claimed),
      byContent: byContentResult.rows,
      transactions: recentResult.rows,
      proof,
    });
  } catch (err) {
    console.error('Earnings error:', err);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

/**
 * POST /api/royalty/generate-root
 * Generate Merkle root from aggregated earnings (admin only)
 */
router.post('/generate-root', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    // Aggregate all creator earnings
    const earningsResult = await db.query(
      `SELECT u.wallet_address, COALESCE(SUM(e.amount), 0) as total_earned
       FROM users u
       JOIN earnings e ON e.creator_id = u.id
       GROUP BY u.wallet_address
       HAVING SUM(e.amount) > 0`
    );

    if (earningsResult.rows.length === 0) {
      return res.status(400).json({ error: 'No earnings to distribute' });
    }

    // Build Merkle tree
    const { root, proofs, epoch } = await merkleService.generateMerkleRoot(earningsResult.rows);

    res.json({
      merkleRoot: root,
      epoch,
      totalCreators: earningsResult.rows.length,
      proofs, // In production, store these securely
    });
  } catch (err) {
    console.error('Merkle root error:', err);
    res.status(500).json({ error: 'Failed to generate Merkle root' });
  }
});

/**
 * POST /api/royalty/claim
 * Claim royalties with Merkle proof
 */
router.post('/claim', authMiddleware, async (req, res) => {
  try {
    const { amount, proof } = req.body;

    if (!amount || !proof) {
      return res.status(400).json({ error: 'Amount and proof are required' });
    }

    // Verify and execute claim (simulated on-chain)
    const claimResult = await merkleService.verifyClaim(
      req.user.walletAddress,
      amount,
      proof
    );

    if (!claimResult.valid) {
      return res.status(400).json({ error: 'Invalid proof' });
    }

    // Record claim in DB
    const { v4: uuidv4 } = require('uuid');
    await db.query(
      `INSERT INTO royalty_claims (id, user_id, amount, epoch, merkle_proof, status, claimed_at)
       VALUES ($1, $2, $3, $4, $5, 'claimed', NOW())`,
      [uuidv4(), req.user.id, amount, claimResult.epoch, JSON.stringify(proof)]
    );

    res.json({
      message: 'Royalty claimed successfully',
      amount,
      txHash: claimResult.txHash,
    });
  } catch (err) {
    console.error('Claim error:', err);
    res.status(500).json({ error: 'Claim failed' });
  }
});

module.exports = router;
