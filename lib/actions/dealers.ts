'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createDealer(formData: FormData) {
  const supabase = await createClient();

  const dealer = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    brand: formData.get('brand') as string,
    postcode_area: formData.get('postcode_area') as string,
    price_per_lead: formData.get('price_per_lead') ? parseInt(formData.get('price_per_lead') as string) : null,
    active: formData.get('active') === 'true',
  };

  const { error } = await supabase
    .from('dealers')
    .insert([dealer]);

  if (error) {
    throw new Error(`Failed to create dealer: ${error.message}`);
  }

  revalidatePath('/admin/dealers');
  return { success: true };
}

export async function updateDealer(id: string, formData: FormData) {
  const supabase = await createClient();

  const dealer = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    brand: formData.get('brand') as string,
    postcode_area: formData.get('postcode_area') as string,
    price_per_lead: formData.get('price_per_lead') ? parseInt(formData.get('price_per_lead') as string) : null,
    active: formData.get('active') === 'true',
  };

  const { error } = await supabase
    .from('dealers')
    .update(dealer)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update dealer: ${error.message}`);
  }

  revalidatePath('/admin/dealers');
  return { success: true };
}

export async function toggleDealerActive(id: string, active: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('dealers')
    .update({ active })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to toggle dealer: ${error.message}`);
  }

  revalidatePath('/admin/dealers');
  return { success: true };
}

export async function deleteDealer(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('dealers')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete dealer: ${error.message}`);
  }

  revalidatePath('/admin/dealers');
  return { success: true };
}

export async function getAllDealers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('dealers')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching dealers:', error);
    return [];
  }

  return data || [];
}

export async function getDealerById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('dealers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching dealer:', error);
    return null;
  }

  return data;
}

export async function linkDealerToModel(dealerId: string, modelId: string, priority: number = 1) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('model_dealers')
    .upsert({
      dealer_id: dealerId,
      model_id: modelId,
      priority,
      active: true,
    }, {
      onConflict: 'model_id,dealer_id'
    });

  if (error) {
    throw new Error(`Failed to link dealer to model: ${error.message}`);
  }

  revalidatePath('/admin/dealers');
  revalidatePath('/admin/models');
  return { success: true };
}

export async function unlinkDealerFromModel(dealerId: string, modelId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('model_dealers')
    .delete()
    .eq('dealer_id', dealerId)
    .eq('model_id', modelId);

  if (error) {
    throw new Error(`Failed to unlink dealer from model: ${error.message}`);
  }

  revalidatePath('/admin/dealers');
  revalidatePath('/admin/models');
  return { success: true };
}
