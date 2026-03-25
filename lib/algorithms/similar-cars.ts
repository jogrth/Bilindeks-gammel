/**
 * Similar Cars Algorithm
 *
 * Automatically calculates similarity scores between car models based on
 * weighted criteria to provide relevant alternatives to users.
 */

import { createClient } from '@/lib/supabase/server';

interface Model {
  id: string;
  brand_id: string;
  name: string;
  body_type: string | null;
  drivetrain: string | null;
  drive_type: string | null;
  seats_min: number | null;
  seats_max: number | null;
  cargo_liters: number | null;
  towing_kg: number | null;
  range_wltp_km: number | null;
  price_from_nok: number | null;
  published: boolean;
}

interface SimilarityResult {
  model_id: string;
  similar_model_id: string;
  similarity_score: number;
}

/**
 * Weights for similarity calculation
 * Total should be 100 for percentage score
 */
const WEIGHTS = {
  bodyType: 25,        // Same segment/body type is very important
  priceRange: 20,      // Price proximity matters
  driveType: 15,       // AWD vs RWD vs FWD similarity
  rangeProximity: 15,  // Range similarity
  towingCapacity: 10,  // Towing capability
  cargoSpace: 10,      // Luggage space
  seating: 5,          // Seat count similarity
};

/**
 * Calculate similarity score between two models
 */
function calculateSimilarity(model1: Model, model2: Model): number {
  let score = 0;

  // Body type match (25 points)
  if (model1.body_type && model2.body_type) {
    if (model1.body_type === model2.body_type) {
      score += WEIGHTS.bodyType;
    }
  }

  // Price proximity (20 points)
  if (model1.price_from_nok && model2.price_from_nok) {
    const priceDiff = Math.abs(model1.price_from_nok - model2.price_from_nok);
    const avgPrice = (model1.price_from_nok + model2.price_from_nok) / 2;
    const priceDeviation = priceDiff / avgPrice;

    // Full points if within 15%, scaling down to 0 at 50% difference
    if (priceDeviation <= 0.15) {
      score += WEIGHTS.priceRange;
    } else if (priceDeviation <= 0.5) {
      score += WEIGHTS.priceRange * (1 - (priceDeviation - 0.15) / 0.35);
    }
  }

  // Drive type match (15 points)
  if (model1.drive_type && model2.drive_type) {
    if (model1.drive_type === model2.drive_type) {
      score += WEIGHTS.driveType;
    } else if (
      (model1.drive_type.includes('Firehjulsdrift') && model2.drive_type.includes('Firehjulsdrift')) ||
      (model1.drive_type.includes('AWD') && model2.drive_type.includes('AWD'))
    ) {
      score += WEIGHTS.driveType * 0.8; // Partial match for AWD variants
    }
  }

  // Range proximity (15 points)
  if (model1.range_wltp_km && model2.range_wltp_km) {
    const rangeDiff = Math.abs(model1.range_wltp_km - model2.range_wltp_km);
    const avgRange = (model1.range_wltp_km + model2.range_wltp_km) / 2;
    const rangeDeviation = rangeDiff / avgRange;

    // Full points if within 10%, scaling down to 0 at 40% difference
    if (rangeDeviation <= 0.1) {
      score += WEIGHTS.rangeProximity;
    } else if (rangeDeviation <= 0.4) {
      score += WEIGHTS.rangeProximity * (1 - (rangeDeviation - 0.1) / 0.3);
    }
  }

  // Towing capacity similarity (10 points)
  if (model1.towing_kg && model2.towing_kg) {
    const towingDiff = Math.abs(model1.towing_kg - model2.towing_kg);
    const avgTowing = (model1.towing_kg + model2.towing_kg) / 2;
    const towingDeviation = towingDiff / avgTowing;

    if (towingDeviation <= 0.2) {
      score += WEIGHTS.towingCapacity;
    } else if (towingDeviation <= 0.5) {
      score += WEIGHTS.towingCapacity * (1 - (towingDeviation - 0.2) / 0.3);
    }
  } else if (!model1.towing_kg && !model2.towing_kg) {
    // Both have no towing, that's a match
    score += WEIGHTS.towingCapacity * 0.5;
  }

  // Cargo space similarity (10 points)
  if (model1.cargo_liters && model2.cargo_liters) {
    const cargoDiff = Math.abs(model1.cargo_liters - model2.cargo_liters);
    const avgCargo = (model1.cargo_liters + model2.cargo_liters) / 2;
    const cargoDeviation = cargoDiff / avgCargo;

    if (cargoDeviation <= 0.15) {
      score += WEIGHTS.cargoSpace;
    } else if (cargoDeviation <= 0.4) {
      score += WEIGHTS.cargoSpace * (1 - (cargoDeviation - 0.15) / 0.25);
    }
  }

  // Seating similarity (5 points)
  if (model1.seats_max && model2.seats_max) {
    if (model1.seats_max === model2.seats_max) {
      score += WEIGHTS.seating;
    } else if (Math.abs(model1.seats_max - model2.seats_max) <= 2) {
      score += WEIGHTS.seating * 0.5;
    }
  }

  return Math.round(score * 100) / 100; // Round to 2 decimals
}

