import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailSchema } from '@/lib/validation';
import { createEditToken } from '@/lib/auth';
import { sendMagicLink } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    const token = await createEditToken(user.id);
    await sendMagicLink(user.email, token);

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email',
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating edit token:', error);
    return NextResponse.json(
      { error: 'Failed to create edit token' },
      { status: 500 }
    );
  }
}





