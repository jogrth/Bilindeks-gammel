interface AIEnrichmentResult {
  success: boolean;
  source: 'openai_generated' | 'generic_fallback';
  data?: {
    body_type: string;
    drivetrain: string;
    drive_type: string;
    seats_max: number;
    range_wltp_km: number;
    cargo_space_liters: number;
    towing_capacity_kg: number;
    price_from_nok: number;
    intro_text: string;
    seo_content: {
      title: string;
      sections: Array<{ heading: string; content: string }>;
    };
    faq_content: Array<{ question: string; answer: string }>;
    trim_levels?: Array<{
      name: string;
      price_nok: number;
      range_wltp_km: number;
      highlights: string;
    }>;
  };
  confidence: number;
  notes: string;
  error?: string;
}

const ENRICHMENT_PROMPT = `You are a Norwegian electric vehicle expert. Given a car model name, provide comprehensive technical and marketing data.

Return ONLY valid JSON with this exact structure (no markdown, no explanations):

{
  "body_type": "SUV|Sedan|Stasjonsvogn|Crossover|Hatchback|Kombi",
  "drivetrain": "electric",
  "drive_type": "AWD|RWD|FWD",
  "seats_max": 5,
  "range_wltp_km": 450,
  "cargo_space_liters": 500,
  "towing_capacity_kg": 1500,
  "price_from_nok": 500000,
  "intro_text": "One sentence Norwegian description",
  "seo_content": {
    "title": "Brand Model - Pris, rekkevidde og tekniske data",
    "sections": [
      {
        "heading": "Brand Model - norsk elbilguide",
        "content": "2-3 sentences about the car in Norwegian"
      },
      {
        "heading": "Brand Model pris",
        "content": "2-3 sentences about pricing in Norwegian"
      },
      {
        "heading": "Brand Model rekkevidde",
        "content": "2-3 sentences about range in Norwegian"
      },
      {
        "heading": "Brand Model firehjulsdrift",
        "content": "2-3 sentences about drivetrain in Norwegian"
      },
      {
        "heading": "Brand Model som familiebil",
        "content": "2-3 sentences about family suitability in Norwegian"
      }
    ]
  },
  "faq_content": [
    {
      "question": "Hva koster Brand Model?",
      "answer": "Norwegian answer about price"
    },
    {
      "question": "Hvor lang rekkevidde har Brand Model?",
      "answer": "Norwegian answer about range"
    },
    {
      "question": "Hvor mange kan sitte i Brand Model?",
      "answer": "Norwegian answer about seating"
    },
    {
      "question": "Kan Brand Model trekke tilhenger?",
      "answer": "Norwegian answer about towing"
    },
    {
      "question": "Hvilke fordeler får jeg som elbileier i Norge?",
      "answer": "Norwegian answer about EV benefits in Norway"
    }
  ],
  "trim_levels": [
    {
      "name": "Standard|Plus|GT-Line|Performance|etc",
      "price_nok": 500000,
      "range_wltp_km": 450,
      "highlights": "Key differences"
    }
  ],
  "confidence": 0.85,
  "notes": "Any warnings about estimated values or missing data"
}

Guidelines:
- Use real 2024-2026 data if available
- For Norwegian prices, use realistic NOK values
- If uncertain, provide reasonable estimates and note it
- All text must be in Norwegian
- Keep descriptions factual and professional
- For trim_levels, include 2-4 common variants if known, otherwise empty array
- Confidence: 0.9+ for well-known models, 0.6-0.8 for estimates`;

