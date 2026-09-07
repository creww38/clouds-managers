import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Key file untuk enkripsi (persisten)
const KEY_FILE = path.join(__dirname, '../data/encryption_key.txt');

// Generate atau load encryption key
function getEncryptionKey() {
  try {
    // Cek ENCRYPTION_KEY di .env dulu
    if (process.env.ENCRYPTION_KEY) {
      return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    }
    
    // Cek file key
    if (fs.existsSync(KEY_FILE)) {
      const keyHex = fs.readFileSync(KEY_FILE, 'utf8').trim();
      if (keyHex.length === 64) { // 32 bytes = 64 hex chars
        return Buffer.from(keyHex, 'hex');
      }
    }
    
    // Generate key baru
    const newKey = crypto.randomBytes(32);
    const keyHex = newKey.toString('hex');
    
    // Simpan ke file
    fs.mkdirSync(path.dirname(KEY_FILE), { recursive: true });
    fs.writeFileSync(KEY_FILE, keyHex);
    
    console.log('🔑 Encryption key baru dibuat dan disimpan');
    
    return newKey;
  } catch (error) {
    console.error('Error getting encryption key:', error);
    // Fallback ke JWT_SECRET
    const secret = process.env.JWT_SECRET || 'default_secret_key';
    return crypto.createHash('sha256').update(secret).digest();
  }
}

// Enkripsi data dengan AES-256-GCM
export function encryptData(data) {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // 12 bytes untuk GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Format: [IV(12 bytes)][AuthTag(16 bytes)][Encrypted Data]
    return Buffer.concat([iv, authTag, encrypted]);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Dekripsi data dengan AES-256-GCM
export function decryptData(encryptedData) {
  try {
    const key = getEncryptionKey();
    
    // Extract IV (12 bytes), AuthTag (16 bytes), dan Encrypted Data
    const iv = encryptedData.subarray(0, 12);
    const authTag = encryptedData.subarray(12, 28);
    const encrypted = encryptedData.subarray(28);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data - encryption key mismatch');
  }
}

// Hash file untuk verifikasi integritas
export function generateFileHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate random encryption key (untuk file sharing)
export function generateShareKey() {
  return crypto.randomBytes(32).toString('hex');
}
