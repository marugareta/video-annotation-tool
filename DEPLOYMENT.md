# 🚀 Deployment Guide - Vercel

## Prerequisites
1. ✅ MongoDB Atlas account dengan cluster yang sudah dibuat
2. ✅ GitHub repository dengan source code
3. ✅ Vercel account (gratis)

## Step 1: MongoDB Atlas Setup
1. Buat database user di MongoDB Atlas
2. Whitelist IP `0.0.0.0/0` untuk Vercel
3. Copy connection string

## Step 2: Deploy ke Vercel
1. Login ke [vercel.com](https://vercel.com)
2. New Project → Import dari GitHub
3. Select repository: `Video-Annotation-Tool`
4. Deploy!

## Step 3: Environment Variables
Set di Vercel Dashboard → Settings → Environment Variables:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/videoannotation
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-32-char-secret
```

## Step 4: Create Admin User
Setelah deploy, akses:
```
https://your-app.vercel.app/api/setup
```

## Step 5: Test Application
- Login: `admin@example.com` / `admin123`
- Upload video dan test annotation

## Health Check
```
https://your-app.vercel.app/api/health
```

## 🎯 Production Features
- ✅ Auto admin user creation
- ✅ Health check endpoint
- ✅ Production optimized build
- ✅ Security headers
- ✅ MongoDB connection pooling
