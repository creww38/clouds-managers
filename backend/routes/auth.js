import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    db.get('SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username],
      async (err, existingUser) => {
        if (err) throw err;

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Username or email already exists'
          });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        db.run(
          'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          [username, email, passwordHash],
          function(err) {
            if (err) {
              return res.status(500).json({
                success: false,
                message: 'Failed to create user'
              });
            }

            const token = jwt.sign(
              { userId: this.lastID },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            res.status(201).json({
              success: true,
              message: 'User created successfully',
              token,
              user: {
                id: this.lastID,
                username,
                email
              }
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login user
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) throw err;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Cek jika 2FA enabled
      if (user.two_factor_enabled === 1) {
        // Generate temporary token untuk 2FA
        const tempToken = jwt.sign(
          { userId: user.id, twoFactorRequired: true },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        );

        return res.json({
          success: true,
          two_factor_required: true,
          temp_token: tempToken,
          email: user.email
        });
      }

      // Generate final token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        two_factor_required: false,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          storage_quota: user.storage_quota,
          storage_used: user.storage_used
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;
