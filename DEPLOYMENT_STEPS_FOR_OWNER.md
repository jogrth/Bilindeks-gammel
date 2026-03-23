# Deployment Steps for Bilindeks Owner

## Prerequisites Completed

✅ Supabase database with 11 tables and RLS enabled
✅ 7 Edge Functions deployed and active
✅ Edge Function secrets configured (RESEND_API_KEY, RESEND_FROM_EMAIL, VEGVESEN_API_KEY)
✅ Environment variables documented
✅ .gitignore configured to exclude secrets

## What You Must Do Now

### Phase 1: Prepare Bolt.new Codebase (30 minutes)

#### 1.1 Identify Framework
In your Bolt.new project terminal, run:
```bash
# Check which framework
ls next.config.* && echo "Framework: Next.js"
ls vite.config.* && echo "Framework: Vite"
```

**Result needed:** Know if you're using Next.js or Vite

#### 1.2 Search for Hardcoded Secrets
```bash
# Search entire codebase
grep -r "uypsxxmprmqjjcvzhshu" --include="*.ts" --include="*.tsx" --include="*.js" .
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --include="*.ts" --include="*.tsx" .
```

**Action required:**
- If matches found in source files (not .env): Replace with environment variable references
- Expected matches: Only in .env, .env.local, .env.example

#### 1.3 Fix Supabase Client Initialization
Find your Supabase client file (usually `lib/supabase.ts` or `src/lib/supabase.ts`):

**If Next.js, it should look like:**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)
```

**If Vite, it should look like:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
```

**Action:** Fix if hardcoded

#### 1.4 Verify .env Configuration
Check your .env file has correct prefix:

**Next.js:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

**Vite:**
```bash
VITE_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

#### 1.5 Test Build
```bash
npm run build
```

**Action:** Fix any build errors before proceeding

#### 1.6 Verify .gitignore
Ensure your .gitignore includes:
```
.env
.env.local
.env*.local
node_modules
.next
dist
```

### Phase 2: Push to GitHub (10 minutes)

#### 2.1 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `bilindeks`
3. Keep it private or public (your choice)
4. Do NOT initialize with README (your code already has files)
5. Click "Create repository"

#### 2.2 Export from Bolt.new
In Bolt.new:
1. Click the download/export button
2. Download the entire project as a zip file
3. Extract to a local folder

#### 2.3 Initialize Git and Push
```bash
cd /path/to/extracted/bilindeks

# Initialize git
git init

# CRITICAL: Verify .env is NOT staged
git status | grep "\.env"
# Should only show .env.example, NOT .env

# If .env appears, add it to .gitignore immediately
echo ".env" >> .gitignore

# Add all files
git add .

# Verify again
git status

# First commit
git commit -m "Initial commit: Bilindeks production ready"

# Create dev branch
git checkout -b dev

# Go back to main
git checkout main

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/bilindeks.git

# Push both branches
git push -u origin main
git push -u origin dev
```

### Phase 3: Deploy to Vercel (15 minutes)

#### 3.1 Import Repository
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `bilindeks` repository
4. Click "Import"

#### 3.2 Configure Build Settings
Vercel should auto-detect your framework. Verify:

**For Next.js:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**For Vite:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Root Directory:** Leave as `.` (root)

#### 3.3 Configure Environment Variables
Click "Environment Variables" and add:

**If Next.js:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://uypsxxmprmqjjcvzhshu.supabase.co
Environment: Production, Preview

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
Environment: Production, Preview
```

**If Vite:**
```
Name: VITE_SUPABASE_URL
Value: https://uypsxxmprmqjjcvzhshu.supabase.co
Environment: Production, Preview

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
Environment: Production, Preview
```

#### 3.4 Deploy
Click "Deploy"

Wait for deployment to complete (usually 2-3 minutes)

### Phase 4: Configure Domains (20 minutes)

#### 4.1 Add Production Domain
1. In Vercel project, go to Settings → Domains
2. Add domain: `bilindeks.no`
3. Add domain: `www.bilindeks.no` (redirect to bilindeks.no)
4. Select branch: `main`

