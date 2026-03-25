import { createClient } from '@supabase/supabase-js';

interface ComprehensiveEnrichmentData {
  specs: {
    brand: string;
    model: string;
    segment?: string;
    body_type: string;
    drivetrain: string;
    drive_type: string;
    seats_max: number;
    range_wltp_km: number;
    cargo_space_liters: number;
    towing_capacity_kg: number;
    price_from_nok: number;
    battery_kwh?: number;
    power_hp?: number;
    charge_speed_kw?: number;
    acceleration_0_100?: number;
    model_year_from?: number;
    model_year_to?: number;
  };
  specConfidence: Record<string, number>;
  specSources: Record<string, string>;
  intro_text: string;
  seoSections: Array<{
    section_key: string;
    heading: string;
    content: string;
    display_order: number;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
    display_order: number;
  }>;
  trimLevels: Array<{
    name: string;
    price_from_nok?: number;
    range_wltp_km?: number;
    drivetrain?: string;
    battery_kwh?: number;
    power_hp?: number;
    features: string[];
    display_order: number;
  }>;
  qualityScore: number;
  reviewStatus: 'draft' | 'needs_review' | 'reviewed' | 'published';
  needsReviewReasons: string[];
  enrichmentSource: 'openai_generated' | 'generic_fallback' | 'manual' | 'external_api';
  enrichmentConfidence: number;
  enrichmentNotes: string;
}

