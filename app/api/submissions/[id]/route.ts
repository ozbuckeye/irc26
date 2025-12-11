import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { updateSubmissionSchema } from '@/lib/validation';
import { isAdmin } from '@/lib/auth-config';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const submissionId = params.id;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check ownership or admin
    const userIsAdmin = isAdmin(session.user.email);
    if (!userIsAdmin && submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ submission });
  } catch (error: unknown) {
    console.error('Error fetching submission:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch submission';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const submissionId = params.id;

    // Get existing submission
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check ownership or admin
    const userIsAdmin = isAdmin(session.user.email);
    if (!userIsAdmin && existingSubmission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate input
    const validated = updateSubmissionSchema.parse(body);

    // Parse hiddenDate if provided
    const updateData: Prisma.SubmissionUpdateInput = { ...validated };
    if (validated.hiddenDate) {
      updateData.hiddenDate = typeof validated.hiddenDate === 'string' 
        ? new Date(validated.hiddenDate) 
        : validated.hiddenDate;
    }

    // Update submission
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: updateData,
    });

    // If admin, log the change
    if (userIsAdmin) {
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          actorEmail: session.user.email || undefined,
          action: 'UPDATE_SUBMISSION',
          targetId: submissionId,
          targetKind: 'SUBMISSION',
          before: existingSubmission as unknown as Prisma.InputJsonValue,
          after: submission as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json({ success: true, submission });
  } catch (error: unknown) {
    console.error('Error updating submission:', error);
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Failed to update submission';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const submissionId = params.id;

    // Get existing submission
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check ownership or admin
    const userIsAdmin = isAdmin(session.user.email);
    if (!userIsAdmin && existingSubmission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If admin, log the deletion
    if (userIsAdmin) {
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          actorEmail: session.user.email || undefined,
          action: 'DELETE_SUBMISSION',
          targetId: submissionId,
          targetKind: 'SUBMISSION',
          before: existingSubmission as unknown as Prisma.InputJsonValue,
        },
      });
    }

    // Delete submission and update pledge status back to CONCEPT
    await prisma.$transaction([
      prisma.submission.delete({
        where: { id: submissionId },
      }),
      prisma.pledge.update({
        where: { id: existingSubmission.pledgeId },
        data: { status: 'CONCEPT' },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting submission:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete submission';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
