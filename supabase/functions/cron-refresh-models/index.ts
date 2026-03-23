import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Cron refresh triggered at:', new Date().toISOString());

    const { data: job, error: jobError } = await supabase
      .from('ingestion_jobs')
      .insert([{
        source_url: null,
        job_type: 'cron',
        status: 'pending',
        started_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (jobError) {
      console.error('Failed to create cron job:', jobError);
    } else {
      console.log('Cron job created:', job?.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cron refresh completed. AI ingestion pipeline will be implemented in a future phase.',
        job_id: job?.id || null,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cron refresh error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
