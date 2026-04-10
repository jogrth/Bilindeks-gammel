import { NextResponse } from 'next/server';

export async function GET() {
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const serviceKeyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...'
    : 'NOT SET';

  return NextResponse.json({
    env_check: {
      SUPABASE_SERVICE_ROLE_KEY: hasServiceKey ? 'present' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY_preview: serviceKeyPrefix,
      NEXT_PUBLIC_SUPABASE_URL: hasUrl ? 'present' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnonKey ? 'present' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV || 'not-vercel',
    }
  });
}
