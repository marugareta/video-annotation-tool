import { MongoClient, Db } from 'mongodb';
import clientPromise from './mongodb';

export async function getDatabase(): Promise<Db | null> {
  try {
    if (!clientPromise) {
      console.warn('Database connection not available');
      return null;
    }
    
    const client = await clientPromise;
    return client.db();
  } catch (error) {
    console.error('Database connection error:', error);
    return null;
  }
}

export function isDatabaseAvailable(): boolean {
  return !!process.env.MONGODB_URI && !!clientPromise;
}
