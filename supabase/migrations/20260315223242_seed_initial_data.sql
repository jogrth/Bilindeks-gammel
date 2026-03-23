/*
  # Seed initial data
  
  Adds sample brands and published models for testing
*/

INSERT INTO brands (name, slug) VALUES
  ('Tesla', 'tesla'),
  ('Mercedes-Benz', 'mercedes-benz'),
  ('BMW', 'bmw'),
  ('Audi', 'audi'),
  ('Volkswagen', 'volkswagen'),
  ('Hyundai', 'hyundai')
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

  INSERT INTO models (brand_id, name, slug, body_type, drivetrain, drive_type, seats_min, seats_max, cargo_liters, towing_kg, range_wltp_km, charge_speed_kw, price_from_nok, intro_text, image_url, published, status) VALUES
    (brand_tesla, 'Model 3', 'tesla-model-3', 'Sedan', 'Elektrisk', 'Bakhjulsdrift', 5, 5, 425, 1000, 491, 170, 449990, 'Tesla Model 3 er en kompakt elbil med imponerende rekkevidde og ytelse. Bilen kombinerer sportslighet med praktisk daglig bruk.', 'https://images.pexels.com/photos/4173624/pexels-photo-4173624.jpeg', true, 'published'),
    (brand_tesla, 'Model Y', 'tesla-model-y', 'SUV', 'Elektrisk', 'Firehjulsdrift', 5, 7, 854, 1600, 533, 250, 549990, 'Tesla Model Y er en romslig elektrisk SUV med plass til opptil 7 personer. Perfekt for familier som ønsker elektrisk kjøring uten kompromisser.', 'https://images.pexels.com/photos/15908287/pexels-photo-15908287.jpeg', true, 'published'),
    (brand_mercedes, 'EQC', 'mercedes-benz-eqc', 'SUV', 'Elektrisk', 'Firehjulsdrift', 5, 5, 500, 1800, 437, 110, 699000, 'Mercedes-Benz EQC kombinerer luksus og elektrisk mobilitet. En premium elektrisk SUV med Mercedes-kvalitet.', 'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg', true, 'published'),
    (brand_bmw, 'iX', 'bmw-ix', 'SUV', 'Elektrisk', 'Firehjulsdrift', 5, 5, 500, 2500, 630, 200, 929000, 'BMW iX er en teknologisk avansert elektrisk SUV med imponerende rekkevidde og trekkevne. Perfekt for den krevende familien.', 'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg', true, 'published'),
    (brand_bmw, 'i4', 'bmw-i4', 'Sedan', 'Elektrisk', 'Bakhjulsdrift', 5, 5, 470, 1600, 590, 205, 639000, 'BMW i4 er en elegant elektrisk sedan med sportslighet og lang rekkevidde. BMW-kjøreglede i elektrisk form.', 'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg', true, 'published'),
    (brand_audi, 'e-tron', 'audi-e-tron', 'SUV', 'Elektrisk', 'Firehjulsdrift', 5, 5, 660, 1800, 436, 150, 779000, 'Audi e-tron er en premium elektrisk SUV med romslig bagasjerom og god trekkevne. Audi-kvalitet møter elektrisk fremtid.', 'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg', true, 'published'),
    (brand_vw, 'ID.4', 'volkswagen-id4', 'SUV', 'Elektrisk', 'Bakhjulsdrift', 5, 5, 543, 1200, 520, 135, 469000, 'Volkswagen ID.4 er en populær elektrisk SUV med god plass og praktiske løsninger for familien.', 'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg', true, 'published'),
    (brand_hyundai, 'Ioniq 5', 'hyundai-ioniq-5', 'SUV', 'Elektrisk', 'Firehjulsdrift', 5, 5, 527, 1600, 481, 220, 469000, 'Hyundai Ioniq 5 er en futuristisk elektrisk SUV med ultra-rask lading og romslig interiør.', 'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg', true, 'published')
  ON CONFLICT (slug) DO NOTHING;
END $$;
