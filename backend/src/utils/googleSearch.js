import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Google Search utility
 * Uses web scraping approach to search Google (no API key required)
 * Note: For production, consider using Google Custom Search API
 */
export class GoogleSearch {
  /**
   * Search Google for a query and extract blog/article links from other domains
   * Note: Google may block automated scraping. For production, use Google Custom Search API.
   */
  async searchArticles(query, maxResults = 2) {
    try {
      // Try multiple search engines/approaches
      // First try Google, then fallback to DuckDuckGo
      
      // Try Google first
      const googleResults = await this.searchGoogle(query, maxResults);
      if (googleResults.length >= maxResults) {
        return googleResults;
      }

      // Fallback to DuckDuckGo if Google didn't return enough results
      console.log('   Trying DuckDuckGo as fallback...');
      const duckDuckGoResults = await this.searchDuckDuckGo(query, maxResults);
      return duckDuckGoResults.length > googleResults.length ? duckDuckGoResults : googleResults;
    } catch (error) {
      console.error('Search error:', error.message);
      return [];
    }
  }

  /**
   * Search Google
   */
  async searchGoogle(query, maxResults = 2) {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.google.com/',
          'Connection': 'keep-alive'
        },
        timeout: 15000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      const links = [];

      // Multiple strategies to extract search results
      // Strategy 1: Look for div.g (main result container)
      $('div.g').each((_, element) => {
        if (links.length >= maxResults) return false;

        const $el = $(element);
        
        // Find the main link (usually in h3 > a)
        const linkEl = $el.find('h3 a, a[href^="http"]').first();
        const href = linkEl.attr('href');
        
        if (!href) return;

        // Google sometimes uses /url?q= format, extract actual URL
        let actualUrl = href;
        if (href.startsWith('/url?q=')) {
          const match = href.match(/\/url\?q=([^&]+)/);
          if (match) {
            actualUrl = decodeURIComponent(match[1]);
          }
        }

        if (actualUrl && this.isArticleLink(actualUrl)) {
          const title = linkEl.text().trim() || $el.find('h3').text().trim() || 'Untitled';
          
          links.push({
            url: actualUrl,
            title: title
          });
        }
      });

      // Strategy 2: Look for result links in different structures
      if (links.length < maxResults) {
        $('div[data-ved] a[href^="http"], div[data-ved] a[href^="/url"]').each((_, element) => {
          if (links.length >= maxResults) return false;

          let href = $(element).attr('href') || '';
          
          // Handle Google's /url?q= format
          if (href.startsWith('/url?q=')) {
            const match = href.match(/\/url\?q=([^&]+)/);
            if (match) {
              href = decodeURIComponent(match[1]);
            } else {
              return;
            }
          }

          if (href && this.isArticleLink(href)) {
            const title = $(element).text().trim() || $(element).closest('div').find('h3').text().trim() || 'Untitled';
            
            // Avoid duplicates
            if (!links.find(l => l.url === href)) {
              links.push({
                url: href,
                title: title
              });
            }
          }
        });
      }

      // Strategy 3: Extract from all links (last resort)
      if (links.length < maxResults) {
        $('a[href^="http"]').each((_, element) => {
          if (links.length >= maxResults) return false;

          const href = $(element).attr('href');
          if (href && this.isArticleLink(href)) {
            // Avoid duplicates and excluded domains
            if (!links.find(l => l.url === href)) {
              links.push({
                url: href,
                title: $(element).text().trim() || 'Untitled'
              });
            }
          }
        });
      }

