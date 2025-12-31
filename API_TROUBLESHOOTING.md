# API 404 Error Troubleshooting

## Issue: Backend API returning 404 NOT_FOUND

### Quick Checks

1. **Verify API endpoint exists**:
   - Check: `https://your-app.vercel.app/api/articles`
   - Should return: `[]` (empty array) or list of articles

2. **Check health endpoint**:
   - Check: `https://your-app.vercel.app/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Verify serverless function**:
   - Vercel Dashboard → Your Project → Functions tab
   - Should see `api/index.js` function

### Common Causes & Fixes

#### 1. API Route Not Found

**Symptom**: 404 error on `/api/articles`

**Check**:
- Verify `api/index.js` exists and exports handler
- Check `vercel.json` routes configuration
- Ensure Express app routes are set up correctly

**Fix**:
```javascript
// api/index.js should export:
export default async function handler(req, res) {
  return app(req, res);
}
```

#### 2. Express Routes Not Matching

**Symptom**: 404 on specific endpoints like `/api/articles/:id`

**Check**:
- Verify routes in `backend/src/routes/articleRoutes.js`
- Check Express app mounts routes at `/api/articles`

**Fix**: Routes should be:
```javascript
app.use('/api/articles', articleRoutes);
```

#### 3. Vercel Routing Issue

**Symptom**: All API calls return 404

**Check**:
- Verify `vercel.json` has correct routes
- Check that `api/index.js` is in the correct location

**Fix**: `vercel.json` should have:
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

#### 4. Database Connection Error

**Symptom**: 500 error instead of 404, or function crashes

**Check**:
- Verify `DATABASE_URL` is set in Vercel environment variables
- Check database is accessible from Vercel's region
- Ensure Prisma client is generated

**Fix**:
1. Add `DATABASE_URL` in Vercel Dashboard → Settings → Environment Variables
2. Run migrations: `npx prisma migrate deploy` (in backend folder)

#### 5. Missing Dependencies

**Symptom**: Function crashes on import

**Check**:
- Verify all dependencies are in `backend/package.json`
- Check Prisma client is generated

**Fix**:
```bash
cd backend
npm install
npx prisma generate
```

### Testing API Endpoints

**Health Check**:
```bash
curl https://your-app.vercel.app/health
```

**Get All Articles**:
```bash
curl https://your-app.vercel.app/api/articles
```

**Get Article by ID**:
```bash
curl https://your-app.vercel.app/api/articles/{id}
```

### Debugging Steps

1. **Check Vercel Function Logs**:
   - Dashboard → Deployments → Click deployment → Functions tab
   - Look for error messages

2. **Test Locally**:
   ```bash
   cd backend
   npm run dev
   # Test: http://localhost:3001/api/articles
   ```

3. **Check Environment Variables**:
   - Dashboard → Settings → Environment Variables
   - Verify all required vars are set

4. **Verify Build Success**:
   - Check that `api/index.js` was built successfully
   - Verify no build errors in deployment logs

### Expected API Endpoints

- `GET /health` - Health check
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Still Not Working?

1. Check Vercel function logs for specific errors
2. Verify the function is deployed (check Functions tab)
3. Test with curl or Postman
4. Check CORS settings if calling from frontend
5. Verify database connection is working

