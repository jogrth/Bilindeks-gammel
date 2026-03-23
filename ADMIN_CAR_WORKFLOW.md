# Admin Car Management Workflow

## Overview

The car admin system is designed to be scalable and semi-automated, with AI assistance and human oversight. This document describes the complete workflow for adding and maintaining cars.

## Database Structure

### Core Tables

1. **models** - Car model data with AI-assisted fields
   - Basic info: name, slug, brand
   - Specs: price, range, body type, drivetrain, etc.
   - AI fields: `ai_intro_text`, `ai_specs` (JSONB)
   - Override tracking: `human_overrides` (JSONB)
   - Quality tracking: `data_quality_score` (0-100)
   - Model years: `model_year_start`, `model_year_end`
   - Images: `image_url`, `image_storage_path`
   - Status: `status`, `published`

2. **model_overrides** - Manual overrides for AI-generated data
3. **brands** - Car manufacturers
4. **similar_models** - Similar car relationships
5. **model_dealers** - Lead routing to dealers

### Storage

- **model-images** bucket - Stores car images (10MB max)
- Public read access
- Admin-only upload/update/delete

## Admin Interface

### 1. Models List Page (`/admin/models`)

Features:
- Statistics dashboard showing totals, published, drafts, and needs review
- Filterable table with:
  - Published status filter
  - Brand filter
  - Status filter (draft, needs_review, published, etc.)
- Expandable rows for quick preview
- Sortable columns

Columns displayed:
- Image thumbnail
- Brand and model name
- Model year range
- Status badge
- Data quality score (0-100%)
- Published indicator
- Last updated date

Quick actions:
- Click row to expand specs preview
- Click "Rediger" to open full detail page

### 2. Model Detail Page (`/admin/models/[id]`)

Organized into tabs:

#### Basic Info Tab
- Model name
- Model year range (start/end)
- Internal review notes
- Data quality score display
- Published status banner

#### Specs Tab
- Body type
- Drivetrain (Elektrisk, Hybrid, etc.)
- Drive type (AWD, RWD, FWD)
- Price
- Range (WLTP km)
- Charge speed (kW)
- Seats (min/max)
- Cargo capacity (liters)
- Towing capacity (kg)

#### AI Content Tab
- Intro text field with AI suggestions
- Side-by-side comparison:
  - Current/manual value
  - AI-generated suggestion
  - "Use this" button to accept AI value
- Visual indicator for AI suggestions (sparkle icon)

#### Images Tab
- Current image preview
- Drag-and-drop upload area
- Supported formats: JPG, PNG, WebP
- Max file size: 10MB
- Automatic upload to Supabase Storage
- Image URL saved to model record

#### Publishing Tab
- Current published status
- Data quality indicator
- Publish/unpublish button
- Quality warnings (must be >60% to publish)
- Preview of what users will see

#### Lead Routing Tab
- Manage which dealers receive leads
- Set dealer priority
- Enable/disable routing per dealer

#### Similar Models Tab
- Manage similar car relationships
- Set similarity score
- Pin important comparisons

## Data Quality System

The system automatically calculates a data quality score based on field completeness:

### Scoring
- **Essential fields (10 points each):**
  - Name
  - Brand
  - Body type
  - Drivetrain

- **Important fields (5 points each):**
  - Price
  - Range
  - Charge speed
  - Seats
  - Cargo capacity
  - Towing capacity

- **Nice-to-have fields (5 points each):**
  - Intro text
  - Image
  - Drive type
  - Model year

### Quality Levels
- **80-100%**: Good (green) - Ready to publish
- **60-79%**: Medium (amber) - Acceptable but could be improved
- **0-59%**: Low (red) - Should not be published

## AI-Assisted Workflow

### Current Implementation
1. AI-generated suggestions are stored in `ai_intro_text` and `ai_specs`
2. Admin reviews suggestions in the AI Content tab
3. Admin can:
   - Accept AI suggestion (one click)
   - Manually edit/override
   - Mix AI and manual content
4. Overrides are tracked in `human_overrides` field

### Future Enhancements
- Automatic import from vehicle registries
- AI-powered spec extraction from manufacturer websites
- Bulk AI enrichment jobs
- Quality scoring improvements
- Automated translation support

## Publishing Workflow

