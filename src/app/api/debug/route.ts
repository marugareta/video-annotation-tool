import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      hasMongoUri: !!process.env.MONGODB_URI,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
      nodeEnv: process.env.NODE_ENV,
      session: !!session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      hasMongoUri: !!process.env.MONGODB_URI,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
