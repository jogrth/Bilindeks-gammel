import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmailPayload {
  lead_id: string;
  dealer_id: string;
  dealer_email: string;
  dealer_name: string;
  lead_data: {
    brand_name: string;
    model_name: string;
    customer_name: string;
    phone: string;
    email: string;
    postcode: string;
    purchase_timeline?: string;
    financing?: string;
    trade_in: boolean;
    trade_in_reg?: string;
    trade_in_mileage?: number;
    message?: string;
    created_at: string;
  };
}

function generateEmailContent(data: EmailPayload['lead_data']): { subject: string; html: string; text: string } {
  const subject = `Nytt lead fra Biljakt – ${data.brand_name} ${data.model_name}`;

  const text = `
Nytt lead fra Biljakt

Modell: ${data.brand_name} ${data.model_name}

KUNDEINFORMASJON
Navn: ${data.customer_name}
Telefon: ${data.phone}
E-post: ${data.email}
Postnummer: ${data.postcode}

KJØPSDETALJER
Tidslinje: ${data.purchase_timeline || 'Ikke oppgitt'}
Finansiering: ${data.financing || 'Ikke oppgitt'}
Innbytte: ${data.trade_in ? 'Ja' : 'Nei'}
${data.trade_in && data.trade_in_reg ? `Innbytte reg.nr: ${data.trade_in_reg}` : ''}
${data.trade_in && data.trade_in_mileage ? `Innbytte km-stand: ${data.trade_in_mileage}` : ''}

${data.message ? `MELDING FRA KUNDE:\n${data.message}\n` : ''}
Mottatt: ${new Date(data.created_at).toLocaleString('nb-NO')}
Kilde: Biljakt
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #1e40af; font-size: 24px; margin-bottom: 8px; }
    h2 { color: #475569; font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .model { color: #64748b; font-size: 16px; margin-bottom: 24px; }
    .info-row { margin: 8px 0; }
    .label { font-weight: 600; color: #475569; }
    .value { color: #1e293b; }
    .message { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
  </style>
</head>
<body>
  <h1>Nytt lead fra Biljakt</h1>
  <div class="model">${data.brand_name} ${data.model_name}</div>

  <h2>Kundeinformasjon</h2>
  <div class="info-row"><span class="label">Navn:</span> <span class="value">${data.customer_name}</span></div>
  <div class="info-row"><span class="label">Telefon:</span> <span class="value">${data.phone}</span></div>
  <div class="info-row"><span class="label">E-post:</span> <span class="value">${data.email}</span></div>
  <div class="info-row"><span class="label">Postnummer:</span> <span class="value">${data.postcode}</span></div>

  <h2>Kjøpsdetaljer</h2>
  <div class="info-row"><span class="label">Tidslinje:</span> <span class="value">${data.purchase_timeline || 'Ikke oppgitt'}</span></div>
  <div class="info-row"><span class="label">Finansiering:</span> <span class="value">${data.financing || 'Ikke oppgitt'}</span></div>
  <div class="info-row"><span class="label">Innbytte:</span> <span class="value">${data.trade_in ? 'Ja' : 'Nei'}</span></div>
  ${data.trade_in && data.trade_in_reg ? `<div class="info-row"><span class="label">Innbytte reg.nr:</span> <span class="value">${data.trade_in_reg}</span></div>` : ''}
  ${data.trade_in && data.trade_in_mileage ? `<div class="info-row"><span class="label">Innbytte km-stand:</span> <span class="value">${data.trade_in_mileage}</span></div>` : ''}

  ${data.message ? `<h2>Melding fra kunde</h2><div class="message">${data.message.replace(/\n/g, '<br>')}</div>` : ''}

  <div class="footer">
    <div>Mottatt: ${new Date(data.created_at).toLocaleString('nb-NO')}</div>
    <div>Kilde: Biljakt</div>
  </div>
</body>
</html>
`.trim();

  return { subject, html, text };
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

    const payload: EmailPayload = await req.json();

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@biljakt.no';

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');

      await supabase
        .from('lead_deliveries')
        .update({
          status: 'failed',
          error_message: 'RESEND_API_KEY not configured',
          delivered_at: new Date().toISOString(),
        })
        .eq('lead_id', payload.lead_id)
        .eq('dealer_id', payload.dealer_id);

      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailContent = generateEmailContent(payload.lead_data);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [payload.dealer_email],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error('Resend error:', errorData);

      await supabase
        .from('lead_deliveries')
        .update({
          status: 'failed',
          error_message: errorData.message || 'Failed to send email',
          delivered_at: new Date().toISOString(),
        })
        .eq('lead_id', payload.lead_id)
        .eq('dealer_id', payload.dealer_id);

      return new Response(
        JSON.stringify({ error: errorData.message || 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendData = await resendResponse.json();

    await supabase
      .from('lead_deliveries')
      .update({
        status: 'sent',
        delivered_at: new Date().toISOString(),
      })
      .eq('lead_id', payload.lead_id)
      .eq('dealer_id', payload.dealer_id);

    return new Response(
      JSON.stringify({ success: true, email_id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send email error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
