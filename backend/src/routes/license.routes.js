const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const blockchainService = require('../services/blockchain.service');

const router = express.Router();

/**
 * POST /api/license/purchase
 * License content — performs gasless transaction via account abstraction
 */
router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const { contentId } = req.body;

    if (!contentId) {
      return res.status(400).json({ error: 'Content ID is required' });
    }

    // Get content details
    const contentResult = await db.query(
      `SELECT c.*, u.wallet_address as creator_wallet
       FROM content c
       JOIN users u ON u.id = c.creator_id
       WHERE c.id = $1 AND c.status = 'REGISTERED'`,
      [contentId]
    );

    if (contentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found or not registered' });
    }

    const content = contentResult.rows[0];

    // Check if already licensed
    const existingLicense = await db.query(
      'SELECT id FROM licenses WHERE content_id = $1 AND licensee_id = $2',
      [contentId, req.user.id]
    );

    if (existingLicense.rows.length > 0) {
      return res.status(409).json({ error: 'Already licensed' });
    }

    // Execute on-chain license (simulated gasless via account abstraction)
    let txHash;
    try {
      txHash = await blockchainService.licenseTo(content.content_hash, content.price);
    } catch (err) {
      console.log('Blockchain license (simulated):', err.message);
      txHash = `0x${uuidv4().replace(/-/g, '')}${'0'.repeat(26)}`; // Simulated tx hash
    }

    // Record license in DB
    const licenseId = uuidv4();
    await db.query(
      `INSERT INTO licenses (id, content_id, licensee_id, price_paid, tx_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [licenseId, contentId, req.user.id, content.price, txHash]
    );

    // Record creator earnings
    await db.query(
      `INSERT INTO earnings (id, creator_id, content_id, amount, source, tx_hash)
       VALUES ($1, $2, $3, $4, 'license', $5)`,
      [uuidv4(), content.creator_id, contentId, content.price, txHash]
    );

    res.json({
      message: 'License granted successfully',
      license: {
        id: licenseId,
        contentId,
        txHash,
        price: content.price,
      },
    });
  } catch (err) {
    console.error('License error:', err);
    res.status(500).json({ error: 'Licensing failed' });
  }
});

/**
 * GET /api/license/my
 * Get user's licensed content
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, c.title, c.preview_url, c.ipfs_cid, c.content_type,
              u.name as creator_name
       FROM licenses l
       JOIN content c ON c.id = l.content_id
       JOIN users u ON u.id = c.creator_id
       WHERE l.licensee_id = $1
       ORDER BY l.granted_at DESC`,
      [req.user.id]
    );

    res.json({ licenses: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
});

module.exports = router;
