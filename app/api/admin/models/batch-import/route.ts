import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enrichModel } from '@/lib/services/enrichment';

interface ImportDetail {
  input: string;
  status: 'success' | 'error';
  message: string;
  model_id?: string;
  enrichment_level?: string;
  fields_populated?: string[];
}

function parseModelInput(input: string): { brandName: string; modelName: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return null;

  const brandName = parts[0];
  const modelName = parts.slice(1).join(' ');

  return { brandName, modelName };
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
      console.error('Missing authorization header');
      return NextResponse.json({ error: 'Unauthorized - Missing authorization header' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    console.log('User found:', user.id);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('system_admins')
      .select('is_active')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminError) {
      console.error('Admin check error:', adminError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const isAdmin = adminCheck !== null && adminCheck.is_active === true;
    console.log('Is admin:', isAdmin);

    if (!isAdmin) {
      console.error('User is not admin');
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { input } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'No models provided' },
        { status: 400 }
      );
    }

    const details: ImportDetail[] = [];
    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const line of lines) {
      const parsed = parseModelInput(line);

      if (!parsed) {
        failed++;
        details.push({
          input: line,
          status: 'error',
          message: 'Could not parse input',
        });
        continue;
      }

      const { brandName, modelName } = parsed;

      try {
        let brand_id: string;

        const brandSlug = generateSlug(brandName);
        const { data: existingBrand } = await supabaseAdmin
          .from('brands')
          .select('id')
          .eq('slug', brandSlug)
          .maybeSingle();

        if (existingBrand) {
          brand_id = existingBrand.id;
        } else {
          const { data: newBrand, error: brandError } = await supabaseAdmin
            .from('brands')
            .insert({
              name: brandName,
              slug: brandSlug,
            })
            .select('id')
            .single();

          if (brandError || !newBrand) {
            failed++;
            details.push({
              input: line,
              status: 'error',
              message: `Failed to create brand: ${brandError?.message || 'Unknown error'}`,
            });
            continue;
          }

          brand_id = newBrand.id;
        }

        const modelSlug = generateSlug(`${brandName} ${modelName}`);

        const { data: existingModel } = await supabaseAdmin
          .from('models')
          .select('id, name')
          .eq('slug', modelSlug)
          .maybeSingle();

        if (existingModel) {
          updated++;
          details.push({
            input: line,
            status: 'success',
            message: `Model already exists: ${existingModel.name}`,
            model_id: existingModel.id,
          });
          continue;
        }

        const { data: newModel, error: modelError } = await supabaseAdmin
          .from('models')
          .insert({
            brand_id,
            name: modelName,
            slug: modelSlug,
            status: 'ingesting',
            published: false,
          })
          .select('id')
          .single();

        if (modelError || !newModel) {
          failed++;
          details.push({
            input: line,
            status: 'error',
            message: `Failed to create model: ${modelError?.message || 'Unknown error'}`,
          });
          continue;
        }

        const enrichmentResult = await enrichModel(newModel.id, modelSlug, brandName, modelName);

        const finalStatus = enrichmentResult.enrichment_level === 'full' ? 'needs_review' : 'draft';
        await supabaseAdmin
          .from('models')
          .update({ status: finalStatus })
          .eq('id', newModel.id);

        created++;
        details.push({
          input: line,
          status: 'success',
          message: `Created with ${enrichmentResult.enrichment_level} enrichment (${enrichmentResult.fields_populated.length} fields)`,
          model_id: newModel.id,
          enrichment_level: enrichmentResult.enrichment_level,
          fields_populated: enrichmentResult.fields_populated,
        });
      } catch (error) {
        failed++;
        details.push({
          input: line,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: failed === 0 || (created + updated) > 0,
      created,
      updated,
      failed,
      details,
    });
  } catch (error) {
    console.error('Batch import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