async function callOpenAI(brandName: string, modelName: string): Promise<AIEnrichmentResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      source: 'generic_fallback',
      confidence: 0,
      notes: 'OpenAI API key not configured',
      error: 'OPENAI_API_KEY environment variable not set',
    };
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
            content: ENRICHMENT_PROMPT,
          },
          {
            role: 'user',
            content: `Enrich this car model: ${brandName} ${modelName}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedData = JSON.parse(jsonContent);

    return {
      success: true,
      source: 'openai_generated',
      data: parsedData,
      confidence: parsedData.confidence || 0.7,
      notes: parsedData.notes || 'Generated by OpenAI',
    };
  } catch (error) {
    console.error('AI enrichment error:', error);
    return {
      success: false,
      source: 'generic_fallback',
      confidence: 0,
      notes: 'AI enrichment failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function generateFallbackEnrichment(
  brandName: string,
  modelName: string
): Promise<AIEnrichmentResult> {
  const fullName = modelName.toLowerCase().startsWith(brandName.toLowerCase())
    ? modelName
    : `${brandName} ${modelName}`;

  return {
    success: true,
    source: 'generic_fallback',
    data: {
      body_type: 'SUV',
      drivetrain: 'electric',
      drive_type: 'RWD',
      seats_max: 5,
      range_wltp_km: 400,
      cargo_space_liters: 450,
      towing_capacity_kg: 1000,
      price_from_nok: 500000,
      intro_text: `${fullName} er en elektrisk bil med moderne teknologi og god rekkevidde.`,
      seo_content: {
        title: `${fullName} - Pris, rekkevidde og tekniske data`,
        sections: [
          {
            heading: `${fullName} - norsk elbilguide`,
            content: `${fullName} er en moderne elbil som kombinerer praktisk design med avansert teknologi. Med god plass og solid rekkevidde er dette et godt valg for norske forhold.`,
          },
          {
            heading: `${fullName} pris`,
            content: `Prisene for ${fullName} varierer avhengig av utstyrsnivå og tilleggspakker. Kontakt forhandler for dagens priser og eventuelle kampanjer.`,
          },
          {
            heading: `${fullName} rekkevidde`,
            content: `${fullName} tilbyr god rekkevidde for daglig bruk og lengre turer. Den faktiske rekkevidden vil variere basert på kjørestil, temperatur og veiforhold.`,
          },
          {
            heading: `${fullName} drivlinje`,
            content: `${fullName} leveres med elektrisk drivlinje som gir god kjøredynamikk og effektiv kraftutnyttelse.`,
          },
          {
            heading: `${fullName} som familiebil`,
            content: `Med god plass og praktisk design er ${fullName} godt egnet som familiebil. God bagasjeplass og komfortable seter gjør lange turer mer behagelige.`,
          },
        ],
      },
      faq_content: [
        {
          question: `Hva koster ${fullName}?`,
          answer: `Prisen for ${fullName} varierer avhengig av valgt utstyrsnivå og tilleggsutstyr. Kontakt en forhandler for dagens priser og tilbud.`,
        },
        {
          question: `Hvor lang rekkevidde har ${fullName}?`,
          answer: `${fullName} har en rekkevidde som dekker de fleste daglige kjørebehov. Den faktiske rekkevidden vil variere basert på kjøreforhold og værtype.`,
        },
        {
          question: `Hvor mange kan sitte i ${fullName}?`,
          answer: `${fullName} har plass til flere passasjerer med komfortable seter og god benplass.`,
        },
        {
          question: `Kan ${fullName} trekke tilhenger?`,
          answer: `Tilhengerfeste kan være tilgjengelig for ${fullName}. Sjekk med forhandler for spesifikasjoner og tilgjengelige alternativer.`,
        },
        {
          question: `Hvilke fordeler får jeg som elbileier i Norge?`,
          answer: `Som eier av ${fullName} får du fritak fra merverdiavgift ved kjøp, gratis parkering på offentlige parkeringsplasser i mange kommuner, reduserte bomavgifter, og lavere forsikring og driftskostnader.`,
        },
      ],
    },
    confidence: 0.3,
    notes: 'Generic fallback data - OpenAI API not available. Values are estimates and should be manually verified.',
  };
}

export async function enrichWithAI(
  brandName: string,
  modelName: string
): Promise<AIEnrichmentResult> {
  console.log(`[AI-ENRICHMENT] Starting for ${brandName} ${modelName}`);

  const aiResult = await callOpenAI(brandName, modelName);
  console.log(`[AI-ENRICHMENT] OpenAI result:`, { success: aiResult.success, source: aiResult.source, hasData: !!aiResult.data });

  if (aiResult.success) {
    console.log(`[AI-ENRICHMENT] Using OpenAI result`);
    return aiResult;
  }

  console.log(`[AI-ENRICHMENT] Using fallback enrichment`);
  return await generateFallbackEnrichment(brandName, modelName);
}
