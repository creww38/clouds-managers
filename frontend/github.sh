
#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Create .gitignore Files - Cloud Storage
# Membuat .gitignore lengkap untuk GitHub
# ═══════════════════════════════════════════════════════════════

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[ℹ]${NC} $1"
}

print_header() {
    echo -e "\n${PURPLE}════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════${NC}\n"
}

PROJECT_DIR="cloud-storage"

print_header "📝 MEMBUAT .GITIGNORE FILES"

# ═══════════════════════════════════════
# 1. ROOT .gitignore
# ═══════════════════════════════════════
print_info "Membuat root .gitignore..."

cat > "$PROJECT_DIR/.gitignore" << 'EOF'
# ═══════════════════════════════════════
# ROOT .GITIGNORE
# ═══════════════════════════════════════

# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
dist/
build/
.vite/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*.local
!.env.example

# Database
*.db
*.db-journal
*.db-wal
*.db-shm
data/
backend/data/

# Uploads
uploads/
backend/uploads/
!uploads/.gitkeep
!backend/uploads/.gitkeep

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.project
.settings/
.classpath

# Cloudflare
.cloudflared/
*.pem
*.key
*.crt

# Temporary files
tmp/
temp/
*.tmp
*.temp

# Backup files
*.backup
*.bak
*.old

# Encryption keys (PENTING!)
encryption_key.txt
data/encryption_key.txt
*.key

# Vercel
.vercel/
vercel.json

# Testing
coverage/
.nyc_output/

# Misc
*.pid
*.seed
*.pid.lock
EOF

print_message "Root .gitignore dibuat"

# ═══════════════════════════════════════
# 2. BACKEND .gitignore
# ═══════════════════════════════════════
print_info "Membuat backend .gitignore..."

cat > "$PROJECT_DIR/backend/.gitignore" << 'EOF'
# ═══════════════════════════════════════
# BACKEND .GITIGNORE
# ═══════════════════════════════════════

# Dependencies
node_modules/
package-lock.json
npm-debug.log*

# Environment
.env
.env.local
.env.production
!.env.example

