import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { generateSimilarCarsForModel } from '@/lib/algorithms/similar-cars';
import { enrichWithAI } from './ai-enrichment';

interface EnrichmentData {
  body_type?: string;
  drivetrain?: string;
  drive_type?: string;
  seats_max?: number;
  range_wltp_km?: number;
  cargo_space_liters?: number;
  towing_capacity_kg?: number;
  price_from_nok?: number;
  intro_text?: string;
  seo_content?: {
    title: string;
    sections: Array<{ heading: string; content: string }>;
  };
  faq_content?: Array<{ question: string; answer: string }>;
  trim_levels?: Array<{
    name: string;
    price_nok: number;
    range_wltp_km: number;
    highlights: string;
  }>;
}

interface EnrichmentResult {
  success: boolean;
  model_id: string;
  enrichment_level: 'none' | 'partial' | 'full';
  enrichment_source: 'known_dataset' | 'openai_generated' | 'generic_fallback' | 'manual';
  fields_populated: string[];
  fields_missing: string[];
  confidence?: number;
  notes?: string;
  error?: string;
}

const EV_MODELS_DATA: Record<string, Partial<EnrichmentData>> = {
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

function generateIntroText(brandName: string, modelName: string, data: Partial<EnrichmentData>): string {
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

function generateSEOContent(brandName: string, modelName: string, data: Partial<EnrichmentData>) {
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

function generateFAQ(brandName: string, modelName: string, data: Partial<EnrichmentData>) {
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
  console.log(`[ENRICHMENT] Starting enrichment for ${brandName} ${modelName} (${modelId})`);
  console.log(`[ENRICHMENT] Model ID: ${modelId}, Slug: ${modelSlug}`);

  try {

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);
    console.log(`[ENRICHMENT] Supabase client created`);

    const knownData = EV_MODELS_DATA[modelSlug];
    const isKnownModel = !!knownData;
    console.log(`[ENRICHMENT] Is known model: ${isKnownModel}`);

    let enrichmentData: Partial<EnrichmentData>;
    let enrichmentSource: 'known_dataset' | 'openai_generated' | 'generic_fallback' = 'generic_fallback';
    let confidence: number = 1.0;
    let notes: string = '';

    if (isKnownModel) {
      console.log(`[ENRICHMENT] Using known dataset for ${modelSlug}`);
      enrichmentData = {
        ...knownData,
        intro_text: generateIntroText(brandName, modelName, knownData),
        seo_content: generateSEOContent(brandName, modelName, knownData),
        faq_content: generateFAQ(brandName, modelName, knownData),
      };
      enrichmentSource = 'known_dataset';
      notes = 'Data from curated database';
    } else {
      console.log(`[ENRICHMENT] Using AI enrichment for ${modelSlug}`);
      const aiResult = await enrichWithAI(brandName, modelName);
      console.log(`[ENRICHMENT] AI result:`, { success: aiResult.success, source: aiResult.source, error: aiResult.error });

      if (aiResult.success && aiResult.data) {
        enrichmentData = aiResult.data;
        enrichmentSource = aiResult.source;
        confidence = aiResult.confidence;
        notes = aiResult.notes;
      } else {
        console.error(`[ENRICHMENT] AI enrichment failed:`, aiResult.error);
        return {
          success: false,
          model_id: modelId,
          enrichment_level: 'none',
          enrichment_source: 'generic_fallback',
          fields_populated: [],
          fields_missing: [],
          notes: aiResult.error || 'Enrichment failed',
          error: aiResult.error,
        };
      }
    }

    const updatePayload: any = {};
    const fieldsPopulated: string[] = [];
    const fieldsToCheck = [
      'body_type',
      'drivetrain',
      'drive_type',
      'seats_max',
      'range_wltp_km',
      'cargo_space_liters',
      'towing_capacity_kg',
      'price_from_nok',
      'intro_text',
    ];

    for (const field of fieldsToCheck) {
      if (enrichmentData[field as keyof EnrichmentData] !== undefined) {
        // Map field names to database column names
        let dbField = field;
        if (field === 'cargo_space_liters') dbField = 'cargo_liters';
        if (field === 'towing_capacity_kg') dbField = 'towing_kg';

        updatePayload[dbField] = enrichmentData[field as keyof EnrichmentData];
        fieldsPopulated.push(field);
      }
    }

    if (enrichmentData.seo_content) {
      updatePayload.seo_content = enrichmentData.seo_content;
      fieldsPopulated.push('seo_content');
    }

    if (enrichmentData.faq_content) {
      updatePayload.faq_content = enrichmentData.faq_content;
      fieldsPopulated.push('faq_content');
    }

    updatePayload.content_generated_at = new Date().toISOString();
    updatePayload.enrichment_source = enrichmentSource;
    updatePayload.enrichment_confidence = confidence;
    updatePayload.enrichment_notes = notes;

    console.log(`[ENRICHMENT] Updating model with ${fieldsPopulated.length} fields`);
    console.log(`[ENRICHMENT] Update payload keys:`, Object.keys(updatePayload));
    console.log(`[ENRICHMENT] Update payload values:`, JSON.stringify(updatePayload, null, 2));

    console.log(`[ENRICHMENT] About to update model ${modelId} in database...`);
    const { error: updateError, data: updateData } = await supabase
      .from('models')
      .update(updatePayload)
      .eq('id', modelId)
      .select();

    if (updateError) {
      console.error(`[ENRICHMENT] ❌ Update error:`, updateError);
      console.error(`[ENRICHMENT] ❌ Error code:`, updateError.code);
      console.error(`[ENRICHMENT] ❌ Error message:`, updateError.message);
      console.error(`[ENRICHMENT] ❌ Error details:`, updateError.details);
      console.error(`[ENRICHMENT] ❌ Error hint:`, updateError.hint);
      throw new Error(`Failed to update model: ${updateError.message}`);
    }

    console.log(`[ENRICHMENT] ✅ Update data:`, updateData);

    console.log(`[ENRICHMENT] Model updated successfully`);

    if (enrichmentData.trim_levels && enrichmentData.trim_levels.length > 0) {
      console.log(`[ENRICHMENT] Inserting ${enrichmentData.trim_levels.length} trim levels`);
      try {
        for (const trim of enrichmentData.trim_levels) {
          const trimSlug = `${modelSlug}-${trim.name.toLowerCase().replace(/\s+/g, '-')}`;
          const { error: trimError } = await supabase.from('trim_levels').insert({
            model_id: modelId,
            name: trim.name,
            slug: trimSlug,
            price_nok: trim.price_nok,
            range_wltp_km: trim.range_wltp_km,
            equipment_highlights: trim.highlights,
            published: false,
          });

          if (trimError) {
            console.error(`[ENRICHMENT] Trim level insert error:`, trimError);
          }
        }
        fieldsPopulated.push('trim_levels');
      } catch (trimErr) {
        console.error(`[ENRICHMENT] Trim levels failed:`, trimErr);
      }
    }

    // Similar cars generation is non-critical - skip if it fails
    console.log(`[ENRICHMENT] Skipping similar cars generation during initial creation`);
    // Similar cars can be generated later via the cron job or manual trigger

    const fieldsMissing = fieldsToCheck.filter(f => !fieldsPopulated.includes(f));
    const enrichmentLevel =
      fieldsPopulated.length === 0 ? 'none' :
      fieldsMissing.length === 0 ? 'full' : 'partial';

    console.log(`[ENRICHMENT] Complete! Level: ${enrichmentLevel}, Fields: ${fieldsPopulated.length}`);

    return {
      success: true,
      model_id: modelId,
      enrichment_level: enrichmentLevel,
      enrichment_source: enrichmentSource,
      fields_populated: fieldsPopulated,
      fields_missing: fieldsMissing,
      confidence,
      notes,
    };
  } catch (error) {
    console.error(`[ENRICHMENT] ❌ Fatal error:`, error);
    if (error instanceof Error) {
      console.error(`[ENRICHMENT] ❌ Error name:`, error.name);
      console.error(`[ENRICHMENT] ❌ Error message:`, error.message);
      console.error(`[ENRICHMENT] ❌ Error stack:`, error.stack);
    }
    console.error(`[ENRICHMENT] ❌ Full error object:`, JSON.stringify(error, null, 2));
    return {
      success: false,
      model_id: modelId,
      enrichment_level: 'none',
      enrichment_source: 'generic_fallback',
      fields_populated: [],
      fields_missing: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
