import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('dealers')
    .select('*')
    .order('name');

  if (error) {
    return Response.json({ error: 'Failed to fetch dealers' }, { status: 500 });
  }

  return Response.json(data || []);
}
