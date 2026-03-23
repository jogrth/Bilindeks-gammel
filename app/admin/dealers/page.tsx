import { requireAdmin } from '@/lib/auth/helpers';
import AdminDealersClient from '@/components/admin/AdminDealersClient';

export const metadata = {
  title: 'Admin - Forhandlere',
};

export default async function AdminDealersPage() {
  await requireAdmin();
  return <AdminDealersClient />;
}
