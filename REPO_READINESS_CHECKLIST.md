# Repository Readiness Checklist

Use this checklist before pushing to GitHub and deploying to Vercel.

## ✅ Git Configuration

- [ ] `.gitignore` file exists and includes:
  - [ ] `node_modules/`
  - [ ] `.env` and `.env*.local`
  - [ ] `.next/` or `dist/`
  - [ ] `.vercel/`
  - [ ] `*.tsbuildinfo`
  - [ ] IDE files (`.vscode`, `.idea`)
  - [ ] Supabase local files (`.supabase/`, `supabase/.temp`)

- [ ] `.env.example` exists with template values (no real secrets)
- [ ] `.env` is NOT committed to repository

## ✅ Environment Variables

### Check Current .env File

- [ ] No secrets should be hardcoded in source code
- [ ] All environment variables use correct prefix:
  - [ ] `VITE_*` for Vite projects, OR
  - [ ] `NEXT_PUBLIC_*` for Next.js projects
- [ ] Required variables present:
  - [ ] `VITE_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Code Audit for Hardcoded Values

Run these checks:

```bash
# Check for hardcoded Supabase URLs
grep -r "https://.*supabase.co" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .

# Check for hardcoded keys (should return nothing or only .env.example)
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .

# Verify env var usage
grep -r "process.env" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
grep -r "import.meta.env" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
```

## ✅ Dependencies

- [ ] `package.json` exists with all dependencies
- [ ] `package-lock.json` or `yarn.lock` committed
- [ ] No git URLs in dependencies
- [ ] All dependencies have version numbers
- [ ] `npm install` runs without errors
- [ ] `npm run build` succeeds locally

## ✅ Build Configuration

### For Next.js Projects

- [ ] `next.config.js` or `next.config.mjs` exists
- [ ] No hardcoded API endpoints
- [ ] Image domains configured if using external images
- [ ] Environment variables properly accessed via `process.env.NEXT_PUBLIC_*`

### For Vite Projects

- [ ] `vite.config.ts` or `vite.config.js` exists
- [ ] Environment variables properly accessed via `import.meta.env.VITE_*`
- [ ] Build outputs to `dist` directory

## ✅ Supabase Configuration

### Database

- [ ] All migrations applied and working
- [ ] RLS enabled on all tables
- [ ] RLS policies tested and working
- [ ] Admin user(s) configured in `system_admins` table
- [ ] No direct service role key usage in frontend code

### Edge Functions

- [ ] All Edge Functions deployed
- [ ] CORS headers implemented in all functions
- [ ] Required secrets configured in Supabase Dashboard
- [ ] Functions tested and working
- [ ] JWT verification settings correct

### Check Edge Function Secrets

List configured secrets (returns names only, not values):
```bash
# Use Supabase dashboard or appropriate tool
# Verify all required API keys are configured
```

## ✅ Security

- [ ] No `.env` file in git history
  ```bash
  git log --all --full-history -- .env
  # Should return nothing
  ```

- [ ] No hardcoded secrets in code
  ```bash
  # Search for common secret patterns
  grep -r "sk_" --include="*.ts" --include="*.tsx" --include="*.js" .
  grep -r "pk_" --include="*.ts" --include="*.tsx" --include="*.js" .
  grep -r "_secret" --include="*.ts" --include="*.tsx" --include="*.js" .
  grep -r "password" --include="*.ts" --include="*.tsx" --include="*.js" .
  ```

- [ ] Service role key never exposed to frontend
- [ ] All API endpoints properly authenticated
- [ ] CORS properly configured

## ✅ Code Quality

- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] No console.log statements in production code (or only debug logs)
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] No TODO or FIXME comments for critical issues

## ✅ Testing

- [ ] App runs locally without errors
- [ ] Login/logout works
- [ ] Admin panel accessible (for admin users)
- [ ] Public pages load correctly
- [ ] Mobile responsive (test in browser dev tools)
- [ ] All forms submit correctly
- [ ] Error states display properly

## ✅ Documentation

- [ ] README.md exists with:
  - [ ] Project description
  - [ ] Setup instructions
  - [ ] Environment variables documented
  - [ ] Development commands listed
  - [ ] Link to DEPLOYMENT.md

- [ ] DEPLOYMENT.md exists with deployment instructions
- [ ] `.env.example` is complete and up-to-date
- [ ] Code comments for complex logic

## ✅ Repository Structure

Verify this structure exists:

```
project/
├── .gitignore
├── .env.example
├── package.json
├── package-lock.json
├── README.md
├── DEPLOYMENT.md
├── next.config.js (or vite.config.ts)
├── tsconfig.json
├── app/ (or src/)
│   ├── components/
│   ├── lib/
│   └── ...
├── public/
├── supabase/
│   └── functions/
└── ...
```

## ✅ Git Workflow

### Initial Repository Setup

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Verify .env is NOT staged
git status | grep .env
# Should only show .env.example, not .env

# First commit
git commit -m "Initial commit"

# Create dev branch
git checkout -b dev

# Connect to GitHub
git remote add origin https://github.com/yourusername/bilindeks.git

# Push both branches
git push -u origin main
git push -u origin dev
```

