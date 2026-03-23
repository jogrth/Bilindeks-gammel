'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAllLeads() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      models (
        id,
        name,
        slug,
        brands (
          name,
          slug
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return data || [];
}

export async function getLeadById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      models (
        id,
        name,
        slug,
        brands (
          name,
          slug
        )
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching lead:', error);
    return null;
  }

  return data;
}

export async function getLeadDeliveries(leadId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lead_deliveries')
    .select(`
      *,
      dealers (
        id,
        name,
        email
      )
    `)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lead deliveries:', error);
    return [];
  }

  return data || [];
}