#### 4.2 Add Development Domain
1. Add domain: `dev.bilindeks.no`
2. Select branch: `dev`

#### 4.3 Configure DNS
Vercel will show you DNS records. Go to your domain registrar and add:

**For bilindeks.no (root):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www.bilindeks.no:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For dev.bilindeks.no:**
```
Type: CNAME
Name: dev
Value: cname.vercel-dns.com
```

**Note:** DNS propagation takes 24-48 hours. Check Vercel for exact values.

### Phase 5: Verify Deployment (10 minutes)

#### 5.1 Test Production Site
1. Visit your Vercel deployment URL (e.g., `bilindeks.vercel.app`)
2. Check for console errors (F12 → Console)
3. Test login functionality
4. Test lead submission on a vehicle page
5. Check admin panel access

#### 5.2 Test Environment Variables
In browser console:
```javascript
// Should NOT be undefined
console.log('Supabase configured:', !!window.location)
```

Check network tab for Supabase API calls - they should succeed.

#### 5.3 Verify Edge Functions
Edge functions are already deployed to Supabase. They work automatically via:
```
https://uypsxxmprmqjjcvzhshu.supabase.co/functions/v1/submit-lead
https://uypsxxmprmqjjcvzhshu.supabase.co/functions/v1/send-lead-email
etc.
```

No additional deployment needed for Edge Functions.

### Phase 6: Setup Branch Workflow (5 minutes)

#### 6.1 Configure Branch Protection (Optional)
In GitHub repository:
1. Settings → Branches
2. Add rule for `main` branch
3. Enable "Require pull request before merging"

#### 6.2 Development Workflow
From now on:

**For new features:**
```bash
git checkout dev
git pull origin dev
git checkout -b feature/feature-name
# Make changes
git commit -m "Add feature"
git push origin feature/feature-name
# Create PR to dev branch
# After merge, dev.bilindeks.no auto-updates
```

**For production releases:**
```bash
git checkout main
git merge dev
git push origin main
# bilindeks.no auto-updates
```

## Summary of Required Actions

### You Must Do:
1. ✅ Check framework (Next.js or Vite) in Bolt.new
2. ✅ Search for and fix hardcoded secrets
3. ✅ Verify Supabase client uses env variables
4. ✅ Run `npm run build` and fix errors
5. ✅ Export code from Bolt.new
6. ✅ Create GitHub repository
7. ✅ Push code to GitHub (verify .env excluded)
8. ✅ Import to Vercel
9. ✅ Add environment variables in Vercel
10. ✅ Configure DNS records

### Already Done (No Action Needed):
- ✅ Supabase database setup
- ✅ Edge Functions deployed (7 functions)
- ✅ Edge Function secrets configured
- ✅ RLS policies enabled
- ✅ Admin user configured
- ✅ .gitignore configured
- ✅ Documentation created

## Troubleshooting

### Build Fails on Vercel
1. Check Vercel logs for specific error
2. Verify environment variables are set correctly
3. Test `npm run build` locally first
4. Check for missing dependencies in package.json

### Environment Variables Not Working
1. Verify correct prefix (NEXT_PUBLIC_ or VITE_)
2. Check assigned to both Production and Preview
3. Redeploy after adding variables
4. Clear Vercel cache: Deployments → ⋯ → Redeploy

### Domain Not Resolving
1. Wait 24-48 hours for DNS propagation
2. Verify DNS records match Vercel instructions exactly
3. Check domain status in Vercel dashboard
4. Use https://dnschecker.org to check propagation

### Lead Submission Not Working
1. Check browser console for errors
2. Verify Supabase connection (check Network tab)
3. Check Edge Function logs in Supabase Dashboard
4. Verify RESEND_API_KEY is configured in Supabase

## Next Steps After Deployment

1. Test all functionality thoroughly
2. Monitor Vercel deployment logs
3. Monitor Supabase Edge Function logs
4. Set up alerts for errors
5. Document any issues for future reference

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Your Edge Functions: https://supabase.com/dashboard/project/uypsxxmprmqjjcvzhshu/functions
- Your Database: https://supabase.com/dashboard/project/uypsxxmprmqjjcvzhshu/editor
