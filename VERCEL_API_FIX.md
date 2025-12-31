# Vercel API 404 Fix Guide

## Current Issue
Backend API returning 404 NOT_FOUND on Vercel deployment.

## Diagnostic Steps

### 1. Check Function Deployment
1. Go to Vercel Dashboard → Your Project
2. Click on **Functions** tab
3. Verify `api/index.js` is listed
4. If not listed, the function isn't being deployed

### 2. Check Build Logs
1. Go to **Deployments** tab
2. Click on latest deployment
3. Check **Build Logs** for errors
4. Look for:
   - `api/index.js` being built
   - Any import errors
   - Missing dependencies

### 3. Check Function Logs
1. Go to **Deployments** → Latest → **Functions** tab
2. Try accessing: `https://your-app.vercel.app/api/test`
3. Check logs for:
   - `[API Handler]` messages (means function is being called)
   - `[Express]` messages (means Express is receiving requests)
   - Any error messages

### 4. Test Endpoints

Try these endpoints in order:

```bash
# 1. Test endpoint (should work if function is deployed)
curl https://your-app.vercel.app/api/test

# 2. Health endpoint
curl https://your-app.vercel.app/health

# 3. Articles endpoint
curl https://your-app.vercel.app/api/articles
```

## Common Fixes

### Fix 1: Function Not Deployed

**Symptom**: Function doesn't appear in Functions tab

**Solution**:
1. Ensure `api/index.js` exists in root
2. Check `vercel.json` has correct build configuration
3. Redeploy: Vercel Dashboard → Deployments → Redeploy

### Fix 2: Import Errors

**Symptom**: Function crashes on import, no logs appear

**Solution**:
- Ensure backend dependencies are installed
- Check that `backend/package.json` has all dependencies
- Verify Prisma client is generated (should happen in build)

### Fix 3: Routing Not Working

**Symptom**: Function logs appear but 404 returned

**Solution**:
- Check `vercel.json` routes configuration
- Verify Express routes are correct
- Check that path matching is correct

### Fix 4: Database Connection

**Symptom**: 500 error or function crashes

**Solution**:
1. Add `DATABASE_URL` in Vercel environment variables
2. Go to Settings → Environment Variables
3. Add: `DATABASE_URL` = your PostgreSQL connection string
4. Redeploy

## Current Configuration

### File Structure
```
/
├── api/
│   └── index.js          # Vercel serverless function
├── backend/
│   ├── src/
│   │   └── app.js        # Express app
│   └── package.json
└── vercel.json           # Vercel configuration
```

### vercel.json
```json
{
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

### api/index.js
```javascript
import app from '../backend/src/app.js';

export default async function handler(req, res) {
  console.log(`[API Handler] ${req.method} ${req.url}`);
  return app(req, res);
}
```

## Next Steps

1. **Check Vercel Function Logs** - This is the most important step
2. **Verify Environment Variables** - Ensure `DATABASE_URL` is set
3. **Test `/api/test` endpoint** - This should work if function is deployed
4. **Check Build Logs** - Look for any errors during build

## If Still Not Working

1. Share the Vercel function logs
2. Share the build logs
3. Share which endpoint you're testing
4. Check if the function appears in the Functions tab

