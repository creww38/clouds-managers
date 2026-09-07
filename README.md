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
