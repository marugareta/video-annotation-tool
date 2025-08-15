import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import clientPromise from '@/lib/mongodb';
import { Annotation, AnnotationWithUserInfo } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    console.log('GET annotations - videoId:', videoId, 'user:', session.user.id);

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    
    const annotations = await client.db().collection('annotations').aggregate([
      { $match: { videoId } },
      {
        $addFields: {
          userObjectId: { $toObjectId: '$userId' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          videoId: 1,
          userId: 1,
          timestamp: 1,
          label: 1,
          createdAt: 1,
          username: { $ifNull: ['$user.username', 'Unknown User'] },
          userEmail: { $ifNull: ['$user.email', ''] }
        }
      },
      { $sort: { timestamp: 1 } }
    ]).toArray();

    console.log('Found annotations:', annotations.length);
    
    return NextResponse.json(annotations);
  } catch (error) {
    console.error('Get annotations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { videoId, timestamp, label } = await request.json();

    console.log('POST annotation:', { videoId, timestamp, label, userId: session.user.id });

    if (!videoId || timestamp === undefined || !label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['up', 'down'].includes(label)) {
      return NextResponse.json(
        { error: 'Label must be "up" or "down"' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const annotations = client.db().collection<Annotation>('annotations');

    const newAnnotation: Annotation = {
      videoId,
      userId: session.user.id,
      timestamp: parseFloat(timestamp),
      label: label as 'up' | 'down',
      createdAt: new Date(),
    };

    const result = await annotations.insertOne(newAnnotation);
    console.log('Annotation inserted with ID:', result.insertedId);

    return NextResponse.json(
      { 
        message: 'Annotation created successfully',
        annotationId: result.insertedId,
        annotation: { ...newAnnotation, _id: result.insertedId }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create annotation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
