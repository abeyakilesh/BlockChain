const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { generateToken } = require('../middleware/auth');
const { ethers } = require('ethers');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with invisible wallet creation (ERC-4337 simulation)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, name, role = 'creator' } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Generate embedded wallet (simulates ERC-4337 account abstraction)
    // In production, use Privy/Magic SDK to create an AA wallet
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;

    const result = await db.query(
      `INSERT INTO users (id, email, name, wallet_address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, wallet_address, role, created_at`,
      [uuidv4(), email, name, walletAddress, role]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        walletAddress: user.wallet_address,
        role: user.role,
      },
      token,
      message: 'Account created with embedded wallet',
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login or auto-register — seamless auth (no "user not found" errors)
 */
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let result = await db.query(
      'SELECT id, email, name, wallet_address, role FROM users WHERE email = $1',
      [email]
    );

    // Auto-register if user doesn't exist
    if (result.rows.length === 0) {
      const wallet = ethers.Wallet.createRandom();
      const walletAddress = wallet.address;
      const name = email.split('@')[0]; // Use email prefix as default name

      result = await db.query(
        `INSERT INTO users (id, email, name, wallet_address, role)
         VALUES ($1, $2, $3, $4, 'creator')
         RETURNING id, email, name, wallet_address, role`,
        [uuidv4(), email, name, walletAddress]
      );
    }

    const user = result.rows[0];
    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        walletAddress: user.wallet_address,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', require('../middleware/auth').authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, wallet_address, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
