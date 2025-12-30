import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Content scraper for extracting main content from articles
 */
export class ContentScraper {
  /**
   * Scrape main content from an article URL
   */
  async scrapeContent(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Remove script and style elements
      $('script, style, nav, header, footer, aside, .sidebar, .advertisement, .ads').remove();

      // Common selectors for article content
      const contentSelectors = [
        'article',
        '.post-content',
        '.entry-content',
        '.article-content',
        '.content',
        'main',
        '[role="main"]',
        '.post-body',
        '.article-body'
      ];

      let content = '';
      let bestSelector = '';

      // Try each selector and pick the one with most content
      for (const selector of contentSelectors) {
        const found = $(selector).first();
        if (found.length > 0) {
          const text = this.extractText(found);
          if (text.length > content.length) {
            content = text;
            bestSelector = selector;
          }
        }
      }

      // Fallback: get all paragraph text from body
      if (!content || content.length < 200) {
        content = this.extractText($('body'));
      }

      return content.trim() || 'Content not available';
    } catch (error) {
      console.error(`Error scraping content from ${url}:`, error.message);
      return 'Content not available';
    }
  }

  /**
   * Extract readable text from a cheerio element
   */
  extractText($element) {
    // Get text from paragraphs, headings, and list items
    const textElements = $element
      .find('p, h1, h2, h3, h4, h5, h6, li, blockquote')
      .map((_, el) => {
        const $el = cheerio.load(el);
        return $el.text().trim();
      })
      .get()
      .filter(text => text.length > 20) // Filter out very short text
      .join('\n\n');

    return textElements;
  }
}

