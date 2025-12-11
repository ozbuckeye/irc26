import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateEditToken } from '@/lib/auth';


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

    await request.json();

    // Verify the confirmation belongs to the user
    const confirmation = await prisma.submission.findUnique({
      where: { id: params.id },
    });

    if (!confirmation || confirmation.userId !== userId) {
      return NextResponse.json(
        { error: 'Confirmation not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      error: 'This endpoint is not fully implemented. Please use the account page to manage submissions.',
    }, { status: 501 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating confirmation:', error);
    return NextResponse.json(
      { error: 'Failed to update confirmation' },
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

    // Verify the confirmation belongs to the user
    const confirmation = await prisma.submission.findUnique({
      where: { id: params.id },
    });

    if (!confirmation || confirmation.userId !== userId) {
      return NextResponse.json(
        { error: 'Confirmation not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.submission.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Confirmation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting confirmation:', error);
    return NextResponse.json(
      { error: 'Failed to delete confirmation' },
      { status: 500 }
    );
  }
}
