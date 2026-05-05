'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (value === null || value === '') return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseOptionalString(value: FormDataEntryValue | null) {
  if (value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function revalidateModelPaths(modelId?: string) {
  if (modelId) revalidatePath(`/admin/models/${modelId}`);
  revalidatePath('/admin/models');
  revalidatePath('/cars');
}

export async function updateModelData(modelId: string, formData: FormData) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};

  const textFields = [
    'intro_text',
    'body_type',
    'drivetrain',
    'drive_type',
  ];

  const numberFields = [
    'range_wltp_km',
    'price_from_nok',
    'cargo_liters',
    'towing_kg',
    'seats_min',
    'seats_max',
    'charge_speed_kw',
  ];

  textFields.forEach((field) => {
    if (formData.has(field)) {
      updates[field] = parseOptionalString(formData.get(field));
    }
  });

  numberFields.forEach((field) => {
    if (formData.has(field)) {
      updates[field] = parseOptionalNumber(formData.get(field));
    }
  });

  // Viktig: frontend/listing bruker image_primary_url som krav for synlighet.
  // Admin kan fortsatt sende image_url, men vi normaliserer alltid til begge felt.
  const submittedImageUrl = parseOptionalString(
    formData.get('image_primary_url') ?? formData.get('image_url'),
  );

  if (submittedImageUrl !== null) {
    updates.image_primary_url = submittedImageUrl;
    updates.image_url = submittedImageUrl;
  } else if (formData.has('image_primary_url') || formData.has('image_url')) {
    updates.image_primary_url = null;
    updates.image_url = null;
  }

  const { error } = await supabase
    .from('models')
    .update(updates)
    .eq('id', modelId);

  if (error) {
    throw new Error(`Failed to update model: ${error.message}`);
  }

  if (submittedImageUrl) {
    await supabase
      .from('model_images')
      .update({ is_primary: false })
      .eq('model_id', modelId);

    await supabase
      .from('model_images')
      .upsert(
        {
          model_id: modelId,
          url: submittedImageUrl,
          alt_text: parseOptionalString(formData.get('image_alt_text')) || 'Bilmodell',
          is_primary: true,
          display_order: 0,
          source: 'manual',
        },
        { onConflict: 'model_id,url' },
      );
  }

  revalidateModelPaths(modelId);
  return { success: true };
}

export async function addModelDealer(modelId: string, dealerId: string, priority: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('model_dealers')
    .insert([{
      model_id: modelId,
      dealer_id: dealerId,
      priority,
      active: true,
    }]);

  if (error) {
    throw new Error(`Failed to add dealer: ${error.message}`);
  }

  revalidatePath(`/admin/models/${modelId}`);
  return { success: true };
}

export async function removeModelDealer(modelId: string, dealerId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('model_dealers')
    .delete()
    .eq('model_id', modelId)
    .eq('dealer_id', dealerId);

  if (error) {
    throw new Error(`Failed to remove dealer: ${error.message}`);
  }

  revalidatePath(`/admin/models/${modelId}`);
  return { success: true };
}

export async function updateModelDealerPriority(modelId: string, dealerId: string, priority: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('model_dealers')
    .update({ priority })
    .eq('model_id', modelId)
    .eq('dealer_id', dealerId);

  if (error) {
    throw new Error(`Failed to update priority: ${error.message}`);
  }

  revalidatePath(`/admin/models/${modelId}`);
  return { success: true };
}

export async function addSimilarModel(modelId: string, similarModelId: string, similarityScore: number, isPinned: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('similar_models')
    .insert([{
      model_id: modelId,
      similar_model_id: similarModelId,
      similarity_score: similarityScore,
      is_pinned: isPinned,
    }]);

  if (error) {
    throw new Error(`Failed to add similar model: ${error.message}`);
  }

  revalidatePath(`/admin/models/${modelId}`);
  return { success: true };
}

export async function removeSimilarModel(modelId: string, similarModelId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('similar_models')
    .delete()
    .eq('model_id', modelId)
    .eq('similar_model_id', similarModelId);

  if (error) {
    throw new Error(`Failed to remove similar model: ${error.message}`);
  }

  revalidatePath(`/admin/models/${modelId}`);
  return { success: true };
}

