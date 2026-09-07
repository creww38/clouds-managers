import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth Header:', authHeader);
  console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT Error:', err.message);
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    console.log('Decoded userId:', decoded.userId);

    db.get(
      'SELECT id, username, email, storage_quota, storage_used FROM users WHERE id = ?',
      [decoded.userId],
      (error, user) => {
        if (error) {
          console.error('DB Error:', error);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        if (!user) {
          console.error('User not found for ID:', decoded.userId);
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        req.user = user;
        next();
      }
    );
  });
}
