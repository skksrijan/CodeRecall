import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../../firebaseAdmin';
import prisma from '../../../../../prisma_client';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token server-side
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { email, name } = await req.json();

    // Verify email matches the token
    if (decodedToken.email !== email) {
      return NextResponse.json({ error: 'Token email mismatch' }, { status: 403 });
    }

    // Upsert user into Prisma
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: name || undefined },
      create: {
        email,
        name: name || undefined,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error in create-user api:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
