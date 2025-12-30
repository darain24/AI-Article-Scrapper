# BeyondChats Article Management System

A full-stack application for scraping, managing, and enhancing articles from beyondchats.com with AI-powered content improvement.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)

## 🎯 Overview

This project consists of three phases:

1. **Phase 1**: Web scraping + PostgreSQL + Prisma + CRUD APIs
2. **Phase 2**: Article enhancement using Google search and LLM rewriting
3. **Phase 3**: React frontend for viewing articles

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Google Gemini API key (for Phase 2)

### Local Development

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Set up database
# Create PostgreSQL database
createdb beyondchats_db

# 3. Configure environment
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and GEMINI_API_KEY

# 4. Run migrations
npm run prisma:generate
npm run prisma:migrate

# 5. Start backend (Terminal 1)
npm run dev

# 6. Start frontend (Terminal 2)
cd ../frontend
npm run dev

# 7. Scrape articles
cd ../backend
npm run scrape
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## 🌐 Deployment

### Vercel (Recommended)

See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for step-by-step Vercel deployment guide.

**Quick Deploy:**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`
4. Deploy!

### Other Platforms

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides for:
- Railway
- Render
- Heroku
- Docker
- AWS

## ✨ Features

### Phase 1
- ✅ Web scraping from beyondchats.com/blogs/ (last page, 5 oldest articles)
- ✅ PostgreSQL database with Prisma ORM
- ✅ Full CRUD API endpoints
- ✅ Clean architecture (controllers, services, utils)

### Phase 2
- ✅ Google search integration for article titles
- ✅ Content scraping from top-ranking articles
- ✅ LLM-powered article rewriting (Google Gemini)
- ✅ Reference link management
- ✅ Original + updated version storage

### Phase 3
- ✅ Responsive React frontend
- ✅ Article listing with cards
- ✅ Article detail view with tabbed interface
- ✅ Original vs Enhanced content comparison
- ✅ Reference links display

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Prisma** - ORM for database operations
- **PostgreSQL** - Relational database
- **Axios** - HTTP client
- **Cheerio** - HTML parsing and scraping
- **Google Gemini API** - LLM for article rewriting

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Vite** - Build tool
- **Axios** - API client

## 📁 Project Structure

```
beyondchats_assignment/
├── api/
│   └── index.js              # Vercel serverless function entry
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── utils/
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── vercel.json               # Vercel configuration
├── DEPLOYMENT.md             # Deployment guides
├── VERCEL_SETUP.md           # Vercel-specific setup
└── README.md
```

## 📡 API Documentation

### Base URL
```
Production: https://your-app.vercel.app/api
Development: http://localhost:3001/api
```

### Endpoints

- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `GET /health` - Health check

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed API documentation.

## 💻 Usage

### Scrape Articles
```bash
cd backend
npm run scrape
```

### Enhance Articles
```bash
cd backend
npm run enhance
```

### View Articles
Visit http://localhost:3000 (development) or your deployed URL

## 📝 License

ISC

## 👤 Author

Built for BeyondChats assignment
