'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateModelData(modelId: string, formData: FormData) {
  const supabase = await createClient();

  const updates: any = {};

  const fields = [
    'intro_text',
    'body_type',
    'drivetrain',
    'range_wltp_km',
    'price_from_nok',
    'cargo_liters',
    'towing_kg',
    'seats_min',
    'seats_max',
    'charge_speed_kw',
  ];

  fields.forEach((field) => {
    const value = formData.get(field);
    if (value !== null && value !== '') {
      if (field === 'range_wltp_km' || field === 'price_from_nok' || field === 'cargo_liters' ||
          field === 'towing_kg' || field === 'seats_min' || field === 'seats_max' || field === 'charge_speed_kw') {
        updates[field] = parseInt(value as string);
      } else {
        updates[field] = value;
      }
    }
  });

  const { error } = await supabase
    .from('models')
    .update(updates)
    .eq('id', modelId);

  if (error) {
    throw new Error(`Failed to update model: ${error.message}`);
  }

  revalidatePath(`/admin/models/${modelId}`);
  revalidatePath('/admin/models');
  revalidatePath('/cars');
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

  const review_status = published ? 'published' : 'draft';

  const { error } = await supabase
    .from('models')
    .update({ review_status })
    .eq('id', modelId);

  if (error) {
    throw new Error(`Failed to toggle published status: ${error.message}`);
  }

  revalidatePath('/admin/models');
  revalidatePath('/cars');
  return { success: true };
}

export async function createModel(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const brandId = formData.get('brand_id') as string;
  const slug = formData.get('slug') as string || name.toLowerCase().replace(/\s+/g, '-');

  const model: any = {
    name,
    brand_id: brandId,
    slug,
    body_type: formData.get('body_type') as string || null,
    drivetrain: formData.get('drivetrain') as string || null,
    drive_type: formData.get('drive_type') as string || null,
    intro_text: formData.get('intro_text') as string || null,
    image_url: formData.get('image_url') as string || null,
    review_status: formData.get('published') === 'true' ? 'published' : 'draft',
    status: formData.get('published') === 'true' ? 'published' : 'draft',
  };

  const numFields = ['seats_min', 'seats_max', 'cargo_liters', 'towing_kg', 'range_wltp_km', 'charge_speed_kw', 'price_from_nok'];
  numFields.forEach((field) => {
    const value = formData.get(field);
    if (value && value !== '') {
      model[field] = parseInt(value as string);
    }
  });

  const { error } = await supabase
    .from('models')
    .insert([model]);

  if (error) {
    throw new Error(`Failed to create model: ${error.message}`);
  }

  revalidatePath('/admin/models');
  revalidatePath('/cars');
  return { success: true };
}

export async function deleteModel(modelId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({
      deleted_at: new Date().toISOString(),
      review_status: 'unpublished',
    })
    .eq('id', modelId);

  if (error) {
    throw new Error(`Failed to delete model: ${error.message}`);
  }

  revalidatePath('/admin/models');
  revalidatePath('/cars');
  return { success: true };
}

export async function unpublishModel(modelId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({ review_status: 'unpublished' })
    .eq('id', modelId);

  if (error) {
    throw new Error(`Failed to unpublish model: ${error.message}`);
  }

  revalidatePath('/admin/models');
  revalidatePath('/cars');
  return { success: true };
}

export async function restoreModel(modelId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({
      deleted_at: null,
      review_status: 'draft',
    })
    .eq('id', modelId);

  if (error) {
    throw new Error(`Failed to restore model: ${error.message}`);
  }

  revalidatePath('/admin/models');
  revalidatePath('/cars');
  return { success: true };
}
