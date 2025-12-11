import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { pledgeSchema } from '@/lib/validation';
import { sendPledgeConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    // Validate input
    const validated = pledgeSchema.parse(body);

    // Get or update user's gcUsername
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        gcUsername: validated.gcUsername,
      },
    });

    // Create pledge
    const pledge = await prisma.pledge.create({
      data: {
        userId: session.user.id,
        gcUsername: validated.gcUsername,
        title: validated.title,
        cacheType: validated.cacheType,
        cacheSize: validated.cacheSize,
        approxSuburb: validated.approxSuburb,
        approxState: validated.approxState,
        conceptNotes: validated.conceptNotes,
        images: validated.images || [],
        status: 'CONCEPT',
      },
    });

    // Send confirmation email
    await sendPledgeConfirmationEmail(user.email, pledge.id);

    return NextResponse.json({ success: true, pledge }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating pledge:', error);
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Failed to create pledge';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



