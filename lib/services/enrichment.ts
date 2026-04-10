import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { generateSimilarCarsForModel } from '@/lib/algorithms/similar-cars';
import { enrichModelComprehensively, saveEnrichmentToDatabase } from './comprehensive-enrichment';

interface EnrichmentResult {
  success: boolean;
  model_id: string;
  enrichment_level: 'none' | 'partial' | 'full';
  enrichment_source: 'known_dataset' | 'openai_generated' | 'generic_fallback' | 'manual' | 'external_api';
  fields_populated: string[];
  fields_missing: string[];
  confidence?: number;
  notes?: string;
  error?: string;
}

const EV_MODELS_DATA: Record<string, any> = {
  'kia-ev9': {
    body_type: 'SUV',
    drivetrain: 'electric',
    drive_type: 'AWD',
    seats_max: 7,
    range_wltp_km: 563,
    cargo_space_liters: 828,
    towing_capacity_kg: 2500,
    price_from_nok: 749900,
  },
  'tesla-model-y': {
    body_type: 'SUV',
    drivetrain: 'electric',
    drive_type: 'AWD',
    seats_max: 7,
    range_wltp_km: 533,
    cargo_space_liters: 854,
    towing_capacity_kg: 1600,
    price_from_nok: 549990,
  },
  'volkswagen-id-4': {
    body_type: 'SUV',
    drivetrain: 'electric',
    drive_type: 'RWD',
    seats_max: 5,
    range_wltp_km: 520,
    cargo_space_liters: 543,
    towing_capacity_kg: 1200,
    price_from_nok: 459900,
  },
  'volvo-ex30': {
    body_type: 'SUV',
    drivetrain: 'electric',
    drive_type: 'RWD',
    seats_max: 5,
    range_wltp_km: 476,
    cargo_space_liters: 318,
    towing_capacity_kg: 1400,
    price_from_nok: 379900,
  },
  'audi-q6-e-tron': {
    body_type: 'SUV',
    drivetrain: 'electric',
    drive_type: 'AWD',
    seats_max: 5,
    range_wltp_km: 625,
    cargo_space_liters: 526,
    towing_capacity_kg: 2400,
    price_from_nok: 749900,
  },
  'bmw-i5-touring': {
    body_type: 'Stasjonsvogn',
    drivetrain: 'electric',
    drive_type: 'RWD',
    seats_max: 5,
    range_wltp_km: 560,
    cargo_space_liters: 570,
    towing_capacity_kg: 2000,
    price_from_nok: 899900,
  },
  'polestar-3': {
    body_type: 'SUV',
    drivetrain: 'electric',
    drive_type: 'AWD',
    seats_max: 5,
    range_wltp_km: 610,
    cargo_space_liters: 484,
    towing_capacity_kg: 2200,
    price_from_nok: 899900,
  },
  'mercedes-eqe': {
    body_type: 'Sedan',
    drivetrain: 'electric',
    drive_type: 'RWD',
    seats_max: 5,
    range_wltp_km: 639,
    cargo_space_liters: 430,
    towing_capacity_kg: 750,
    price_from_nok: 799900,
  },
  'hyundai-ioniq-5': {
    body_type: 'SUV',
    drivetrain: 'electric',
    drive_type: 'AWD',
    seats_max: 5,
    range_wltp_km: 507,
    cargo_space_liters: 527,
    towing_capacity_kg: 1600,
    price_from_nok: 469900,
  },
  'ford-mustang-mach-e': {
    body_type: 'SUV',
    drivetrain: 'electric',
    drive_type: 'AWD',
    seats_max: 5,
    range_wltp_km: 600,
    cargo_space_liters: 402,
    towing_capacity_kg: 750,
    price_from_nok: 549900,
  },
};

