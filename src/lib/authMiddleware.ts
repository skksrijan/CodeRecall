import { NextResponse } from 'next/server';
import { adminAuth } from '../../firebaseAdmin';
import prisma from '../../prisma_client';
import logger from './logger';

export async function verifyAuth(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Find or auto-provision user in Prisma
    let user = await prisma.user.findUnique({
      where: { email: decodedToken.email },
    });

    if (!user && decodedToken.email) {
      try {
        user = await prisma.user.create({
          data: {
            email: decodedToken.email,
            name: (decodedToken as any).name || null,
          }
        });
        logger.info({ email: decodedToken.email }, 'Auto-provisioned Prisma user record');
      } catch (createErr) {
        // If race condition where another request created it, try finding it again
        user = await prisma.user.findUnique({
          where: { email: decodedToken.email },
        });
      }
    }

    if (!user) {
      logger.warn({ email: decodedToken.email }, 'User token valid but not found in Prisma database');
      return { error: 'User not found in database', status: 404 };
    }

    return { user };
  } catch (error: any) {
    logger.error({ err: error }, 'Error verifying auth token');
    return { error: 'Unauthorized', status: 401 };
  }
}
