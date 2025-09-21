import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getMongoClient } from '@/lib/mongodb';
import { User } from '@/types';

export async function POST() {
  try {
    const client = await getMongoClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    
    const users = client.db().collection<User>('users');
    
    const existingAdmin = await users.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists', exists: true },
        { status: 200 }
      );
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser: User = {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
    };
    
    const result = await users.insertOne(adminUser);
    
    return NextResponse.json(
      { 
        message: 'Admin user created successfully',
        userId: result.insertedId,
        credentials: {
          email: 'admin@example.com',
          password: 'admin123'
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
