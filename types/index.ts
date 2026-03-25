export interface Brand {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface CarModel {
  id: string;
  brand_id: string;
  brand_name?: string;
  brand_slug?: string;
  name: string;
  slug: string;
  segment: string | null;
  body_type: string | null;
  drivetrain: string | null;
  drive_type: string | null;
  seats_min: number | null;
  seats_max: number | null;
  cargo_liters: number | null;
  towing_kg: number | null;
  range_wltp_km: number | null;
  charge_speed_kw: number | null;
  battery_kwh: number | null;
  power_hp: number | null;
  acceleration_0_100: number | null;
  model_year_from: number | null;
  model_year_to: number | null;
  price_from_nok: number | null;
  image_url: string | null;
  image_primary_url: string | null;
  intro_text: string | null;
  source_url: string | null;
  status: ModelStatus;
  confidence_score: number | null;
  quality_score: number | null;
  review_status: string | null;
  needs_review_reasons: string[] | null;
  spec_confidence: Record<string, number> | null;
  spec_sources: Record<string, string> | null;
  enrichment_source: string | null;
  enrichment_confidence: number | null;
  enrichment_notes: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type ModelStatus = 'draft' | 'ingesting' | 'needs_review' | 'published' | 'error' | 'archived';

export interface ModelOverride {
  id: string;
  model_id: string;
  field_name: string;
  override_value: unknown;
  created_at: string;
}

export interface SimilarModel {
  model_id: string;
  similar_model_id: string;
  similarity_score: number;
  is_pinned: boolean;
  created_at: string;
  model?: CarModel;
}

export interface Dealer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  brand: string | null;
  brand_preference: string | null;
  active: boolean;
  price_per_lead: number | null;
  postcode_area: string | null;
  postcode_from: number | null;
  postcode_to: number | null;
  created_at: string;
  updated_at: string;
}

export interface ModelDealer {
  model_id: string;
  dealer_id: string;
  priority: number;
  active: boolean;
  created_at: string;
  dealer?: Dealer;
}

export interface Lead {
  id: string;
  model_id: string;
  name: string;
  email: string;
  phone: string;
  postcode: string | null;
  purchase_timeline: string | null;
  financing: string | null;
  trade_in: boolean;
  trade_in_reg: string | null;
  trade_in_mileage: number | null;
  message: string | null;
  created_at: string;
  model_name?: string;
  brand_name?: string;
}

export type LeadDeliveryStatus = 'pending' | 'sent' | 'failed' | 'bounced';

export interface LeadDelivery {
  id: string;
  lead_id: string;
  dealer_id: string;
  status: LeadDeliveryStatus;
  delivered_at: string | null;
  error_message: string | null;
  created_at: string;
  dealer?: Dealer;
}

export type IngestionJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface IngestionJob {
  id: string;
  input_name: string;
  status: IngestionJobStatus;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface LeadFormData {
  modelId: string;
  name: string;
  email: string;
  phone: string;
  postcode?: string;
  purchaseTimeline: string;
  financing: string;
  tradeIn: boolean;
  tradeInReg?: string;
  tradeInMileage?: number;
  message?: string;
}

export interface CarFilters {
  brandId?: string;
  modelId?: string;
  bodyType?: string;
  drivetrain?: string;
  driveType?: string;
  minRange?: number;
  maxRange?: number;
  minPrice?: number;
  maxPrice?: number;
  minCargo?: number;
  maxCargo?: number;
  minTowing?: number;
  maxTowing?: number;
  minSeats?: number;
  maxSeats?: number;
  only4x4?: boolean;
}

export const BODY_TYPES = [
  'SUV',
  'Sedan',
  'Stasjonsvogn',
  'Kombikupé',
  'Van',
  'Hatchback',
] as const;

export const DRIVETRAINS = [
  'Elektrisk',
  'Plug-in Hybrid',
  'Hybrid',
  'Diesel',
  'Bensin',
] as const;

export const DRIVE_TYPES = [
  'Forhjulsdrift',
  'Bakhjulsdrift',
  'Firehjulsdrift',
] as const;

export const PURCHASE_TIMELINES = [
  'Innen 1 måned',
  'Innen 3 måneder',
  'Innen 6 måneder',
  'Undersøker bare',
] as const;

export const FINANCING_OPTIONS = [
  'Kontant',
  'Billån',
  'Leasing',
  'Usikker',
] as const;

export interface ModelImage {
  id: string;
  model_id: string;
  url: string;
  alt_text: string | null;
  caption: string | null;
  source: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ModelTrimLevel {
  id: string;
  model_id: string;
  name: string;
  price_from_nok: number | null;
  range_wltp_km: number | null;
  drivetrain: string | null;
  battery_kwh: number | null;
  power_hp: number | null;
  features: string[];
  display_order: number;
  is_verified: boolean;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModelFAQ {
  id: string;
  model_id: string;
  question: string;
  answer: string;
  display_order: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModelSEOSection {
  id: string;
  model_id: string;
  section_key: string;
  heading: string;
  content: string;
  display_order: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
