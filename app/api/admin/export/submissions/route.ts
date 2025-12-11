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

    const where: Prisma.SubmissionWhereInput = {};

    if (state) where.state = state as 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA';
    if (cacheType) where.type = cacheType as 'TRADITIONAL' | 'MULTI' | 'MYSTERY' | 'LETTERBOX' | 'WHERIGO' | 'VIRTUAL';
    if (gcUsername) where.gcUsername = { contains: gcUsername, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { gcUsername: { contains: search, mode: 'insensitive' } },
        { gcCode: { contains: search, mode: 'insensitive' } },
        { cacheName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            gcUsername: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = ['ID', 'GC Code', 'Cache Name', 'GC Username', 'Email', 'Type', 'Difficulty', 'Terrain', 'Suburb', 'State', 'Hidden Date', 'Created At'];
    const rows = submissions.map((s) => [
      s.id,
      s.gcCode,
      s.cacheName,
      s.gcUsername,
      s.user?.email || '',
      s.type,
      s.difficulty,
      s.terrain,
      s.suburb,
      s.state,
      new Date(s.hiddenDate).toISOString(),
      new Date(s.createdAt).toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="irc26-submissions-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    console.error('Error exporting submissions:', error);
    const message = error instanceof Error ? error.message : 'Failed to export submissions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



