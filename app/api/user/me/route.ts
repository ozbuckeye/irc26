import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { gcUsernameSchema } from '@/lib/validation';

export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        gcUsername: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error('Error fetching user:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const validated = gcUsernameSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        gcUsername: validated.gcUsername,
      },
      select: {
        id: true,
        email: true,
        gcUsername: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
