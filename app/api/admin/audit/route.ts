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
    const action = searchParams.get('action');
    const targetKind = searchParams.get('targetKind');
    const actorEmail = searchParams.get('actorEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.AuditLogWhereInput = {};

    if (action) {
      where.action = action;
    }

    if (targetKind) {
      where.targetKind = targetKind;
    }

    if (actorEmail) {
      where.actorEmail = { contains: actorEmail, mode: 'insensitive' };
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

    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit to most recent 1000 entries
    });

    return NextResponse.json({ auditLogs });
  } catch (error: unknown) {
    console.error('Error fetching audit logs:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch audit logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



