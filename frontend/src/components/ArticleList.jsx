import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleAPI } from '../services/api';
import './ArticleList.css';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleAPI.getAll();
      setArticles(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading articles...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="article-list">
      <div className="article-list-header">
        <h2>Articles</h2>
        <p className="article-count">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
      </div>

      {articles.length === 0 ? (
        <div className="no-articles">
          <p>No articles found. Run the scraping script to add articles.</p>
        </div>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => (
            <div key={article.id} className="article-card">
              <div className="article-card-header">
                <h3 className="article-title">
                  <Link to={`/article/${article.id}`}>{article.title}</Link>
                </h3>
                {article.updatedContent && (
                  <span className="badge badge-enhanced">Enhanced</span>
                )}
              </div>
              
              <div className="article-meta">
                <span className="article-date">
                  Published: {formatDate(article.publishedAt)}
                </span>
              </div>

              <div className="article-preview">
                {article.content.substring(0, 150)}
                {article.content.length > 150 && '...'}
              </div>

              <div className="article-card-footer">
                <Link to={`/article/${article.id}`} className="btn btn-primary">
                  View Article
                </Link>
                {article.references && article.references.length > 0 && (
                  <span className="reference-count">
                    {article.references.length} reference{article.references.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticleList;

