import dotenv from 'dotenv';
import { BeyondChatsScraper } from '../utils/scraper.js';
import { ArticleService } from '../services/articleService.js';

dotenv.config();

/**
 * Phase 1: Scrape the 5 oldest articles from beyondchats.com/blogs/
 * and store them in PostgreSQL database
 */
async function scrapeArticles() {
  try {
    console.log('Starting article scraping...');
    console.log('Checking database connection...');
    
    // Test database connection
    const prisma = (await import('../config/database.js')).default;
    try {
      await prisma.$connect();
      console.log('✓ Database connected');
    } catch (dbError) {
      console.error('✗ Database connection failed:', dbError.message);
      console.error('Please check your DATABASE_URL in .env file');
      process.exit(1);
    }
    
    const scraper = new BeyondChatsScraper();
    const articleService = new ArticleService();

    // Scrape the 5 oldest articles
    console.log('Scraping articles from beyondchats.com...');
    const articles = await scraper.scrapeOldestArticles();
    
    console.log(`\nFound ${articles.length} articles`);
    
    if (articles.length === 0) {
      console.log('⚠ No articles found. The website structure may have changed or the last page has no articles.');
      process.exit(0);
    }

    // Display articles found
    console.log('\nArticles found:');
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   URL: ${article.url}`);
      console.log(`   Content length: ${article.content?.length || 0} characters`);
    });

    // Store articles in database
    console.log('\nSaving articles to database...');
    let savedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const article of articles) {
      try {
        // Validate article data
        if (!article.title || !article.url || !article.content) {
          console.error(`✗ Skipping article: Missing required fields (title: ${!!article.title}, url: ${!!article.url}, content: ${!!article.content})`);
          errorCount++;
          continue;
        }

        await articleService.createArticle({
          title: article.title,
          content: article.content,
          url: article.url,
          publishedAt: article.publishedAt
        });
        savedCount++;
        console.log(`✓ Saved: ${article.title.substring(0, 60)}${article.title.length > 60 ? '...' : ''}`);
      } catch (error) {
        if (error.message.includes('already exists') || error.code === 'P2002') {
          skippedCount++;
          console.log(`⊘ Skipped (already exists): ${article.title.substring(0, 60)}${article.title.length > 60 ? '...' : ''}`);
        } else {
          errorCount++;
          console.error(`✗ Error saving "${article.title}":`, error.message);
          console.error('   Error details:', error);
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Scraping complete!`);
    console.log(`  ✓ Saved: ${savedCount} new articles`);
    console.log(`  ⊘ Skipped: ${skippedCount} articles (already exist)`);
    console.log(`  ✗ Errors: ${errorCount} articles`);
    console.log(`${'='.repeat(60)}`);
    
    // Disconnect from database
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Scraping failed with error:');
    console.error(error);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

scrapeArticles();

