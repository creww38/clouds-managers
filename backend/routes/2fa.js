import express from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate 2FA secret
router.post('/setup', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `SecureCloud:${req.user.email}`
  });

  // Simpan secret ke database
  db.run(
    'UPDATE users SET two_factor_secret = ? WHERE id = ?',
    [secret.base32, userId],
    async (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to setup 2FA'
        });
      }

      // Generate QR Code
      try {
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
          success: true,
          secret: secret.base32,
          qrCode: qrCodeUrl,
          otpauthUrl: secret.otpauth_url
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Failed to generate QR code'
        });
      }
    }
  );
});

// Verify and enable 2FA
router.post('/verify', authenticateToken, (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  db.get('SELECT two_factor_secret FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user || !user.two_factor_secret) {
      return res.status(400).json({
        success: false,
        message: '2FA not setup'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      db.run('UPDATE users SET two_factor_enabled = 1 WHERE id = ?', [userId]);

      res.json({
        success: true,
        message: '2FA enabled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }
  });
});

// Verify 2FA during login
router.post('/login-verify', (req, res) => {
  const { email, token, tempToken } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.two_factor_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA not enabled'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (verified) {
      // Generate final JWT
      const finalToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({
        success: true,
        token: finalToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }
  });
});

// Disable 2FA
router.post('/disable', authenticateToken, (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  db.get('SELECT two_factor_secret FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user || !user.two_factor_secret) {
      return res.status(400).json({
        success: false,
        message: '2FA not setup'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      db.run(
        'UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?',
        [userId]
      );

      res.json({
        success: true,
        message: '2FA disabled'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }
  });
});

// Check 2FA status
router.get('/status', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get('SELECT two_factor_enabled FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      two_factor_enabled: user?.two_factor_enabled === 1
    });
  });
});

export default router;
