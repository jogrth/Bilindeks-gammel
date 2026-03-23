import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('model_dealers')
    .select(`
      *,
      dealers (
        id,
        name,
        email,
        phone,
        brand,
        active
      )
    `)
    .eq('model_id', id)
    .order('priority');

  if (error) {
    return Response.json({ error: 'Failed to fetch dealers' }, { status: 500 });
  }

  return Response.json(data || []);
}
