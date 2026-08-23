import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../prisma_client';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authResult.user!.id }
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await req.json();
    const updatedUser = await prisma.user.update({
      where: { id: authResult.user!.id },
      data: {
        name: body.name,
        dailyNewLimit: body.dailyNewLimit !== undefined ? parseInt(body.dailyNewLimit, 10) : undefined,
        notificationsEnabled: body.notificationsEnabled,
        hasCompletedOnboarding: body.hasCompletedOnboarding,
      }
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    // This will cascade and delete all associated decks, problems, reviews, and review states
    await prisma.user.delete({
      where: { id: authResult.user!.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
