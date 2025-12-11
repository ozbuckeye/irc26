import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuth();

    const pledges = await prisma.pledge.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        submission: true,
      },
    });

    return NextResponse.json({ pledges });
  } catch (error: unknown) {
    console.error('Error fetching pledges:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch pledges';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



