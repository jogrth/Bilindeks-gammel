/**
 * Lead Routing Algorithm
 *
 * Routes leads to appropriate dealers based on:
 * - Model match
 * - Brand match
 * - Geographic postcode range
 * - Active status
 * - Priority
 */

import { createClient } from '@/lib/supabase/server';

interface Dealer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  brand_preference: string | null;
  postcode_from: number | null;
  postcode_to: number | null;
  active: boolean;
  price_per_lead: number | null;
}

interface ModelDealerRelation {
  dealer_id: string;
  priority: number;
  active: boolean;
  dealer: Dealer;
}

interface LeadRoutingResult {
  dealers: Array<{
    dealer_id: string;
    dealer_name: string;
    dealer_email: string;
    priority: number;
    match_reason: string;
  }>;
  totalMatched: number;
}

/**
 * Parse Norwegian postcode to numeric value
 */
function parsePostcode(postcode: string | null | undefined): number | null {
  if (!postcode) return null;
  const cleaned = postcode.replace(/\s/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Check if a postcode falls within dealer's service range
 */
function isPostcodeInRange(
  postcode: number,
  dealerFrom: number | null,
  dealerTo: number | null
): boolean {
  if (dealerFrom === null || dealerTo === null) {
    return false; // Dealer has no postcode range set
  }
  return postcode >= dealerFrom && postcode <= dealerTo;
}

/**
 * Find dealers that can handle a specific lead
 */
export async function findMatchingDealers(
  modelId: string,
  brandId: string,
  userPostcode: string | null
): Promise<LeadRoutingResult> {
  const supabase = await createClient();
  const postcodeNum = parsePostcode(userPostcode);

  const matchedDealers: LeadRoutingResult['dealers'] = [];

  // Step 1: Find dealers directly linked to this model
  const { data: modelDealers, error: modelDealersError } = await supabase
    .from('model_dealers')
    .select(`
      dealer_id,
      priority,
      active,
      dealer:dealers(
        id,
        name,
        email,
        phone,
        brand_preference,
        postcode_from,
        postcode_to,
        active,
        price_per_lead
      )
    `)
    .eq('model_id', modelId)
    .eq('active', true);

  if (!modelDealersError && modelDealers) {
    for (const relation of modelDealers as unknown as ModelDealerRelation[]) {
      const dealer = relation.dealer;

      // Check if dealer is active
      if (!dealer.active) continue;

      // Check postcode range if user provided postcode
      if (postcodeNum) {
        if (!isPostcodeInRange(postcodeNum, dealer.postcode_from, dealer.postcode_to)) {
          continue; // Outside dealer's service area
        }
      }

      matchedDealers.push({
        dealer_id: dealer.id,
        dealer_name: dealer.name,
        dealer_email: dealer.email,
        priority: relation.priority,
        match_reason: 'Model-specific dealer',
      });
    }
  }

  // Step 2: If no model-specific dealers, find brand-level dealers
  if (matchedDealers.length === 0) {
    const { data: brandDealers, error: brandDealersError } = await supabase
      .from('dealers')
      .select('*')
      .eq('active', true)
      .eq('brand_preference', brandId);

    if (!brandDealersError && brandDealers) {
      for (const dealer of brandDealers) {
        // Check postcode range if user provided postcode
        if (postcodeNum) {
          if (!isPostcodeInRange(postcodeNum, dealer.postcode_from, dealer.postcode_to)) {
            continue;
          }
        }

        matchedDealers.push({
          dealer_id: dealer.id,
          dealer_name: dealer.name,
          dealer_email: dealer.email,
          priority: 999, // Lower priority for brand-level matches
          match_reason: 'Brand dealer',
        });
      }
    }
  }

  // Sort by priority (ascending - lower number = higher priority)
  matchedDealers.sort((a, b) => a.priority - b.priority);

  return {
    dealers: matchedDealers,
    totalMatched: matchedDealers.length,
  };
}

/**
 * Create lead delivery records for matched dealers
 */
export async function createLeadDeliveries(
  leadId: string,
  dealerIds: string[]
): Promise<{ success: boolean; created: number; error?: string }> {
  const supabase = await createClient();

  const deliveries = dealerIds.map((dealerId) => ({
    lead_id: leadId,
    dealer_id: dealerId,
    status: 'pending' as const,
  }));

  const { data, error } = await supabase
    .from('lead_deliveries')
    .insert(deliveries)
    .select();

  if (error) {
    return {
      success: false,
      created: 0,
      error: error.message,
    };
  }

  return {
    success: true,
    created: data?.length || 0,
  };
}

/**
 * Route a lead to appropriate dealers and create deliveries
 */
export async function routeLead(
  leadId: string,
  modelId: string,
  brandId: string,
  userPostcode: string | null
): Promise<{
  success: boolean;
  dealersMatched: number;
  deliveriesCreated: number;
  error?: string;
}> {
  try {
    // Find matching dealers
    const routing = await findMatchingDealers(modelId, brandId, userPostcode);

    if (routing.totalMatched === 0) {
      return {
        success: true,
        dealersMatched: 0,
        deliveriesCreated: 0,
        error: 'No matching dealers found',
      };
    }

    // Create lead deliveries
    const dealerIds = routing.dealers.map((d) => d.dealer_id);
    const deliveryResult = await createLeadDeliveries(leadId, dealerIds);

    return {
      success: deliveryResult.success,
      dealersMatched: routing.totalMatched,
      deliveriesCreated: deliveryResult.created,
      error: deliveryResult.error,
    };
  } catch (error) {
    return {
      success: false,
      dealersMatched: 0,
      deliveriesCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
