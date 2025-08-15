import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getMongoClient } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
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
          _id: 1,
          userId: 1,
          timestamp: 1,
          label: 1,
          username: { $ifNull: ['$user.username', 'Unknown User'] },
          userEmail: { $ifNull: ['$user.email', ''] },
          createdAt: 1
        }
      },
      { $sort: { timestamp: 1 } }
    ]).toArray();

    const csvHeaders = 'ID,User ID,Username,Email,Timestamp (seconds),Label,Created At\n';
    const csvRows = annotations.map((annotation) => [
      annotation._id,
      annotation.userId,
      annotation.username,
      annotation.userEmail,
      annotation.timestamp,
      annotation.label,
      annotation.createdAt.toISOString()
    ].join(',')).join('\n');

    const csvContent = csvHeaders + csvRows;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="annotations_${videoId}.csv"`
      }
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
