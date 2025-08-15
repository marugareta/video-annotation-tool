require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    const existingAdmin = await users.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
    };
    
    const result = await users.insertOne(adminUser);
    console.log('Admin user created successfully:', result.insertedId);
    console.log('Login credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
  }
}

createAdminUser();
