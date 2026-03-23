import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LeadFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LeadFormData = await request.json();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('leads')
      .insert({
        model_id: body.modelId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        postcode: body.postcode,
        purchase_timeline: body.purchaseTimeline,
        financing: body.financing,
        trade_in: body.tradeIn,
        trade_in_reg: body.tradeInReg,
        trade_in_mileage: body.tradeInMileage,
        message: body.message,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return Response.json({ error: 'Failed to create lead' }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error in POST /api/leads:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
