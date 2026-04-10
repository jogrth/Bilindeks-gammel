import { createClient } from '@supabase/supabase-js';

export interface ModelImage {
  id: string;
  model_id: string;
  url: string;
  alt_text?: string;
  caption?: string;
  source?: string;
  is_primary: boolean;
  display_order: number;
}

export async function saveModelImage(
  modelId: string,
  imageUrl: string,
  options: {
    isPrimary?: boolean;
    altText?: string;
    caption?: string;
    source?: string;
    displayOrder?: number;
  } = {}
): Promise<ModelImage | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (options.isPrimary) {
      await supabase
        .from('model_images')
        .update({ is_primary: false })
        .eq('model_id', modelId);
    }

    const { data, error } = await supabase
      .from('model_images')
      .insert({
        model_id: modelId,
        url: imageUrl,
        alt_text: options.altText,
        caption: options.caption,
        source: options.source,
        is_primary: options.isPrimary || false,
        display_order: options.displayOrder || 0,
      })
      .select()
      .single();

    if (error) throw error;

    if (options.isPrimary) {
      await supabase
        .from('models')
        .update({ image_primary_url: imageUrl })
        .eq('id', modelId);
    }

    return data;
  } catch (error) {
    console.error('[IMAGE-MANAGEMENT] Error saving image:', error);
    return null;
  }
}

export async function getModelImages(modelId: string): Promise<ModelImage[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data, error } = await supabase
      .from('model_images')
      .select('*')
      .eq('model_id', modelId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[IMAGE-MANAGEMENT] Error fetching images:', error);
    return [];
  }
}

export async function setPrimaryImage(modelId: string, imageId: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    await supabase
      .from('model_images')
      .update({ is_primary: false })
      .eq('model_id', modelId);

    const { data: image } = await supabase
      .from('model_images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .select()
      .single();

    if (image) {
      await supabase
        .from('models')
        .update({ image_primary_url: image.url })
        .eq('id', modelId);
    }

    return true;
  } catch (error) {
    console.error('[IMAGE-MANAGEMENT] Error setting primary image:', error);
    return false;
  }
}

export async function deleteModelImage(imageId: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { error } = await supabase
      .from('model_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[IMAGE-MANAGEMENT] Error deleting image:', error);
    return false;
  }
}

export function getPlaceholderImage(brand: string, model: string): string {
  return `https://via.placeholder.com/800x500/e5e7eb/6b7280?text=${encodeURIComponent(brand + ' ' + model)}`;
}

export async function fetchAndSaveCarImage(
  modelId: string,
  brandName: string,
  modelName: string
): Promise<boolean> {
  const pexelsApiKey = process.env.PEXELS_API_KEY;

  if (!pexelsApiKey) {
    console.log('[IMAGE-FETCH] No PEXELS_API_KEY configured, skipping auto image fetch');
    return false;
  }

  const query = `${brandName} ${modelName} car`;

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      {
        headers: { Authorization: pexelsApiKey },
      }
    );

    if (!response.ok) {
      console.error('[IMAGE-FETCH] Pexels API error:', response.status);
      return false;
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      console.log('[IMAGE-FETCH] No photos found for:', query);
      return false;
    }

    const photo = data.photos[0];
    const imageUrl = photo.src.large2x || photo.src.large || photo.src.original;

    const saved = await saveModelImage(modelId, imageUrl, {
      isPrimary: true,
      altText: `${brandName} ${modelName}`,
      source: 'pexels',
      displayOrder: 0,
    });

    if (saved) {
      console.log('[IMAGE-FETCH] Image saved for model:', modelId);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[IMAGE-FETCH] Error fetching image:', error);
    return false;
  }
}
