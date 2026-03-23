import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: dealer, error: dealerError } = await supabase
    .from('dealers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (dealerError || !dealer) {
    return Response.json({ error: 'Dealer not found' }, { status: 404 });
  }

  const { data: modelDealers, error: modelsError } = await supabase
    .from('model_dealers')
    .select(`
      priority,
      active,
      model_id,
      models (
        id,
        name,
        slug,
        brands (
          name
        )
      )
    `)
    .eq('dealer_id', id)
    .order('priority');

  const models = (modelDealers || []).map((md: any) => ({
    ...md.models,
    model_dealers: [{
      priority: md.priority,
      active: md.active
    }]
  }));

  return Response.json({
    dealer,
    models
  });
}
