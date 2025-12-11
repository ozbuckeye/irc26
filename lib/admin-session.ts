import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-session')?.value;

    if (!token) {
      return false;
    }

    const { payload } = await jwtVerify(token, secret);
    
    return payload.admin === true;
  } catch {
    return false;
  }
}



