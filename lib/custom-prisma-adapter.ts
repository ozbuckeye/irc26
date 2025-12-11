import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import type { Adapter } from 'next-auth/adapters';

/**
 * Custom Prisma adapter that gracefully handles verification token deletion errors.
 * When a verification token is already consumed/deleted, Prisma throws P2025.
 * This adapter catches that error and returns null instead of crashing.
 */
export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  const baseAdapter = PrismaAdapter(prisma);

  return {
    ...baseAdapter,
    async useVerificationToken({ identifier, token }) {
      try {
        // Try to delete the verification token
        const verificationToken = await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier,
              token,
            },
          },
        });
        return verificationToken;
      } catch (error: unknown) {
        // P2025 is Prisma&apos;s error code for "Record to delete does not exist"
        // This happens when a magic link is reused or already consumed
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          // Token already consumed or doesn't exist - return null gracefully
          return null;
        }
        // Re-throw other errors (connection issues, etc.)
        throw error;
      }
    },
  };
}






