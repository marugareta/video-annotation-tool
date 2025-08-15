import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import clientPromise from '@/lib/mongodb';
import { Video } from '@/types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
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

    const client = await clientPromise;
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const fileExtension = path.extname(file.name);
    const filename = `${uuidv4()}${fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const client = await clientPromise;
    const videos = client.db().collection<Video>('videos');

    const newVideo: Video = {
      title,
      filename,
      originalName: file.name,
      path: `/uploads/${filename}`,
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
