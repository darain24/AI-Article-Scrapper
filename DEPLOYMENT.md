# Deployment Guide

This guide covers deploying the BeyondChats application to various platforms.

## 🚀 Vercel Deployment (Recommended)

Vercel provides seamless deployment for both frontend and backend.

### Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. GitHub repository (or GitLab/Bitbucket)
3. Environment variables configured

### Step 1: Prepare Repository

Ensure your code is pushed to a Git repository:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as root
   - **Build Command**: (Leave empty, Vercel will auto-detect)
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install` (in root) or configure separately

4. Add Environment Variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=production
   PORT=3001
   ```

5. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts to configure
```

### Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `NODE_ENV` - Set to `production`

**Optional Variables:**
- `PORT` - Server port (default: 3001)
- `VITE_API_BASE_URL` - Frontend API base URL (default: `/api`)

### Step 4: Database Setup

#### Using Vercel Postgres (Recommended)

1. In Vercel Dashboard → Your Project → Storage
2. Create a Postgres database
3. Copy the connection string
4. Add as `DATABASE_URL` environment variable

#### Using External Database

1. Use services like:
   - Supabase (https://supabase.com)
   - Neon (https://neon.tech)
   - Railway (https://railway.app)
   - AWS RDS
   - Google Cloud SQL

2. Get connection string and add as `DATABASE_URL`

### Step 5: Run Database Migrations

After deployment, run Prisma migrations:

```bash
# Via Vercel CLI
vercel env pull .env.local
cd backend
npx prisma migrate deploy

# Or via Vercel Functions
# Create a one-time migration script
```

### Step 6: Verify Deployment

1. Check health endpoint: `https://your-app.vercel.app/health`
2. Test API: `https://your-app.vercel.app/api/articles`
3. Visit frontend: `https://your-app.vercel.app`

## 🐳 Docker Deployment

### Build Docker Images

```bash
# Build backend
cd backend
docker build -t beyondchats-backend .

# Build frontend
cd ../frontend
docker build -t beyondchats-frontend .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

## ☁️ Other Platforms

### Railway

1. Connect GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy

### Render

1. Create new Web Service
2. Connect repository
3. Configure:
   - Build Command: `cd backend && npm install && npm run prisma:generate`
   - Start Command: `cd backend && npm start`
4. Add PostgreSQL database
5. Set environment variables

### Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set GEMINI_API_KEY=your_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run npm run prisma:migrate --prefix backend
```

### AWS (EC2/ECS/Lambda)

1. **EC2**: Deploy as traditional server
2. **ECS**: Use Docker containers
3. **Lambda**: Requires serverless configuration

## 🔧 Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] CORS configured for production domain
- [ ] Error logging set up
- [ ] Rate limiting configured (if needed)
- [ ] SSL/HTTPS enabled
- [ ] Health checks configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error**: `Can't reach database server`

**Solutions**:
- Check `DATABASE_URL` is correct
- Verify database is accessible from deployment region
- Check firewall/security group settings
- Ensure connection pooling is configured

#### 2. Prisma Client Errors

**Error**: `PrismaClient is not configured`

**Solutions**:
```bash
cd backend
npm run prisma:generate
```

#### 3. CORS Errors

**Error**: `CORS policy blocked`

**Solutions**:
- Update CORS configuration in `backend/src/app.js`
- Add your production domain to allowed origins

#### 4. Environment Variables Not Loading

**Error**: `GEMINI_API_KEY is not set`

**Solutions**:
- Verify environment variables in deployment platform
- Check variable names match exactly
- Restart deployment after adding variables

#### 5. Build Failures

**Error**: Build timeout or memory issues

**Solutions**:
- Increase build timeout in platform settings
- Optimize dependencies
- Use build caching

## 📊 Monitoring

### Health Checks

- Endpoint: `/health`
- Should return: `{"status":"ok","timestamp":"..."}`

### Logging

- Check deployment platform logs
- Use services like:
  - Vercel Analytics
  - Sentry (error tracking)
  - LogRocket (session replay)

## 🔐 Security

1. **Never commit** `.env` files
2. Use **strong database passwords**
3. Enable **HTTPS only**
4. Set up **rate limiting**
5. Use **API key rotation**
6. Enable **database backups**

## 📝 Post-Deployment

1. Test all API endpoints
2. Verify frontend loads correctly
3. Run scraping script: `npm run scrape` (via CLI or scheduled job)
4. Monitor error logs
5. Set up alerts for critical errors

## 🔄 Continuous Deployment

Configure automatic deployments:
- Vercel: Automatic on git push
- GitHub Actions: Set up CI/CD pipeline
- Other platforms: Configure webhooks

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review error logs
3. Test locally with production environment variables
4. Contact platform support if needed

