import { requireAdmin } from '@/lib/auth/helpers';
import AdminJobsClient from '@/components/admin/AdminJobsClient';

export const metadata = {
  title: 'Admin - Ingestion Jobs',
};

export default async function AdminJobsPage() {
  await requireAdmin();
  return <AdminJobsClient />;
}
