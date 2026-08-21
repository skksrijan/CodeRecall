import { NextResponse } from 'next/server';
import { adminAuth } from '../../firebaseAdmin';
import prisma from '../../prisma_client';

export async function verifyAuth(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Find user in Prisma
    const user = await prisma.user.findUnique({
      where: { email: decodedToken.email },
    });

    if (!user) {
      return { error: 'User not found in database', status: 404 };
    }

    return { user };
  } catch (error: any) {
    console.error('Error verifying auth token:', error);
    return { error: 'Unauthorized', status: 401 };
  }
}
