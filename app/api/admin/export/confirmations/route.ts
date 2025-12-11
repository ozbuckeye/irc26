import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/admin-session';

export async function GET() {
  try {
    const isAdmin = await verifyAdminSession();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const confirmations = await prisma.submission.findMany({
      include: {
        user: {
          select: {
            gcUsername: true,
            email: true,
          },
        },
        pledge: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert to CSV
    const headers = ['Username', 'Email', 'GC Code', 'Cache Name', 'Type', 'Difficulty', 'Terrain', 'Suburb', 'State', 'Notes', 'Pledge ID', 'Created At'];
    const rows = confirmations.map((c) => [
      c.user?.gcUsername || '',
      c.user?.email || '',
      c.gcCode,
      c.cacheName,
      c.type,
      c.difficulty.toString(),
      c.terrain.toString(),
      c.suburb,
      c.state,
      c.notes || '',
      c.pledgeId || '',
      c.createdAt.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="irc26-confirmations.csv"',
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Error exporting confirmations:', error);
    return NextResponse.json(
      { error: 'Failed to export confirmations' },
      { status: 500 }
    );
  }
}





