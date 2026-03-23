/*
  # Biljakt Database Schema

  Complete database schema for the Biljakt car discovery and lead generation platform.

  ## Tables Created
  1. brands - Car manufacturers
  2. models - Car models with specifications
  3. model_overrides - Admin overrides for auto-ingested data
  4. similar_models - Car similarity relationships
  5. dealers - Dealer/retailer information
  6. model_dealers - Model to dealer routing
  7. leads - Customer lead submissions
  8. lead_deliveries - Lead delivery tracking
  9. ingestion_jobs - AI ingestion job tracking
  10. profiles - User profiles extending auth.users

  ## Features
  - Row Level Security (RLS) enabled on all tables
  - Comprehensive indexes for performance
  - Triggers for updated_at timestamps
  - Helper functions for admin checks
  - Constraints for data integrity

  ## Security
  - Public can read published models only
  - Admins have full access
  - Leads are admin-only readable
  - Service role can insert leads
*/

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE 1: brands
-- ============================================================================

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read brands"
  ON brands FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage brands"
  ON brands FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- TABLE 2: models
-- ============================================================================

CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  body_type text,
  drivetrain text,
  drive_type text,
  seats_min integer,
  seats_max integer,
  cargo_liters integer,
  towing_kg integer,
  range_wltp_km integer,
  charge_speed_kw integer,
  price_from_nok integer,
  image_url text,
  intro_text text,
  source_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'ingesting', 'needs_review', 'published', 'error', 'archived')),
  confidence_score numeric(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT seats_valid CHECK (seats_max IS NULL OR seats_min IS NULL OR seats_min <= seats_max),
  CONSTRAINT price_positive CHECK (price_from_nok IS NULL OR price_from_nok > 0),
  CONSTRAINT range_positive CHECK (range_wltp_km IS NULL OR range_wltp_km > 0)
);

CREATE INDEX IF NOT EXISTS idx_models_slug ON models(slug);
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_models_published ON models(published);
CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
CREATE INDEX IF NOT EXISTS idx_models_published_filters ON models(published, drivetrain, body_type);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at DESC);

CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published models"
  ON models FOR SELECT
  TO authenticated, anon
  USING (published = true);

CREATE POLICY "Admins can manage models"
  ON models FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- TABLE 3: model_overrides
-- ============================================================================

CREATE TABLE IF NOT EXISTS model_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  override_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_model_field UNIQUE (model_id, field_name)
);

CREATE INDEX IF NOT EXISTS idx_model_overrides_model_id ON model_overrides(model_id);
CREATE INDEX IF NOT EXISTS idx_model_overrides_model_field ON model_overrides(model_id, field_name);

ALTER TABLE model_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage overrides"
  ON model_overrides FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- TABLE 4: similar_models
-- ============================================================================

CREATE TABLE IF NOT EXISTS similar_models (
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  similar_model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  similarity_score numeric(5,2) NOT NULL DEFAULT 0 CHECK (similarity_score >= 0 AND similarity_score <= 100),
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (model_id, similar_model_id),
  CONSTRAINT no_self_reference CHECK (model_id != similar_model_id)
);

CREATE INDEX IF NOT EXISTS idx_similar_models_model_id ON similar_models(model_id);
CREATE INDEX IF NOT EXISTS idx_similar_models_similar_model_id ON similar_models(similar_model_id);
CREATE INDEX IF NOT EXISTS idx_similar_models_score ON similar_models(similarity_score DESC);

ALTER TABLE similar_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read similar models"
  ON similar_models FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = similar_models.model_id
      AND models.published = true
    )
    AND
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = similar_models.similar_model_id
      AND models.published = true
    )
  );

CREATE POLICY "Admins can manage similar models"
  ON similar_models FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- TABLE 5: dealers
-- ============================================================================

CREATE TABLE IF NOT EXISTS dealers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  brand text,
  active boolean DEFAULT true,
  price_per_lead integer,
  postcode_area text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dealers_active ON dealers(active);
CREATE INDEX IF NOT EXISTS idx_dealers_brand ON dealers(brand);

ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage dealers"
  ON dealers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- TABLE 6: model_dealers
-- ============================================================================

CREATE TABLE IF NOT EXISTS model_dealers (
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  priority integer DEFAULT 1,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (model_id, dealer_id)
);

CREATE INDEX IF NOT EXISTS idx_model_dealers_model_id ON model_dealers(model_id);
CREATE INDEX IF NOT EXISTS idx_model_dealers_dealer_id ON model_dealers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_model_dealers_active ON model_dealers(active);

