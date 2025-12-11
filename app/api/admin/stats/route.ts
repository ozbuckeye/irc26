import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isAdmin = await verifyAdminSession();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Total pledges
    const totalPledges = await prisma.pledge.count();

    // Total caches pledged (just count pledges since there's no pledgedCount field)
    const totalCachesPledged = totalPledges;

    // Total confirmations
    const totalConfirmations = await prisma.submission.count();

    // Total pledgers
    const totalPledgers = await prisma.user.count({
      where: {
        OR: [
          { pledges: { some: {} } },
          { submissions: { some: {} } },
        ],
      },
    });

    // States breakdown
    const pledgeStates = await prisma.pledge.findMany({
      select: { approxState: true },
    });
    const confirmationStates = await prisma.submission.findMany({
      select: { state: true },
    });

    const stateBreakdown: Record<string, { pledges: number; confirmations: number }> = {};
    
    pledgeStates.forEach((p) => {
      const state = p.approxState;
      if (!stateBreakdown[state]) {
        stateBreakdown[state] = { pledges: 0, confirmations: 0 };
      }
      stateBreakdown[state].pledges += 1;
    });

    confirmationStates.forEach((c) => {
      if (!stateBreakdown[c.state]) {
        stateBreakdown[c.state] = { pledges: 0, confirmations: 0 };
      }
      stateBreakdown[c.state].confirmations += 1;
    });

    // Cache type breakdown
    const typeBreakdown: Record<string, { pledged: number; confirmed: number }> = {};

    const allPledges = await prisma.pledge.findMany({
      select: { cacheType: true },
    });

    allPledges.forEach((p) => {
      const type = p.cacheType;
      if (!typeBreakdown[type]) {
        typeBreakdown[type] = { pledged: 0, confirmed: 0 };
      }
      typeBreakdown[type].pledged += 1;
    });

    const allConfirmations = await prisma.submission.findMany({
      select: { type: true },
    });

    allConfirmations.forEach((c) => {
      if (!typeBreakdown[c.type]) {
        typeBreakdown[c.type] = { pledged: 0, confirmed: 0 };
      }
      typeBreakdown[c.type].confirmed += 1;
    });

    // Cache size breakdown
    const sizeBreakdown: Record<string, { pledged: number; confirmed: number }> = {};
    
    const allPledgesWithSizes = await prisma.pledge.findMany({
      select: { cacheSize: true },
    });

    allPledgesWithSizes.forEach((p) => {
      const size = p.cacheSize;
      if (!sizeBreakdown[size]) {
        sizeBreakdown[size] = { pledged: 0, confirmed: 0 };
      }
      sizeBreakdown[size].pledged += 1;
    });

    // Note: Submissions don't track cache size, so size breakdown for confirmations is not available

    return NextResponse.json({
      totalPledges,
      totalCachesPledged,
      totalConfirmations,
      totalPledgers,
      stateBreakdown,
      typeBreakdown,
      sizeBreakdown,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}





