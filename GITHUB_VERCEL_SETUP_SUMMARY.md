# Bilindeks - Complete GitHub & Vercel Deployment Guide

## Quick Reference

**Start Here:** [DEPLOYMENT_STEPS_FOR_OWNER.md](DEPLOYMENT_STEPS_FOR_OWNER.md) - Step-by-step instructions

**Framework Status:** To be determined from your Bolt.new codebase
**Supabase Status:** ✅ Fully configured and ready
**Edge Functions:** ✅ All 7 deployed and active
**Edge Secrets:** ✅ All configured (RESEND, VEGVESEN)

## What's Already Done

### Supabase Backend (100% Complete)
- ✅ Database with 11 tables
  - brands, models, model_overrides, similar_models
  - dealers, model_dealers
  - leads, lead_deliveries
  - profiles, system_admins
  - ingestion_jobs
- ✅ Row Level Security enabled on all tables
- ✅ 1 admin user configured in system_admins
- ✅ All RLS policies active

### Edge Functions (100% Complete)
- ✅ `submit-lead` - Public lead submission (JWT: OFF)
- ✅ `send-lead-email` - Email notifications (JWT: OFF)
- ✅ `verify-admin` - Admin verification (JWT: ON)
- ✅ `lookup-vehicle` - Vehicle data from Vegvesen (JWT: ON)
- ✅ `run-ingestion-job` - Data ingestion (JWT: ON)
- ✅ `publish-model` - Model publishing (JWT: ON)
- ✅ `cron-refresh-models` - Scheduled updates (JWT: ON)

### Edge Function Secrets (100% Complete)
- ✅ `RESEND_API_KEY` - Configured
- ✅ `RESEND_FROM_EMAIL` - Configured
- ✅ `VEGVESEN_API_KEY` - Configured
- ✅ Auto-provided Supabase variables (URL, keys, DB URL)

### Documentation (100% Complete)
- ✅ Deployment steps guide
- ✅ Environment variables checklist
- ✅ Security configurations
- ✅ Git workflow documentation

## What You Must Do

### Phase 1: Bolt.new Code Preparation (30 min)

**Location:** Your Bolt.new project

**Actions:**
1. Identify if using Next.js or Vite
2. Search for hardcoded secrets and remove them
3. Verify Supabase client uses environment variables
4. Test `npm run build` succeeds
5. Export entire project as zip

**Details:** See [DEPLOYMENT_STEPS_FOR_OWNER.md](DEPLOYMENT_STEPS_FOR_OWNER.md) Phase 1

### Phase 2: GitHub Repository (10 min)

**Location:** GitHub.com

**Actions:**
1. Create new repository `bilindeks`
2. Initialize Git in exported code
3. **CRITICAL:** Verify .env is NOT committed
4. Push main and dev branches

**Details:** See [DEPLOYMENT_STEPS_FOR_OWNER.md](DEPLOYMENT_STEPS_FOR_OWNER.md) Phase 2

### Phase 3: Vercel Deployment (15 min)

**Location:** Vercel.com

**Actions:**
1. Import GitHub repository
2. Configure build settings (auto-detected)
3. Add environment variables (see below)
4. Deploy

**Environment Variables to Add:**
```bash
# If Next.js:
NEXT_PUBLIC_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k

# If Vite:
VITE_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

Set for both "Production" and "Preview" environments.

**Details:** See [DEPLOYMENT_STEPS_FOR_OWNER.md](DEPLOYMENT_STEPS_FOR_OWNER.md) Phase 3

### Phase 4: DNS Configuration (20 min)

**Location:** Your domain registrar

**Actions:**
Add these DNS records:

```
# Production
Type: A, Name: @, Value: 76.76.21.21

# WWW redirect
Type: CNAME, Name: www, Value: cname.vercel-dns.com

