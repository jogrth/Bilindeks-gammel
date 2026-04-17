export async function getPublishedModels(filters?: CarFilters) {
  const supabase = await createClient();

  let query = supabase
    .from('models')
    .select(`
      *,
      brands (
        name,
        slug
      )
    `)
    // 🔥 KUN dette styrer synlighet
    .eq('published', true)
    // 🔥 Fjern dårlige modeller
    .not('image_primary_url', 'is', null)
    .gte('quality_score', 50)
    .is('deleted_at', null)
    .order('quality_score', { ascending: false });

  if (filters?.brandId) {
    query = query.eq('brand_id', filters.brandId);
  }

  if (filters?.modelId) {
    query = query.eq('id', filters.modelId);
  }

  if (filters?.bodyType) {
    query = query.eq('body_type', filters.bodyType);
  }

  if (filters?.drivetrain) {
    query = query.eq('drivetrain', filters.drivetrain);
  }

  if (filters?.driveType) {
    query = query.eq('drive_type', filters.driveType);
  }

  if (filters?.minRange) {
    query = query.gte('range_wltp_km', filters.minRange);
  }

  if (filters?.maxRange) {
    query = query.lte('range_wltp_km', filters.maxRange);
  }

  if (filters?.minPrice) {
    query = query.gte('price_from_nok', filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte('price_from_nok', filters.maxPrice);
  }

  if (filters?.minCargo) {
    query = query.gte('cargo_liters', filters.minCargo);
  }

  if (filters?.maxCargo) {
    query = query.lte('cargo_liters', filters.maxCargo);
  }

  if (filters?.minTowing) {
    query = query.gte('towing_kg', filters.minTowing);
  }

  if (filters?.maxTowing) {
    query = query.lte('towing_kg', filters.maxTowing);
  }

  if (filters?.minSeats) {
    query = query.gte('seats_min', filters.minSeats);
  }

  if (filters?.maxSeats) {
    query = query.lte('seats_max', filters.maxSeats);
  }

  if (filters?.only4x4) {
    query = query.eq('drive_type', 'Firehjulsdrift');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching models:', error);
    return [];
  }

  return (data || []).map(model => ({
    ...model,
    brand_name: model.brands?.name,
    brand_slug: model.brands?.slug,
  })) as CarModel[];
}
