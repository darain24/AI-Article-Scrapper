# Vercel Deployment Setup Guide

## Quick Fix for Current Error

The error you're seeing is likely due to:
1. Missing API route configuration
2. Database connection issues
3. Missing environment variables

## Step-by-Step Fix

### 1. Project Structure

Your project should have this structure:
```
beyondchats_assignment/
├── api/
│   └── index.js          # Serverless function entry point
├── backend/
│   └── src/
│       └── app.js        # Express app
├── frontend/
│   └── dist/             # Built frontend (generated)
└── vercel.json           # Vercel configuration
```

### 2. Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these **required** variables:

```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

**Optional:**
```
FRONTEND_URL=https://your-app.vercel.app
PORT=3001
```

### 3. Database Setup

#### Option A: Vercel Postgres (Easiest)

1. In Vercel Dashboard → Your Project → Storage
2. Click "Create Database" → Select "Postgres"
3. Copy the connection string
4. Add as `DATABASE_URL` environment variable

#### Option B: External Database

Use services like:
- **Supabase**: https://supabase.com (Free tier available)
- **Neon**: https://neon.tech (Free tier available)
- **Railway**: https://railway.app

### 4. Run Database Migrations

After setting up the database, run migrations:

**Option A: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run migrations
cd backend
npx prisma migrate deploy
```

**Option B: Via Supabase/Neon Dashboard**
- Use their SQL editor to run migrations manually
- Or use their CLI tools

**Option C: Create Migration Endpoint**
Add a temporary endpoint to run migrations (remove after use):

```javascript
// backend/src/routes/migrate.js (temporary)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.MIGRATION_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Run migrations
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 5. Deploy

```bash
# If using Vercel CLI
vercel --prod

# Or push to GitHub (if connected)
git push origin main
```

### 6. Verify Deployment

1. **Health Check**: `https://your-app.vercel.app/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **API Test**: `https://your-app.vercel.app/api/articles`
   - Should return: `[]` (empty array if no articles)

3. **Frontend**: `https://your-app.vercel.app`
   - Should show the React app

## Common Errors & Fixes

### Error: FUNCTION_INVOCATION_FAILED

**Causes:**
- Missing environment variables
- Database connection failed
- Prisma client not generated
- Import errors

**Fix:**
1. Check Vercel logs: Dashboard → Deployments → Click deployment → Functions tab
2. Verify all environment variables are set
3. Ensure `DATABASE_URL` is correct
4. Check that Prisma client is generated (should happen automatically)

### Error: Database Connection Failed

**Fix:**
1. Verify `DATABASE_URL` format is correct
2. Check database allows connections from Vercel IPs
3. For Supabase/Neon: Check connection pooling settings
4. Use connection string with `?pgbouncer=true` for connection pooling

### Error: Prisma Client Not Found

**Fix:**
Add to `package.json` in backend:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Or add build command in Vercel:
```
cd backend && npm install && npx prisma generate && cd ..
```

### Error: CORS Issues

**Fix:**
Update CORS in `backend/src/app.js`:
```javascript
const corsOptions = {
  origin: [
    'https://your-app.vercel.app',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean),
  credentials: true
};
app.use(cors(corsOptions));
```

## Testing Locally with Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run locally
vercel dev
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database created and connected
- [ ] Migrations run successfully
- [ ] Health endpoint returns 200
- [ ] API endpoints working
- [ ] Frontend loads correctly
- [ ] CORS configured for production domain
- [ ] Error logging set up

## Need Help?

1. Check Vercel logs for detailed error messages
2. Test API endpoints individually
3. Verify database connection separately
4. Check Prisma client generation
5. Review Vercel documentation: https://vercel.com/docs

