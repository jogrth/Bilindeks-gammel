# Bilindeks Deployment Guide

This guide covers deploying Bilindeks to production and development environments using GitHub and Vercel.

## Repository Setup

### 1. GitHub Repository Structure

```
main branch    → Production (bilindeks.no)
dev branch     → Development (dev.bilindeks.no)
```

### 2. Required Files

Ensure these files are present and properly configured:

- `.gitignore` - Excludes secrets and build artifacts
- `.env.example` - Template for environment variables
- `package.json` - All dependencies listed
- `next.config.js` or `vite.config.js` - Build configuration

## Environment Variables

### Required for All Environments

#### Supabase Configuration
```bash
VITE_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** If using Next.js instead of Vite, use:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Edge Functions Environment Variables

Edge Functions have access to these automatically:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Additional secrets for Edge Functions (if needed):
- Check configured secrets: Use Supabase dashboard or `list_edge_function_secrets` tool
- Configure new secrets: Use Supabase dashboard under Edge Functions → Environment Variables

## Vercel Deployment

### Initial Setup

1. **Connect GitHub Repository to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the repository

2. **Configure Build Settings**

   For Next.js:
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

   For Vite:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables from `.env.example`
   - Configure separately for Production and Preview (dev)

### Production Environment (main branch)

1. **Domain Configuration**
   - Go to Project Settings → Domains
   - Add `bilindeks.no`
   - Add `www.bilindeks.no` (redirect to main domain)
   - Vercel will provide DNS configuration instructions

2. **Environment Variables**
   - Set environment: `Production`
   - Add all variables from `.env.example`
   - Use production Supabase credentials

3. **Branch Configuration**
   - Production branch: `main`
   - Deploy on push to `main`

### Development Environment (dev branch)

1. **Domain Configuration**
   - Add `dev.bilindeks.no` as a custom domain
   - Point to the `dev` branch

2. **Environment Variables**
   - Set environment: `Preview`
   - Branch: `dev`
   - Add all variables from `.env.example`
   - Can use same Supabase project or separate dev project

3. **Branch Configuration**
   - Preview branch: `dev`
   - Deploy on push to `dev`

## DNS Configuration

### For bilindeks.no (Production)

Add these DNS records at your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### For dev.bilindeks.no (Development)

```
Type: CNAME
Name: dev
Value: cname.vercel-dns.com
```

**Note:** Vercel provides specific DNS values. Check your Vercel project dashboard for exact values.

## Workflow

### Development Workflow

1. Create feature branch from `dev`
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push and create PR to `dev`
   ```bash
   git push origin feature/your-feature-name
   ```
   - Create PR on GitHub targeting `dev` branch
   - Vercel creates preview deployment automatically

4. After review, merge to `dev`
   - `dev.bilindeks.no` updates automatically

### Production Release Workflow

1. Create PR from `dev` to `main`
   ```bash
   git checkout main
   git pull origin main
   git merge dev
   ```

2. Review changes carefully

3. Merge to `main`
   - `bilindeks.no` updates automatically

## Pre-Deployment Checklist

### Code Review

- [ ] No secrets or API keys in code
- [ ] All environment variables use correct prefix (VITE_ or NEXT_PUBLIC_)
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` is up to date
- [ ] All dependencies in `package.json`
- [ ] Build succeeds locally: `npm run build`
- [ ] No console errors in production build

### Supabase Configuration

- [ ] RLS policies enabled on all tables
- [ ] Edge Functions deployed
- [ ] Edge Function secrets configured (if needed)
- [ ] Database migrations applied
- [ ] Admin users configured in `system_admins` table

### Security

- [ ] No hardcoded credentials
- [ ] CORS headers properly configured
- [ ] Authentication working correctly
- [ ] Admin verification working

### Testing

- [ ] Test login/logout flow
- [ ] Test admin panel access
- [ ] Test public pages load correctly
- [ ] Test Edge Functions respond correctly
- [ ] Test on mobile viewport

## Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check for missing dependencies

### Environment Variables Not Working

1. Ensure correct prefix (VITE_ or NEXT_PUBLIC_)
2. Redeploy after adding variables
3. Check variable is set for correct environment (Production vs Preview)
4. Clear cache and redeploy

### Edge Functions Not Working

1. Check Edge Function is deployed in Supabase dashboard
2. Verify CORS headers are correct
3. Check Edge Function logs in Supabase dashboard
4. Verify JWT verification setting matches usage

### Domain Not Resolving

1. Wait 24-48 hours for DNS propagation
2. Verify DNS records match Vercel instructions
3. Check domain status in Vercel dashboard
4. Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

## Monitoring

### Vercel Analytics

- Enable in Project Settings → Analytics
- Monitor performance, errors, and usage

### Supabase Logs

- Edge Function logs: Supabase Dashboard → Edge Functions → Logs
- Database logs: Supabase Dashboard → Database → Logs
- Auth logs: Supabase Dashboard → Authentication → Logs

## Rollback Procedure

If production deployment has issues:

1. **Instant Rollback in Vercel**
   - Go to Deployments
   - Find last working deployment
   - Click "..." → Promote to Production

2. **Code Rollback**
   ```bash
   git checkout main
   git revert HEAD
   git push origin main
   ```

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vite Docs: https://vitejs.dev/guide