const COMPREHENSIVE_ENRICHMENT_PROMPT = `You are a Norwegian electric vehicle expert with access to current 2024-2026 market data. Given a car model, provide comprehensive, accurate technical and marketing data.

CRITICAL REQUIREMENTS:
1. Use REAL data when available - check your knowledge base for actual specifications
2. For Norwegian market prices, use realistic NOK values (most EVs range 400k-800k NOK)
3. Distinguish between verified facts and reasonable estimates
4. All Norwegian text must be natural, readable, and model-specific
5. NEVER use generic placeholders like "Brand Model" - always use the actual car name

Return ONLY valid JSON (no markdown, no code blocks):

{
  "specs": {
    "segment": "Compact SUV|Midsize SUV|Large SUV|Sedan|Station Wagon|Hatchback",
    "body_type": "SUV|Sedan|Stasjonsvogn|Crossover|Hatchback|Kombi",
    "drivetrain": "electric",
    "drive_type": "AWD|RWD|FWD",
    "seats_max": 5,
    "range_wltp_km": 450,
    "cargo_space_liters": 500,
    "towing_capacity_kg": 1500,
    "price_from_nok": 500000,
    "battery_kwh": 77.4,
    "power_hp": 286,
    "charge_speed_kw": 150,
    "acceleration_0_100": 5.9,
    "model_year_from": 2024,
    "model_year_to": null
  },
  "spec_confidence": {
    "range_wltp_km": 0.95,
    "price_from_nok": 0.85,
    "battery_kwh": 0.9,
    "power_hp": 0.9,
    "seats_max": 1.0,
    "cargo_space_liters": 0.8,
    "towing_capacity_kg": 0.85
  },
  "spec_sources": {
    "range_wltp_km": "manufacturer_spec",
    "price_from_nok": "norwegian_market_2024",
    "battery_kwh": "manufacturer_spec",
    "power_hp": "manufacturer_spec"
  },
  "intro_text": "One natural Norwegian sentence describing this specific car",
  "seo_sections": [
    {
      "section_key": "overview",
      "heading": "Kia EV9 - norsk elbilguide",
      "content": "2-3 paragraphs with specific facts about THIS car. Mention actual specs, real features, market position. Use the actual car name naturally.",
      "display_order": 0
    },
    {
      "section_key": "price",
      "heading": "Kia EV9 pris",
      "content": "Discuss actual price range, positioning in market, value proposition. Be specific to THIS model.",
      "display_order": 1
    },
    {
      "section_key": "range",
      "heading": "Kia EV9 rekkevidde",
      "content": "Discuss actual WLTP range, real-world performance, charging capabilities for THIS car.",
      "display_order": 2
    },
    {
      "section_key": "drivetrain",
      "heading": "Kia EV9 firehjulsdrift",
      "content": "Discuss drivetrain specifics for THIS model (AWD/RWD/FWD), performance implications.",
      "display_order": 3
    },
    {
      "section_key": "family",
      "heading": "Kia EV9 som familiebil",
      "content": "Discuss THIS car's family suitability, actual seating, cargo, safety features.",
      "display_order": 4
    },
    {
      "section_key": "cargo",
      "heading": "Kia EV9 bagasjerom",
      "content": "Discuss actual cargo capacity, versatility, practical use cases for THIS car.",
      "display_order": 5
    },
    {
      "section_key": "towing",
      "heading": "Kia EV9 hengervekt",
      "content": "Discuss towing capacity and capabilities for THIS specific model.",
      "display_order": 6
    }
  ],
  "faqs": [
    {
      "question": "Hva koster Kia EV9?",
      "answer": "Specific answer with actual price information for THIS car, mention trim variations if known.",
      "display_order": 0
    },
    {
      "question": "Hvor lang rekkevidde har Kia EV9?",
      "answer": "Specific answer with actual WLTP range and real-world expectations for THIS car.",
      "display_order": 1
    },
    {
      "question": "Har Kia EV9 firehjulsdrift?",
      "answer": "Specific answer about THIS car's drivetrain configuration.",
      "display_order": 2
    },
    {
      "question": "Hvor mange kan sitte i Kia EV9?",
      "answer": "Specific answer about THIS car's seating configuration.",
      "display_order": 3
    },
    {
      "question": "Kan Kia EV9 trekke tilhenger?",
      "answer": "Specific answer about THIS car's towing capacity and capabilities.",
      "display_order": 4
    }
  ],
  "trim_levels": [
    {
      "name": "Air",
      "price_from_nok": 600000,
      "range_wltp_km": 563,
      "drivetrain": "RWD",
      "battery_kwh": 99.8,
      "power_hp": 204,
      "features": ["19-tommers felger", "Varmepumpe", "Smart adaptiv cruisekontroll"],
      "display_order": 0
    },
    {
      "name": "Earth",
      "price_from_nok": 680000,
      "range_wltp_km": 505,
      "drivetrain": "AWD",
      "battery_kwh": 99.8,
      "power_hp": 384,
      "features": ["Firehjulsdrift", "20-tommers felger", "Premium lydanlegg"],
      "display_order": 1
    }
  ],
  "quality_assessment": {
    "has_verified_specs": true,
    "has_images": false,
    "has_trim_levels": true,
    "content_quality": "high|medium|low",
    "missing_critical_data": []
  },
  "enrichment_notes": "Explain what data is verified vs estimated, any uncertainties, data sources used",
  "confidence": 0.92
}

Quality Guidelines:
- confidence 0.9+: Well-known model with verified specs
- confidence 0.7-0.9: Good data with some estimates
- confidence 0.5-0.7: Partial data, several estimates
- confidence <0.5: Mostly estimates, needs verification

Content Quality:
- ALWAYS use the actual car name (e.g., "Kia EV9", not "Brand Model")
- Write naturally in Norwegian - avoid stiff translations
- Be specific and factual - mention real features and specs
- Don't repeat the car name excessively within paragraphs
- Structure content with good readability`;

