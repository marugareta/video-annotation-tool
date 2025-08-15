import { MongoClient } from 'mongodb';

let uri = '';
let clientPromise: Promise<MongoClient> | null = null;

if (process.env.MONGODB_URI) {
  uri = process.env.MONGODB_URI;
  const options = {};

  let client;

  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;

// Helper function for API routes
export async function getMongoClient() {
  if (!clientPromise) {
    console.warn('MongoDB connection not available - check MONGODB_URI environment variable');
    console.warn('Current MONGODB_URI status:', !!process.env.MONGODB_URI);
    return null;
  }
  
  try {
    console.log('Attempting MongoDB connection...');
    const client = await clientPromise;
    console.log('MongoDB connection successful');
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return null;
  }
}
