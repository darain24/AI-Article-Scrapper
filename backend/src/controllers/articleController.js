import { ArticleService } from '../services/articleService.js';

const articleService = new ArticleService();

/**
 * Article controller for handling HTTP requests
 */
export class ArticleController {
  /**
   * Create a new article
   */
  async create(req, res) {
    try {
      const { title, content, url, publishedAt, updatedContent, references } = req.body;

      if (!title || !content || !url) {
        return res.status(400).json({
          error: 'Missing required fields: title, content, url'
        });
      }

      const article = await articleService.createArticle({
        title,
        content,
        url,
        publishedAt: publishedAt || new Date(),
        updatedContent,
        references
      });

      res.status(201).json(article);
    } catch (error) {
      res.status(400).json({
        error: error.message || 'Failed to create article'
      });
    }
  }

  /**
   * Get all articles
   */
  async getAll(req, res) {
    try {
      const articles = await articleService.getAllArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({
        error: error.message || 'Failed to fetch articles'
      });
    }
  }

  /**
   * Get article by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const article = await articleService.getArticleById(id);
      res.json(article);
    } catch (error) {
      res.status(404).json({
        error: error.message || 'Article not found'
      });
    }
  }

  /**
   * Update article
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const article = await articleService.updateArticle(id, req.body);
      res.json(article);
    } catch (error) {
      res.status(404).json({
        error: error.message || 'Failed to update article'
      });
    }
  }

  /**
   * Delete article
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await articleService.deleteArticle(id);
      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      res.status(404).json({
        error: error.message || 'Failed to delete article'
      });
    }
  }
}

