import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getMongoClient } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user ) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid annotation ID' },
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
    
    const annotations = client.db().collection('annotations');

    const result = await annotations.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Annotation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    console.error('Delete annotation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { timestamp, label } = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid annotation ID' },
        { status: 400 }
      );
    }

    if (timestamp === undefined || !label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['change', 'in_zone', 'out_of_zone'].includes(label)) {
      return NextResponse.json(
        { error: 'Label must be "change", "in_zone", or "out_of_zone"' },
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
    
    const annotations = client.db().collection('annotations');

    const result = await annotations.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          timestamp: parseFloat(timestamp), 
          label: label as 'change' | 'in_zone' | 'out_of_zone' 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Annotation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Annotation updated successfully' });
  } catch (error) {
    console.error('Update annotation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
