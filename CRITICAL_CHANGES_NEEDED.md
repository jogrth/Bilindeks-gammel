# Critical Changes Required Before GitHub/Vercel Deployment

## ⚠️ MUST FIX Before First Push to GitHub

### 1. Environment Variable Prefix Issue

**Current State:** Your `.env` uses `VITE_*` prefix
**Impact:** Only works if you're using Vite. If using Next.js, variables won't work.

**Action Required:**

**If using Vite:**
✅ Current .env is correct - no changes needed

**If using Next.js:**
❌ Change all variable names:
```bash
# Current (wrong for Next.js):
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Change to:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Also update all references in code:
```typescript
// Change from:
import.meta.env.VITE_SUPABASE_URL

// To:
process.env.NEXT_PUBLIC_SUPABASE_URL
```

### 2. Verify Framework Configuration

**Action Required:**
1. Confirm which framework you're using (Vite or Next.js)
2. Ensure correct config file exists:
   - Vite: `vite.config.ts`
   - Next.js: `next.config.js`

### 3. Check for Hardcoded Secrets

**Action Required:**

Run these searches in your codebase:

```bash
# Search for hardcoded Supabase URLs
grep -r "https://uypsxxmprmqjjcvzhshu.supabase.co" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ src/

# Search for hardcoded keys
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ src/

# All matches should be replaced with env variable usage
```

**Replace any hardcoded values with:**
```typescript
// For Vite:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// For Next.js:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

### 4. Supabase Client Initialization

**Current files to check:**
- `lib/supabase.ts` (or similar)
- `app/login/page.tsx`
- Any file that creates Supabase client

**Action Required:**

Ensure client is initialized using environment variables:

```typescript
// ✅ CORRECT - Uses environment variables
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL  // Vite
// OR
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL  // Next.js

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY  // Vite
// OR
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // Next.js

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ❌ WRONG - Hardcoded
export const supabase = createClient(
  'https://uypsxxmprmqjjcvzhshu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)
```

## 🔧 Required Files Status

### Files That MUST Exist

- [x] `.gitignore` - ✅ Created
- [x] `.env.example` - ✅ Created
- [ ] `package.json` - ⚠️ Verify exists and is complete
- [ ] `README.md` - ⚠️ Create if missing
- [ ] Build config (`next.config.js` or `vite.config.ts`) - ⚠️ Verify exists

### Files That MUST NOT Exist in Git

- `.env` - Must be in `.gitignore` ✅
- `node_modules/` - Must be in `.gitignore` ✅
- `.next/` or `dist/` - Must be in `.gitignore` ✅

## 🗂️ Project Structure Verification

**Action Required:**

Verify your project has this basic structure:

```
project/
├── .gitignore                    ✅ Created
├── .env                          ⚠️ Must NOT be committed
├── .env.example                  ✅ Created
├── package.json                  ⚠️ Verify complete
├── package-lock.json             ⚠️ Should exist
├── tsconfig.json                 ⚠️ Verify exists
├── next.config.js (Next.js)      ⚠️ Verify if using Next.js
├── vite.config.ts (Vite)         ⚠️ Verify if using Vite
├── README.md                     ⚠️ Create if missing
├── DEPLOYMENT.md                 ✅ Created
├── app/ or src/                  ⚠️ Verify exists
│   ├── components/
│   ├── lib/
│   │   └── supabase.ts          ⚠️ CHECK: Uses env variables
│   ├── login/
│   │   └── page.tsx             ⚠️ CHECK: Uses env variables
│   └── admin/
├── public/                       ⚠️ Verify exists
└── supabase/
    └── functions/                ⚠️ Verify exists
        ├── verify-admin/
        ├── lookup-vehicle/
        └── ...
```

## 🔍 Code Audit Commands

Run these before committing:

```bash
# 1. Check for .env in git
git status | grep "\.env$"
# Expected: Nothing (only .env.example should show)

# 2. Build test
npm run build
# Expected: Successful build

# 3. Search for hardcoded secrets
grep -r "uypsxxmprmqjjcvzhshu" --include="*.ts" --include="*.tsx" src/ app/
# Expected: No matches (or only in comments)

# 4. Verify env variable usage
grep -r "import.meta.env\|process.env" --include="*.ts" --include="*.tsx" src/ app/
# Expected: All Supabase config uses env variables
```

## 📋 Package.json Requirements

**Action Required:**

Verify `package.json` includes:

```json
{
  "name": "bilindeks",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev" OR "vite",
    "build": "next build" OR "vite build",
    "start": "next start" OR "vite preview",
    "lint": "next lint" OR "eslint ."
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x",
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    // ... other dependencies
  }
}
```

## ⚡ Edge Functions Check

**Action Required:**

1. List all deployed Edge Functions:
```bash
# Use mcp__supabase__list_edge_functions tool
```

2. Verify each function has:
   - ✅ CORS headers properly configured
   - ✅ Error handling implemented
   - ✅ No hardcoded credentials

3. Check Edge Function secrets:
```bash
# Use mcp__supabase__list_edge_function_secrets tool
```

Expected functions:
- `verify-admin` ✅
- `lookup-vehicle` ✅
- `submit-lead` ✅
- `send-lead-email` ✅
- `run-ingestion-job` ✅
- `publish-model` ✅
- `cron-refresh-models` ✅

## 🗄️ Database Verification

**Action Required:**

1. Verify admin user exists:
```sql
SELECT * FROM system_admins WHERE is_active = true;
```

2. Verify RLS is enabled on all tables:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
```
Expected: No results (all tables should have RLS enabled)

3. Test authentication:
- Try logging in with admin credentials
- Verify admin panel access works

## 🚀 Pre-Push Final Checklist

Before `git push`:

- [ ] `.env` is NOT committed
- [ ] All secrets use environment variables
- [ ] `npm run build` succeeds
- [ ] Supabase client uses env variables
- [ ] Admin login works locally
- [ ] Edge Functions are deployed
- [ ] Database migrations are applied
- [ ] RLS policies are enabled

## 🎯 Deployment Blockers

These will cause deployment to FAIL:

1. **Missing environment variables in Vercel**
   - Solution: Configure before deploying

2. **Hardcoded secrets in code**
   - Solution: Replace with env variable references

3. **Build fails**
   - Solution: Run `npm run build` locally and fix errors

4. **Wrong variable prefix**
   - Solution: Use `VITE_*` for Vite or `NEXT_PUBLIC_*` for Next.js

5. **Missing dependencies**
   - Solution: Ensure all dependencies in `package.json`

## 📝 Next Steps After Fixing Issues

1. Complete all items in this document
2. Review REPO_READINESS_CHECKLIST.md
3. Run all audit commands listed above
4. Test locally: `npm run build && npm run start`
5. Create GitHub repository
6. Push code to GitHub
7. Configure Vercel
8. Deploy

## 🆘 If You Need Help

Common issues and solutions:

**"Environment variable is undefined"**
- Check variable name prefix matches framework
- Restart dev server after adding variables
- Verify no typos

**"Build fails"**
- Run `npm install` to ensure all dependencies
- Check for TypeScript errors: `npx tsc --noEmit`
- Review build logs for specific errors

**"Can't connect to Supabase"**
- Verify env variables are set correctly
- Check Supabase project is active
- Verify RLS policies allow access

---

**IMPORTANT:** Do not skip any items in this document. Each issue will cause problems in production.

**Priority:** 🔴 HIGH - Complete before first GitHub push