export async function toggleSimilarModelPin(modelId: string, similarModelId: string, isPinned: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('similar_models')
    .update({ is_pinned: isPinned })
    .eq('model_id', modelId)
    .eq('similar_model_id', similarModelId);

  if (error) {
    throw new Error(`Failed to toggle pin: ${error.message}`);
  }

  revalidatePath(`/admin/models/${modelId}`);
  return { success: true };
}

export async function getAllModelsForAdmin() {
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching models:', error);
    return [];
  }

  return data || [];
}

export async function getModelByIdForAdmin(id: string) {
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
    .maybeSingle();

  if (error) {
    console.error('Error fetching model:', error);
    return null;
  }

  return data;
}

export async function toggleModelPublished(modelId: string, published: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({
      published,
      review_status: published ? 'published' : 'draft',
      status: published ? 'published' : 'draft',
    })
    .eq('id', modelId);

  if (error) {
    throw new Error(`Failed to toggle published status: ${error.message}`);
  }

  revalidateModelPaths(modelId);
  return { success: true };
}

export async function createModel(formData: FormData) {
  const supabase = await createClient();

  const name = parseOptionalString(formData.get('name'));
  const brandId = parseOptionalString(formData.get('brand_id'));

  if (!name) throw new Error('Model name is required');
  if (!brandId) throw new Error('Brand is required');

  const rawSlug = parseOptionalString(formData.get('slug'));
  const slug = rawSlug || name.toLowerCase().replace(/\s+/g, '-');
  const isPublished = formData.get('published') === 'true';
  const imageUrl = parseOptionalString(formData.get('image_primary_url') ?? formData.get('image_url'));

  const model: Record<string, unknown> = {
    name,
    brand_id: brandId,
    slug,
    body_type: parseOptionalString(formData.get('body_type')),
    drivetrain: parseOptionalString(formData.get('drivetrain')),
    drive_type: parseOptionalString(formData.get('drive_type')),
    intro_text: parseOptionalString(formData.get('intro_text')),
    image_url: imageUrl,
    image_primary_url: imageUrl,
    published: isPublished,
    review_status: isPublished ? 'published' : 'draft',
    status: isPublished ? 'published' : 'draft',
  };

  const numFields = [
    'seats_min',
    'seats_max',
    'cargo_liters',
    'towing_kg',
    'range_wltp_km',
    'charge_speed_kw',
    'price_from_nok',
  ];

  numFields.forEach((field) => {
    const parsed = parseOptionalNumber(formData.get(field));
    if (parsed !== null) model[field] = parsed;
  });

  const { data, error } = await supabase
    .from('models')
    .insert([model])
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create model: ${error.message}`);
  }

  if (imageUrl && data?.id) {
    await supabase
      .from('model_images')
      .insert({
        model_id: data.id,
        url: imageUrl,
        alt_text: name,
        is_primary: true,
        display_order: 0,
        source: 'manual',
      });
  }

  revalidateModelPaths(data?.id);
  return { success: true, id: data?.id };
}

export async function deleteModel(modelId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({
      deleted_at: new Date().toISOString(),
      published: false,
      review_status: 'unpublished',
      status: 'unpublished',
    })
    .eq('id', modelId);

  if (error) {
    throw new Error(`Failed to delete model: ${error.message}`);
  }

  revalidateModelPaths(modelId);
  return { success: true };
}

export async function unpublishModel(modelId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({
      published: false,
      review_status: 'unpublished',
      status: 'unpublished',
    })
    .eq('id', modelId);

  if (error) {
    throw new Error(`Failed to unpublish model: ${error.message}`);
  }

  revalidateModelPaths(modelId);
  return { success: true };
}

export async function restoreModel(modelId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({
      deleted_at: null,
      published: false,
      review_status: 'draft',
      status: 'draft',
    })
    .eq('id', modelId);

  if (error) {
    throw new Error(`Failed to restore model: ${error.message}`);
  }

  revalidateModelPaths(modelId);
  return { success: true };
}
