import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { requireAdmin } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';
import ModelsListClient from '@/components/admin/ModelsListClient';
import ModelsPageClient from '@/components/admin/ModelsPageClient';

export const metadata = {
  title: 'Admin - Modeller',
};

export default async function AdminModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();

  const supabase = await createClient();
  const params = await searchParams;

  // Get filter parameters
  const publishedFilter = params.published as string | undefined;
  const brandFilter = params.brand as string | undefined;
  const statusFilter = params.status as string | undefined;

  // Build query
  let query = supabase
    .from('models')
    .select(`
      *,
      brands (
        id,
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (publishedFilter === 'true') {
    query = query.eq('published', true);
  } else if (publishedFilter === 'false') {
    query = query.eq('published', false);
  }

  if (brandFilter) {
    query = query.eq('brand_id', brandFilter);
  }

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data: models } = await query;

  // Get all brands for filter
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, slug')
    .order('name');

  // Get stats
  const { count: totalCount } = await supabase
    .from('models')
    .select('*', { count: 'exact', head: true });

  const { count: publishedCount } = await supabase
    .from('models')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  const { count: draftCount } = await supabase
    .from('models')
    .select('*', { count: 'exact', head: true })
    .eq('published', false);

  const { count: needsReviewCount } = await supabase
    .from('models')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'needs_review');

  return (
    <ModelsPageClient
      models={models || []}
      brands={brands || []}
      currentFilters={{
        published: publishedFilter,
        brand: brandFilter,
        status: statusFilter,
      }}
      stats={{
        total: totalCount || 0,
        published: publishedCount || 0,
        draft: draftCount || 0,
        needsReview: needsReviewCount || 0,
      }}
    />
  );
}
