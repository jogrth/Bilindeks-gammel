import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/helpers';

interface GenerateRequest {
  prompts: string[];
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: GenerateRequest = await request.json();

  if (!body.prompts || body.prompts.length === 0) {
    return Response.json({ error: 'No prompts provided' }, { status: 400 });
  }

  const supabase = await createClient();
  const results = [];

  for (const prompt of body.prompts) {
    try {
      const article = await generateArticle(prompt);

      const { data, error } = await supabase
        .from('articles')
        .insert([article])
        .select()
        .single();

      if (error) {
        results.push({ prompt, success: false, error: error.message });
      } else {
        results.push({ prompt, success: true, article: data });
      }
    } catch (error) {
      results.push({
        prompt,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return Response.json({ results });
}

async function generateArticle(prompt: string) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `Du er en profesjonell redaksjonell skribent for Bilindeks, et norsk nettsted for elbilsammenligning.

Din oppgave er å skrive høykvalitets, forbrukerrettede artikler på norsk.

Retningslinjer:
- Bruk moderne, klar norsk
- Vær informativ og nyttig
- Ikke generer fluff
- Fokuser på konkret, praktisk informasjon
- Bilindeks skal framstå som en god rådgiver

Svar ALLTID med gyldig JSON i dette formatet:
{
  "title": "Artikkelens tittel (maks 60 tegn)",
  "slug": "artikkel-slug-med-bindestreker",
  "ingress": "Kort ingress (maks 200 tegn)",
  "article_type": "seo_topic | collection | guide | comparison | news",
  "topic": "Hovedemne",
  "tags": ["tag1", "tag2", "tag3"],
  "body_content": [
    {
      "heading": "Avsnittstittel",
      "content": "Avsnittets innhold med <p>-tagger",
      "order": 0
    }
  ],
  "faq_content": [
    {
      "question": "Spørsmål?",
      "answer": "Svar med <p>-tagger",
      "order": 0
    }
  ],
  "main_image_url": "https://images.pexels.com/photos/...",
  "main_image_alt": "Beskrivelse av hovedbildet",
  "meta_title": "SEO-tittel (maks 60 tegn)",
  "meta_description": "SEO-beskrivelse (maks 160 tegn)"
}

Krav til innhold:
- Minimum 4 avsnitt med heading og content
- Minimum 5 FAQ-spørsmål
- Alle tekster skal være på norsk
- Bruk HTML-tagger i content (<p>, <strong>, <em>, <ul>, <li>)
- Hovedbilde fra Pexels (bruk reelle Pexels-URLer)

For samlesider ("collection" type):
- Inkluder informasjon om hvilke bilmodeller som skal vises
- Marker dette i body_content ved å inkludere {MODEL_SLUG} der modeller skal vises`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const article = JSON.parse(content);

  return {
    title: article.title,
    slug: article.slug,
    ingress: article.ingress,
    body_content: article.body_content,
    article_type: article.article_type || 'seo_topic',
    topic: article.topic,
    tags: article.tags || [],
    main_image_url: article.main_image_url,
    main_image_alt: article.main_image_alt,
    meta_title: article.meta_title || article.title,
    meta_description: article.meta_description || article.ingress,
    faq_content: article.faq_content || [],
    review_status: 'draft',
    quality_score: 0,
  };
}
