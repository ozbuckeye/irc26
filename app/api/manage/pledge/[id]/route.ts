import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateEditToken } from '@/lib/auth';
import { editPledgeSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const userId = await validateEditToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = editPledgeSchema.parse(body);

    // Verify the pledge belongs to the user
    const pledge = await prisma.pledge.findUnique({
      where: { id: params.id },
    });

    if (!pledge || pledge.userId !== userId) {
      return NextResponse.json(
        { error: 'Pledge not found or access denied' },
        { status: 404 }
      );
    }

    // Update pledge
    const updated = await prisma.pledge.update({
      where: { id: params.id },
      data: {
        ...(validated.gcUsername && { gcUsername: validated.gcUsername }),
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.cacheType && { cacheType: validated.cacheType }),
        ...(validated.cacheSize && { cacheSize: validated.cacheSize }),
        ...(validated.approxSuburb && { approxSuburb: validated.approxSuburb }),
        ...(validated.approxState && { approxState: validated.approxState }),
        ...(validated.conceptNotes !== undefined && { conceptNotes: validated.conceptNotes }),
        ...(validated.images !== undefined && { images: validated.images }),
      },
    });

    return NextResponse.json({
      success: true,
      pledge: updated,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating pledge:', error);
    return NextResponse.json(
      { error: 'Failed to update pledge' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const userId = await validateEditToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify the pledge belongs to the user
    const pledge = await prisma.pledge.findUnique({
      where: { id: params.id },
    });

    if (!pledge || pledge.userId !== userId) {
      return NextResponse.json(
        { error: 'Pledge not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.pledge.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Pledge deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting pledge:', error);
    return NextResponse.json(
      { error: 'Failed to delete pledge' },
      { status: 500 }
    );
  }
}





