import prisma from '../config/database.js';

/**
 * Article service for CRUD operations
 */
export class ArticleService {
  /**
   * Create a new article
   */
  async createArticle(data) {
    try {
      const article = await prisma.article.create({
        data: {
          title: data.title,
          content: data.content,
          url: data.url,
          publishedAt: new Date(data.publishedAt),
          updatedContent: data.updatedContent || null,
          references: data.references || null
        }
      });
      return article;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Article with this URL already exists');
      }
      throw error;
    }
  }

  /**
   * Get all articles
   */
  async getAllArticles() {
    try {
      const articles = await prisma.article.findMany({
        orderBy: {
          publishedAt: 'desc'
        }
      });
      return articles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get article by ID
   */
  async getArticleById(id) {
    try {
      const article = await prisma.article.findUnique({
        where: { id }
      });

      if (!article) {
        throw new Error('Article not found');
      }

      return article;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update article
   */
  async updateArticle(id, data) {
    try {
      const article = await prisma.article.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.content && { content: data.content }),
          ...(data.updatedContent !== undefined && { updatedContent: data.updatedContent }),
          ...(data.references !== undefined && { references: data.references }),
          updatedAt: new Date()
        }
      });
      return article;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Article not found');
      }
      throw error;
    }
  }

  /**
   * Delete article
   */
  async deleteArticle(id) {
    try {
      await prisma.article.delete({
        where: { id }
      });
      return { message: 'Article deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Article not found');
      }
      throw error;
    }
  }

  /**
   * Get articles that need enhancement (no updatedContent)
   */
  async getArticlesForEnhancement() {
    try {
      const articles = await prisma.article.findMany({
        where: {
          updatedContent: null
        },
        orderBy: {
          publishedAt: 'desc'
        }
      });
      return articles;
    } catch (error) {
      throw error;
    }
  }
}

