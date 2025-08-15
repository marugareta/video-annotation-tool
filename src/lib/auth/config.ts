import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getMongoClient } from '../mongodb';
import { User } from '@/types';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          console.log('Attempting to authenticate user:', credentials.email);
          const client = await getMongoClient();
          if (!client) {
            console.error('Database not available during authentication');
            return null;
          }
          
          const users = client.db().collection<User>('users');
          
          const user = await users.findOne({ email: credentials.email });
          console.log('User found:', !!user);
          
          if (!user) {
            console.log('User not found in database');
            return null;
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          console.log('Password match:', passwordMatch);
          
          if (!passwordMatch) {
            console.log('Password does not match');
            return null;
          }

          console.log('Authentication successful for user:', user.email);
          return {
            id: user._id?.toString() || '',
            email: user.email,
            name: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT callback - adding user data to token');
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        console.log('Session callback - adding token data to session');
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};