### States
1. **draft** - Initial state, not visible to users
2. **ingesting** - AI is processing the model
3. **needs_review** - AI completed, awaiting human review
4. **published** - Live and visible to users
5. **error** - Something went wrong during processing
6. **archived** - Model is outdated/discontinued

### Publishing Process
1. Admin creates or imports model (status: draft)
2. Optional: AI enriches the model (status: ingesting → needs_review)
3. Admin reviews data in detail page
4. Admin verifies:
   - Data quality score is acceptable (>60%)
   - All critical fields are filled
   - Images are uploaded
   - Intro text is present
5. Admin clicks "Publish" button
6. Model becomes visible at `/cars` and `/cars/[slug]`

### Unpublishing
- Admin can unpublish anytime
- Model remains in database
- Status reverts to draft
- Not visible to users

## Image Management

### Upload Process
1. Navigate to Images tab in model detail
2. Click upload area or drag image
3. Image validates (<10MB, correct format)
4. Uploads to `model-images/models/[model-id]-[timestamp].[ext]`
5. Public URL saved to `image_url` field
6. Storage path saved to `image_storage_path` field

### Storage Path Format
```
model-images/models/{model-id}-{timestamp}.{extension}
```

### Best Practices
- Use high-quality product images
- Prefer landscape orientation (16:9 or 4:3)
- Optimize images before upload when possible
- Use WebP for best compression

## Search and Filtering

### Available Filters
1. **Published Status**
   - All
   - Published
   - Unpublished

2. **Brand**
   - All brands
   - Individual brand selection

3. **Status**
   - All statuses
   - Draft
   - Needs Review
   - Published
   - Ingesting
   - Error

### URL Parameters
Filters are preserved in URL for bookmarking:
```
/admin/models?published=true&brand={brand-id}&status=needs_review
```

## API Endpoints

### GET `/api/admin/models/[id]`
Fetch single model with all details

### PATCH `/api/admin/models/[id]`
Update model fields (requires admin auth)

Accepted fields:
- All spec fields
- `published`, `status`
- `review_notes`
- Model years
- Image URLs

### POST `/api/admin/models/upload-image`
Upload image to storage

Form data:
- `file`: Image file
- `modelId`: Model UUID

Returns:
- `url`: Public URL
- `path`: Storage path

## Future Roadmap

### Phase 1: Current Implementation ✓
- Manual car management
- AI suggestion display
- Image upload
- Basic publishing workflow
- Quality scoring

### Phase 2: Coming Soon
- Automatic vehicle registry import
- Bulk AI enrichment
- Advanced search and filtering
- Revision history
- Multi-image support

### Phase 3: Future
- AI-powered automatic updates
- Integration with dealer inventory systems
- User feedback integration
- A/B testing for descriptions
- SEO optimization tools

## Security

### Authentication
- All admin endpoints require authentication
- Uses Supabase auth with `system_admins` table
- Row Level Security (RLS) enforced on all tables

### Permissions
- **Public**: Can read published models only
- **Authenticated**: Same as public (regular users)
- **Admin**: Full CRUD on all models, regardless of status

### Storage Security
- Public bucket for easy CDN delivery
- Upload requires admin authentication
- 10MB file size limit enforced
- Only image MIME types allowed

## Troubleshooting

### Data Quality Score Not Updating
- Score updates automatically on save
- Trigger recalculates on INSERT/UPDATE
- Check that `update_data_quality_score()` trigger exists

### Image Upload Failing
- Verify file size <10MB
- Check file format (JPG, PNG, WebP only)
- Ensure `model-images` bucket exists
- Verify admin authentication

### Can't Publish Model
- Data quality must be ≥60%
- Fill out more essential/important fields
- Check console for specific error messages

### AI Suggestions Not Showing
- `ai_intro_text` field must be populated
- Check database migration ran successfully
- Verify AI enrichment process completed

## Performance Considerations

### Database Indexes
All critical queries are indexed:
- `idx_models_published` - Fast filtering by published status
- `idx_models_data_quality` - Quality sorting
- `idx_models_brand_id` - Brand filtering
- `idx_models_status` - Status filtering

### Image Optimization
- Store original in Supabase Storage
- Consider adding CDN in front
- Use Next.js Image component for automatic optimization
- Implement lazy loading for list views

### Caching Strategy
- Static generation for published models
- ISR (Incremental Static Regeneration) for updates
- Admin pages are always dynamic (SSR)
