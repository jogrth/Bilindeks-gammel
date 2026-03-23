import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { requireAdmin } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';
import ModelsListClient from '@/components/admin/ModelsListClient';

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
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-8">
        <Container>
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="text-sm text-sky-700 hover:text-sky-800 mb-2 inline-block"
              >
                ← Tilbake til dashboard
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">Modeller</h1>
              <p className="mt-2 text-slate-600">
                Administrer bilmodeller, AI-forslag og publisering
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-600">Totalt</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{totalCount || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-600">Publisert</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{publishedCount || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-600">Utkast</div>
              <div className="mt-2 text-3xl font-bold text-slate-600">{draftCount || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-600">Trenger gjennomgang</div>
              <div className="mt-2 text-3xl font-bold text-amber-600">{needsReviewCount || 0}</div>
            </div>
          </div>

          {/* Models list */}
          <ModelsListClient
            models={models || []}
            brands={brands || []}
            currentFilters={{
              published: publishedFilter,
              brand: brandFilter,
              status: statusFilter,
            }}
          />
        </div>
      </Container>
    </div>
  );
}
