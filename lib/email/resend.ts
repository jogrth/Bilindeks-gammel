export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@biljakt.no';

  if (!resendApiKey) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function generateDealerLeadEmail(lead: {
  brand_name: string;
  model_name: string;
  customer_name: string;
  phone: string;
  email: string;
  postcode: string;
  purchase_timeline?: string;
  needs_financing: boolean;
  has_tradein: boolean;
  tradein_reg?: string;
  tradein_mileage?: string;
  message?: string;
  created_at: string;
}): { subject: string; html: string; text: string } {
  const subject = `Nytt lead fra Biljakt – ${lead.brand_name} ${lead.model_name}`;

  const text = `
Nytt lead fra Biljakt

Modell: ${lead.brand_name} ${lead.model_name}

KUNDEINFORMASJON
Navn: ${lead.customer_name}
Telefon: ${lead.phone}
E-post: ${lead.email}
Postnummer: ${lead.postcode}

KJØPSDETALJER
Tidslinje: ${lead.purchase_timeline || 'Ikke oppgitt'}
Finansiering: ${lead.needs_financing ? 'Ja' : 'Nei'}
Innbytte: ${lead.has_tradein ? 'Ja' : 'Nei'}
${lead.has_tradein && lead.tradein_reg ? `Innbytte reg.nr: ${lead.tradein_reg}` : ''}
${lead.has_tradein && lead.tradein_mileage ? `Innbytte km-stand: ${lead.tradein_mileage}` : ''}

${lead.message ? `MELDING FRA KUNDE:\n${lead.message}\n` : ''}
Mottatt: ${new Date(lead.created_at).toLocaleString('nb-NO')}
Kilde: Biljakt

---
Dette er et automatisk generert lead fra Biljakt.no
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
  <div class="model">${lead.brand_name} ${lead.model_name}</div>

  <h2>Kundeinformasjon</h2>
  <div class="info-row"><span class="label">Navn:</span> <span class="value">${lead.customer_name}</span></div>
  <div class="info-row"><span class="label">Telefon:</span> <span class="value">${lead.phone}</span></div>
  <div class="info-row"><span class="label">E-post:</span> <span class="value">${lead.email}</span></div>
  <div class="info-row"><span class="label">Postnummer:</span> <span class="value">${lead.postcode}</span></div>

  <h2>Kjøpsdetaljer</h2>
  <div class="info-row"><span class="label">Tidslinje:</span> <span class="value">${lead.purchase_timeline || 'Ikke oppgitt'}</span></div>
  <div class="info-row"><span class="label">Finansiering:</span> <span class="value">${lead.needs_financing ? 'Ja' : 'Nei'}</span></div>
  <div class="info-row"><span class="label">Innbytte:</span> <span class="value">${lead.has_tradein ? 'Ja' : 'Nei'}</span></div>
  ${lead.has_tradein && lead.tradein_reg ? `<div class="info-row"><span class="label">Innbytte reg.nr:</span> <span class="value">${lead.tradein_reg}</span></div>` : ''}
  ${lead.has_tradein && lead.tradein_mileage ? `<div class="info-row"><span class="label">Innbytte km-stand:</span> <span class="value">${lead.tradein_mileage}</span></div>` : ''}

  ${lead.message ? `<h2>Melding fra kunde</h2><div class="message">${lead.message.replace(/\n/g, '<br>')}</div>` : ''}

  <div class="footer">
    <div>Mottatt: ${new Date(lead.created_at).toLocaleString('nb-NO')}</div>
    <div>Kilde: Biljakt</div>
  </div>
</body>
</html>
`.trim();

  return { subject, html, text };
}
