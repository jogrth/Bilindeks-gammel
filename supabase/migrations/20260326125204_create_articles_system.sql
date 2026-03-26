/*
  # Create Articles System

  ## Purpose
  Full editorial article system for Bilindeks with:
  - Article management (CRUD)
  - Review status workflow (draft, needs_review, published, unpublished)
  - Soft delete support
  - Rich content (images, FAQ, internal links)
  - Quality scoring
  - SEO metadata

  ## New Tables
  1. **articles** - Main article content
  2. **article_images** - Article image gallery
  3. **article_related_models** - Links articles to car models
  4. **article_related_articles** - Links between articles

  ## Features
  - Full editorial workflow
  - Image management (1 main + multiple body images)
  - Internal linking to models and other articles
  - FAQ content
  - Topic/tag support
  - Quality scoring
  - Soft delete (deleted_at)

  ## Security
  - RLS enabled on all tables
  - Public can read published, non-deleted articles
  - Admins have full access
*/

-- =================================================================
-- TABLE: articles
-- =================================================================

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core content
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  ingress text,
  body_content jsonb,
  
  -- Article metadata
  article_type text CHECK (article_type IN ('seo_topic', 'collection', 'guide', 'comparison', 'news')),
  topic text,
  tags text[],
  
  -- Images
  main_image_url text,
  main_image_alt text,
  
  -- SEO
  meta_title text,
  meta_description text,
  
  -- FAQ
  faq_content jsonb,
  
  -- Quality & status
  quality_score integer DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  review_status text DEFAULT 'draft' CHECK (review_status IN ('draft', 'needs_review', 'published', 'unpublished')),
  review_notes text,
  
  -- Soft delete
  deleted_at timestamptz DEFAULT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  
  -- Constraints
  CONSTRAINT title_not_empty CHECK (length(title) > 0),
  CONSTRAINT slug_not_empty CHECK (length(slug) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_review_status ON articles(review_status);
CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON articles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_articles_topic ON articles(topic);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- Composite index for public queries
CREATE INDEX IF NOT EXISTS idx_articles_public_query 
  ON articles(review_status, deleted_at) 
  WHERE deleted_at IS NULL AND review_status = 'published';

-- Trigger for updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =================================================================
-- TABLE: article_images
-- =================================================================

CREATE TABLE IF NOT EXISTS article_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  
  url text NOT NULL,
  alt_text text,
  caption text,
  
  display_order integer DEFAULT 0,
  is_body_image boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_images_article_id ON article_images(article_id);
CREATE INDEX IF NOT EXISTS idx_article_images_display_order ON article_images(article_id, display_order);

-- =================================================================
-- TABLE: article_related_models
-- =================================================================

CREATE TABLE IF NOT EXISTS article_related_models (
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  
  display_order integer DEFAULT 0,
  featured boolean DEFAULT false,
  description text,
  
  created_at timestamptz DEFAULT now(),
  
  PRIMARY KEY (article_id, model_id)
);

CREATE INDEX IF NOT EXISTS idx_article_related_models_article_id ON article_related_models(article_id);
CREATE INDEX IF NOT EXISTS idx_article_related_models_model_id ON article_related_models(model_id);

-- =================================================================
-- TABLE: article_related_articles
-- =================================================================

CREATE TABLE IF NOT EXISTS article_related_articles (
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  related_article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  
  display_order integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  
  PRIMARY KEY (article_id, related_article_id),
  CONSTRAINT no_self_reference CHECK (article_id != related_article_id)
);

CREATE INDEX IF NOT EXISTS idx_article_related_articles_article_id ON article_related_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_article_related_articles_related_id ON article_related_articles(related_article_id);

-- =================================================================
-- ROW LEVEL SECURITY
-- =================================================================

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_related_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_related_articles ENABLE ROW LEVEL SECURITY;

-- Public can read published, non-deleted articles
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  TO authenticated, anon
  USING (review_status = 'published' AND deleted_at IS NULL);

-- Admins can manage all articles
CREATE POLICY "Admins can manage articles"
  ON articles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public can read images for published articles
CREATE POLICY "Public can read article images"
  ON article_images FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_images.article_id
      AND articles.review_status = 'published'
      AND articles.deleted_at IS NULL
    )
  );

-- Admins can manage article images
CREATE POLICY "Admins can manage article images"
  ON article_images FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public can read related models for published articles
CREATE POLICY "Public can read article related models"
  ON article_related_models FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_related_models.article_id
      AND articles.review_status = 'published'
      AND articles.deleted_at IS NULL
    )
  );

-- Admins can manage article related models
CREATE POLICY "Admins can manage article related models"
  ON article_related_models FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public can read related articles for published articles
CREATE POLICY "Public can read article related articles"
  ON article_related_articles FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_related_articles.article_id
      AND articles.review_status = 'published'
      AND articles.deleted_at IS NULL
    )
  );

-- Admins can manage article related articles
CREATE POLICY "Admins can manage article related articles"
  ON article_related_articles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =================================================================
-- COMMENTS
-- =================================================================

COMMENT ON TABLE articles IS 'Editorial articles with full workflow support';
COMMENT ON COLUMN articles.review_status IS 'Editorial state: draft, needs_review, published, unpublished';
COMMENT ON COLUMN articles.deleted_at IS 'Soft delete timestamp. NULL = active, NOT NULL = deleted';
COMMENT ON COLUMN articles.quality_score IS 'Auto-calculated 0-100 score for content quality';
COMMENT ON COLUMN articles.body_content IS 'Structured JSON content with sections and formatting';
COMMENT ON COLUMN articles.faq_content IS 'JSON array of FAQ questions and answers';

COMMENT ON TABLE article_images IS 'Image gallery for articles (main + body images)';
COMMENT ON TABLE article_related_models IS 'Links articles to car models for internal navigation';
COMMENT ON TABLE article_related_articles IS 'Links between related articles';
