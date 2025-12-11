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

    const where: Prisma.SubmissionWhereInput = {};

    if (state) {
      where.state = state as 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA';
    }

    if (cacheType) {
      where.type = cacheType as 'TRADITIONAL' | 'MULTI' | 'MYSTERY' | 'LETTERBOX' | 'WHERIGO' | 'VIRTUAL';
    }

    if (gcUsername) {
      where.gcUsername = { contains: gcUsername, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { gcUsername: { contains: search, mode: 'insensitive' } },
        { gcCode: { contains: search, mode: 'insensitive' } },
        { cacheName: { contains: search, mode: 'insensitive' } },
        { suburb: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
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

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            gcUsername: true,
          },
        },
        pledge: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ submissions });
  } catch (error: unknown) {
    console.error('Error fetching admin submissions:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch submissions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



