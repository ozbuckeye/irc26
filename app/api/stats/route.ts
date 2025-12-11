import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get total pledges and submissions
    const [totalPledged, totalSubmissions, allPledges, allSubmissions] = await Promise.all([
      prisma.pledge.count(),
      prisma.submission.count(),
      prisma.pledge.findMany({
        select: { gcUsername: true },
      }),
      prisma.submission.findMany({
        select: { gcUsername: true, state: true, type: true },
      }),
    ]);

    // Calculate unique rainmakers (distinct gcUsername from pledges and submissions)
    const rainmakersSet = new Set<string>();
    allPledges.forEach((p) => rainmakersSet.add(p.gcUsername));
    allSubmissions.forEach((s) => rainmakersSet.add(s.gcUsername));
    const rainmakers = rainmakersSet.size;

    // Breakdown by state (from submissions only)
    const byState: Record<string, number> = {};
    allSubmissions.forEach((s) => {
      byState[s.state] = (byState[s.state] || 0) + 1;
    });

    // Breakdown by type (from submissions only)
    const byType: Record<string, number> = {};
    allSubmissions.forEach((s) => {
      byType[s.type] = (byType[s.type] || 0) + 1;
    });

    return NextResponse.json({
      totalPledged,
      totalSubmissions,
      rainmakers,
      byState,
      byType,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