ALTER TABLE model_dealers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage model dealers"
  ON model_dealers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- TABLE 7: leads
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  postcode text,
  purchase_timeline text,
  financing text,
  trade_in boolean DEFAULT false,
  trade_in_reg text,
  trade_in_mileage integer,
  message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_model_id ON leads(model_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Service role can insert leads"
  ON leads FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- TABLE 8: lead_deliveries
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_deliveries_lead_id ON lead_deliveries(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_deliveries_dealer_id ON lead_deliveries(dealer_id);
CREATE INDEX IF NOT EXISTS idx_lead_deliveries_status ON lead_deliveries(status);

ALTER TABLE lead_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read lead deliveries"
  ON lead_deliveries FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Service role can manage lead deliveries"
  ON lead_deliveries FOR ALL
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- TABLE 9: ingestion_jobs
-- ============================================================================

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_name text NOT NULL,
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_created_at ON ingestion_jobs(created_at DESC);

ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ingestion jobs"
  ON ingestion_jobs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- TABLE 10: profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, is_admin)
  VALUES (NEW.id, NEW.email, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- SEED DATA FOR DEVELOPMENT
-- ============================================================================

INSERT INTO brands (name, slug) VALUES
  ('Tesla', 'tesla'),
  ('Mercedes-Benz', 'mercedes-benz'),
  ('BMW', 'bmw'),
  ('Audi', 'audi'),
  ('Volkswagen', 'volkswagen'),
  ('Volvo', 'volvo'),
  ('Polestar', 'polestar'),
  ('Hyundai', 'hyundai'),
  ('Kia', 'kia'),
  ('Ford', 'ford')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  brand_tesla uuid;
  brand_mercedes uuid;
  brand_bmw uuid;
  brand_audi uuid;
  brand_vw uuid;
  brand_hyundai uuid;
BEGIN
  SELECT id INTO brand_tesla FROM brands WHERE slug = 'tesla';
  SELECT id INTO brand_mercedes FROM brands WHERE slug = 'mercedes-benz';
  SELECT id INTO brand_bmw FROM brands WHERE slug = 'bmw';
  SELECT id INTO brand_audi FROM brands WHERE slug = 'audi';
  SELECT id INTO brand_vw FROM brands WHERE slug = 'volkswagen';
  SELECT id INTO brand_hyundai FROM brands WHERE slug = 'hyundai';

  INSERT INTO models (brand_id, name, slug, body_type, drivetrain, drive_type, seats_min, seats_max, cargo_liters, towing_kg, range_wltp_km, charge_speed_kw, price_from_nok, intro_text, published, status) VALUES
    (brand_tesla, 'Model 3', 'tesla-model-3', 'Sedan', 'Elektrisk', 'Bakhjulsdrift', 5, 5, 425, 1000, 491, 170, 449990, 'Tesla Model 3 er en kompakt elbil med imponerende rekkevidde og ytelse. Bilen kombinerer sportslighet med praktisk daglig bruk.', true, 'published'),
    (brand_tesla, 'Model Y', 'tesla-model-y', 'SUV', 'Elektrisk', 'Firehjulsdrift', 5, 7, 854, 1600, 533, 250, 549990, 'Tesla Model Y er en romslig elektrisk SUV med plass til opptil 7 personer. Perfekt for familier som ønsker elektrisk kjøring uten kompromisser.', true, 'published'),
    (brand_mercedes, 'EQC', 'mercedes-benz-eqc', 'SUV', 'Elektrisk', 'Firehjulsdrift', 5, 5, 500, 1800, 437, 110, 699000, 'Mercedes-Benz EQC kombinerer luksus og elektrisk mobilitet. En premium elektrisk SUV med Mercedes-kvalitet.', true, 'published'),
    (brand_bmw, 'iX', 'bmw-ix', 'SUV', 'Elektrisk', 'Firehjulsdrift', 5, 5, 500, 2500, 630, 200, 929000, 'BMW iX er en teknologisk avansert elektrisk SUV med imponerende rekkevidde og trekkevne. Perfekt for den krevende familien.', true, 'published'),
    (brand_bmw, 'i4', 'bmw-i4', 'Sedan', 'Elektrisk', 'Bakhjulsdrift', 5, 5, 470, 1600, 590, 205, 639000, 'BMW i4 er en elegant elektrisk sedan med sportslighet og lang rekkevidde. BMW-kjøreglede i elektrisk form.', true, 'published'),
    (brand_audi, 'e-tron', 'audi-e-tron', 'SUV', 'Elektrisk', 'Firehjulsdrift', 5, 5, 660, 1800, 436, 150, 779000, 'Audi e-tron er en premium elektrisk SUV med romslig bagasjerom og god trekkevne. Audi-kvalitet møter elektrisk fremtid.', true, 'published'),
    (brand_vw, 'ID.4', 'volkswagen-id4', 'SUV', 'Elektrisk', 'Bakhjulsdrift', 5, 5, 543, 1200, 520, 135, 469000, 'Volkswagen ID.4 er en populær elektrisk SUV med god plass og praktiske løsninger for familien.', true, 'published'),
    (brand_hyundai, 'Ioniq 5', 'hyundai-ioniq-5', 'SUV', 'Elektrisk', 'Firehjulsdrift', 5, 5, 527, 1600, 481, 220, 469000, 'Hyundai Ioniq 5 er en futuristisk elektrisk SUV med ultra-rask lading og romslig interiør.', true, 'published')
  ON CONFLICT (slug) DO NOTHING;
END $$;
