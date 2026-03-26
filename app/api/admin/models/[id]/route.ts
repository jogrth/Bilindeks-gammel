import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('models')
    .select(`
      *,
      brands (
        name,
        slug
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Model not found' }, { status: 404 });
  }

  return Response.json({
    ...data,
    brand_name: data.brands?.name,
    brand_slug: data.brands?.slug,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const updateData: any = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.intro_text !== undefined) updateData.intro_text = body.intro_text;
  if (body.body_type !== undefined) updateData.body_type = body.body_type;
  if (body.drivetrain !== undefined) updateData.drivetrain = body.drivetrain;
  if (body.drive_type !== undefined) updateData.drive_type = body.drive_type;
  if (body.seats_min !== undefined) updateData.seats_min = body.seats_min ? parseInt(body.seats_min) : null;
  if (body.seats_max !== undefined) updateData.seats_max = body.seats_max ? parseInt(body.seats_max) : null;
  if (body.cargo_liters !== undefined) updateData.cargo_liters = body.cargo_liters ? parseInt(body.cargo_liters) : null;
  if (body.towing_kg !== undefined) updateData.towing_kg = body.towing_kg ? parseInt(body.towing_kg) : null;
  if (body.range_wltp_km !== undefined) updateData.range_wltp_km = body.range_wltp_km ? parseInt(body.range_wltp_km) : null;
  if (body.charge_speed_kw !== undefined) updateData.charge_speed_kw = body.charge_speed_kw ? parseInt(body.charge_speed_kw) : null;
  if (body.price_from_nok !== undefined) updateData.price_from_nok = body.price_from_nok ? parseInt(body.price_from_nok) : null;
  if (body.model_year_start !== undefined) updateData.model_year_start = body.model_year_start ? parseInt(body.model_year_start) : null;
  if (body.model_year_end !== undefined) updateData.model_year_end = body.model_year_end ? parseInt(body.model_year_end) : null;
  if (body.review_notes !== undefined) updateData.review_notes = body.review_notes;
  if (body.review_status !== undefined) updateData.review_status = body.review_status;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.image_url !== undefined) updateData.image_url = body.image_url;
  if (body.image_storage_path !== undefined) updateData.image_storage_path = body.image_storage_path;

  const { data, error } = await supabase
    .from('models')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({
      deleted_at: new Date().toISOString(),
      review_status: 'unpublished',
    })
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}