function generateIntroText(brandName: string, modelName: string, data: any): string {
  const parts = [`${brandName} ${modelName} er en`];

  if (data.body_type) {
    parts.push(data.body_type.toLowerCase());
  }

  if (data.drivetrain === 'electric') {
    parts.push('elbil');
  }

  if (data.seats_max) {
    parts.push(`med plass til ${data.seats_max} personer`);
  }

  if (data.range_wltp_km) {
    parts.push(`og en rekkevidde på opptil ${data.range_wltp_km} km`);
  }

  return parts.join(' ') + '.';
}

function generateSEOContent(brandName: string, modelName: string, data: any) {
  const fullName = `${brandName} ${modelName}`;
  const sections = [];

  sections.push({
    heading: `${fullName} - norsk elbilguide`,
    content: `${fullName} er en populær ${data.body_type?.toLowerCase() || 'bil'} som kombinerer moderne teknologi med praktisk brukervennlighet. Her finner du all informasjon du trenger for å ta en informert beslutning.`,
  });

  if (data.price_from_nok) {
    sections.push({
      heading: `${fullName} pris`,
      content: `${fullName} starter på ${Math.floor(data.price_from_nok / 1000)} ${data.price_from_nok % 1000} kroner. Prisen varierer avhengig av utstyrsnivå og ekstrautstyr. Kontakt forhandler for dagens beste tilbud og innbytte av din nåværende bil.`,
    });
  }

  if (data.range_wltp_km) {
    sections.push({
      heading: `${fullName} rekkevidde`,
      content: `Med en WLTP-rekkevidde på opptil ${data.range_wltp_km} km er ${fullName} godt egnet for både daglig pendling og lengre turer. Den faktiske rekkevidden vil variere basert på kjørestil, temperatur og terreng.`,
    });
  }

  if (data.drive_type) {
    const driveText = data.drive_type === 'AWD' ? 'firehjulsdrift' : data.drive_type === 'RWD' ? 'bakhjulsdrift' : 'forhjulsdrift';
    sections.push({
      heading: `${fullName} ${driveText}`,
      content: `${fullName} leveres med ${driveText}, som gir ${data.drive_type === 'AWD' ? 'utmerket grep under alle forhold og optimal kraftfordeling mellom akslingene' : 'god kjøredynamikk og effektiv kraftutnyttelse'}.`,
    });
  }

  if (data.seats_max && data.seats_max >= 5) {
    sections.push({
      heading: `${fullName} som familiebil`,
      content: `Med ${data.seats_max === 7 ? 'hele 7 seter' : 'plass til 5 personer'} og ${data.cargo_space_liters ? `${data.cargo_space_liters} liter bagasjerom` : 'godt med bagasjeplass'} er ${fullName} en utmerket familiebil. ${data.towing_capacity_kg ? `Tilhengervekt på ${data.towing_capacity_kg} kg gjør den også egnet for henger eller campingvogn.` : ''}`,
    });
  }

  return {
    title: `${fullName} - Pris, rekkevidde og tekniske data`,
    sections,
  };
}

