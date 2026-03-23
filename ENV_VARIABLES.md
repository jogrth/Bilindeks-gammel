# Environment Variables Reference

Complete reference for all environment variables used in Bilindeks.

## 🔧 Frontend Application Variables

### Required Variables

#### Supabase Connection

**For Vite Projects:**
```bash
VITE_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

**For Next.js Projects:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

**Description:**
- `*_SUPABASE_URL`: Your Supabase project URL
- `*_SUPABASE_ANON_KEY`: Public anonymous key (safe to expose in frontend)

**Where to get:**
- Supabase Dashboard → Project Settings → API
- URL: Copy from "Project URL"
- Anon Key: Copy from "Project API keys" → "anon" → "public"

**Security Note:**
- Anon key is safe to expose publicly
- Protected by Row Level Security (RLS) policies
- Never use service_role key in frontend

## 🔐 Backend/Edge Functions Variables

### Auto-Configured Variables

These are automatically available in Supabase Edge Functions:

```bash
SUPABASE_URL                  # Your project URL
SUPABASE_ANON_KEY            # Public anon key
SUPABASE_SERVICE_ROLE_KEY    # Private service role key (NEVER expose to frontend)
SUPABASE_DB_URL              # Direct database connection string
```

**Note:** You never need to manually configure these. Supabase provides them automatically.

### Custom Edge Function Secrets

To add custom secrets for Edge Functions (e.g., third-party API keys):

1. Go to Supabase Dashboard
2. Navigate to Edge Functions → Environment Variables
3. Add your secrets there

Example custom secrets you might add:
```bash
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG....
```

**Check configured secrets:**
- Use `mcp__supabase__list_edge_function_secrets` tool, OR
- Check Supabase Dashboard → Edge Functions → Environment Variables

## 🌍 Environment-Specific Configuration

### Development Environment (.env.local or .env)

```bash
# Supabase (can use production or separate dev project)
VITE_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Development-specific overrides
NODE_ENV=development
```

### Production Environment (Vercel)

Configure in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Environment: Production
# Branch: main

VITE_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Preview/Dev Environment (Vercel)

Configure in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Environment: Preview
# Branch: dev

VITE_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** You can use the same Supabase project for both environments, or create separate dev/prod Supabase projects.

## 📝 Variable Naming Conventions

### Frontend Variables

**Vite:** Must start with `VITE_`
```bash
✅ VITE_SUPABASE_URL
✅ VITE_API_ENDPOINT
✅ VITE_FEATURE_FLAG
❌ SUPABASE_URL          # Won't be exposed to browser
❌ API_KEY               # Won't be exposed to browser
```

**Next.js:** Must start with `NEXT_PUBLIC_`
```bash
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_API_ENDPOINT
✅ NEXT_PUBLIC_FEATURE_FLAG
❌ SUPABASE_URL          # Won't be exposed to browser
❌ API_KEY               # Won't be exposed to browser
```

### Backend Variables

Backend variables (Node.js, API routes) don't need prefixes:
```bash
✅ DATABASE_URL
✅ SECRET_KEY
✅ PRIVATE_API_KEY
```

## 🔍 How to Access Variables

### In Vite Frontend Code

```typescript
// ✅ Correct
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ❌ Wrong
const supabaseUrl = process.env.VITE_SUPABASE_URL;  // This is for Node.js
```

### In Next.js Frontend Code

```typescript
// ✅ Correct
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

### In Next.js API Routes / Server Components

```typescript
// ✅ Correct - can access any variable
const secretKey = process.env.SECRET_KEY;
const publicVar = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

### In Supabase Edge Functions

```typescript
// ✅ Auto-configured variables
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// ✅ Custom secrets you added
const openaiKey = Deno.env.get("OPENAI_API_KEY");
```

## ✅ Validation Checklist

Before deploying, verify:

- [ ] All variables use correct prefix for framework
- [ ] No secrets hardcoded in source code
- [ ] `.env` file in `.gitignore`
- [ ] `.env.example` has template values (no real secrets)
- [ ] Vercel has all required variables configured
- [ ] Variables set for correct environment (Production vs Preview)
- [ ] Edge Function secrets configured in Supabase Dashboard

## 🧪 Testing Variables

### Test Locally

```bash
# Check if variables are loaded
npm run dev

# In browser console:
console.log(import.meta.env.VITE_SUPABASE_URL);  // For Vite
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);  // For Next.js
```

### Test in Vercel

After deployment:
1. Check Vercel deployment logs for "Environment Variables Loaded"
2. Visit deployed site
3. Check browser console for proper API connections
4. Verify no "undefined" errors related to env variables

## 🚨 Security Best Practices

### ✅ DO:
- Use `VITE_` or `NEXT_PUBLIC_` prefix for public variables
- Keep `.env` in `.gitignore`
- Use Vercel environment variables for secrets
- Configure Edge Function secrets in Supabase Dashboard
- Rotate keys if accidentally exposed
- Use separate keys for dev/staging/production

### ❌ DON'T:
- Commit `.env` file to git
- Hardcode secrets in source code
- Use service role key in frontend
- Share secrets in public channels
- Reuse the same keys across projects

## 🔄 Rotating Secrets

If a secret is compromised:

### Supabase Keys

1. Go to Supabase Dashboard → Project Settings → API
2. Click "Reset" next to the compromised key
3. Update `.env` locally
4. Update Vercel environment variables
5. Redeploy all environments

### Edge Function Secrets

1. Go to Supabase Dashboard → Edge Functions → Environment Variables
2. Update the secret value
3. Edge Functions will use new value immediately (no redeploy needed)

### Third-Party API Keys

1. Revoke old key in the third-party service
2. Generate new key
3. Update in Supabase Edge Functions environment variables
4. Test to ensure functionality works

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)

## 🆘 Troubleshooting

### Variable is undefined in browser

**Problem:** `import.meta.env.VITE_MY_VAR` returns undefined

**Solutions:**
1. Ensure variable starts with `VITE_` (or `NEXT_PUBLIC_` for Next.js)
2. Restart dev server after adding new variables
3. Check `.env` file is in project root
4. Verify no typos in variable name

### Variable not available in Vercel

**Problem:** Application works locally but not in Vercel

**Solutions:**
1. Check variable is added in Vercel dashboard
2. Verify variable is set for correct environment (Production/Preview)
3. Redeploy after adding variables
4. Check for typos in variable name
5. Ensure variable has correct prefix

### Edge Function can't access secret

**Problem:** `Deno.env.get("MY_SECRET")` returns null

**Solutions:**
1. Add secret in Supabase Dashboard → Edge Functions → Environment Variables
2. Edge Function secrets are separate from frontend .env
3. No redeploy needed for Edge Functions - secrets update immediately
4. Check variable name matches exactly

---

**Last Updated:** 2026-03-23
**Maintained By:** Development Team
