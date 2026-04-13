import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/helpers';

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

  if (body.title !== undefined) updateData.title = body.title;
  if (body.ingress !== undefined) updateData.ingress = body.ingress;
  if (body.topic !== undefined) updateData.topic = body.topic;
  if (body.meta_title !== undefined) updateData.meta_title = body.meta_title;
  if (body.meta_description !== undefined) updateData.meta_description = body.meta_description;
  if (body.review_notes !== undefined) updateData.review_notes = body.review_notes;
  if (body.body_content !== undefined) updateData.body_content = body.body_content;
  if (body.review_status !== undefined) {
    updateData.review_status = body.review_status;
    if (body.review_status === 'published') {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('articles')
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
    .from('articles')
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
