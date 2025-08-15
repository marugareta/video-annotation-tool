import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getMongoClient } from '@/lib/mongodb';
import { Video } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Dynamically import Vercel Blob only when available
async function uploadToVercelBlob(file: File, filename: string) {
  try {
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, file, {
      access: 'public',
    });
    return blob.url;
  } catch (error) {
    console.error('Vercel Blob upload failed:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await getMongoClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    
    const videos = client.db().collection<Video>('videos');
    
    const videoList = await videos.find({}).toArray();
    
    return NextResponse.json(videoList);
  } catch (error) {
    console.error('Get videos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('video') as File;
    const title = formData.get('title') as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: 'Missing file or title' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split('.').pop() || 'mp4';
    const filename = `${uuidv4()}.${fileExtension}`;
    
    console.log('Processing video upload:', filename);
    
    let videoUrl: string;
    
    // Try Vercel Blob first if token is available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        console.log('Using Vercel Blob storage');
        videoUrl = await uploadToVercelBlob(file, filename);
        console.log('Video uploaded to Vercel Blob:', videoUrl);
      } catch (error) {
        console.error('Vercel Blob failed, falling back to base64');
        // Fall back to base64 if Vercel Blob fails
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        videoUrl = `data:${file.type};base64,${base64}`;
      }
    } else {
      // Use base64 approach when Vercel Blob is not configured
      console.log('Using base64 storage (Vercel Blob not configured)');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Check file size (limit to 10MB for base64 storage)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (buffer.length > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 10MB. Configure Vercel Blob for larger files.' },
          { status: 400 }
        );
      }
      
      const base64 = buffer.toString('base64');
      videoUrl = `data:${file.type};base64,${base64}`;
    }

    const client = await getMongoClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    
    const videos = client.db().collection<Video>('videos');

    const newVideo: Video = {
      title,
      filename,
      originalName: file.name,
      path: videoUrl,
      uploadedBy: session.user.id,
      createdAt: new Date(),
    };

    const result = await videos.insertOne(newVideo);

    return NextResponse.json(
      { 
        message: 'Video uploaded successfully',
        videoId: result.insertedId,
        video: { ...newVideo, _id: result.insertedId },
        storageType: process.env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : 'base64'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
