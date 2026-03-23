import { NextRequest } from 'next/server';
import { getPublishedModels } from '@/lib/db/models';
import type { CarFilters } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const filters: CarFilters = {};

  const bodyType = searchParams.get('bodyType');
  if (bodyType) filters.bodyType = bodyType;

  const drivetrain = searchParams.get('drivetrain');
  if (drivetrain) filters.drivetrain = drivetrain;

  const driveType = searchParams.get('driveType');
  if (driveType) filters.driveType = driveType;

  const minRange = searchParams.get('minRange');
  if (minRange) filters.minRange = parseInt(minRange);

  const maxRange = searchParams.get('maxRange');
  if (maxRange) filters.maxRange = parseInt(maxRange);

  const minPrice = searchParams.get('minPrice');
  if (minPrice) filters.minPrice = parseInt(minPrice);

  const maxPrice = searchParams.get('maxPrice');
  if (maxPrice) filters.maxPrice = parseInt(maxPrice);

  const minCargo = searchParams.get('minCargo');
  if (minCargo) filters.minCargo = parseInt(minCargo);

  const maxCargo = searchParams.get('maxCargo');
  if (maxCargo) filters.maxCargo = parseInt(maxCargo);

  const minTowing = searchParams.get('minTowing');
  if (minTowing) filters.minTowing = parseInt(minTowing);

  const maxTowing = searchParams.get('maxTowing');
  if (maxTowing) filters.maxTowing = parseInt(maxTowing);

  const minSeats = searchParams.get('minSeats');
  if (minSeats) filters.minSeats = parseInt(minSeats);

  const maxSeats = searchParams.get('maxSeats');
  if (maxSeats) filters.maxSeats = parseInt(maxSeats);

  const only4x4 = searchParams.get('only4x4');
  if (only4x4 === 'true') filters.only4x4 = true;

  try {
    const models = await getPublishedModels(filters);
    console.log(`[API /api/models] Returning ${models.length} models`);
    return Response.json(models);
  } catch (error) {
    console.error('[API /api/models] Error:', error);
    return Response.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
