# Quick Start Guide

Get the project running in 5 minutes!

## Prerequisites Check

- [ ] Node.js installed (`node --version`)
- [ ] PostgreSQL installed and running (`psql --version`)
- [ ] Google Gemini API key (for Phase 2)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create database
createdb beyondchats_db

# Or using psql
psql -U postgres
CREATE DATABASE beyondchats_db;
\q
```

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env and add your DATABASE_URL and GEMINI_API_KEY
```

Example `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/beyondchats_db?schema=public"
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Initialize Database

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 5. Run Phase 1: Scrape Articles

```bash
cd backend
npm run scrape
```

Expected output:
```
Finding last page...
Last page found: X
Scraping page X...
Fetching full content for articles...
✓ Saved: Article Title 1
✓ Saved: Article Title 2
...
Scraping complete! Saved 5 new articles.
```

### 6. Start Backend Server

```bash
cd backend
npm run dev
```

Server should start on http://localhost:3001

### 7. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend should start on http://localhost:3000

### 8. (Optional) Run Phase 2: Enhance Articles

```bash
cd backend
npm run enhance
```

This will:
- Find articles without enhanced versions
- Search Google for each title
- Scrape reference articles
- Use LLM to rewrite content
- Update articles in database

**Note**: This requires Google Gemini API key and may take several minutes.

## Verify Installation

1. **Backend Health Check**: http://localhost:3001/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **API Test**: http://localhost:3001/api/articles
   - Should return array of articles (empty if none scraped yet)

3. **Frontend**: http://localhost:3000
   - Should show article list page

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check database exists: `psql -l | grep beyondchats`

### Prisma Errors
- Run: `npm run prisma:generate`
- Check schema.prisma syntax
- Verify DATABASE_URL format

### Port Already in Use
- Change PORT in backend/.env
- Or kill process: `lsof -ti:3001 | xargs kill`

### Scraping Fails
- Check internet connection
- Verify beyondchats.com is accessible
- Website structure may have changed

### Enhancement Script Fails
- Verify GEMINI_API_KEY is set
- Check API key is valid
- Ensure you have API credits
- Get API key from: https://makersuite.google.com/app/apikey

## Next Steps

- View articles in frontend: http://localhost:3000
- Explore API: http://localhost:3001/api/articles
- Use Prisma Studio: `cd backend && npm run prisma:studio`

## Common Commands

```bash
# Backend
cd backend
npm run dev          # Start server
npm run scrape       # Scrape articles
npm run enhance      # Enhance articles
npm run prisma:studio # Database GUI

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
```

## Need Help?

Check the main [README.md](./README.md) for detailed documentation.