### Before Pushing Code

```bash
# Verify no secrets in staged files
git diff --cached

# Check for .env in staging
git status | grep "\.env$"
# Should return nothing (only .env.example should be staged)
```

## ✅ Vercel Configuration

Before deploying to Vercel:

- [ ] GitHub repository is public or organization has Vercel access
- [ ] Environment variables prepared for Vercel:
  - [ ] Production environment variables
  - [ ] Preview (dev) environment variables
- [ ] Domain names ready:
  - [ ] bilindeks.no
  - [ ] dev.bilindeks.no
- [ ] DNS access to configure records

## 🚨 Critical Checks

### MUST DO before first push:

1. **Audit all files for secrets**
   ```bash
   # Check what's being committed
   git diff --cached

   # Search for potential secrets
   grep -r "supabase" .env*
   grep -r "key" .env*
   grep -r "secret" .env*
   ```

2. **Verify .gitignore is working**
   ```bash
   # .env should NOT appear
   git status

   # Force check
   git add .env
   # Should show: "The following paths are ignored by one of your .gitignore files"
   ```

3. **Test build**
   ```bash
   npm run build
   # Must succeed without errors
   ```

## 📋 Quick Pre-Push Command

Run this before every push:

```bash
# Clean build test
rm -rf .next dist node_modules && npm install && npm run build && echo "✅ Ready for push"
```

## ✅ Post-Push Verification

After pushing to GitHub:

- [ ] Repository visible on GitHub
- [ ] `.env` is NOT in repository
- [ ] `.env.example` IS in repository
- [ ] All source files present
- [ ] `node_modules` NOT in repository

## ✅ Post-Deployment Verification

After deploying to Vercel:

- [ ] Production site loads: https://bilindeks.no
- [ ] Dev site loads: https://dev.bilindeks.no
- [ ] No 500 errors in Vercel logs
- [ ] Environment variables loaded correctly
- [ ] Database connection working
- [ ] Edge Functions responding
- [ ] Authentication working
- [ ] Admin panel accessible

## 🆘 If Something Goes Wrong

### Secret Accidentally Committed

```bash
# Remove from git history (BEFORE pushing)
git rm --cached .env
git commit --amend

# If already pushed - contact GitHub support or:
# 1. Rotate all secrets immediately
# 2. Use git-filter-branch or BFG Repo-Cleaner
# 3. Force push (dangerous)
```

### Build Fails

1. Check Vercel build logs
2. Run `npm run build` locally
3. Verify all environment variables set in Vercel
4. Check for missing dependencies

### Need to Rollback

See DEPLOYMENT.md → Rollback Procedure

---

## Sign-off

Before marking this complete:

- [ ] All checklist items above are completed
- [ ] Build succeeds locally
- [ ] No secrets in repository
- [ ] Documentation is complete
- [ ] Team is briefed on workflow

**Checked by:** _______________
**Date:** _______________
**Ready for deployment:** [ ] Yes [ ] No
