import { createClient } from '@/lib/supabase/server';

export type ReviewStatus = 'draft' | 'needs_review' | 'published' | 'unpublished';

export interface PublicationRequirements {
  qualityScore: number;
  hasImage: boolean;
  hasPrice: boolean;
  hasRange: boolean;
  isDeleted: boolean;
  meetsMinimumQuality: boolean;
  canPublish: boolean;
  reasons: string[];
}

export async function checkPublicationRequirements(
  modelId: string
): Promise<PublicationRequirements> {
  const supabase = await createClient();

  const { data: model, error } = await supabase
    .from('models')
    .select('quality_score, image_primary_url, price_from_nok, range_wltp_km, deleted_at')
    .eq('id', modelId)
    .maybeSingle();

  if (error || !model) {
    throw new Error(`Model not found: ${modelId}`);
  }

  const requirements: PublicationRequirements = {
    qualityScore: model.quality_score || 0,
    hasImage: model.image_primary_url != null,
    hasPrice: model.price_from_nok != null,
    hasRange: model.range_wltp_km != null,
    isDeleted: model.deleted_at != null,
    meetsMinimumQuality: (model.quality_score || 0) >= 70,
    canPublish: false,
    reasons: [],
  };

  if (requirements.isDeleted) {
    requirements.reasons.push('Model is deleted');
  }
  if (!requirements.hasImage) {
    requirements.reasons.push('Missing primary image');
  }
  if (!requirements.hasPrice) {
    requirements.reasons.push('Missing price (price_from_nok)');
  }
  if (!requirements.hasRange) {
    requirements.reasons.push('Missing range (range_wltp_km)');
  }
  if (!requirements.meetsMinimumQuality) {
    requirements.reasons.push(`Quality score ${requirements.qualityScore} is below minimum (70)`);
  }

  requirements.canPublish =
    !requirements.isDeleted &&
    requirements.hasImage &&
    requirements.hasPrice &&
    requirements.hasRange &&
    requirements.meetsMinimumQuality;

  return requirements;
}

export async function publishModel(modelId: string): Promise<{ success: boolean; error?: string }> {
  const requirements = await checkPublicationRequirements(modelId);

  if (!requirements.canPublish) {
    return {
      success: false,
      error: `Cannot publish: ${requirements.reasons.join(', ')}`,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({ review_status: 'published' })
    .eq('id', modelId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function unpublishModel(modelId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({ review_status: 'unpublished' })
    .eq('id', modelId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteModel(modelId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', modelId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function restoreModel(modelId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({
      deleted_at: null,
      review_status: 'draft',
    })
    .eq('id', modelId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function markNeedsReview(
  modelId: string,
  reasons: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({
      review_status: 'needs_review',
      needs_review_reasons: reasons,
    })
    .eq('id', modelId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export const PUBLIC_FILTER = 'review_status.eq.published,deleted_at.is.null';
export const ADMIN_FILTER = 'deleted_at.is.null';
export const TRASH_FILTER = 'deleted_at.not.is.null';
