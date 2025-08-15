import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';

export async function GET() {
  try {
    // Test database connection
    const client = await getMongoClient();
    if (client) {
      await client.db().admin().ping();
    }
    
    return NextResponse.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: client ? 'Connected' : 'Not available',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ 
      status: 'Error',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
