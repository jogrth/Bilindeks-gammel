# Environment Variables Checklist for Bilindeks

## Frontend Application Variables (Vercel)

These must be configured in Vercel for the Next.js/Vite app:

### Production Environment
```bash
NEXT_PUBLIC_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

**Note:** If your codebase uses Vite instead of Next.js, use:
```bash
VITE_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

### Development Environment (Same as Production)
Use the same values for dev.bilindeks.no

### Where to Configure in Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable twice:
   - Set environment to "Production" for main branch
   - Set environment to "Preview" for dev branch

## Supabase Edge Functions Variables (Already Configured)

The following are already configured in Supabase and don't need manual setup:

### Auto-Configured by Supabase
- `SUPABASE_URL` - Auto-provided
- `SUPABASE_ANON_KEY` - Auto-provided
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided
- `SUPABASE_DB_URL` - Auto-provided

### Custom Secrets (Already Set)
✅ `RESEND_API_KEY` - For send-lead-email function
✅ `RESEND_FROM_EMAIL` - For send-lead-email function
✅ `VEGVESEN_API_KEY` - For lookup-vehicle function

**Status:** All edge function secrets are properly configured. No action needed.

## Local Development (.env file)

Your local .env should contain:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

Or for Vite:
```bash
VITE_SUPABASE_URL=https://uypsxxmprmqjjcvzhshu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHN4eG1wcm1xampjdnpoc2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDg2MzUsImV4cCI6MjA4OTE4NDYzNX0.4P4Qs83D35dqv2JN8Wauv8VrjDx4ZmzD5uNe5_k-D4k
```

## Critical Checks Before Deployment

### 1. Verify Framework in Your Codebase
Run this in your Bolt.new project:
```bash
# Check which framework you're using
ls next.config.* 2>/dev/null && echo "USING NEXT.JS - Use NEXT_PUBLIC_*"
ls vite.config.* 2>/dev/null && echo "USING VITE - Use VITE_*"
```

### 2. Search for Hardcoded Secrets
```bash
# Search for hardcoded Supabase URL
grep -r "uypsxxmprmqjjcvzhshu" --include="*.ts" --include="*.tsx" --include="*.js" app/ src/

# Search for hardcoded keys
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --include="*.ts" --include="*.tsx" app/ src/
```

**Expected result:** No matches (only in .env files)

### 3. Verify Supabase Client Uses Env Variables
Check your Supabase client initialization file (usually `lib/supabase.ts` or similar):

**Correct (Next.js):**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Correct (Vite):**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Wrong (Hardcoded):**
```typescript
// ❌ DO NOT DO THIS
export const supabase = createClient(
  'https://uypsxxmprmqjjcvzhshu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)
```

## Summary Checklist

- [ ] Framework identified (Next.js or Vite)
- [ ] All environment variables use correct prefix
- [ ] No hardcoded secrets in source code
- [ ] Supabase client uses environment variables
- [ ] .env file is in .gitignore
- [ ] .env.example created with placeholder values
- [ ] Ready to add variables to Vercel after deployment
