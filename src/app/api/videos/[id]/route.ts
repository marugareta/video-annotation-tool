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
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid video ID' },
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
    const videos = db.collection('videos');
    const annotations = db.collection('annotations');

    // Check if video exists
    const video = await videos.findOne({ _id: new ObjectId(id) });
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Delete all annotations for this video first
    const annotationDeleteResult = await annotations.deleteMany({ videoId: id });
    console.log(`Deleted ${annotationDeleteResult.deletedCount} annotations for video ${id}`);

    // Delete the video
    const videoDeleteResult = await videos.deleteOne({ _id: new ObjectId(id) });

    if (videoDeleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      );
    }

    console.log(`Video ${id} deleted successfully`);

    return NextResponse.json({
      message: 'Video and all associated annotations deleted successfully',
      deletedAnnotations: annotationDeleteResult.deletedCount
    });
  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
