import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Create folder
router.post('/', authenticateToken, (req, res) => {
  const { name, parent_id } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Folder name is required'
    });
  }

  db.run(
    'INSERT INTO folders (user_id, name, parent_id) VALUES (?, ?, ?)',
    [userId, name, parent_id || null],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create folder'
        });
      }

      res.status(201).json({
        success: true,
        folder: {
          id: this.lastID,
          name,
          parent_id: parent_id || null
        }
      });
    }
  );
});

// Get all folders
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { parent_id } = req.query;

  let query = 'SELECT * FROM folders WHERE user_id = ?';
  const params = [userId];

  if (parent_id) {
    query += ' AND parent_id = ?';
    params.push(parent_id);
  } else {
    query += ' AND parent_id IS NULL';
  }

  db.all(query, params, (err, folders) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch folders'
      });
    }

    res.json({
      success: true,
      folders
    });
  });
});

// Delete folder
router.delete('/:id', authenticateToken, (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;

  db.run('DELETE FROM folders WHERE id = ? AND user_id = ?', [folderId, userId], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete folder'
      });
    }

    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });
  });
});

export default router;
