import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import db from '../config/database.js';
import { compressFile, decompressFile, selectCompressionAlgorithm, shouldCompress } from '../utils/compression.js';
import { encryptData, decryptData, generateFileHash } from '../utils/encryption.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Upload file dengan kompresi dan enkripsi
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { folder_id } = req.body;
    const userId = req.user.id;

    const originalSize = req.file.size;
    if (req.user.storage_used + originalSize > req.user.storage_quota) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Storage quota exceeded'
      });
    }

    // Baca file dari temp
    const fileBuffer = fs.readFileSync(req.file.path);
    
    // 1. KOMPRESI FILE
    console.log(`📦 Compressing ${req.file.originalname}...`);
    const compressionAlgorithm = selectCompressionAlgorithm(req.file.mimetype);
    const compressed = await compressFile(fileBuffer, compressionAlgorithm);
    console.log(`   Original: ${compressed.originalSize} bytes`);
    console.log(`   Compressed: ${compressed.compressedSize} bytes`);
    console.log(`   Ratio: ${compressed.compressionRatio}% saved`);
    console.log(`   Algorithm: ${compressed.algorithm}`);

    // 2. ENKRIPSI FILE
    console.log(`🔐 Encrypting ${req.file.originalname}...`);
    const encryptedData = encryptData(compressed.data);
    console.log(`   Encrypted size: ${encryptedData.length} bytes`);

    // 3. Generate file hash untuk verifikasi
    const fileHash = generateFileHash(fileBuffer);
    
    // Generate unique name dan share token
    const uniqueName = uuidv4() + path.extname(req.file.originalname);
    const shareToken = uuidv4();

    // Simpan ke SQLite
    db.run(
      `INSERT INTO files (
        user_id, folder_id, name, original_name, mime_type, 
        size, data, share_token, 
        compression_algorithm, compressed_size, compression_ratio,
        file_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        folder_id || null, 
        uniqueName, 
        req.file.originalname, 
        req.file.mimetype, 
        originalSize, 
        encryptedData, 
        shareToken,
        compressed.algorithm,
        compressed.compressedSize,
        compressed.compressionRatio,
        fileHash
      ],
      function(err) {
        // Delete temp file
        fs.unlinkSync(req.file.path);

        if (err) {
          console.error('Database insert error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to save file to database'
          });
        }

        // Update storage used
        db.run('UPDATE users SET storage_used = storage_used + ? WHERE id = ?', [originalSize, userId]);

        res.status(201).json({
          success: true,
          message: 'File uploaded, compressed, and encrypted successfully',
          file: {
            id: this.lastID,
            name: req.file.originalname,
            size: originalSize,
            compressed_size: compressed.compressedSize,
            compression_ratio: compressed.compressionRatio,
            compression_algorithm: compressed.algorithm,
            mime_type: req.file.mimetype,
            share_token: shareToken,
            file_hash: fileHash,
            created_at: new Date().toISOString()
          }
        });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
});

// Get all files (tanpa data blob)
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { folder_id, search } = req.query;

  let query = `
    SELECT id, user_id, folder_id, name, original_name, mime_type, 
           size, compressed_size, compression_ratio, compression_algorithm,
           is_public, share_token, download_count, file_hash,
           created_at, updated_at
    FROM files WHERE user_id = ?
  `;
  const params = [userId];

  if (folder_id) {
    query += ' AND folder_id = ?';
    params.push(folder_id);
  } else {
    query += ' AND folder_id IS NULL';
  }

  if (search) {
    query += ' AND original_name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch files'
      });
    }

    res.json({
      success: true,
      files
    });
  });
});

// Download file (dengan dekripsi dan dekompresi)
router.get('/download/:id', authenticateToken, async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  db.get(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId],
    async (err, file) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      try {
        console.log(`🔓 Decrypting ${file.original_name}...`);
        // 1. DEKRIPSI
        const decryptedData = decryptData(file.data);
        
        console.log(`📦 Decompressing ${file.original_name}...`);
        // 2. DEKOMPRESI
        const decompressedData = await decompressFile(decryptedData, file.compression_algorithm);

        // 3. Verifikasi hash
        const verifyHash = generateFileHash(decompressedData);
        if (verifyHash !== file.file_hash) {
          console.error('File integrity check failed!');
        }

        // Update download count
        db.run('UPDATE files SET download_count = download_count + 1 WHERE id = ?', [fileId]);

        res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
        res.setHeader('Content-Length', file.size);
        res.send(decompressedData);
      } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to decrypt/decompress file'
        });
      }
    }
  );
});

// Preview file (inline)
router.get('/preview/:id', authenticateToken, async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  db.get(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId],
    async (err, file) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      try {
        // Dekripsi dan dekompresi
        const decryptedData = decryptData(file.data);
        const decompressedData = await decompressFile(decryptedData, file.compression_algorithm);

        res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
        res.send(decompressedData);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Failed to preview file'
        });
      }
    }
  );
});

// Delete file
router.delete('/:id', authenticateToken, (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  db.get(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId],
    (err, file) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      db.run('DELETE FROM files WHERE id = ?', [fileId], (deleteErr) => {
        if (deleteErr) {
          return res.status(500).json({
            success: false,
            message: 'Failed to delete file'
          });
        }

        db.run('UPDATE users SET storage_used = storage_used - ? WHERE id = ?', [file.size, userId]);

        res.json({
          success: true,
          message: 'File deleted successfully'
        });
      });
    }
  );
});

// Get file stats (kompresi info)
router.get('/stats/:id', authenticateToken, (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  db.get(
    `SELECT id, original_name, size, compressed_size, compression_ratio, 
            compression_algorithm, file_hash, download_count, created_at
     FROM files WHERE id = ? AND user_id = ?`,
    [fileId, userId],
    (err, file) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        stats: file
      });
    }
  );
});

// Share file
router.post('/:id/share', authenticateToken, (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  db.get('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, userId], (err, file) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const shareToken = uuidv4();
    
    db.run(
      'INSERT INTO shares (file_id, token) VALUES (?, ?)',
      [fileId, shareToken],
      function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Failed to share file'
          });
        }

        res.json({
          success: true,
          share_url: `/api/files/shared/${shareToken}`,
          share_token: shareToken
        });
      }
    );
  });
});

// Get shared file metadata (public)
router.get('/shared/:token', (req, res) => {
  const token = req.params.token;

  db.get(`
    SELECT f.id, f.original_name, f.mime_type, f.size, f.compressed_size,
           f.compression_ratio, s.expires_at 
    FROM shares s 
    JOIN files f ON s.file_id = f.id 
    WHERE s.token = ?
  `, [token], (err, file) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Shared file not found'
      });
    }

    if (file.expires_at && new Date(file.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Share link has expired'
      });
    }

    res.json({
      success: true,
      file: {
        id: file.id,
        name: file.original_name,
        mime_type: file.mime_type,
        size: file.size,
        compressed_size: file.compressed_size,
        compression_ratio: file.compression_ratio
      }
    });
  });
});

// Download shared file (public) - dengan dekripsi
router.get('/shared/:token/download', async (req, res) => {
  const token = req.params.token;

  db.get(`
    SELECT f.*, s.expires_at 
    FROM shares s 
    JOIN files f ON s.file_id = f.id 
    WHERE s.token = ?
  `, [token], async (err, file) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Shared file not found'
      });
    }

    try {
      // Dekripsi dan dekompresi
      const decryptedData = decryptData(file.data);
      const decompressedData = await decompressFile(decryptedData, file.compression_algorithm);

      res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
      res.send(decompressedData);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to process shared file'
      });
    }
  });
});

export default router;
