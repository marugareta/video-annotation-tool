import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getMongoClient } from '@/lib/mongodb';
import { Video } from '@/types';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

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

    // Upload to Vercel Blob
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const filename = `${uuidv4()}.${fileExtension}`;
    
    console.log('Uploading video to Vercel Blob:', filename);
    const blob = await put(filename, file, {
      access: 'public',
    });
    
    console.log('Video uploaded to blob:', blob.url);

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
      path: blob.url, // Use blob URL instead of local path
      uploadedBy: session.user.id,
      createdAt: new Date(),
    };

    const result = await videos.insertOne(newVideo);

    return NextResponse.json(
      { 
        message: 'Video uploaded successfully',
        videoId: result.insertedId,
        video: { ...newVideo, _id: result.insertedId }
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
