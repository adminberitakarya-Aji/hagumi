# Supabase Setup Guide for Hagumi

## 📋 Prerequisites

- Supabase account (Free tier)
- Node.js installed
- Git installed

## 🚀 Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or login
4. Click "New Project"
5. Fill in project details:
   - **Name:** `hagumi`
   - **Database Password:** (Create a strong password, save it!)
   - **Region:** Choose region closest to your users (e.g., Southeast Asia)
   - **Pricing Plan:** Free
6. Click "Create new project"
7. Wait for project to be created (2-3 minutes)

### Step 2: Get Supabase Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Update .env File

Open `.env` file in your project root and update:

```env
# === Supabase (Database & Auth) ===
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Replace:**
- `your-project-id` with your actual project ID
- `your-actual-anon-key-here` with your actual anon key

### Step 4: Run Database Migrations

#### Option A: Using Supabase Dashboard (Recommended for Free Tier)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click "New Query"
4. Copy and paste the content of each migration file:

**Migration 1: Initial Schema**
```bash
# Copy content from: supabase/migrations/001_initial_schema.sql
```

**Migration 2: Economy Tables**
```bash
# Copy content from: supabase/migrations/20260508_economy_tables.sql
```

**Migration 3: RPC Functions**
```bash
# Copy content from: supabase/functions/economy_rpc.sql
```

5. Click "Run" for each migration
6. Wait for success message

#### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

### Step 5: Verify Setup

Run this query in Supabase SQL Editor to verify:

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'pets', 'inventory', 'battle_pass', 'gacha_pulls', 'purchases', 'user_economy');

-- Check all functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%_coins%' 
       OR routine_name LIKE '%_gems%'
       OR routine_name LIKE 'claim_daily%'
       OR routine_name LIKE '%battle_pass%'
       OR routine_name LIKE '%gacha%'
       OR routine_name LIKE '%inventory%');
```

Expected result: All 7 tables and 11 functions should be listed.

### Step 6: Test Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Step 7: Create Test User

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click "Add user"
4. Enter email and password
5. Click "Create user"

Or use the signup form in your app.

## 🔧 Configuration Files

### .env File Structure

```env
# Sentry (Error Tracking) - Optional
VITE_SENTRY_DSN=https://examplePublicKey@o123456.ingest.sentry.io/123456

# Supabase (Database & Auth) - Required
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here

# API (Backend) - For future use
VITE_API_BASE_URL=http://localhost:3001/api/v1

# App Info
VITE_APP_VERSION=0.1.0
```

## 📊 Supabase Free Tier Limits

### Database
- **500 MB** database storage
- **1 GB** file storage
- **2 GB** bandwidth per month
- **50,000** API requests per month

### Authentication
- Unlimited users
- Email/password auth
- Social auth (Google, GitHub, etc.)

### Real-time
- 200 concurrent connections
- Unlimited channels

### Storage
- 1 GB file storage
- 2 GB bandwidth per month

## 🔒 Security Best Practices

### 1. Never Commit .env File

Make sure `.env` is in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

### 2. Use Environment-Specific Configs

For different environments:

```bash
# Development
.env

# Production
.env.production
```

### 3. Rotate Keys Regularly

- Change anon key every 3-6 months
- Use service role key only on server-side
- Never expose service role key in client code

## 🐛 Troubleshooting

### Issue: "Invalid API Key"

**Solution:**
- Check if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Make sure you're using the anon/public key, not service role key
- Restart dev server after updating .env

### Issue: "Table does not exist"

**Solution:**
- Run migrations in Supabase SQL Editor
- Check if migrations completed successfully
- Verify table names in database

### Issue: "Permission denied"

**Solution:**
- Check RLS policies are enabled
- Verify user is authenticated
- Check if user has access to their own data

### Issue: "Connection timeout"

**Solution:**
- Check your internet connection
- Verify Supabase project is active
- Check if you're using correct region

## 📈 Monitoring

### Supabase Dashboard

Monitor your project at:
- **Database:** https://supabase.com/dashboard/project/[project-id]/database
- **Auth:** https://supabase.com/dashboard/project/[project-id]/auth/users
- **Storage:** https://supabase.com/dashboard/project/[project-id]/storage
- **API:** https://supabase.com/dashboard/project/[project-id]/api

### Key Metrics to Track

- Database size
- API request count
- Active users
- Storage usage
- Error rates

## 🚀 Next Steps

After setup is complete:

1. ✅ Test all features locally
2. ✅ Deploy to Vercel/Netlify
3. ✅ Setup CI/CD
4. ✅ Configure Sentry monitoring
5. ✅ Setup automated backups
6. ✅ Monitor performance

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)

## 💡 Tips

1. **Start with Free Tier:** Free tier is sufficient for development and small projects
2. **Monitor Usage:** Keep an eye on API requests and storage
3. **Backup Regularly:** Export database regularly
4. **Use Indexes:** Add indexes for frequently queried columns
5. **Optimize Queries:** Use EXPLAIN ANALYZE to optimize slow queries

## 🎯 Production Checklist

Before going to production:

- [ ] Update .env with production values
- [ ] Enable RLS on all tables
- [ ] Set up proper indexes
- [ ] Configure CORS settings
- [ ] Enable email verification
- [ ] Set up rate limiting
- [ ] Configure error tracking (Sentry)
- [ ] Set up monitoring
- [ ] Test all features
- [ ] Create backup strategy

## 🆘 Support

If you encounter issues:

1. Check [Supabase Status](https://status.supabase.com)
2. Search [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
3. Ask in [Supabase Discord](https://supabase.com/discord)
4. Check [Supabase Docs](https://supabase.com/docs)

---

**Last Updated:** May 8, 2026