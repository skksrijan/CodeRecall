import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../prisma_client';
import { Difficulty } from '@prisma/client';

export async function GET(req: Request, { params }: { params: { problemId: string } }) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: params.problemId },
      include: { tags: true, reviewState: true, decks: true },
    });

    if (!problem || problem.userId !== authResult.user!.id) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    return NextResponse.json(problem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { problemId: string } }) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await req.json();
    const { title, leetcodeUrl, difficulty, notes, userSolution, language, deckIds, tags } = body;

    // Verify ownership
    const existing = await prisma.problem.findUnique({ where: { id: params.problemId } });
    if (!existing || existing.userId !== authResult.user!.id) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const updatedProblem = await prisma.problem.update({
      where: { id: params.problemId },
      data: {
        ...(title && { title }),
        ...(leetcodeUrl !== undefined && { leetcodeUrl }),
        ...(difficulty && { difficulty: difficulty as Difficulty }),
        ...(notes !== undefined && { notes }),
        ...(userSolution !== undefined && { userSolution }),
        ...(language !== undefined && { language }),
        ...(deckIds !== undefined && {
          decks: {
            set: [], // Clear existing
            connect: deckIds.map((id: string) => ({ id })),
          },
        }),
        ...(tags !== undefined && {
          tags: {
            set: [], // Clear existing
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      },
      include: { tags: true, decks: true, reviewState: true },
    });

    return NextResponse.json(updatedProblem);
  } catch (error) {
    console.error('Error updating problem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { problemId: string } }) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    // Verify ownership
    const existing = await prisma.problem.findUnique({ where: { id: params.problemId } });
    if (!existing || existing.userId !== authResult.user!.id) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    await prisma.problem.delete({
      where: { id: params.problemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting problem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
