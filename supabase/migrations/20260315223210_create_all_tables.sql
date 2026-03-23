/*
  # Create all Biljakt tables
  
  Creates brands, models, dealers, leads and related tables with RLS
*/

-- Helper function
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

-- brands
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read brands" ON brands;
CREATE POLICY "Public can read brands"
  ON brands FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Admins can manage brands" ON brands;
CREATE POLICY "Admins can manage brands"
  ON brands FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- models
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
  status text DEFAULT 'draft',
  confidence_score numeric(5,2),
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_models_slug ON models(slug);
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_models_published ON models(published);

DROP TRIGGER IF EXISTS update_models_updated_at ON models;
CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published models" ON models;
CREATE POLICY "Public can read published models"
  ON models FOR SELECT
  TO authenticated, anon
  USING (published = true);

DROP POLICY IF EXISTS "Admins can manage models" ON models;
CREATE POLICY "Admins can manage models"
  ON models FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- model_overrides
CREATE TABLE IF NOT EXISTS model_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  override_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_model_field UNIQUE (model_id, field_name)
);

CREATE INDEX IF NOT EXISTS idx_model_overrides_model_id ON model_overrides(model_id);

ALTER TABLE model_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage overrides" ON model_overrides;
CREATE POLICY "Admins can manage overrides"
  ON model_overrides FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- similar_models
CREATE TABLE IF NOT EXISTS similar_models (
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  similar_model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  similarity_score numeric(5,2) NOT NULL DEFAULT 0,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (model_id, similar_model_id)
);

CREATE INDEX IF NOT EXISTS idx_similar_models_model_id ON similar_models(model_id);

ALTER TABLE similar_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read similar models" ON similar_models;
CREATE POLICY "Public can read similar models"
  ON similar_models FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (SELECT 1 FROM models WHERE id = similar_models.model_id AND published = true)
    AND EXISTS (SELECT 1 FROM models WHERE id = similar_models.similar_model_id AND published = true)
  );

DROP POLICY IF EXISTS "Admins can manage similar models" ON similar_models;
CREATE POLICY "Admins can manage similar models"
  ON similar_models FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- dealers
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

ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage dealers" ON dealers;
CREATE POLICY "Admins can manage dealers"
  ON dealers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- model_dealers
CREATE TABLE IF NOT EXISTS model_dealers (
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  priority integer DEFAULT 1,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (model_id, dealer_id)
);

CREATE INDEX IF NOT EXISTS idx_model_dealers_model_id ON model_dealers(model_id);

ALTER TABLE model_dealers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage model dealers" ON model_dealers;
CREATE POLICY "Admins can manage model dealers"
  ON model_dealers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- leads
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

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read leads" ON leads;
CREATE POLICY "Admins can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Service role can insert leads" ON leads;
CREATE POLICY "Service role can insert leads"
  ON leads FOR INSERT
  TO service_role
  WITH CHECK (true);

-- lead_deliveries
CREATE TABLE IF NOT EXISTS lead_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_deliveries_lead_id ON lead_deliveries(lead_id);

ALTER TABLE lead_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read lead deliveries" ON lead_deliveries;
CREATE POLICY "Admins can read lead deliveries"
  ON lead_deliveries FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Service role can manage lead deliveries" ON lead_deliveries;
CREATE POLICY "Service role can manage lead deliveries"
  ON lead_deliveries FOR ALL
  TO service_role
  WITH CHECK (true);

-- ingestion_jobs
CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_name text NOT NULL,
  status text DEFAULT 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON ingestion_jobs(status);

ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage ingestion jobs" ON ingestion_jobs;
CREATE POLICY "Admins can manage ingestion jobs"
  ON ingestion_jobs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
