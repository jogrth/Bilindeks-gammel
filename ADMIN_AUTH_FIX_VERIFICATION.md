# Admin Authentication Fix - Verification Guide

## Problem
The "Legg til bil" (Add Car) modal was failing with:
```
POST /api/admin/models/batch-import 401 (Unauthorized)
```

## Root Cause
The API route was relying on cookie-based authentication via the server-side Supabase client, which wasn't working properly in the API route context. The frontend wasn't sending Bearer tokens.

## Solution Implemented

### 1. Frontend Changes (`components/admin/AddModelsModal.tsx`)

**Before:**
```typescript
const response = await fetch('/api/admin/models/batch-import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: input.trim() }),
});
```

**After:**
```typescript
const { createClient } = await import('@/lib/supabase/client');
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  throw new Error('Not authenticated');
}

console.log('Sending request with token:', session.access_token.substring(0, 20) + '...');

const response = await fetch('/api/admin/models/batch-import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({ input: input.trim() }),
});
```

**Changes:**
- ✅ Gets session from Supabase client
- ✅ Includes `Authorization: Bearer <token>` header
- ✅ Logs token presence for debugging
- ✅ Throws error if not authenticated

### 2. API Route Changes (`app/api/admin/models/batch-import/route.ts`)

**Before:**
- Used cookie-based auth via `createClient()` from `@/lib/supabase/server`
- Checked `profiles` table for `is_admin` field

**After:**
- Uses Bearer token authentication (same as verify-admin edge function)
- Validates JWT using Supabase with anon key
- Checks `system_admins` table using service role

**Authentication Flow:**
1. Extract `Authorization` header
2. Validate JWT with anon key client
3. Get user from token
4. Check `system_admins` table with service role client
5. Verify `is_active = true`

**Error Responses:**
- `401` - Missing or invalid token
- `403` - Not an admin
- `500` - Database error
- `200` - Success with results

## Testing Checklist

### Prerequisites
1. ✅ User must be logged in
2. ✅ User must exist in `system_admins` table with `is_active = true`

### Test Steps

1. **Login as Admin**
   - Navigate to `/login`
   - Login with admin credentials
   - Verify redirect to `/admin`

2. **Open Models Page**
   - Navigate to `/admin/models`
   - Click "Legg til bil" button
   - Modal should open

3. **Add Test Models**
   - Enter in textarea:
     ```
     Polestar 4
     Peugeot e-5008
     ```
   - Click "Legg til" button
   - Check browser console for log: `Sending request with token: ...`

4. **Verify Success**
   - ✅ No 401 Unauthorized error
   - ✅ No 403 Forbidden error
   - ✅ Success message appears
   - ✅ Details show "Created with ... enrichment"
   - ✅ Modal closes after 2 seconds
   - ✅ Models appear in the list

5. **Verify Database**
   ```sql
   SELECT
     b.name as brand,
     m.name as model,
     m.status,
     m.enrichment_source,
     m.enrichment_confidence
   FROM models m
   JOIN brands b ON m.brand_id = b.id
   WHERE m.slug IN ('polestar-4', 'peugeot-e-5008');
   ```

   Expected:
   - Status: `needs_review` or `draft`
   - Source: `generic_fallback` or `openai_generated`
   - Confidence: 0.3 or higher

## Verification Results

### Build Status
- ✅ Build completes successfully
- ✅ No TypeScript errors
- ✅ All routes compile

### Code Quality
- ✅ Uses same auth pattern as verify-admin
- ✅ Proper error handling
- ✅ Clear error messages
- ✅ Console logging for debugging

### Security
- ✅ JWT validation with anon key
- ✅ Admin check with service role
- ✅ No token exposure in responses
- ✅ Proper status codes

## Comparison with verify-admin Edge Function

Both implementations now follow the same pattern:

| Step | verify-admin | batch-import |
|------|--------------|--------------|
| Get auth header | ✅ | ✅ |
| Validate with anon key | ✅ | ✅ |
| Extract user | ✅ | ✅ |
| Check system_admins | ✅ | ✅ |
| Use service role | ✅ | ✅ |
| Return proper errors | ✅ | ✅ |

## Next Steps for User

1. Test the flow in the running application
2. Verify models are created correctly
3. Verify enrichment runs
4. Verify no console errors
5. Confirm modal shows success message

The fix is complete and ready for testing!