/**
 * Generate similar car relationships for a specific model
 */
export async function generateSimilarCarsForModel(
  modelId: string,
  limit: number = 5,
  includeUnpublished: boolean = false,
  supabaseClient?: any
): Promise<SimilarityResult[]> {
  const supabase = supabaseClient || await createClient();

  // Get the target model
  const { data: targetModel, error: targetError } = await supabase
    .from('models')
    .select('*')
    .eq('id', modelId)
    .maybeSingle();

  if (targetError || !targetModel) {
    throw new Error('Model not found');
  }

  // Get all other models (published or all depending on flag)
  let query = supabase
    .from('models')
    .select('*')
    .neq('id', modelId);

  if (!includeUnpublished) {
    query = query.eq('published', true);
  }

  const { data: allModels, error: modelsError } = await query;

  if (modelsError || !allModels) {
    return [];
  }

  // Calculate similarity scores
  const similarities: SimilarityResult[] = allModels
    .map((model: Model) => ({
      model_id: modelId,
      similar_model_id: model.id,
      similarity_score: calculateSimilarity(targetModel, model),
    }))
    .filter((s: SimilarityResult) => s.similarity_score >= 30) // Minimum 30% similarity
    .sort((a: SimilarityResult, b: SimilarityResult) => b.similarity_score - a.similarity_score)
    .slice(0, limit);

  return similarities;
}

/**
 * Generate similar car relationships for all published models
 */
export async function generateAllSimilarCars(): Promise<{
  success: boolean;
  processed: number;
  inserted: number;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Get all published models
    const { data: models, error: modelsError } = await supabase
      .from('models')
      .select('id')
      .eq('published', true);

    if (modelsError || !models) {
      return { success: false, processed: 0, inserted: 0, error: modelsError?.message };
    }

    let totalInserted = 0;

    // Process each model
    for (const model of models) {
      const similarities = await generateSimilarCarsForModel(model.id);

      if (similarities.length > 0) {
        // Delete existing similarities for this model
        await supabase
          .from('similar_models')
          .delete()
          .eq('model_id', model.id)
          .eq('is_pinned', false); // Keep manually pinned ones

        // Insert new similarities
        const { error: insertError } = await supabase
          .from('similar_models')
          .insert(similarities);

        if (!insertError) {
          totalInserted += similarities.length;
        }
      }
    }

    return {
      success: true,
      processed: models.length,
      inserted: totalInserted,
    };
  } catch (error) {
    return {
      success: false,
      processed: 0,
      inserted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get similar cars for a model (reads from database)
 */
export async function getSimilarCars(modelId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('similar_models')
    .select(`
      similarity_score,
      is_pinned,
      similar_model:models!similar_models_similar_model_id_fkey(
        id,
        name,
        slug,
        brand_id,
        body_type,
        drivetrain,
        drive_type,
        price_from_nok,
        range_wltp_km,
        image_url,
        intro_text
      )
    `)
    .eq('model_id', modelId)
    .order('is_pinned', { ascending: false })
    .order('similarity_score', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching similar cars:', error);
    return [];
  }

  return data;
}
