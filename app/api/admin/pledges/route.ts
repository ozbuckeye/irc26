import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-session';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const cacheType = searchParams.get('cacheType');
    const gcUsername = searchParams.get('gcUsername');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.PledgeWhereInput = {};

    if (state) {
      where.approxState = state as 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA';
    }

    if (cacheType) {
      where.cacheType = cacheType as 'TRADITIONAL' | 'MULTI' | 'MYSTERY' | 'LETTERBOX' | 'WHERIGO' | 'VIRTUAL';
    }

    if (gcUsername) {
      where.gcUsername = { contains: gcUsername, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { gcUsername: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { approxSuburb: { contains: search, mode: 'insensitive' } },
        { conceptNotes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const pledges = await prisma.pledge.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            gcUsername: true,
          },
        },
        submission: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pledges });
  } catch (error: unknown) {
    console.error('Error fetching admin pledges:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch pledges';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
