import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/helpers';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const modelId = formData.get('modelId') as string;

    if (!file || !modelId) {
      return Response.json(
        { error: 'File and modelId are required' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const fileExt = file.name.split('.').pop();
    const fileName = `${modelId}-${Date.now()}.${fileExt}`;
    const filePath = `models/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('model-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return Response.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('model-images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('models')
      .update({
        image_url: publicUrl,
        image_storage_path: filePath,
      })
      .eq('id', modelId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({
      url: publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
