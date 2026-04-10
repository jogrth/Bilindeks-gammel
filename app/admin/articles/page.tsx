import { Container } from '@/components/ui/Container';
import { requireAdmin } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';
import ArticlesListClient from '@/components/admin/ArticlesListClient';

export const metadata = {
  title: 'Admin - Artikler',
};

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();

  const supabase = await createClient();
  const params = await searchParams;

  const statusFilter = params.status as string | undefined;
  const topicFilter = params.topic as string | undefined;

  let query = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('review_status', statusFilter);
  }

  if (topicFilter) {
    query = query.eq('topic', topicFilter);
  }

  const { data: articles } = await query;

  const { count: totalCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  const { count: publishedCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('review_status', 'published')
    .is('deleted_at', null);

  const { count: draftCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('review_status', 'draft')
    .is('deleted_at', null);

  const { count: needsReviewCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('review_status', 'needs_review')
    .is('deleted_at', null);

  return (
    <ArticlesListClient
      articles={articles || []}
      currentFilters={{
        status: statusFilter,
        topic: topicFilter,
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
