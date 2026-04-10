import { requireAdmin } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ArticleDetailClient from '@/components/admin/ArticleDetailClient';

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !article) {
    notFound();
  }

  const { data: relatedModels } = await supabase
    .from('article_related_models')
    .select(`
      *,
      models (
        id,
        name,
        slug,
        brand_id
      )
    `)
    .eq('article_id', id);

  const { data: images } = await supabase
    .from('article_images')
    .select('*')
    .eq('article_id', id)
    .order('display_order');

  return (
    <ArticleDetailClient
      article={article}
      relatedModels={relatedModels || []}
      images={images || []}
    />
  );
}
