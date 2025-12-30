# BeyondChats Article Management System

A full-stack application for scraping, managing, and enhancing articles from beyondchats.com with AI-powered content improvement.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Data Flow](#data-flow)
- [API Documentation](#api-documentation)
- [Usage](#usage)

## 🎯 Overview

This project consists of three phases:

1. **Phase 1**: Web scraping + PostgreSQL + Prisma + CRUD APIs
2. **Phase 2**: Article enhancement using Google search and LLM rewriting
3. **Phase 3**: React frontend for viewing articles

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Article List │  │ Article View │  │   Routing    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
          └─────────────────┼──────────────────┘
                            │ HTTP/REST API
┌───────────────────────────┼──────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │  │   Services   │  │    Routes    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘             │
│                           │                                  │
│  ┌────────────────────────┼──────────────────────────────┐ │
│  │                    Prisma ORM                          │ │
│  └────────────────────────┼──────────────────────────────┘ │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Articles Table                    │   │
│  │  - id, title, content, url, publishedAt             │   │
│  │  - updatedContent, references                        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Scripts & Utilities                      │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Scrape Articles  │  │ Enhance Articles │               │
│  └────────┬─────────┘  └────────┬─────────┘               │
│           │                      │                          │
│  ┌────────┼──────────────────────┼──────────────────────┐  │
│  │  Web Scraper  │  Google Search  │  Content Scraper   │  │
│  └────────┼──────────────────────┼──────────────────────┘  │
│           │                      │                          │
│  ┌────────┼──────────────────────┼──────────────────────┐  │
│  │      beyondchats.com      │      LLM Rewriter        │  │
│  └───────────────────────────┴──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

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
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Prisma client configuration
│   │   ├── controllers/
│   │   │   └── articleController.js  # HTTP request handlers
│   │   ├── services/
│   │   │   └── articleService.js     # Business logic
│   │   ├── routes/
│   │   │   └── articleRoutes.js     # API routes
│   │   ├── utils/
│   │   │   ├── scraper.js            # Web scraper for beyondchats.com
│   │   │   ├── googleSearch.js       # Google search utility
│   │   │   ├── contentScraper.js     # Content extraction
│   │   │   └── llmRewriter.js        # LLM rewriting service
│   │   ├── scripts/
│   │   │   ├── scrapeArticles.js     # Phase 1: Scraping script
│   │   │   └── enhanceArticles.js    # Phase 2: Enhancement script
│   │   └── app.js                    # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   ├── .env.example                  # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArticleList.jsx       # Article listing component
│   │   │   ├── ArticleList.css
│   │   │   ├── ArticleView.jsx       # Article detail component
│   │   │   └── ArticleView.css
│   │   ├── services/
│   │   │   └── api.js                # API client
│   │   ├── App.jsx                   # Main app component
│   │   ├── App.css
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Google Gemini API key (for Phase 2)

### Step 1: Clone and Install Dependencies

```bash
# Navigate to project directory
cd beyondchats_assignment

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Database Setup

1. **Create PostgreSQL database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE beyondchats_db;

# Exit psql
\q
```

2. **Configure Prisma:**

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env and set your DATABASE_URL
# DATABASE_URL="postgresql://user:password@localhost:5432/beyondchats_db?schema=public"
```

3. **Run Prisma migrations:**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### Step 3: Configure Environment Variables

**Backend (.env):**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/beyondchats_db?schema=public"
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```

**Frontend (.env - optional):**

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Step 4: Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📊 Data Flow

### Phase 1: Article Scraping

```
1. User runs: npm run scrape (in backend/)
   │
   ├─> BeyondChatsScraper.findLastPage()
   │   └─> Scrapes beyondchats.com/blogs/ to find last page
   │
   ├─> BeyondChatsScraper.scrapePage(lastPage)
   │   └─> Extracts article metadata (title, URL, date)
   │
   ├─> BeyondChatsScraper.fetchArticleContent(url)
   │   └─> Scrapes full content from each article URL
   │
   └─> ArticleService.createArticle()
       └─> Stores in PostgreSQL via Prisma
```

### Phase 2: Article Enhancement

```
1. User runs: npm run enhance (in backend/)
   │
   ├─> ArticleService.getArticlesForEnhancement()
   │   └─> Fetches articles without updatedContent
   │
   ├─> For each article:
   │   │
   │   ├─> GoogleSearch.searchArticles(title)
   │   │   └─> Searches Google, extracts top 2 article links
   │   │
   │   ├─> ContentScraper.scrapeContent(url)
   │   │   └─> Scrapes content from reference articles
   │   │
   │   ├─> LLMRewriter.rewriteArticle(original, references)
   │   │   └─> Uses OpenAI API to rewrite article
   │   │
   │   └─> ArticleService.updateArticle()
   │       └─> Updates article with updatedContent + references
```

### Phase 3: Frontend Display

```
1. User visits: http://localhost:3000
   │
   ├─> ArticleList component mounts
   │   └─> Calls: GET /api/articles
   │       └─> Displays article cards
   │
   └─> User clicks article
       └─> ArticleView component
           └─> Calls: GET /api/articles/:id
               └─> Displays original/enhanced content with tabs
```

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### GET /api/articles
Get all articles

**Response:**
```json
[
  {
    "id": "clx...",
    "title": "Article Title",
    "content": "Article content...",
    "url": "https://beyondchats.com/blog/...",
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "updatedContent": "Enhanced content...",
    "references": [
      {
        "url": "https://example.com/article",
        "title": "Reference Article"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/articles/:id
Get article by ID

**Response:**
```json
{
  "id": "clx...",
  "title": "Article Title",
  "content": "Article content...",
  ...
}
```

#### POST /api/articles
Create new article

**Request Body:**
```json
{
  "title": "Article Title",
  "content": "Article content",
  "url": "https://beyondchats.com/blog/...",
  "publishedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /api/articles/:id
Update article

**Request Body:**
```json
{
  "title": "Updated Title",
  "updatedContent": "Enhanced content...",
  "references": [...]
}
```

#### DELETE /api/articles/:id
Delete article

**Response:**
```json
{
  "message": "Article deleted successfully"
}
```

## 💻 Usage

### Phase 1: Scrape Articles

```bash
cd backend
npm run scrape
```

This will:
- Find the last page of beyondchats.com/blogs/
- Scrape the 5 oldest articles
- Store them in PostgreSQL

### Phase 2: Enhance Articles

```bash
cd backend
npm run enhance
```

This will:
- Fetch articles without enhanced versions
- Search Google for each article title
- Scrape top 2 reference articles
- Use LLM to rewrite articles
- Update articles with enhanced content and references

### Phase 3: View Articles

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Visit http://localhost:3000
4. Browse articles and view original/enhanced versions

## 🔧 Assumptions & Notes

1. **Web Scraping**: The scraper uses common HTML selectors. If beyondchats.com structure changes, selectors may need adjustment.

2. **Google Search**: Uses web scraping approach (no API key required). For production, consider Google Custom Search API.

3. **LLM API**: Requires Google Gemini API key. Uses Gemini Pro model. Costs apply per API call.

4. **Error Handling**: Scripts continue processing even if individual articles fail.

5. **Database**: Assumes PostgreSQL is running locally. Adjust DATABASE_URL for remote databases.

6. **Content Scraping**: Reference article scraping may fail for sites with anti-scraping measures.

## 📝 License

ISC

## 👤 Author

Built for BeyondChats assignment

# AI-Article-Scrapper
