# 🚀 Bilindeks - GitHub & Vercel Setup Summary

Complete guide to move Bilindeks to Git-based workflow with production deployments.

## 📚 Documentation Index

Your project now includes comprehensive documentation:

1. **CRITICAL_CHANGES_NEEDED.md** - 🔴 START HERE
   - Issues that MUST be fixed before pushing to GitHub
   - Code audit commands
   - Deployment blockers

2. **REPO_READINESS_CHECKLIST.md**
   - Step-by-step checklist for repository preparation
   - Security verification steps
   - Pre-push validation

3. **ENV_VARIABLES.md**
   - Complete environment variable reference
   - Framework-specific configuration (Vite vs Next.js)
   - Edge Function secrets management

4. **DEPLOYMENT.md**
   - Vercel deployment instructions
   - DNS configuration
   - Branch strategy
   - Rollback procedures

5. **.env.example**
   - Template for environment variables
   - Safe to commit to repository

6. **.gitignore**
   - Prevents sensitive files from being committed
   - Framework-specific exclusions

## 🎯 Quick Start - 5 Steps to Deployment

### Step 1: Fix Critical Issues (30 minutes)

Read and complete: **CRITICAL_CHANGES_NEEDED.md**

Key tasks:
- Verify framework (Vite or Next.js)
- Check environment variable prefix
- Audit code for hardcoded secrets
- Ensure Supabase client uses env variables

### Step 2: Repository Preparation (15 minutes)

Follow: **REPO_READINESS_CHECKLIST.md**

Key tasks:
- Verify `.gitignore` working
- Run security audits
- Test build locally
- Verify all files present

### Step 3: Push to GitHub (10 minutes)

```bash
# Initialize git
git init

# Add files
git add .

# VERIFY .env is NOT staged
git status | grep "\.env$"
# Should only show .env.example

# First commit
git commit -m "Initial commit: Bilindeks production ready"

# Create dev branch
git checkout -b dev

# Connect to GitHub
git remote add origin https://github.com/yourusername/bilindeks.git

# Push both branches
git push -u origin main
git push -u origin dev
```

### Step 4: Configure Vercel (20 minutes)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import GitHub repository
   - Select bilindeks repository

2. **Configure Build Settings**
   - Framework: Auto-detected (Next.js or Vite)
   - Build Command: `npm run build`
   - Output Directory: `.next` or `dist`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add from ENV_VARIABLES.md:
     - `VITE_SUPABASE_URL` (or `NEXT_PUBLIC_*`)
     - `VITE_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_*`)
   - Set for: Production & Preview

4. **Configure Domains**
   - Add `bilindeks.no` → main branch
   - Add `dev.bilindeks.no` → dev branch

### Step 5: Deploy (5 minutes)

Vercel automatically deploys on push:
- Push to `main` → bilindeks.no updates
- Push to `dev` → dev.bilindeks.no updates

## 🌳 Branch Strategy

```
main (production)
├── bilindeks.no
└── Protected branch

dev (development)
├── dev.bilindeks.no
└── Default development branch

feature/* (feature branches)
└── Merge to dev via PR
```

### Workflow

**Daily Development:**
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "Description"
git push origin feature/your-feature
# Create PR to dev branch
```

**Production Release:**
```bash
# After testing on dev.bilindeks.no
git checkout main
git merge dev
git push origin main
# bilindeks.no updates automatically
```

## 🔐 Environment Variables

### Required for All Environments

#### For Vite Projects:
```bash
VITE_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

#### For Next.js Projects:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

**Where to Configure:**

**Local Development:**
- Add to `.env` file (already exists)
- Never commit this file

**Vercel (Production & Dev):**
- Project Settings → Environment Variables
- Add for both "Production" and "Preview" environments
- Assign to correct branches

**Edge Functions:**
- Automatically configured by Supabase
- For custom secrets: Supabase Dashboard → Edge Functions → Environment Variables

Full reference: **ENV_VARIABLES.md**

## 🌐 Domain Setup

### Production: bilindeks.no

**DNS Configuration:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Vercel Configuration:**
- Domain: `bilindeks.no`
- Branch: `main`
- Redirect: `www.bilindeks.no` → `bilindeks.no`

### Development: dev.bilindeks.no

**DNS Configuration:**
```
Type: CNAME
Name: dev
Value: cname.vercel-dns.com
```

**Vercel Configuration:**
- Domain: `dev.bilindeks.no`
- Branch: `dev`

**Note:** DNS propagation takes 24-48 hours. Check Vercel dashboard for exact DNS values.

## 📦 Supabase Configuration

### Database
- ✅ Migrations applied
- ✅ RLS enabled on all tables
- ✅ Security policies optimized
- ✅ Admin users configured

