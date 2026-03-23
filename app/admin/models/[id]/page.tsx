import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { requireAdmin } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';
import ModelDetailClient from '@/components/admin/ModelDetailClient';

export const metadata = {
  title: 'Admin - Modelldetaljer',
};

interface ModelDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
  await requireAdmin();

  const { id } = await params;
  const supabase = await createClient();

  // Fetch model with brand info
  const { data: model } = await supabase
    .from('models')
    .select(`
      *,
      brands (
        id,
        name,
        slug
      )
    `)
    .eq('id', id)
    .single();

  if (!model) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Modell ikke funnet</h1>
          <Link
            href="/admin/models"
            className="text-sky-700 hover:text-sky-800"
          >
            ← Tilbake til oversikt
          </Link>
        </div>
      </div>
    );
  }

  // Fetch related data
  const { data: dealers } = await supabase
    .from('model_dealers')
    .select(`
      *,
      dealers (
        id,
        name,
        email,
        active
      )
    `)
    .eq('model_id', id);

  const { data: allDealers } = await supabase
    .from('dealers')
    .select('id, name, email, active, brand')
    .eq('active', true)
    .order('name');

  const { data: similarModels } = await supabase
    .from('similar_models')
    .select(`
      *,
      similar_models:models!similar_models_similar_model_id_fkey (
        id,
        name,
        slug,
        brands (
          name
        )
      )
    `)
    .eq('model_id', id);

  const { data: allModels } = await supabase
    .from('models')
    .select(`
      id,
      name,
      slug,
      brands (
        name
      )
    `)
    .neq('id', id)
    .eq('published', true)
    .order('name');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-8">
        <Container>
          <Link
            href="/admin/models"
            className="text-sm text-sky-700 hover:text-sky-800 mb-2 inline-block"
          >
            ← Tilbake til oversikt
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {model.brands?.name} {model.name}
              </h1>
              <p className="text-slate-600 mt-1">{model.slug}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          <ModelDetailClient
            model={model}
            dealers={dealers || []}
            allDealers={allDealers || []}
            similarModels={similarModels || []}
            allModels={allModels || []}
          />
        </div>
      </Container>
    </div>
  );
}