# Database
data/*.db
data/*.db-journal
data/*.db-wal
data/*.db-shm
data/
!data/.gitkeep

# Uploads
uploads/*
!uploads/.gitkeep
!uploads/temp/
!uploads/temp/.gitkeep
!uploads/thumbnails/
!uploads/thumbnails/.gitkeep

# Encryption keys (SANGAT PENTING!)
data/encryption_key.txt
encryption_key.txt
*.key
*.pem

# Logs
logs/*
!logs/.gitkeep
*.log

# Temporary files
tmp/
temp/
*.tmp

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp

# Backup
*.backup
*.bak
EOF

print_message "Backend .gitignore dibuat"

# ═══════════════════════════════════════
# 3. FRONTEND .gitignore
# ═══════════════════════════════════════
print_info "Membuat frontend .gitignore..."

cat > "$PROJECT_DIR/frontend/.gitignore" << 'EOF'
# ═══════════════════════════════════════
# FRONTEND .GITIGNORE
# ═══════════════════════════════════════

# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build
dist/
build/
.vite/
*.tsbuildinfo

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
!.env.example
!.env.production

# Vercel
.vercel/
.now/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp

# Testing
coverage/

# Misc
*.tmp
EOF

print_message "Frontend .gitignore dibuat"

# ═══════════════════════════════════════
# 4. BUAT .env.example
# ═══════════════════════════════════════
print_info "Membuat .env.example..."

cat > "$PROJECT_DIR/backend/.env.example" << 'EOF'
# ═══════════════════════════════════════
# BACKEND ENVIRONMENT VARIABLES
# Copy file ini ke .env dan isi nilainya
# ═══════════════════════════════════════

# Server
PORT=5000
NODE_ENV=development

# Database
DB_PATH=./data/cloud_storage.db

# Storage Mode: sqlite | googledrive | hybrid
STORAGE_MODE=sqlite

# JWT (GANTI DENGAN SECRET YANG AMAN!)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Encryption (GANTI DENGAN KEY YANG AMAN!)
ENCRYPTION_KEY=your_encryption_key_here

# Google Drive (Optional)
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GOOGLE_DRIVE_REFRESH_TOKEN=
GOOGLE_DRIVE_FOLDER_ID=

# Upload Limits
MAX_FILE_SIZE=104857600
MAX_STORAGE_QUOTA=5368709120

# CORS
FRONTEND_URL=http://localhost:5173

# 2FA (Optional)
TWO_FACTOR_ISSUER=SecureCloud
EOF

print_message "Backend .env.example dibuat"

cat > "$PROJECT_DIR/frontend/.env.example" << 'EOF'
# ═══════════════════════════════════════
# FRONTEND ENVIRONMENT VARIABLES
# Copy file ini ke .env dan isi nilainya
# ═══════════════════════════════════════

# API URL (untuk production)
VITE_API_URL=http://localhost:5000
EOF

print_message "Frontend .env.example dibuat"

# ═══════════════════════════════════════
# 5. BUAT .gitkeep untuk folder kosong
# ═══════════════════════════════════════
print_info "Membuat .gitkeep untuk folder kosong..."

# Backend
touch "$PROJECT_DIR/backend/data/.gitkeep" 2>/dev/null || {
    mkdir -p "$PROJECT_DIR/backend/data"
    touch "$PROJECT_DIR/backend/data/.gitkeep"
}
touch "$PROJECT_DIR/backend/uploads/.gitkeep" 2>/dev/null || {
    mkdir -p "$PROJECT_DIR/backend/uploads"
    touch "$PROJECT_DIR/backend/uploads/.gitkeep"
}
touch "$PROJECT_DIR/backend/uploads/temp/.gitkeep" 2>/dev/null || {
    mkdir -p "$PROJECT_DIR/backend/uploads/temp"
    touch "$PROJECT_DIR/backend/uploads/temp/.gitkeep"
}
touch "$PROJECT_DIR/backend/uploads/thumbnails/.gitkeep" 2>/dev/null || {
    mkdir -p "$PROJECT_DIR/backend/uploads/thumbnails"
    touch "$PROJECT_DIR/backend/uploads/thumbnails/.gitkeep"
}
touch "$PROJECT_DIR/backend/logs/.gitkeep" 2>/dev/null || {
    mkdir -p "$PROJECT_DIR/backend/logs"
    touch "$PROJECT_DIR/backend/logs/.gitkeep"
}

print_message ".gitkeep files dibuat"

# ═══════════════════════════════════════
# 6. BUAT README UNTUK GITHUB
# ═══════════════════════════════════════
print_info "Membuat README.md untuk GitHub..."

cat > "$PROJECT_DIR/README.md" << 'EOF'
# ☁️ SecureCloud - Encrypted Cloud Storage

A full-stack cloud storage application with:
- 🔐 **AES-256-GCM Encryption**
- 📦 **Automatic Compression** (Brotli/Gzip)
- 🔑 **Two-Factor Authentication**
- 📱 **Mobile-Friendly UI**
- 🗄️ **SQLite Database**
- ☁️ **Google Drive Integration** (Optional)

## ✨ Features

- User authentication with 2FA
- File upload with compression & encryption
- File preview (images, videos, PDF, text)
- Folder management
- File sharing with links
- Storage quota management
- Responsive design

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- SQLite
- JWT Authentication
- Speakeasy (2FA)
- Multer (File upload)
- zlib (Compression)

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Axios
- React Dropzone

## 📁 Project Structure

```
cloud-storage/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── App.jsx
    └── vite.config.js
```

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Edit .env dengan config kamu
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 Environment Variables

Copy `.env.example` to `.env` and fill in the values.

## 🔒 Security

- All files encrypted with AES-256-GCM
- Passwords hashed with bcrypt
- JWT for authentication
- 2FA support

## 📄 License

MIT
EOF

print_message "README.md dibuat"

# ═══════════════════════════════════════
# 7. INSTRUKSI GITHUB
# ═══════════════════════════════════════
print_header "📤 INSTRUKSI PUSH KE GITHUB"

cat << 'EOF'

1. Inisialisasi Git:
```bash
cd cloud-storage
git init
git add .
git commit -m "Initial commit: SecureCloud with 2FA and encryption"
```

2. Buat repository di GitHub:
   - Buka https://github.com
   - Klik "New repository"
   - Beri nama: cloud-storage
   - Jangan centang "Initialize with README"

3. Hubungkan ke GitHub:
```bash
git remote add origin https://github.com/USERNAME/cloud-storage.git
git branch -M main
git push -u origin main
```

4. Verifikasi:
```bash
git status
# Harusnya: "nothing to commit, working tree clean"
```

## ⚠️ PENTING!
Pastikan file ini TIDAK ter-push:
- .env (environment variables)
- encryption_key.txt
- *.db (database files)
- node_modules/
EOF

echo ""
print_header "✅ .GITIGNORE SELESAI DIBUAT!"
echo ""
echo -e "${GREEN}File yang di-ignore:${NC}"
echo -e "  • ${RED}.env${NC} - Environment variables (rahasia)"
echo -e "  • ${RED}encryption_key.txt${NC} - Encryption key (rahasia)"
echo -e "  • ${RED}*.db${NC} - Database files"
echo -e "  • ${RED}node_modules/${NC} - Dependencies"
echo -e "  • ${RED}uploads/${NC} - Uploaded files"
echo -e "  • ${RED}logs/${NC} - Log files"
echo ""
echo -e "${GREEN}File yang akan di-push:${NC}"
echo -e "  • ${CYAN}Source code${NC} (server.js, routes, components)"
echo -e "  • ${CYAN}.env.example${NC} (template, bukan rahasia)"
echo -e "  • ${CYAN}README.md${NC}"
echo -e "  • ${CYAN}package.json${NC}"
echo ""