# Development
Type: CNAME, Name: dev, Value: cname.vercel-dns.com
```

**Note:** DNS takes 24-48 hours to propagate

**Details:** See [DEPLOYMENT_STEPS_FOR_OWNER.md](DEPLOYMENT_STEPS_FOR_OWNER.md) Phase 4

## Branch Strategy

```
main branch → bilindeks.no (production)
dev branch → dev.bilindeks.no (staging)
feature/* → merge to dev via PR
```

## Critical Pre-Deployment Checks

Run these in your Bolt.new project:

### 1. Check Framework
```bash
ls next.config.* && echo "Next.js" || ls vite.config.* && echo "Vite"
```

### 2. Find Hardcoded Secrets
```bash
grep -r "uypsxxmprmqjjcvzhshu" --include="*.ts" --include="*.tsx" .
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --include="*.ts" --include="*.tsx" .
```
**Expected:** Only matches in .env files, not source code

### 3. Verify .env is Excluded
```bash
cat .gitignore | grep "\.env"
```
**Expected:** Should show `.env` is ignored

### 4. Test Build
```bash
npm run build
```
**Expected:** Build succeeds with no errors

## Environment Variables Reference

### Frontend App (Vercel)
**Purpose:** Connect frontend to Supabase
**Location:** Vercel Project Settings → Environment Variables
**Format:** `NEXT_PUBLIC_*` (Next.js) or `VITE_*` (Vite)

### Edge Functions (Supabase)
**Purpose:** Backend services (email, vehicle lookup, etc.)
**Location:** Already configured in Supabase
**Status:** ✅ No action needed

**Complete reference:** [ENVIRONMENT_VARIABLES_CHECKLIST.md](ENVIRONMENT_VARIABLES_CHECKLIST.md)

## Files in This Package

1. **DEPLOYMENT_STEPS_FOR_OWNER.md** ⭐ START HERE
   - Complete step-by-step deployment guide
   - Includes all commands to run
   - Troubleshooting section

2. **ENVIRONMENT_VARIABLES_CHECKLIST.md**
   - All environment variables documented
   - How to verify they're used correctly
   - Framework-specific configurations

3. **.env.example**
   - Template for environment variables
   - Safe to commit to Git

4. **.gitignore**
   - Excludes secrets and build artifacts
   - Ready to use

5. **GITHUB_VERCEL_SETUP_SUMMARY.md** (this file)
   - Overview and quick reference

## Estimated Timeline

- Phase 1 (Bolt.new prep): 30 minutes
- Phase 2 (GitHub): 10 minutes
- Phase 3 (Vercel): 15 minutes
- Phase 4 (DNS): 20 minutes setup, 24-48 hours propagation

**Total active work:** ~75 minutes
**Total time to live site:** 24-48 hours (DNS propagation)

## Success Criteria

Your deployment is successful when:

- ✅ https://bilindeks.no loads without errors
- ✅ https://dev.bilindeks.no loads without errors
- ✅ Login/logout works
- ✅ Lead submission works (test on a vehicle page)
- ✅ Admin panel accessible (for admin users)
- ✅ No console errors in browser
- ✅ No errors in Vercel deployment logs

## If Something Goes Wrong

### Build Fails
1. Check Vercel logs for specific error
2. Run `npm run build` locally
3. Fix errors and push again

### Environment Variables Not Working
1. Verify correct prefix (NEXT_PUBLIC_ or VITE_)
2. Check set for both Production and Preview
3. Redeploy after adding

### Lead Submission Fails
1. Check browser console
2. Check Supabase Edge Function logs
3. Verify RESEND_API_KEY configured (already done)

**Full troubleshooting:** [DEPLOYMENT_STEPS_FOR_OWNER.md](DEPLOYMENT_STEPS_FOR_OWNER.md)

## Getting Help

- Vercel Docs: https://vercel.com/docs
- Supabase Dashboard: https://supabase.com/dashboard/project/uypsxxmprmqjjcvzhshu
- Edge Functions: https://supabase.com/dashboard/project/uypsxxmprmqjjcvzhshu/functions
- Database: https://supabase.com/dashboard/project/uypsxxmprmqjjcvzhshu/editor

## What Doesn't Need Manual Deployment

These are already live and working:

- ✅ Supabase database
- ✅ All 7 Edge Functions
- ✅ Edge Function secrets
- ✅ RLS policies
- ✅ Admin authentication

**You only need to deploy the frontend application to Vercel.**
