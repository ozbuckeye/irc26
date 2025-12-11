import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await requireAuth();

    const submissions = await prisma.submission.findMany({
      where: { userId: session.user.id },
      include: {
        pledge: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ submissions });
  } catch (error: unknown) {
    console.error('Error fetching submissions:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch submissions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



