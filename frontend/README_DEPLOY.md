# Deploy ke Vercel

## Langkah 1: Deploy Backend
1. Deploy backend ke Railway/Render/Fly.io
2. Catat URL backend (contoh: https://backend-app.railway.app)

## Langkah 2: Update Frontend
1. Update `.env.production`:
   ```
   VITE_API_URL=https://backend-app.railway.app
   ```

2. Update `vercel.json`:
   ```json
   {
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "https://backend-app.railway.app/api/$1"
       }
     ]
   }
   ```

## Langkah 3: Deploy ke Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

## Atau via GitHub:
1. Push code ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy
