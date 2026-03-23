import { requireAdmin } from '@/lib/auth/helpers';
import DealerDetailClient from '@/components/admin/DealerDetailClient';

interface DealerDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Admin - Forhandler Detaljer',
};

export default async function DealerDetailPage({ params }: DealerDetailPageProps) {
  await requireAdmin();
  return <DealerDetailClient params={params} />;
}
