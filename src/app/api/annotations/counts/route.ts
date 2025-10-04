import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getMongoClient } from '@/lib/mongodb';

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

    const pipeline = [];
    
    if (session.user.role !== 'admin') {
      pipeline.push({
        $match: {
          userId: session.user.id
        }
      });
    }

    pipeline.push({
      $group: {
        _id: '$videoId',
        count: { $sum: 1 }
      }
    });

    const counts = await client.db().collection('annotations').aggregate(pipeline).toArray();

    const countsMap = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(countsMap);
  } catch (error) {
    console.error('Get annotation counts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}