### Edge Functions Deployed
1. `verify-admin` - Admin authentication
2. `lookup-vehicle` - Vehicle data lookup
3. `submit-lead` - Lead form submission
4. `send-lead-email` - Email notifications
5. `run-ingestion-job` - Data ingestion
6. `publish-model` - Model publishing
7. `cron-refresh-models` - Scheduled model refresh

**All functions:**
- Have proper CORS headers
- Use environment variables
- Include error handling

### Environment Variables (Auto-configured)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

**Custom secrets:** Configure in Supabase Dashboard if needed

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] No hardcoded secrets
- [ ] All env variables use correct prefix
- [ ] `.env` in `.gitignore`
- [ ] `npm run build` succeeds
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Security
- [ ] RLS enabled on all tables
- [ ] Admin verification working
- [ ] No service role key in frontend
- [ ] CORS properly configured

### Testing
- [ ] Login/logout works
- [ ] Admin panel accessible
- [ ] Public pages load
- [ ] Edge Functions respond
- [ ] Mobile responsive

### Repository
- [ ] `.gitignore` configured
- [ ] `.env.example` complete
- [ ] Documentation complete
- [ ] Dependencies in `package.json`

### Deployment
- [ ] Vercel account ready
- [ ] Domain DNS access
- [ ] Environment variables prepared
- [ ] Branches configured (main, dev)

## 🚨 Common Pitfalls

### ❌ Don't:
1. Commit `.env` file
2. Hardcode secrets in code
3. Use `NEXT_PUBLIC_*` with Vite (or vice versa)
4. Push to main without testing on dev
5. Skip environment variable configuration in Vercel
6. Forget to configure both Production and Preview environments

### ✅ Do:
1. Use environment variables for all secrets
2. Test locally before pushing
3. Use correct variable prefix for your framework
4. Deploy to dev first, then promote to production
5. Configure all environment variables in Vercel
6. Keep `.env.example` updated

## 🆘 Troubleshooting

### Build Fails on Vercel
1. Check Vercel build logs
2. Run `npm run build` locally
3. Verify environment variables set
4. Check for missing dependencies

### Environment Variables Not Working
1. Verify correct prefix (VITE_ or NEXT_PUBLIC_)
2. Redeploy after adding variables
3. Check assigned to correct environment
4. Restart dev server locally

### Can't Connect to Supabase
1. Verify env variables in Vercel
2. Check Supabase project is active
3. Verify RLS policies allow access
4. Check browser console for errors

### Domain Not Resolving
1. Wait 24-48 hours for DNS
2. Verify DNS records match Vercel
3. Check domain status in Vercel
4. Clear DNS cache

**Full troubleshooting:** See DEPLOYMENT.md

## 📊 Post-Deployment Monitoring

### Vercel
- Deployments → View logs
- Analytics → Monitor performance
- Runtime Logs → Debug issues

### Supabase
- Edge Functions → View logs
- Database → Query performance
- Auth → Monitor logins

## 🔄 Making Changes After Deployment

### Quick Bug Fix
```bash
git checkout dev
git pull origin dev
git checkout -b fix/issue-name
# Fix bug
git commit -m "Fix: issue description"
git push origin fix/issue-name
# Create PR to dev
# Test on dev.bilindeks.no
# After testing, merge dev to main
```

### New Feature
```bash
git checkout dev
git pull origin dev
git checkout -b feature/feature-name
# Build feature
git commit -m "Add: feature description"
git push origin feature/feature-name
# Create PR to dev
# Test on dev.bilindeks.no
# After testing, merge dev to main
```

## 🎓 Learning Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide)
- [Git Branching Strategy](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows)

## ✨ Success Criteria

Your deployment is successful when:

- ✅ https://bilindeks.no loads correctly
- ✅ https://dev.bilindeks.no loads correctly
- ✅ Users can log in
- ✅ Admin panel is accessible
- ✅ Public pages display properly
- ✅ Edge Functions respond correctly
- ✅ No errors in Vercel logs
- ✅ No errors in Supabase logs
- ✅ Mobile responsive design works

## 📞 Support

If you encounter issues:

1. Review relevant documentation file
2. Check troubleshooting sections
3. Verify all checklist items complete
4. Review Vercel and Supabase logs
5. Test locally to isolate issue

---

## 🎯 Your Action Plan

1. **Now:** Read CRITICAL_CHANGES_NEEDED.md
2. **Next:** Complete REPO_READINESS_CHECKLIST.md
3. **Then:** Push to GitHub
4. **After:** Configure Vercel
5. **Finally:** Deploy and test

**Estimated Total Time:** 90 minutes from start to live production site

**Good luck! 🚀**