      return links.slice(0, maxResults);
    } catch (error) {
      if (error.response) {
        console.error(`   Google search failed: HTTP ${error.response.status}`);
      } else {
        console.error(`   Google search failed: ${error.message}`);
      }
      return [];
    }
  }

  /**
   * Search DuckDuckGo (more permissive with scraping)
   */
  async searchDuckDuckGo(query, maxResults = 2) {
    try {
      // Use DuckDuckGo's instant answer API (no scraping needed)
      const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      
      try {
        const apiResponse = await axios.get(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          },
          timeout: 10000
        });

        const links = [];
        
        // Get related topics
        if (apiResponse.data.RelatedTopics) {
          for (const topic of apiResponse.data.RelatedTopics) {
            if (links.length >= maxResults) break;
            
            if (topic.FirstURL && this.isArticleLink(topic.FirstURL)) {
              links.push({
                url: topic.FirstURL,
                title: topic.Text || topic.FirstURL
              });
            }
          }
        }

        if (links.length > 0) {
          return links.slice(0, maxResults);
        }
      } catch (apiError) {
        // Fallback to HTML scraping if API fails
      }

      // Fallback: HTML scraping
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const links = [];

      // Try multiple selectors for DuckDuckGo results
      const selectors = [
        'a.result__a',
        '.result a',
        'a[class*="result"]',
        '.web-result a'
      ];

      for (const selector of selectors) {
        $(selector).each((_, element) => {
          if (links.length >= maxResults) return false;

          let href = $(element).attr('href');
          const title = $(element).text().trim();

          if (!href) return;

          // DuckDuckGo uses redirect URLs, extract actual URL
          if (href.includes('uddg=')) {
            const match = href.match(/uddg=([^&]+)/);
            if (match) {
              try {
                href = decodeURIComponent(match[1]);
              } catch (e) {
                return; // Can't decode URL
              }
            } else {
              return; // Can't extract URL
            }
          } else if (href.startsWith('//')) {
            href = 'https:' + href;
          } else if (href.startsWith('/l/')) {
            // Another DuckDuckGo redirect format
            return; // Skip these
          }

          // Validate URL
          if (!href.startsWith('http://') && !href.startsWith('https://')) {
            return;
          }

          if (href && this.isArticleLink(href)) {
            // Avoid duplicates
            if (!links.find(l => l.url === href)) {
              links.push({
                url: href,
                title: title || 'Untitled'
              });
            }
          }
        });

        if (links.length >= maxResults) break;
      }

      return links.slice(0, maxResults);
    } catch (error) {
      console.error(`   DuckDuckGo search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Check if a URL is likely an article/blog post
   */
  isArticleLink(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }

    // Exclude common non-article domains
    const excludeDomains = [
      'google.com',
      'youtube.com',
      'facebook.com',
      'twitter.com',
      'x.com',
      'instagram.com',
      'linkedin.com',
      'pinterest.com',
      'reddit.com',
      'beyondchats.com', // Exclude original domain
      'googleusercontent.com',
      'gstatic.com'
    ];

    const urlLower = url.toLowerCase();
    
    // Check if URL is from excluded domains
    if (excludeDomains.some(domain => urlLower.includes(domain))) {
      return false;
    }

    // Exclude file extensions that aren't articles
    const excludeExtensions = ['.pdf', '.jpg', '.png', '.gif', '.mp4', '.zip', '.exe'];
    if (excludeExtensions.some(ext => urlLower.endsWith(ext))) {
      return false;
    }

    // Check if URL looks like an article (has common article patterns)
    const articlePatterns = [
      /\/blog\//,
      /\/article\//,
      /\/post\//,
      /\/news\//,
      /\/\d{4}\/\d{2}\//, // Date pattern (YYYY/MM/)
      /\/\d{4}\/\d{2}\/\d{2}\//, // Date pattern (YYYY/MM/DD/)
      /\/[a-z-]{3,}-[a-z-]{3,}-[a-z-]{3,}/, // Multiple hyphens (common in article URLs)
      /\/[a-z-]+\.html$/, // HTML pages
      /\/[a-z-]+\.php$/ // PHP pages
    ];

    // If it matches article patterns, it's likely an article
    if (articlePatterns.some(pattern => pattern.test(urlLower))) {
      return true;
    }

    // If URL is from a known blog/content domain, accept it
    const contentDomains = [
      'medium.com',
      'wordpress.com',
      'blogspot.com',
      'tumblr.com',
      'substack.com',
      'dev.to',
      'hashnode.com'
    ];

    if (contentDomains.some(domain => urlLower.includes(domain))) {
      return true;
    }

    // Default: accept if it's a valid HTTP(S) URL and not excluded
    return urlLower.startsWith('http://') || urlLower.startsWith('https://');
  }
}

