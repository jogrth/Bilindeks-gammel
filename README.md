# Bilindeks - Norwegian EV Comparison Platform

Comprehensive platform for comparing electric vehicles in the Norwegian market.

## 🚀 Quick Start

### First Time Setup

1. **Read the documentation** (in this order):
   - 📖 [GITHUB_VERCEL_SETUP_SUMMARY.md](GITHUB_VERCEL_SETUP_SUMMARY.md) - Start here
   - 🔴 [CRITICAL_CHANGES_NEEDED.md](CRITICAL_CHANGES_NEEDED.md) - Must-fix items
   - ✅ [REPO_READINESS_CHECKLIST.md](REPO_READINESS_CHECKLIST.md) - Pre-deployment checklist
   - 🔧 [ENV_VARIABLES.md](ENV_VARIABLES.md) - Environment configuration
   - 🚢 [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
bilindeks/
├── app/                        # Application code
│   ├── components/             # React components
│   ├── lib/                    # Utility functions & Supabase client
│   ├── login/                  # Authentication pages
│   └── admin/                  # Admin dashboard
├── public/                     # Static assets
├── supabase/                   # Supabase configuration
│   └── functions/              # Edge Functions
├── .env                        # Local environment (DO NOT COMMIT)
├── .env.example                # Environment template (safe to commit)
├── .gitignore                  # Git exclusions
└── [Documentation files]       # Setup and deployment guides
```

## 🔐 Environment Variables

### Required Variables

**For Vite:**
```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**For Next.js:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: [Supabase Dashboard → Project Settings → API](https://supabase.com/dashboard/project/_/settings/api)

See [ENV_VARIABLES.md](ENV_VARIABLES.md) for complete reference.

## 🌳 Git Workflow

### Branch Strategy
- `main` → Production (bilindeks.no)
- `dev` → Development (dev.bilindeks.no)
- `feature/*` → Feature branches (merge to dev)

### Development Workflow
```bash
# Start new feature
git checkout dev
git pull origin dev
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push and create PR
git push origin feature/your-feature
```

## 🏗️ Tech Stack

- **Framework:** Next.js / Vite
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Edge Functions:** Supabase Edge Functions (Deno)
- **Hosting:** Vercel
- **Language:** TypeScript

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

## 🗄️ Database

### Supabase Configuration
- **RLS:** Enabled on all tables
- **Admin System:** Custom admin verification via `system_admins` table
- **Edge Functions:** 7 deployed functions for various operations

### Key Tables
- `brands` - EV manufacturers
- `models` - EV models with specifications
- `dealers` - Dealership information
- `leads` - Customer inquiries
- `system_admins` - Admin access control

## 🔧 Edge Functions

Deployed Supabase Edge Functions:
1. `verify-admin` - Admin authentication
2. `lookup-vehicle` - Vehicle data lookup
3. `submit-lead` - Lead form submission
4. `send-lead-email` - Email notifications
5. `run-ingestion-job` - Data ingestion
6. `publish-model` - Model publishing
7. `cron-refresh-models` - Scheduled updates

## 🚀 Deployment

### Production Deployment

1. **Ensure code is ready**
   - Complete [REPO_READINESS_CHECKLIST.md](REPO_READINESS_CHECKLIST.md)
   - Fix all items in [CRITICAL_CHANGES_NEEDED.md](CRITICAL_CHANGES_NEEDED.md)

2. **Push to GitHub**
   ```bash
   git push origin main
   ```

3. **Vercel auto-deploys to:**
   - Production: https://bilindeks.no (main branch)
   - Development: https://dev.bilindeks.no (dev branch)

Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔒 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Environment variables for all secrets
- ✅ Admin verification via Edge Functions
- ✅ CORS properly configured
- ✅ No service role keys in frontend

## 🧪 Testing

```bash
# Test build
npm run build

# Run tests (if configured)
npm test

# Type checking
npx tsc --noEmit
```

## 📊 Monitoring

### Vercel
- Deployments and logs: https://vercel.com/dashboard
- Analytics and performance metrics

### Supabase
- Database logs and queries
- Edge Function logs
- Auth activity

## 🐛 Troubleshooting

Common issues and solutions:

**Build fails:**
- Check environment variables are set
- Run `npm install` to update dependencies
- Verify TypeScript compiles: `npx tsc --noEmit`

**Can't connect to Supabase:**
- Verify `.env` has correct credentials
- Check Supabase project is active
- Ensure RLS policies allow access

**Environment variables undefined:**
- Check variable prefix (VITE_ or NEXT_PUBLIC_)
- Restart dev server after changes
- Verify no typos in variable names

Full troubleshooting: [DEPLOYMENT.md](DEPLOYMENT.md)

## 📚 Documentation

- [GITHUB_VERCEL_SETUP_SUMMARY.md](GITHUB_VERCEL_SETUP_SUMMARY.md) - Complete setup overview
- [CRITICAL_CHANGES_NEEDED.md](CRITICAL_CHANGES_NEEDED.md) - Pre-deployment fixes
- [REPO_READINESS_CHECKLIST.md](REPO_READINESS_CHECKLIST.md) - Deployment checklist
- [ENV_VARIABLES.md](ENV_VARIABLES.md) - Environment variable reference
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment procedures

## 🤝 Contributing

1. Create feature branch from `dev`
2. Make your changes
3. Test thoroughly
4. Create PR to `dev` branch
5. After review and testing on dev.bilindeks.no
6. Merge to `main` for production release

## 📝 License

[Your License Here]

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review troubleshooting sections
3. Check Vercel/Supabase logs

---

**Made with ⚡ for the Norwegian EV market**
