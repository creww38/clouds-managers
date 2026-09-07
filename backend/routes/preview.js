import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';
import { decryptData } from '../utils/encryption.js';
import { decompressFile } from '../utils/compression.js';

const router = express.Router();

// Preview file
router.get('/:id', authenticateToken, async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  console.log(`\n🔍 Preview request - File ID: ${fileId}`);

  db.get(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId],
    async (err, file) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!file) {
        console.log('❌ File not found');
        return res.status(404).json({ success: false, message: 'File not found' });
      }

      console.log('📄 File info:', {
        name: file.original_name,
        mime: file.mime_type,
        size: file.size,
        compression: file.compression_algorithm,
        dataLength: file.data?.length
      });

      try {
        // 1. Dekripsi
        console.log('🔓 Decrypting...');
        const decryptedData = decryptData(file.data);
        console.log(`   Decrypted: ${decryptedData.length} bytes`);

        // 2. Dekompresi (hanya jika perlu)
        let finalData = decryptedData;
        if (file.compression_algorithm && file.compression_algorithm !== 'none') {
          console.log(`📦 Decompressing (${file.compression_algorithm})...`);
          finalData = await decompressFile(decryptedData, file.compression_algorithm);
          console.log(`   Decompressed: ${finalData.length} bytes`);
        } else {
          console.log('📄 No decompression needed');
        }

        // 3. Verifikasi ukuran
        console.log(`✅ Final data: ${finalData.length} bytes (expected: ${file.size})`);

        // 4. Kirim response
        res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
        res.setHeader('Content-Length', finalData.length);
        res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
        res.setHeader('Cache-Control', 'no-cache');

        res.send(finalData);
        console.log('✅ Preview sent successfully\n');
      } catch (error) {
        console.error('❌ Preview error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to process file: ' + error.message
        });
      }
    }
  );
});

export default router;