function generateFAQ(brandName: string, modelName: string, data: any) {
  const fullName = `${brandName} ${modelName}`;
  const faq = [];

  faq.push({
    question: `Hva koster ${fullName}?`,
    answer: data.price_from_nok
      ? `${fullName} starter på ${Math.floor(data.price_from_nok / 1000)} ${data.price_from_nok % 1000} kroner for grunnmodellen. Prisen vil variere basert på valgt utstyrsnivå og tilleggsutstyr.`
      : `Prisen for ${fullName} varierer avhengig av utstyrsnivå. Kontakt en forhandler for dagens priser.`,
  });

  faq.push({
    question: `Hvor lang rekkevidde har ${fullName}?`,
    answer: data.range_wltp_km
      ? `${fullName} har en WLTP-rekkevidde på opptil ${data.range_wltp_km} km. Den faktiske rekkevidden vil avhenge av kjørestil, temperatur og veiforhold.`
      : `Rekkevidden for ${fullName} varierer avhengig av batteristørrelse og utstyrsnivå.`,
  });

  faq.push({
    question: `Hvor mange kan sitte i ${fullName}?`,
    answer: data.seats_max
      ? `${fullName} har ${data.seats_max === 7 ? 'plass til 7 personer fordelt på tre seterader' : `plass til ${data.seats_max} personer`}.`
      : `${fullName} er tilgjengelig med ulike setekonfigurasjoner.`,
  });

  faq.push({
    question: `Kan ${fullName} trekke tilhenger?`,
    answer: data.towing_capacity_kg
      ? `Ja, ${fullName} har en tilhengervekt på ${data.towing_capacity_kg} kg. Dette gjør den egnet for campingvogn, båt eller annet utstyr.`
      : `${fullName} kan være tilgjengelig med tilhengerfeste. Sjekk med forhandler for spesifikasjoner.`,
  });

  faq.push({
    question: `Hvilke fordeler får jeg som elbileier i Norge?`,
    answer: `Som eier av ${fullName} får du fritak fra merverdiavgift ved kjøp, gratis parkering på offentlige parkeringsplasser i mange kommuner, fri bompassering enkelte steder, og lavere forsikring og driftskostnader sammenlignet med fossile biler.`,
  });

  return faq;
}

export async function enrichModel(modelId: string, modelSlug: string, brandName: string, modelName: string): Promise<EnrichmentResult> {
  console.log(`[ENRICHMENT] Starting comprehensive enrichment for ${brandName} ${modelName} (${modelId})`);

  try {
    const enrichmentData = await enrichModelComprehensively(brandName, modelName);

    console.log(`[ENRICHMENT] Enrichment completed with source: ${enrichmentData.enrichmentSource}, confidence: ${enrichmentData.enrichmentConfidence}`);
    console.log(`[ENRICHMENT] Quality score: ${enrichmentData.qualityScore}, Review status: ${enrichmentData.reviewStatus}`);

    await saveEnrichmentToDatabase(modelId, enrichmentData);

    console.log(`[ENRICHMENT] Saved enrichment data to database`);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

      const similarities = await generateSimilarCarsForModel(modelId, 6, false, supabase);
      if (similarities.length > 0) {
        await supabase.from('similar_models').insert(similarities);
        console.log(`[ENRICHMENT] Generated ${similarities.length} similar car recommendations`);
      }
    } catch (similarError) {
      console.error(`[ENRICHMENT] Similar cars generation failed:`, similarError);
    }

    const fieldsPopulated = [
      'specs',
      'seo_sections',
      'faqs',
      enrichmentData.trimLevels.length > 0 ? 'trim_levels' : null,
    ].filter(Boolean) as string[];

    const fieldsMissing = [];
    if (enrichmentData.needsReviewReasons.length > 0) {
      fieldsMissing.push(...enrichmentData.needsReviewReasons);
    }

    const enrichmentLevel: 'none' | 'partial' | 'full' =
      enrichmentData.qualityScore >= 80 ? 'full' :
      enrichmentData.qualityScore >= 40 ? 'partial' : 'none';

    console.log(`[ENRICHMENT] Complete! Level: ${enrichmentLevel}, Quality Score: ${enrichmentData.qualityScore}`);

    return {
      success: true,
      model_id: modelId,
      enrichment_level: enrichmentLevel,
      enrichment_source: enrichmentData.enrichmentSource,
      fields_populated: fieldsPopulated,
      fields_missing: fieldsMissing,
      confidence: enrichmentData.enrichmentConfidence,
      notes: enrichmentData.enrichmentNotes,
    };
  } catch (error) {
    console.error(`[ENRICHMENT] ❌ Fatal error:`, error);
    return {
      success: false,
      model_id: modelId,
      enrichment_level: 'none',
      enrichment_source: 'generic_fallback',
      fields_populated: [],
      fields_missing: ['All fields'],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
