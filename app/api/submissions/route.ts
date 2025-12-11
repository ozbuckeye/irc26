import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { submissionSchema } from '@/lib/validation';
import { sendSubmissionConfirmationEmail } from '@/lib/email';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    // Validate input
    const validated = submissionSchema.parse(body);

    // Verify pledge exists and belongs to user
    const pledge = await prisma.pledge.findUnique({
      where: { id: validated.pledgeId },
      include: { submission: true },
    });

    if (!pledge) {
      return NextResponse.json({ error: 'Pledge not found' }, { status: 404 });
    }

    // Check if pledge already has a submission
    if (pledge.submission) {
      return NextResponse.json({ error: 'This pledge already has a submission' }, { status: 400 });
    }

    // Check ownership
    if (pledge.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse hiddenDate
    const hiddenDate = typeof validated.hiddenDate === 'string' 
      ? new Date(validated.hiddenDate) 
      : validated.hiddenDate;

    // Move images from pledge to submission (transfer, not copy)
    let submissionImages: Prisma.InputJsonValue | undefined = undefined;
    if (pledge.images) {
      // Handle various image formats (same logic as used elsewhere)
      if (Array.isArray(pledge.images)) {
        submissionImages = pledge.images as Prisma.InputJsonValue;
      } else if (typeof pledge.images === 'string') {
        try {
          const parsed = JSON.parse(pledge.images);
          submissionImages = Array.isArray(parsed) ? (parsed as Prisma.InputJsonValue) : undefined;
        } catch {
          submissionImages = undefined;
        }
      } else if (typeof pledge.images === 'object') {
        submissionImages = pledge.images as Prisma.InputJsonValue;
      }
    }

    // Create submission and update pledge in a transaction
    const submission = await prisma.$transaction(async (tx) => {
      // Create submission with images from pledge
      const newSubmission = await tx.submission.create({
        data: {
          pledgeId: validated.pledgeId,
          userId: session.user.id,
          gcUsername: pledge.gcUsername,
          gcCode: validated.gcCode,
          cacheName: validated.cacheName,
          suburb: validated.suburb,
          state: validated.state,
          difficulty: validated.difficulty,
          terrain: validated.terrain,
          type: validated.type,
          hiddenDate: hiddenDate,
          notes: validated.notes,
          images: submissionImages,
        },
      });

      // Update pledge: set status to HIDDEN and clear images (images moved to submission)
      await tx.pledge.update({
        where: { id: validated.pledgeId },
        data: { 
          status: 'HIDDEN',
          images: Prisma.DbNull, // Clear images from pledge since they're now in submission
        },
      });

      return newSubmission;
    });

    // Send confirmation email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (user) {
      await sendSubmissionConfirmationEmail(user.email, submission.id);
    }

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating submission:', error);
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Failed to create submission';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



