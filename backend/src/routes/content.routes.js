const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─── Preview URL Resolver ─────────────────────────────────
// Converts relative /uploads/... paths to full URLs so frontend can load them.
function resolvePreviewUrls(rows, req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return rows.map(row => {
    if (row.preview_url && row.preview_url.startsWith('/uploads/')) {
      row.preview_url = `${baseUrl}${row.preview_url}`;
    }
    // Also set cover_url for frontend compatibility
    if (!row.cover_url && row.preview_url) {
      row.cover_url = row.preview_url;
    }
    return row;
  });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|flac|mp4|webm|mov|avi/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype.split('/')[1]);
    if (ext || mime) return cb(null, true);
    cb(new Error('Unsupported file type'));
  },
});

/**
 * POST /api/content/upload
 * Upload content + inline processing with duplicate detection
 */
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, price = '0' } = req.body;
    const file = req.file;

    if (!file || !title) {
      return res.status(400).json({ error: 'File and title are required' });
    }

    // Determine content type
    const mimeType = file.mimetype;
    let contentType = 'image';
    if (mimeType.startsWith('audio')) contentType = 'audio';
    if (mimeType.startsWith('video')) contentType = 'video';

    // ─── Fingerprint: SHA-256 hash of the file ───────────
    const crypto = require('crypto');
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(file.path);
    const fingerprint = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // ─── Duplicate Check: look for same fingerprint in DB ─
    const dupCheck = await db.query(
      'SELECT id, title, creator_id FROM content WHERE fingerprint_hash = $1 AND status != $2',
      [fingerprint, 'FAILED']
    );

    if (dupCheck.rows.length > 0) {
      // Clean up the uploaded file
      fs.unlinkSync(file.path);
      const existing = dupCheck.rows[0];
      return res.status(409).json({
        error: `Duplicate detected! This file matches "${existing.title}" already on the platform.`,
        existingContentId: existing.id,
      });
    }

    // ─── Insert & Register ───────────────────────────────
    const contentId = uuidv4();
    await db.query(
      `INSERT INTO content (id, creator_id, title, description, category, content_type, price,
        original_filename, file_size, mime_type, preview_url, fingerprint_hash, status, registered_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'REGISTERED', NOW())`,
      [
        contentId, req.user.id, title, description, category, contentType,
        parseFloat(price), file.originalname, file.size, mimeType,
        `/uploads/${file.filename}`, fingerprint,
      ]
    );

    // Also create a completed job record for tracking
    const jobId = uuidv4();
    await db.query(
      `INSERT INTO jobs (id, content_id, bull_job_id, status, progress)
       VALUES ($1, $2, $3, 'completed', 100)`,
      [jobId, contentId, jobId]
    );

    console.log(`✅ Content "${title}" registered (fingerprint: ${fingerprint.substring(0, 16)}...)`);

    res.status(201).json({
      message: 'Content uploaded and registered successfully',
      contentId,
      jobId,
      status: 'REGISTERED',
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * GET /api/content/status/:jobId
 * Poll job processing status
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT j.status as job_status, j.progress, j.error,
              c.status as content_status, c.ipfs_cid, c.tx_hash, c.certificate_url,
              c.fingerprint_hash, c.rejection_reason
       FROM jobs j
       JOIN content c ON c.id = j.content_id
       WHERE j.id = $1`,
      [req.params.jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

/**
 * GET /api/content
 * List marketplace content (Web2 speed — reads from PostgreSQL)
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, sort = 'newest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT c.id, c.title, c.description, c.category, c.content_type, c.price,
             c.currency, c.preview_url, c.ipfs_cid, c.status, c.created_at,
             u.name as creator_name, u.wallet_address as creator_wallet,
             (SELECT COUNT(*) FROM licenses WHERE content_id = c.id) as license_count
      FROM content c
      JOIN users u ON u.id = c.creator_id
      WHERE c.status = 'REGISTERED'
    `;

    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND c.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Sorting
    switch (sort) {
      case 'popular': query += ` ORDER BY license_count DESC`; break;
      case 'price_low': query += ` ORDER BY c.price ASC`; break;
      case 'price_high': query += ` ORDER BY c.price DESC`; break;
      default: query += ` ORDER BY c.created_at DESC`;
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM content WHERE status = 'REGISTERED'${category ? ` AND category = '${category}'` : ''}`
    );

    res.json({
      content: resolvePreviewUrls(result.rows, req),
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countResult.rows[0].count / parseInt(limit)),
    });
  } catch (err) {
    console.error('Marketplace error:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * GET /api/content/creator/mine
 * Get creator's own content
 */
router.get('/creator/mine', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM licenses WHERE content_id = c.id) as license_count,
              (SELECT COALESCE(SUM(e.amount), 0) FROM earnings e WHERE e.content_id = c.id) as total_earnings
       FROM content c
       WHERE c.creator_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.json({ content: resolvePreviewUrls(result.rows, req) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * GET /api/content/:id
 * Get single content details
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, u.name as creator_name, u.wallet_address as creator_wallet,
              (SELECT COUNT(*) FROM licenses WHERE content_id = c.id) as license_count,
              (SELECT MAX(granted_at) FROM licenses WHERE content_id = c.id) as last_purchased_at
       FROM content c
       JOIN users u ON u.id = c.creator_id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ content: resolvePreviewUrls(result.rows, req)[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * DELETE /api/content/:id
 * Delete a piece of content (only creator)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Verify ownership
    const contentCheck = await db.query(
      'SELECT creator_id FROM content WHERE id = $1',
      [req.params.id]
    );

    if (contentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (contentCheck.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this content' });
    }

    // Delete content (cascade deletes licenses/earnings if setup, otherwise manual cleanup may be needed based on schema)
    // Soft delete: Update status to 'DELETED' so it's removed from marketplace but retained in history
    await db.query('UPDATE content SET status = $1 WHERE id = $2', ['DELETED', req.params.id]);

    res.json({ message: 'Content deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

module.exports = router;
// Triggering nodemon restart to clear cached PostgreSQL enum definitions
