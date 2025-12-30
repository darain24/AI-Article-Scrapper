# Architecture Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Frontend (Port 3000)                  │  │
│  │  - ArticleList Component                                 │  │
│  │  - ArticleView Component                                 │  │
│  │  - API Service Layer                                     │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└───────────────────────┼─────────────────────────────────────────┘
                        │ HTTP/REST
┌───────────────────────┼─────────────────────────────────────────┐
│                    API LAYER                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Express.js Backend (Port 3001)                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │  Routes      │→ │ Controllers  │→ │  Services    │ │  │
│  │  └──────────────┘  └──────────────┘  └──────┬───────┘ │  │
│  └───────────────────────────────────────────────┼──────────┘  │
└───────────────────────────────────────────────────┼────────────┘
                                                    │ Prisma ORM
┌───────────────────────────────────────────────────┼────────────┐
│                  DATA LAYER                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                         │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │              Articles Table                        │  │  │
│  │  │  - id (PK)                                        │  │  │
│  │  │  - title                                          │  │  │
│  │  │  - content                                        │  │  │
│  │  │  - url (unique)                                   │  │  │
│  │  │  - publishedAt                                    │  │  │
│  │  │  - updatedContent (nullable)                      │  │  │
│  │  │  - references (JSON, nullable)                    │  │  │
│  │  │  - createdAt                                      │  │  │
│  │  │  - updatedAt                                      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ beyondchats  │  │   Google      │  │   Google     │        │
│  │    .com      │  │    Search     │  │   Gemini     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Backend Architecture

#### 1. Routes Layer (`src/routes/`)
- Defines API endpoints
- Maps HTTP methods to controller actions
- Example: `GET /api/articles` → `ArticleController.getAll()`

#### 2. Controllers Layer (`src/controllers/`)
- Handles HTTP request/response
- Validates input
- Calls service layer
- Returns JSON responses

#### 3. Services Layer (`src/services/`)
- Contains business logic
- Interacts with database via Prisma
- Handles data transformations
- Example: `ArticleService.createArticle()`

#### 4. Utils Layer (`src/utils/`)
- Reusable utilities
- External service integrations
- **Scraper**: Web scraping from beyondchats.com
- **GoogleSearch**: Google search integration
- **ContentScraper**: Content extraction from URLs
- **LLMRewriter**: Google Gemini API integration

#### 5. Scripts (`src/scripts/`)
- Standalone Node.js scripts
- **scrapeArticles.js**: Phase 1 scraping script
- **enhanceArticles.js**: Phase 2 enhancement script

### Frontend Architecture

#### 1. Components (`src/components/`)
- **ArticleList**: Displays grid of article cards
- **ArticleView**: Shows article details with tabs

#### 2. Services (`src/services/`)
- API client abstraction
- Centralized HTTP requests
- Error handling

#### 3. Routing (`src/App.jsx`)
- React Router configuration
- Route definitions

## Data Flow

### Phase 1: Article Scraping Flow

```
User Command: npm run scrape
    │
    ├─> scrapeArticles.js
    │   │
    │   ├─> BeyondChatsScraper.findLastPage()
    │   │   └─> HTTP GET beyondchats.com/blogs/
    │   │       └─> Parse HTML, find pagination
    │   │
    │   ├─> BeyondChatsScraper.scrapePage(lastPage)
    │   │   └─> Extract article metadata
    │   │       - Title
    │   │       - URL
    │   │       - Published date
    │   │
    │   ├─> BeyondChatsScraper.fetchArticleContent(url)
    │   │   └─> HTTP GET article URL
    │   │       └─> Extract full content
    │   │
    │   └─> ArticleService.createArticle()
    │       └─> Prisma.article.create()
    │           └─> INSERT INTO articles
```

### Phase 2: Article Enhancement Flow

```
User Command: npm run enhance
    │
    ├─> enhanceArticles.js
    │   │
    │   ├─> ArticleService.getArticlesForEnhancement()
    │   │   └─> SELECT * FROM articles WHERE updatedContent IS NULL
    │   │
    │   └─> For each article:
    │       │
    │       ├─> GoogleSearch.searchArticles(title)
    │       │   └─> HTTP GET google.com/search?q=title
    │       │       └─> Parse results, extract top 2 links
    │       │
    │       ├─> ContentScraper.scrapeContent(url)
    │       │   └─> HTTP GET reference URL
    │       │       └─> Extract main content
    │       │
    │       ├─> LLMRewriter.rewriteArticle(original, references)
    │       │   └─> HTTP POST generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
    │       │       └─> Get rewritten content
    │       │
    │       └─> ArticleService.updateArticle()
    │           └─> Prisma.article.update()
    │               └─> UPDATE articles SET updatedContent, references
```

### Phase 3: Frontend Display Flow

```
User visits: http://localhost:3000
    │
    ├─> ArticleList component mounts
    │   │
    │   ├─> useEffect() triggers
    │   │   └─> articleAPI.getAll()
    │   │       └─> HTTP GET /api/articles
    │   │           └─> ArticleController.getAll()
    │   │               └─> ArticleService.getAllArticles()
    │   │                   └─> Prisma.article.findMany()
    │   │                       └─> SELECT * FROM articles
    │   │
    │   └─> Render article cards
    │
    └─> User clicks article
        │
        └─> Navigate to /article/:id
            │
            └─> ArticleView component
                │
                ├─> articleAPI.getById(id)
                │   └─> HTTP GET /api/articles/:id
                │       └─> ArticleController.getById()
                │           └─> ArticleService.getArticleById()
                │               └─> Prisma.article.findUnique()
                │
                └─> Render article with tabs
                    - Original content
                    - Enhanced content (if available)
                    - References
```

## Database Schema

```sql
CREATE TABLE "Article" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "url" TEXT NOT NULL UNIQUE,
  "publishedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedContent" TEXT,
  "references" JSONB
);

CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");
```

## API Request/Response Flow

### Request Flow
```
Client → Express Middleware → Route → Controller → Service → Prisma → Database
```

### Response Flow
```
Database → Prisma → Service → Controller → Express → JSON Response → Client
```

## Error Handling

### Backend
- Controllers catch service errors
- Return appropriate HTTP status codes
- JSON error responses with messages

### Frontend
- Try-catch blocks in API calls
- Error state management
- User-friendly error messages

## Security Considerations

1. **Input Validation**: Controllers validate required fields
2. **SQL Injection**: Prevented by Prisma ORM
3. **CORS**: Configured for frontend origin
4. **Environment Variables**: Sensitive data in .env files
5. **Rate Limiting**: Consider adding for production

## Scalability Considerations

1. **Database Indexing**: Indexes on publishedAt and createdAt
2. **Caching**: Could add Redis for article caching
3. **Pagination**: API supports pagination (can be added)
4. **Async Processing**: Enhancement script processes articles sequentially (could be parallelized)
5. **CDN**: Frontend assets can be served via CDN

## Deployment Architecture

```
Production:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│   Node.js   │────▶│ PostgreSQL │
│  (Reverse   │     │  (Express)  │     │  (RDS)     │
│   Proxy)    │     │             │     │            │
└─────────────┘     └─────────────┘     └─────────────┘
      │
      │
┌─────────────┐
│   React     │
│  (Static)   │
│   (S3/CDN)  │
└─────────────┘
```

