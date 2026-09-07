import db from '../config/database.js';

console.log('🔄 Updating database schema...');

db.serialize(() => {
  // Tambah kolom untuk kompresi dan enkripsi
  db.run(`
    ALTER TABLE files ADD COLUMN compression_algorithm TEXT DEFAULT 'none'
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('ℹ️ Column compression_algorithm already exists or cannot be added');
    } else {
      console.log('✅ Added compression_algorithm column');
    }
  });

  db.run(`
    ALTER TABLE files ADD COLUMN encryption_iv TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('ℹ️ Column encryption_iv already exists or cannot be added');
    } else {
      console.log('✅ Added encryption_iv column');
    }
  });

  db.run(`
    ALTER TABLE files ADD COLUMN encryption_auth_tag TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('ℹ️ Column encryption_auth_tag already exists or cannot be added');
    } else {
      console.log('✅ Added encryption_auth_tag column');
    }
  });

  db.run(`
    ALTER TABLE files ADD COLUMN file_hash TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('ℹ️ Column file_hash already exists or cannot be added');
    } else {
      console.log('✅ Added file_hash column');
    }
  });

  db.run(`
    ALTER TABLE files ADD COLUMN compressed_size INTEGER DEFAULT 0
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('ℹ️ Column compressed_size already exists or cannot be added');
    } else {
      console.log('✅ Added compressed_size column');
    }
  });

  db.run(`
    ALTER TABLE files ADD COLUMN compression_ratio REAL DEFAULT 0
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('ℹ️ Column compression_ratio already exists or cannot be added');
    } else {
      console.log('✅ Added compression_ratio column');
    }
  });
});

console.log('✅ Database schema update complete');
process.exit(0);
