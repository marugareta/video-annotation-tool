import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getMongoClient } from '@/lib/mongodb';
import { VideoNote } from '@/types';

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

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const db = client.db();

    if (session.user.role === 'admin') {
      const notes = await db.collection('video_notes').aggregate([
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
            note: 1,
            createdAt: 1,
            updatedAt: 1,
            username: { $ifNull: ['$user.username', 'Unknown User'] },
            userEmail: { $ifNull: ['$user.email', ''] }
          }
        },
        { $sort: { updatedAt: -1 } }
      ]).toArray();

      return NextResponse.json(notes);
    } else {
      const note = await db.collection('video_notes').findOne({
        videoId,
        userId: session.user.id
      });

      return NextResponse.json(note || null);
    }
  } catch (error) {
    console.error('Get notes error:', error);
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

    const { videoId, note } = await request.json();

    if (!videoId || note === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const db = client.db();
    const notesCollection = db.collection<VideoNote>('video_notes');

    const existingNote = await notesCollection.findOne({
      videoId,
      userId: session.user.id
    });

    if (existingNote) {
      await notesCollection.updateOne(
        { videoId, userId: session.user.id },
        {
          $set: {
            note,
            updatedAt: new Date()
          }
        }
      );

      return NextResponse.json({
        message: 'Note updated successfully',
        note: {
          ...existingNote,
          note,
          updatedAt: new Date()
        }
      });
    } else {
      const newNote: VideoNote = {
        videoId,
        userId: session.user.id,
        note,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await notesCollection.insertOne(newNote);

      return NextResponse.json({
        message: 'Note saved successfully',
        note: {
          ...newNote,
          _id: result.insertedId
        }
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Save note error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}