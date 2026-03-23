import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
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
    .eq('model_id', id)
    .order('is_pinned', { ascending: false })
    .order('similarity_score', { ascending: false });

  if (error) {
    return Response.json({ error: 'Failed to fetch similar models' }, { status: 500 });
  }

  const formatted = (data || []).map(item => ({
    ...item,
    similar_models: {
      ...item.similar_models,
      brand_name: item.similar_models?.brands?.name,
    },
  }));

  return Response.json(formatted);
}
