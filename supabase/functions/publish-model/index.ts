import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PublishPayload {
  model_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: PublishPayload = await req.json();

    if (!payload.model_id) {
      return new Response(
        JSON.stringify({ error: 'model_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('id, slug, name, brand_name')
      .eq('id', payload.model_id)
      .single();

    if (modelError || !model) {
      return new Response(
        JSON.stringify({ error: 'Model not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!model.slug || !model.name) {
      return new Response(
        JSON.stringify({ error: 'Model must have slug and name to be published' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: updatedModel, error: updateError } = await supabase
      .from('models')
      .update({
        review_status: 'published',
        status: 'published',
      })
      .eq('id', payload.model_id)
      .select()
      .single();

    if (updateError || !updatedModel) {
      console.error('Model update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to publish model' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        model: updatedModel,
        message: 'Model published successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Publish model error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
