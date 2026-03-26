# Review Status & Quality System Implementation

**Status:** ✅ Complete and production-ready
**Date:** 2026-03-26
**Build Status:** ✅ Passing

## Overview

Successfully migrated from boolean `published` field to a comprehensive review status system with quality scoring and publication gates. This was done as a **safe, non-breaking migration** that maintains backward compatibility.

## Key Achievements

### 1. Safe Migration (No Breaking Changes) ✅
- **Kept** `published` column temporarily (safe to drop later)
- Added new columns without disrupting existing data
- Auto-sync trigger ensures `published` stays synchronized with `review_status`
- All existing data migrated: `published=true` → `review_status='published'`

### 2. Canonical Field Names ✅
- Model name field: `name` (consistent across schema, TypeScript, UI)
- No mixing of `model`, `model_name`, or `name` variants

### 3. Quality Score Publication Gate ✅
Implemented strict publication requirements enforced at multiple levels:

**Database Level:**
- `calculate_quality_score()` - Deterministic 0-100 scoring function
- `can_publish_model()` - Validation function
- Auto-update trigger recalculates score on every model change

**Application Level:**
- `checkPublicationRequirements()` - TypeScript validation
- `publishModel()` - Enforces all requirements before allowing publication
- Clear error messages when requirements not met

**Publication Requirements:**
- `quality_score >= 70`
- `review_status = 'published'` (manual admin approval required)
- `deleted_at IS NULL`
- `image_primary_url` exists
- `price_from_nok` exists
- `range_wltp_km` exists

### 4. Similar Cars Filtering ✅
All similar car queries now exclude:
- Deleted models (`deleted_at IS NOT NULL`)
- Unpublished models (`review_status != 'published'`)
- Draft models
- Models needing review

## Database Schema Changes

### New Columns
```sql
review_status text DEFAULT 'draft'
  CHECK (review_status IN ('draft', 'needs_review', 'published', 'unpublished'))
deleted_at timestamptz DEFAULT NULL
quality_score integer DEFAULT 0
```

### New Indexes
```sql
idx_models_review_status
idx_models_deleted_at
idx_models_public_query (review_status, deleted_at) WHERE deleted_at IS NULL AND review_status = 'published'
```

### New Functions
- `calculate_quality_score(model_record)` - Deterministic scoring
- `update_model_quality_score()` - Trigger function
- `can_publish_model(model_id)` - Publication validation
- `sync_published_with_review_status()` - Backward compatibility sync

### Updated RLS Policies
```sql
-- Public can only see published, non-deleted models
CREATE POLICY "Public can read published models"
  ON models FOR SELECT
  TO authenticated, anon
  USING (review_status = 'published' AND deleted_at IS NULL);
```

## Quality Score Formula

**Total: 100 points**

### Part 1: Core Completeness (50 points)
- Range WLTP: 10 points
- Price: 10 points
- Battery kWh: 8 points
- Power HP: 8 points
- Segment: 5 points
- Body type: 5 points
- Seats: 2 points
- Cargo: 2 points

### Part 2: Data Confidence (30 points)
Based on average confidence scores:
- ≥90%: 30 points
- ≥80%: 25 points
- ≥70%: 20 points
- ≥60%: 15 points
- <60%: 10 points

### Part 3: Content Richness (20 points)
- Primary image: 5 points
- Additional content (images, trims, FAQs): calculated in application

### Hard Caps
- Missing price OR range: max 60 points
- No image: max 70 points
- Low confidence (<60%): max 75 points

## Review Status States

| State | Description | Public Visibility |
|-------|-------------|-------------------|
| `draft` | Incomplete or new model | ❌ Hidden |
| `needs_review` | Complete but awaiting approval | ❌ Hidden |
| `published` | Approved and live | ✅ Visible |
| `unpublished` | Manually hidden by admin | ❌ Hidden |

## Code Changes Summary

### New Files
- `lib/services/model-state-transitions.ts` - State management and publication logic

### Updated Files
**Types:**
- `types/index.ts` - Added `ReviewStatus` type, updated `CarModel` interface

**Components:**
- `components/admin/ModelDetailClient.tsx` - Uses `review_status`
- `components/admin/ModelsListClient.tsx` - Uses `quality_score`
- `components/admin/ModelsPageClient.tsx` - Updated types
- `components/admin/DealerDetailClient.tsx` - Filters by `review_status`

**Actions & Services:**
- `lib/actions/models.ts` - `toggleModelPublished()` uses `review_status`
- `lib/algorithms/similar-cars.ts` - Filters deleted/unpublished models

**API Routes:**
- `app/api/admin/models/[id]/route.ts` - Accepts `review_status`
- `app/api/admin/models/batch-import/route.ts` - Creates with `review_status='draft'`

**Pages:**
- `app/admin/page.tsx` - Dashboard stats use `review_status`
- `app/admin/models/page.tsx` - Filtering uses `review_status`

## Migration Safety Features

### Backward Compatibility
1. `published` column kept temporarily
2. Auto-sync trigger maintains consistency
3. Existing queries continue to work
4. Gradual rollout possible

### Data Integrity
1. All existing `published=true` → `review_status='published'`
2. All existing `published=false` → `review_status='draft'`
3. Check constraints prevent invalid states
4. Quality scores auto-calculated for all models

### Rollback Plan
If issues arise:
1. Revert code changes (published field still exists)
2. Drop new triggers
3. System falls back to `published` boolean
4. No data loss

## Next Steps

### Immediate (Optional)
1. Monitor production for 1-2 weeks
2. Verify all queries use `review_status`
3. Check no remaining `published` references in active code

### Future Cleanup (After Verification)
1. Remove backward compatibility trigger
2. Drop `published` column
3. Remove any remaining `published` references

### Phases B-H Ready to Implement
The foundation is now in place for:
- B: SEO content management
- C: Trim levels
- D: Advanced enrichment
- E: Image gallery
- F: FAQ management
- G: Admin review workflow
- H: Batch quality improvements

## Testing Checklist

✅ Build passes with zero errors
✅ TypeScript types consistent
✅ Quality score calculation works
✅ Publication gate enforces requirements
✅ Similar cars exclude non-published models
✅ RLS policies secure public data
✅ Backward compatibility maintained
✅ Data migration successful

## Key Decisions

1. **Keep canonical field name:** `name` (not `model_name` or `model`)
2. **Publication requires manual approval:** Admin must explicitly set `review_status='published'`
3. **Quality threshold:** Minimum 70 points to publish
4. **Soft delete:** Use `deleted_at` instead of hard deletes
5. **Backward compatibility:** Maintain `published` during transition

## Migration Files Applied

1. `add_review_status_and_quality_system.sql`
2. `update_rls_for_review_status.sql`
3. `sync_published_with_review_status.sql`

All migrations are idempotent and safe to re-run.
