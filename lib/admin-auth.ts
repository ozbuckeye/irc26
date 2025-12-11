import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

export async function verifyAdminSession(): Promise<{ email: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'admin') {
      return null;
    }

    return {
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<{ email: string; role: string }> {
  const session = await verifyAdminSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}





