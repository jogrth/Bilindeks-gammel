import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LeadSubmission {
  model_id: string;
  name: string;
  phone: string;
  email: string;
  postcode: string;
  purchase_timeline?: string;
  financing: string;
  trade_in: boolean;
  trade_in_reg?: string;
  trade_in_mileage?: string;
  message?: string;
}

interface LeadInsert {
  model_id: string;
  name: string;
  email: string;
  phone: string;
  postcode?: string;
  purchase_timeline?: string;
  financing?: string;
  trade_in: boolean;
  trade_in_reg?: string;
  trade_in_mileage?: number;
  message?: string;
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

    const payload: LeadSubmission = await req.json();
    console.log('[submit-lead] Received payload:', payload);

    if (!payload.model_id || !payload.name || !payload.phone || !payload.email || !payload.postcode) {
      console.error('[submit-lead] Missing required fields:', {
        has_model_id: !!payload.model_id,
        has_name: !!payload.name,
        has_phone: !!payload.phone,
        has_email: !!payload.email,
        has_postcode: !!payload.postcode,
      });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[submit-lead] Looking up model with ID:', payload.model_id);

    const { data: model, error: modelError } = await supabase
      .from('models')
      .select(`
        id,
        name,
        brands (
          name
        )
      `)
      .eq('id', payload.model_id)
      .maybeSingle();

    console.log('[submit-lead] Model lookup result:', { model, modelError });

    if (modelError || !model) {
      console.error('[submit-lead] Model not found or error:', modelError);
      return new Response(
        JSON.stringify({
          error: 'Model not found',
          details: modelError?.message || 'No model matches the provided ID',
          model_id: payload.model_id
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const leadInsert: LeadInsert = {
      model_id: payload.model_id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      postcode: payload.postcode || undefined,
      purchase_timeline: payload.purchase_timeline,
      financing: payload.financing,
      trade_in: payload.trade_in,
      trade_in_reg: payload.trade_in ? payload.trade_in_reg : undefined,
      trade_in_mileage: payload.trade_in && payload.trade_in_mileage ? parseInt(payload.trade_in_mileage) : undefined,
      message: payload.message,
    };

    console.log('[submit-lead] Inserting lead:', leadInsert);

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([leadInsert])
      .select()
      .single();

    console.log('[submit-lead] Lead insert result:', { lead, leadError });

    if (leadError || !lead) {
      console.error('[submit-lead] Lead insert failed:', leadError);
      return new Response(
        JSON.stringify({
          error: 'Failed to create lead',
          step: 'lead_insert',
          details: leadError?.message || 'Unknown error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[submit-lead] Fetching dealers for model:', payload.model_id);

    // Parse user postcode for range matching
    const userPostcodeNum = payload.postcode ? parseInt(payload.postcode.replace(/\s/g, ''), 10) : null;
    console.log('[submit-lead] User postcode numeric:', userPostcodeNum);

    const { data: modelDealers, error: dealersError } = await supabase
      .from('model_dealers')
      .select(`
        dealer_id,
        priority,
        active,
        dealers (
          id,
          name,
          email,
          active,
          postcode_from,
          postcode_to,
          brand_preference
        )
      `)
      .eq('model_id', payload.model_id)
      .eq('active', true)
      .order('priority', { ascending: true });

    console.log('[submit-lead] Dealers fetch result:', { count: modelDealers?.length || 0, dealersError });

    if (dealersError) {
      console.error('[submit-lead] Dealers fetch error:', dealersError);
    }

    // Filter by active status and postcode range
    const activeDealers = (modelDealers || []).filter((md: any) => {
      if (!md.dealers || !md.dealers.active) return false;

      // If dealer has postcode range set, check if user is in range
      if (md.dealers.postcode_from && md.dealers.postcode_to && userPostcodeNum) {
        const inRange = userPostcodeNum >= md.dealers.postcode_from &&
                       userPostcodeNum <= md.dealers.postcode_to;
        console.log(`[submit-lead] Dealer ${md.dealers.name} postcode check:`, {
          dealer_range: `${md.dealers.postcode_from}-${md.dealers.postcode_to}`,
          user_postcode: userPostcodeNum,
          in_range: inRange
        });
        return inRange;
      }

      // If no postcode range set, include dealer (backward compatibility)
      return true;
    });

    console.log('[submit-lead] Active dealers count:', activeDealers.length);

    if (activeDealers.length === 0) {
      console.warn('[submit-lead] No active dealers found for model:', payload.model_id);
      return new Response(
        JSON.stringify({
          success: true,
          lead_id: lead.id,
          warning: 'Lead created but no active dealers to notify'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deliveries = activeDealers.map((md: any) => ({
      lead_id: lead.id,
      dealer_id: md.dealer_id,
      status: 'pending',
    }));

    console.log('[submit-lead] Inserting deliveries:', deliveries.length);

    const { error: deliveriesError } = await supabase
      .from('lead_deliveries')
      .insert(deliveries);

    if (deliveriesError) {
      console.error('[submit-lead] Deliveries insert error:', deliveriesError);
    } else {
      console.log('[submit-lead] Deliveries inserted successfully');
    }

    console.log('[submit-lead] Sending emails to dealers');

    const emailPromises = activeDealers.map(async (md: any) => {
      try {
        const emailPayload = {
          lead_id: lead.id,
          dealer_id: md.dealer_id,
          dealer_email: md.dealers.email,
          dealer_name: md.dealers.name,
          lead_data: {
            brand_name: (model as any).brands?.name || 'Unknown',
            model_name: model.name,
            customer_name: lead.name,
            phone: lead.phone,
            email: lead.email,
            postcode: lead.postcode,
            purchase_timeline: lead.purchase_timeline,
            financing: lead.financing,
            trade_in: lead.trade_in,
            trade_in_reg: lead.trade_in_reg,
            trade_in_mileage: lead.trade_in_mileage,
            message: lead.message,
            created_at: lead.created_at,
          },
        };

        const sendEmailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-lead-email`;
        const response = await fetch(sendEmailUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
          console.error(`[submit-lead] Failed to send email to dealer ${md.dealer_id}: HTTP ${response.status}`);
        } else {
          console.log(`[submit-lead] Email sent successfully to dealer ${md.dealer_id}`);
        }
      } catch (error) {
        console.error(`[submit-lead] Error sending email to dealer ${md.dealer_id}:`, error);
      }
    });

    await Promise.allSettled(emailPromises);

    console.log('[submit-lead] All emails processed, returning success');

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        dealers_notified: activeDealers.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[submit-lead] Unhandled error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        step: 'unknown',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
