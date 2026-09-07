import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);
const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

// Daftar MIME types yang TIDAK BOLEH dikompres
const NO_COMPRESSION_TYPES = [
  // Gambar (sudah terkompresi)
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/svg+xml', // SVG bisa dikompres tapi biarkan tidak untuk simplicity
  'image/x-icon',

  // Video (sudah terkompresi)
  'video/mp4',
  'video/webm',
  'video/avi',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',

  // Audio (sudah terkompresi)
  'audio/mpeg',
  'audio/mp3',
  'audio/wav', // WAV tidak terkompresi tapi biarkan
  'audio/mp4',
  'audio/aac',
  'audio/ogg',
  'audio/flac',

  // Arsip (sudah terkompresi)
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/gzip',
  'application/x-7z-compressed',
  'application/x-tar',

  // File terkompresi lainnya
  'application/vnd.rar',
  'application/x-bzip2',
  'application/x-xz',
];

// Daftar MIME types yang BOLEH dikompres
const COMPRESSIBLE_TYPES = [
  // Text
  'text/plain',
  'text/html',
  'text/css',
  'text/csv',
  'text/javascript',
  'text/xml',
  'text/markdown',

  // Dokumen
  'application/json',
  'application/xml',
  'application/javascript',
  'application/pdf', // PDF bisa dikompres tapi hati-hati
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Source code
  'application/x-httpd-php',
  'application/x-python-code',
  'application/x-java-source',
];

// Fungsi untuk mengecek apakah file harus dikompres
export function shouldCompress(mimeType) {
  // Jika MIME type tidak ada, jangan kompres
  if (!mimeType) return false;

  // Cek apakah file dalam daftar NO_COMPRESSION
  for (const type of NO_COMPRESSION_TYPES) {
    if (mimeType.toLowerCase().startsWith(type.toLowerCase())) {
      console.log(`📄 ${mimeType} - Skip kompresi (sudah terkompresi)`);
      return false;
    }
  }

  // Cek apakah file dalam daftar COMPRESSIBLE
  for (const type of COMPRESSIBLE_TYPES) {
    if (mimeType.toLowerCase().startsWith(type.toLowerCase())) {
      console.log(`📄 ${mimeType} - Bisa dikompres`);
      return true;
    }
  }

  // Default: jangan kompres jika tidak yakin
  console.log(`📄 ${mimeType} - Skip kompresi (tidak dikenal)`);
  return false;
}

// Pilih algoritma kompresi terbaik
export function selectCompressionAlgorithm(mimeType) {
  if (!shouldCompress(mimeType)) {
    return 'none';
  }

  // Untuk text/JSON/XML, gunakan brotli (rasio terbaik)
  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/xml' ||
    mimeType === 'application/javascript'
  ) {
    return 'brotli';
  }

  // Untuk PDF dan dokumen, gunakan gzip
  if (mimeType === 'application/pdf' || mimeType.includes('document')) {
    return 'gzip';
  }

  // Default gzip
  return 'gzip';
}

// Kompresi file
export async function compressFile(buffer, algorithm = 'none') {
  // Jika algorithm none, return original
  if (algorithm === 'none') {
    return {
      data: buffer,
      originalSize: buffer.length,
      compressedSize: buffer.length,
      compressionRatio: 0,
      algorithm: 'none'
    };
  }

  try {
    const originalSize = buffer.length;
    let compressedBuffer;
    let compressionRatio;

    switch (algorithm) {
      case 'gzip':
        compressedBuffer = await gzip(buffer, { level: 9 });
        break;
      case 'deflate':
        compressedBuffer = await deflate(buffer, { level: 9 });
        break;
      case 'brotli':
        compressedBuffer = await brotliCompress(buffer, {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
            [zlib.constants.BROTLI_PARAM_SIZE_HINT]: originalSize
          }
        });
        break;
      default:
        return {
          data: buffer,
          originalSize,
          compressedSize: buffer.length,
          compressionRatio: 0,
          algorithm: 'none'
        };
    }

    // Jika kompresi tidak menghemat space, gunakan original
    if (compressedBuffer.length >= originalSize) {
      console.log('⚠️  Kompresi tidak efektif, gunakan original');
      return {
        data: buffer,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 0,
        algorithm: 'none'
      };
    }

    compressionRatio = ((1 - compressedBuffer.length / originalSize) * 100).toFixed(2);

    return {
      data: compressedBuffer,
      originalSize,
      compressedSize: compressedBuffer.length,
      compressionRatio: parseFloat(compressionRatio),
      algorithm
    };
  } catch (error) {
    console.error('Compression error:', error);
    return {
      data: buffer,
      originalSize: buffer.length,
      compressedSize: buffer.length,
      compressionRatio: 0,
      algorithm: 'none'
    };
  }
}

// Dekompresi file
export async function decompressFile(buffer, algorithm = 'none') {
  // Jika algorithm none, return original
  if (algorithm === 'none') {
    return buffer;
  }

  try {
    let decompressedBuffer;

    switch (algorithm) {
      case 'gzip':
        decompressedBuffer = await gunzip(buffer);
        break;
      case 'deflate':
        decompressedBuffer = await inflate(buffer);
        break;
      case 'brotli':
        decompressedBuffer = await brotliDecompress(buffer);
        break;
      default:
        return buffer;
    }

    return decompressedBuffer;
  } catch (error) {
    console.error('Decompression error:', error);
    return buffer; // Return original jika gagal dekompresi
  }
}
