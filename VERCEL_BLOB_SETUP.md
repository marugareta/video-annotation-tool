# Vercel Blob Storage Setup Guide

## Current Implementation
The app now uses base64 data URLs for video storage, which works immediately but has limitations:
- ✅ Works out of the box
- ✅ No external dependencies
- ❌ Limited to small files (10MB max)
- ❌ Videos stored in database

## Upgrading to Vercel Blob Storage

If you want to use proper cloud storage with Vercel Blob:

### 1. Enable Vercel Blob
1. Go to Vercel Dashboard → Your Project
2. Navigate to **Settings** → **Storage**
3. Click **Create Database** → **Blob**
4. This will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables

### 2. Update the Implementation
Replace the current base64 approach in `/src/app/api/videos/route.ts` with:

```typescript
import { put } from '@vercel/blob';

// Replace the base64 section with:
const blob = await put(filename, file, {
  access: 'public',
});

const videoUrl = blob.url;
```

### 3. Benefits of Vercel Blob
- ✅ Unlimited file sizes
- ✅ CDN delivery
- ✅ Better performance
- ✅ Separate from database

## Current Status
The app works with the base64 approach for demo purposes. Upgrade to Vercel Blob when you need to handle larger video files.
