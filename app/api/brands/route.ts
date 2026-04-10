import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('Error fetching brands:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(brands || []);
  } catch (error) {
    console.error('Unexpected error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
