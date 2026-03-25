import { createClient } from '@/lib/supabase/server';
import type { CarModel, CarFilters, ModelImage, ModelTrimLevel, ModelFAQ, ModelSEOSection } from '@/types';

export async function getPublishedModels(filters?: CarFilters) {
  const supabase = await createClient();

  let query = supabase
    .from('models')
    .select(`
      *,
      brands (
        name,
        slug
      )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (filters?.brandId) {
    query = query.eq('brand_id', filters.brandId);
  }

  if (filters?.modelId) {
    query = query.eq('id', filters.modelId);
  }

  if (filters?.bodyType) {
    query = query.eq('body_type', filters.bodyType);
  }

  if (filters?.drivetrain) {
    query = query.eq('drivetrain', filters.drivetrain);
  }

  if (filters?.driveType) {
    query = query.eq('drive_type', filters.driveType);
  }

  if (filters?.minRange) {
    query = query.gte('range_wltp_km', filters.minRange);
  }

  if (filters?.maxRange) {
    query = query.lte('range_wltp_km', filters.maxRange);
  }

  if (filters?.minPrice) {
    query = query.gte('price_from_nok', filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte('price_from_nok', filters.maxPrice);
  }

  if (filters?.minCargo) {
    query = query.gte('cargo_liters', filters.minCargo);
  }

  if (filters?.maxCargo) {
    query = query.lte('cargo_liters', filters.maxCargo);
  }

  if (filters?.minTowing) {
    query = query.gte('towing_kg', filters.minTowing);
  }

  if (filters?.maxTowing) {
    query = query.lte('towing_kg', filters.maxTowing);
  }

  if (filters?.minSeats) {
    query = query.gte('seats_min', filters.minSeats);
  }

  if (filters?.maxSeats) {
    query = query.lte('seats_max', filters.maxSeats);
  }

  if (filters?.only4x4) {
    query = query.eq('drive_type', 'Firehjulsdrift');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching models:', error);
    return [];
  }

  return (data || []).map(model => ({
    ...model,
    brand_name: model.brands?.name,
    brand_slug: model.brands?.slug,
  })) as CarModel[];
}

export async function getModelBySlug(slug: string) {
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
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    brand_name: data.brands?.name,
    brand_slug: data.brands?.slug,
  } as CarModel;
}

export async function getSimilarModels(modelId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('similar_models')
    .select(`
      similarity_score,
      is_pinned,
      similar_model:models!similar_models_similar_model_id_fkey (
        *,
        brands (
          name,
          slug
        )
      )
    `)
    .eq('model_id', modelId)
    .order('is_pinned', { ascending: false })
    .order('similarity_score', { ascending: false })
    .limit(2);

  if (error || !data) {
    return [];
  }

  return data.map((item: any) => {
    const model = item.similar_model;
    const brands = model.brands;
    return {
      id: model.id,
      brand_id: model.brand_id,
      brand_name: brands?.name || '',
      brand_slug: brands?.slug || '',
      name: model.name,
      slug: model.slug,
      body_type: model.body_type,
      drivetrain: model.drivetrain,
      drive_type: model.drive_type,
      seats_min: model.seats_min,
      seats_max: model.seats_max,
      cargo_liters: model.cargo_liters,
      towing_kg: model.towing_kg,
      range_wltp_km: model.range_wltp_km,
      charge_speed_kw: model.charge_speed_kw,
      price_from_nok: model.price_from_nok,
      image_url: model.image_url,
      intro_text: model.intro_text,
      source_url: model.source_url,
      status: model.status,
      confidence_score: model.confidence_score,
      published: model.published,
      created_at: model.created_at,
      updated_at: model.updated_at,
    } as CarModel;
  });
}

export async function getAllBrands() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return data || [];
}

export async function getModelImages(modelId: string): Promise<ModelImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('model_images')
    .select('*')
    .eq('model_id', modelId)
    .order('is_primary', { ascending: false })
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching model images:', error);
    return [];
  }

  return data || [];
}

export async function getModelTrimLevels(modelId: string): Promise<ModelTrimLevel[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('model_trim_levels')
    .select('*')
    .eq('model_id', modelId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching trim levels:', error);
    return [];
  }

  return data || [];
}

export async function getModelFAQs(modelId: string): Promise<ModelFAQ[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('model_faqs')
    .select('*')
    .eq('model_id', modelId)
    .order('display_order', { ascending: true});

  if (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }

  return data || [];
}

export async function getModelSEOSections(modelId: string): Promise<ModelSEOSection[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('model_seo_sections')
    .select('*')
    .eq('model_id', modelId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching SEO sections:', error);
    return [];
  }

  return data || [];
}
