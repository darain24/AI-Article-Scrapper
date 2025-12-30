import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes articles from beyondchats.com/blogs/
 * Finds the last page and gets the 5 oldest articles
 */
export class BeyondChatsScraper {
  constructor() {
    this.baseUrl = 'https://beyondchats.com/blogs/';
  }

  /**
   * Finds the last page number by checking pagination
   */
  async findLastPage() {
    try {
      // Start from a high page number and work backwards, or check pagination links
      // Strategy: Check page 1 first to see pagination structure
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Look for pagination links (common patterns: page numbers, "next", "last")
      const paginationLinks = $('a[href*="page"], .pagination a, .page-numbers a');
      let maxPage = 1;

      paginationLinks.each((_, element) => {
        const href = $(element).attr('href') || '';
        const text = $(element).text().trim();
        
        // Extract page number from href or text
        const pageMatch = href.match(/page[=\/](\d+)/i) || text.match(/(\d+)/);
        if (pageMatch) {
          const pageNum = parseInt(pageMatch[1]);
          if (pageNum > maxPage) {
            maxPage = pageNum;
          }
        }
      });

      // If no pagination found, try to find last page by checking if page 100 exists
      // Then binary search or linear search backwards
      if (maxPage === 1) {
        // Try checking if there are more pages by testing a few
        for (let page = 2; page <= 50; page++) {
          try {
            const testUrl = `${this.baseUrl}page/${page}/`;
            const testResponse = await axios.get(testUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              validateStatus: (status) => status < 500 // Don't throw on 404
            });
            
            if (testResponse.status === 200) {
              const $test = cheerio.load(testResponse.data);
              const articles = $test('article, .post, .blog-post, [class*="article"]').length;
              if (articles > 0) {
                maxPage = page;
              } else {
                break; // No articles found, we've gone too far
              }
            } else {
              break; // Page doesn't exist
            }
          } catch (error) {
            break; // Error means page doesn't exist
          }
        }
      }

      return maxPage;
    } catch (error) {
      console.error('Error finding last page:', error.message);
      return 1; // Default to page 1 if error
    }
  }

  /**
   * Scrapes articles from a specific page
   */
  async scrapePage(pageNumber) {
    try {
      const url = pageNumber === 1 
        ? this.baseUrl 
        : `${this.baseUrl}page/${pageNumber}/`;
      
      console.log(`  Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      const articles = [];

      // Try multiple strategies to find articles
      // Strategy 1: Look for article links directly
      const articleLinks = $('a[href*="/blog/"], a[href*="/blogs/"]');
      
      if (articleLinks.length > 0) {
        console.log(`  Found ${articleLinks.length} potential article links`);
        
        articleLinks.each((_, element) => {
          try {
            const $link = $(element);
            const href = $link.attr('href') || '';
            
            // Skip if not a blog post URL
            if (!href.includes('/blog/') && !href.includes('/blogs/')) {
              return;
            }
            
            // Skip pagination links
            if (href.includes('/page/')) {
              return;
            }
            
            // Skip tag/category pages - only get actual blog posts
            if (href.includes('/tag/') || href.includes('/category/') || href.includes('/tags/') || href.includes('/categories/')) {
              return;
            }
            
            // Skip if it's just the base blogs URL
            if (href === '/blogs/' || href === '/blogs' || href.endsWith('/blogs/')) {
              return;
            }
            
            // Construct full URL
            const url = href.startsWith('http') 
              ? href 
              : `https://beyondchats.com${href.startsWith('/') ? href : '/' + href}`;
            
            // Find parent container for article metadata
            const $container = $link.closest('article, .post, .blog-post, .entry, [class*="post"], [class*="article"], .card, .item');
            
            // Extract title
            let title = $link.text().trim();
            if (!title || title.length < 10) {
              title = $container.find('h1, h2, h3, h4, .title, .post-title').first().text().trim();
            }
            
            // Extract published date
            const dateEl = $container.find('time, .date, .published, [class*="date"], [class*="time"]').first();
            let dateText = dateEl.attr('datetime') || dateEl.attr('date') || dateEl.text().trim();
            
            // If no date in container, look in parent
            if (!dateText) {
              dateText = $link.parent().find('time, .date').first().attr('datetime') || 
                        $link.parent().find('time, .date').first().text().trim();
            }
            
            const publishedAt = this.parseDate(dateText);
            
            // Extract excerpt/preview content
            const contentEl = $container.find('.excerpt, .summary, .content, p').first();
            let content = contentEl.text().trim();
            
            // If no content in container, try to find nearby text
            if (!content || content.length < 20) {
              content = $link.parent().find('p').first().text().trim();
            }

            if (title && url && title.length > 5) {
              // Avoid duplicates
              const exists = articles.find(a => a.url === url);
              if (!exists) {
                articles.push({
                  title: title.substring(0, 200), // Limit title length
                  url,
                  content: content || title, // Use title as fallback if no content
                  publishedAt
                });
              }
            }
          } catch (error) {
            console.error('  Error parsing article link:', error.message);
          }
        });
      }

      // Strategy 2: If no articles found, try common blog structures
      if (articles.length === 0) {
        console.log('  Trying alternative selectors...');
        const articleSelectors = [
          'article',
          '.post',
          '.blog-post',
          '.entry',
          '[class*="article"]',
          '[class*="post"]',
          '.card',
          '.item'
        ];

        for (const selector of articleSelectors) {
          const found = $(selector);
          if (found.length > 0) {
            console.log(`  Found ${found.length} elements with selector: ${selector}`);
            found.each((_, element) => {
              try {
                const $el = $(element);
                
                // Extract title
                const titleEl = $el.find('h1, h2, h3, .title, .post-title, a').first();
                let title = titleEl.text().trim();
                
                // Extract URL
                const linkEl = $el.find('a[href*="/blog"], a[href*="/blogs"]').first();
                if (!linkEl.length) {
                  return; // Skip if no blog link
                }
                
                const relativeUrl = linkEl.attr('href') || '';
                
                // Skip tag/category pages
                if (relativeUrl.includes('/tag/') || relativeUrl.includes('/category/') || 
                    relativeUrl.includes('/tags/') || relativeUrl.includes('/categories/')) {
                  return;
                }
                
                // Skip if it's just the base blogs URL
                if (relativeUrl === '/blogs/' || relativeUrl === '/blogs' || relativeUrl.endsWith('/blogs/')) {
                  return;
                }
                
                const url = relativeUrl.startsWith('http') 
                  ? relativeUrl 
                  : `https://beyondchats.com${relativeUrl.startsWith('/') ? relativeUrl : '/' + relativeUrl}`;
                
                // Extract published date
                const dateEl = $el.find('time, .date, .published, [class*="date"]').first();
                const dateText = dateEl.attr('datetime') || dateEl.text().trim();
                const publishedAt = this.parseDate(dateText);
                
                // Extract excerpt/preview content
                const contentEl = $el.find('.excerpt, .summary, .content, p').first();
                const content = contentEl.text().trim();

                if (title && url && title.length > 5) {
                  const exists = articles.find(a => a.url === url);
                  if (!exists) {
                    articles.push({
                      title: title.substring(0, 200),
                      url,
                      content: content || title,
                      publishedAt
                    });
                  }
                }
              } catch (error) {
                console.error('  Error parsing article element:', error.message);
              }
            });
            
            if (articles.length > 0) {
              break; // Found articles, stop trying other selectors
            }
          }
        }
      }

      console.log(`  Extracted ${articles.length} articles from page ${pageNumber}`);
      return articles;
    } catch (error) {
      console.error(`  Error scraping page ${pageNumber}:`, error.message);
      if (error.response) {
        console.error(`  HTTP Status: ${error.response.status}`);
      }
      return [];
    }
  }

  /**
   * Fetches full article content from article URL
   */
  async fetchArticleContent(articleUrl) {
    try {
      const response = await axios.get(articleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Common selectors for article content
      const contentSelectors = [
        '.entry-content',
        '.post-content',
        '.article-content',
        'article .content',
        '[class*="content"]',
        'main article'
      ];

      let content = '';
      for (const selector of contentSelectors) {
        const found = $(selector);
        if (found.length > 0) {
          // Get text content, preserving paragraphs
          content = found
            .find('p, h1, h2, h3, h4, h5, h6, li')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter(text => text.length > 0)
            .join('\n\n');
          
          if (content.length > 100) {
            break;
          }
        }
      }

      // Fallback: get all paragraph text
      if (!content || content.length < 100) {
        content = $('article p, main p')
          .map((_, el) => $(el).text().trim())
          .get()
          .filter(text => text.length > 0)
          .join('\n\n');
      }

      return content || 'Content not available';
    } catch (error) {
      console.error(`Error fetching article content from ${articleUrl}:`, error.message);
      return 'Content not available';
    }
  }

  /**
   * Gets the 5 oldest articles from the last page
   */
  async scrapeOldestArticles() {
    try {
      console.log('Finding last page...');
      const lastPage = await this.findLastPage();
      console.log(`Last page found: ${lastPage}`);

      console.log(`Scraping page ${lastPage}...`);
      let articles = await this.scrapePage(lastPage);

      // If we don't have enough articles, check previous pages
      if (articles.length < 5) {
        for (let page = lastPage - 1; page >= 1 && articles.length < 5; page--) {
          const pageArticles = await this.scrapePage(page);
          articles = [...articles, ...pageArticles];
        }
      }

      // Fetch full content for each article
      console.log('Fetching full content for articles...');
      const articlesWithContent = await Promise.all(
        articles.slice(0, 5).map(async (article) => {
          const fullContent = await this.fetchArticleContent(article.url);
          return {
            ...article,
            content: fullContent
          };
        })
      );

      // Sort by published date (oldest first) and take 5
      articlesWithContent.sort((a, b) => 
        new Date(a.publishedAt) - new Date(b.publishedAt)
      );

      return articlesWithContent.slice(0, 5);
    } catch (error) {
      console.error('Error scraping oldest articles:', error.message);
      throw error;
    }
  }

  /**
   * Parses date from various formats
   */
  parseDate(dateText) {
    if (!dateText) {
      return new Date();
    }

    // Try ISO format first
    const isoDate = new Date(dateText);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // Try common date formats
    const datePatterns = [
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{2})-(\d{2})-(\d{4})/ // MM-DD-YYYY
    ];

    for (const pattern of datePatterns) {
      const match = dateText.match(pattern);
      if (match) {
        return new Date(dateText);
      }
    }

    // Default to current date if parsing fails
    return new Date();
  }
}

