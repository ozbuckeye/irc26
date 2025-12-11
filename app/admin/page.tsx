import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-session';
import { getAllAdminImages } from '@/lib/admin-images';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const isAdmin = await verifyAdminSession();

  if (!isAdmin) {
    redirect('/auth/admin?callbackUrl=/admin');
  }

  // Fetch all images for the gallery
  const images = await getAllAdminImages();

  return <AdminDashboard initialImages={images} />;
}

