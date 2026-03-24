import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ImportDetail {
  input: string;
  status: 'success' | 'error';
  message: string;
  model_id?: string;
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
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        const { data: existingBrand } = await supabase
          .from('brands')
          .select('id')
          .eq('slug', brandSlug)
          .maybeSingle();

        if (existingBrand) {
          brand_id = existingBrand.id;
        } else {
          const { data: newBrand, error: brandError } = await supabase
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

        const { data: existingModel } = await supabase
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

        const { data: newModel, error: modelError } = await supabase
          .from('models')
          .insert({
            brand_id,
            name: modelName,
            slug: modelSlug,
            status: 'draft',
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

        created++;
        details.push({
          input: line,
          status: 'success',
          message: `Created successfully as draft`,
          model_id: newModel.id,
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