async function callOpenAI(brandName: string, modelName: string): Promise<ComprehensiveEnrichmentData | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log('[ENRICHMENT] OpenAI API key not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: COMPREHENSIVE_ENRICHMENT_PROMPT,
          },
          {
            role: 'user',
            content: `Provide comprehensive enrichment data for: ${brandName} ${modelName}

Use your knowledge of actual vehicle specifications, Norwegian market prices, and current 2024-2026 model data. Be as accurate as possible.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ENRICHMENT] OpenAI API error:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      console.error('[ENRICHMENT] No content in OpenAI response');
      return null;
    }

    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedData = JSON.parse(jsonContent);

    const fullName = modelName.toLowerCase().startsWith(brandName.toLowerCase())
      ? modelName
      : `${brandName} ${modelName}`;

    const qualityAssessment = parsedData.quality_assessment || {};
    const needsReviewReasons: string[] = [];

    if (!qualityAssessment.has_verified_specs) {
      needsReviewReasons.push('Specs need verification');
    }
    if (!qualityAssessment.has_images) {
      needsReviewReasons.push('Missing images');
    }
    if (!qualityAssessment.has_trim_levels || (parsedData.trim_levels || []).length === 0) {
      needsReviewReasons.push('Missing trim levels');
    }
    if (parsedData.confidence < 0.7) {
      needsReviewReasons.push('Low confidence data');
    }
    if (qualityAssessment.missing_critical_data?.length > 0) {
      needsReviewReasons.push(`Missing: ${qualityAssessment.missing_critical_data.join(', ')}`);
    }

    let qualityScore = 0;
    if (parsedData.specs) qualityScore += 30;
    if (parsedData.trim_levels?.length > 0) qualityScore += 20;
    if (parsedData.seo_sections?.length >= 5) qualityScore += 20;
    if (parsedData.faqs?.length >= 5) qualityScore += 10;
    if (parsedData.confidence >= 0.8) qualityScore += 10;
    if (qualityAssessment.has_verified_specs) qualityScore += 10;

    return {
      specs: {
        brand: brandName,
        model: modelName,
        ...parsedData.specs,
      },
      specConfidence: parsedData.spec_confidence || {},
      specSources: parsedData.spec_sources || {},
      intro_text: parsedData.intro_text,
      seoSections: parsedData.seo_sections || [],
      faqs: parsedData.faqs || [],
      trimLevels: parsedData.trim_levels || [],
      qualityScore,
      reviewStatus: needsReviewReasons.length > 0 ? 'needs_review' : 'reviewed',
      needsReviewReasons,
      enrichmentSource: 'openai_generated',
      enrichmentConfidence: parsedData.confidence || 0.7,
      enrichmentNotes: parsedData.enrichment_notes || 'Generated by OpenAI GPT-4',
    };
  } catch (error) {
    console.error('[ENRICHMENT] AI enrichment error:', error);
    return null;
  }
}

function generateFallbackEnrichment(brandName: string, modelName: string): ComprehensiveEnrichmentData {
  const fullName = modelName.toLowerCase().startsWith(brandName.toLowerCase())
    ? modelName
    : `${brandName} ${modelName}`;

  return {
    specs: {
      brand: brandName,
      model: modelName,
      segment: 'SUV',
      body_type: 'SUV',
      drivetrain: 'electric',
      drive_type: 'RWD',
      seats_max: 5,
      range_wltp_km: 400,
      cargo_space_liters: 450,
      towing_capacity_kg: 1000,
      price_from_nok: 500000,
    },
    specConfidence: {
      range_wltp_km: 0.3,
      price_from_nok: 0.3,
      seats_max: 0.5,
      cargo_space_liters: 0.3,
      towing_capacity_kg: 0.3,
    },
    specSources: {
      range_wltp_km: 'estimated',
      price_from_nok: 'estimated',
    },
    intro_text: `${fullName} er en elektrisk bil med moderne teknologi.`,
    seoSections: [
      {
        section_key: 'overview',
        heading: `${fullName} - norsk elbilguide`,
        content: `${fullName} er en moderne elbil som kombinerer praktisk design med avansert teknologi. Med god plass og solid rekkevidde er dette et godt valg for norske forhold.`,
        display_order: 0,
      },
      {
        section_key: 'price',
        heading: `${fullName} pris`,
        content: `Prisene for ${fullName} varierer avhengig av utstyrsnivå og tilleggspakker. Kontakt forhandler for dagens priser og eventuelle kampanjer.`,
        display_order: 1,
      },
      {
        section_key: 'range',
        heading: `${fullName} rekkevidde`,
        content: `${fullName} tilbyr god rekkevidde for daglig bruk og lengre turer. Den faktiske rekkevidden vil variere basert på kjørestil, temperatur og veiforhold.`,
        display_order: 2,
      },
    ],
    faqs: [
      {
        question: `Hva koster ${fullName}?`,
        answer: `Prisen for ${fullName} varierer avhengig av valgt utstyrsnivå og tilleggsutstyr. Kontakt en forhandler for dagens priser og tilbud.`,
        display_order: 0,
      },
      {
        question: `Hvor lang rekkevidde har ${fullName}?`,
        answer: `${fullName} har en rekkevidde som dekker de fleste daglige kjørebehov. Den faktiske rekkevidden vil variere basert på kjøreforhold.`,
        display_order: 1,
      },
    ],
    trimLevels: [],
    qualityScore: 20,
    reviewStatus: 'draft',
    needsReviewReasons: [
      'Using fallback data - all specs need verification',
      'Missing images',
      'Missing trim levels',
      'Low confidence data',
    ],
    enrichmentSource: 'generic_fallback',
    enrichmentConfidence: 0.3,
    enrichmentNotes: 'Generic fallback data - OpenAI API not available. All values are estimates and must be manually verified.',
  };
}

export async function enrichModelComprehensively(
  brandName: string,
  modelName: string
): Promise<ComprehensiveEnrichmentData> {
  console.log(`[COMPREHENSIVE-ENRICHMENT] Starting for ${brandName} ${modelName}`);

  const aiResult = await callOpenAI(brandName, modelName);

  if (aiResult) {
    console.log(`[COMPREHENSIVE-ENRICHMENT] Using OpenAI result with quality score: ${aiResult.qualityScore}`);
    return aiResult;
  }

  console.log(`[COMPREHENSIVE-ENRICHMENT] Using fallback enrichment`);
  return generateFallbackEnrichment(brandName, modelName);
}

export async function saveEnrichmentToDatabase(
  modelId: string,
  enrichmentData: ComprehensiveEnrichmentData
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    await supabase
      .from('models')
      .update({
        segment: enrichmentData.specs.segment,
        body_type: enrichmentData.specs.body_type,
        drivetrain: enrichmentData.specs.drivetrain,
        drive_type: enrichmentData.specs.drive_type,
        seats_max: enrichmentData.specs.seats_max,
        range_wltp_km: enrichmentData.specs.range_wltp_km,
        cargo_liters: enrichmentData.specs.cargo_space_liters,
        towing_kg: enrichmentData.specs.towing_capacity_kg,
        price_from_nok: enrichmentData.specs.price_from_nok,
        battery_kwh: enrichmentData.specs.battery_kwh,
        power_hp: enrichmentData.specs.power_hp,
        charge_speed_kw: enrichmentData.specs.charge_speed_kw,
        acceleration_0_100: enrichmentData.specs.acceleration_0_100,
        model_year_from: enrichmentData.specs.model_year_from,
        model_year_to: enrichmentData.specs.model_year_to,
        intro_text: enrichmentData.intro_text,
        spec_confidence: enrichmentData.specConfidence,
        spec_sources: enrichmentData.specSources,
        quality_score: enrichmentData.qualityScore,
        review_status: enrichmentData.reviewStatus,
        needs_review_reasons: enrichmentData.needsReviewReasons,
        enrichment_source: enrichmentData.enrichmentSource,
        enrichment_confidence: enrichmentData.enrichmentConfidence,
        enrichment_notes: enrichmentData.enrichmentNotes,
      })
      .eq('id', modelId);

    for (const section of enrichmentData.seoSections) {
      await supabase.from('model_seo_sections').upsert({
        model_id: modelId,
        section_key: section.section_key,
        heading: section.heading,
        content: section.content,
        display_order: section.display_order,
        is_verified: false,
      });
    }

    await supabase.from('model_faqs').delete().eq('model_id', modelId);
    for (const faq of enrichmentData.faqs) {
      await supabase.from('model_faqs').insert({
        model_id: modelId,
        question: faq.question,
        answer: faq.answer,
        display_order: faq.display_order,
        is_verified: false,
      });
    }

    await supabase.from('model_trim_levels').delete().eq('model_id', modelId);
    for (const trim of enrichmentData.trimLevels) {
      await supabase.from('model_trim_levels').insert({
        model_id: modelId,
        name: trim.name,
        price_from_nok: trim.price_from_nok,
        range_wltp_km: trim.range_wltp_km,
        drivetrain: trim.drivetrain,
        battery_kwh: trim.battery_kwh,
        power_hp: trim.power_hp,
        features: trim.features,
        display_order: trim.display_order,
        is_verified: false,
        source: enrichmentData.enrichmentSource,
      });
    }

    console.log(`[COMPREHENSIVE-ENRICHMENT] Saved enrichment data for model ${modelId}`);
  } catch (error) {
    console.error('[COMPREHENSIVE-ENRICHMENT] Error saving to database:', error);
    throw error;
  }
}
