import { MongoClient } from 'mongodb';

// Allow build to proceed without MONGODB_URI during static generation
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
} else {
  console.warn('MONGODB_URI not found - database operations will not be available');
}

export default clientPromise;
