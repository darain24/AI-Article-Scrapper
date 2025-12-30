import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleAPI } from '../services/api';
import './ArticleView.css';

function ArticleView() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('original'); // 'original' or 'updated'

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleAPI.getById(id);
      setArticle(response.data);
      
      // Set default tab to 'updated' if updated content exists
      if (response.data.updatedContent) {
        setActiveTab('updated');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch article');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContent = (content) => {
    // Split by double newlines to preserve paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map((para, index) => (
      <p key={index} className="content-paragraph">
        {para.trim()}
      </p>
    ));
  };

  if (loading) {
    return <div className="loading">Loading article...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error: {error}
        <br />
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '15px', display: 'inline-block' }}>
          Back to Articles
        </Link>
      </div>
    );
  }

  if (!article) {
    return <div className="error">Article not found</div>;
  }

  return (
    <div className="article-view">
      <Link to="/" className="back-link">
        ← Back to Articles
      </Link>

      <div className="article-header">
        <h1>{article.title}</h1>
        <div className="article-meta-info">
          <span className="meta-item">
            <strong>Published:</strong> {formatDate(article.publishedAt)}
          </span>
          <span className="meta-item">
            <strong>Last Updated:</strong> {formatDate(article.updatedAt)}
          </span>
          {article.url && (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="meta-item link">
              View Original →
            </a>
          )}
        </div>
      </div>

      {article.updatedContent && (
        <div className="tab-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'original' ? 'active' : ''}`}
              onClick={() => setActiveTab('original')}
            >
              Original Version
            </button>
            <button
              className={`tab ${activeTab === 'updated' ? 'active' : ''}`}
              onClick={() => setActiveTab('updated')}
            >
              Enhanced Version
            </button>
          </div>
        </div>
      )}

      <div className="article-content">
        {activeTab === 'original' ? (
          <div className="content-section">
            <h2 className="content-title">Original Content</h2>
            <div className="content-body">
              {formatContent(article.content)}
            </div>
          </div>
        ) : (
          <div className="content-section">
            <h2 className="content-title">Enhanced Content</h2>
            <div className="content-body">
              {formatContent(article.updatedContent)}
            </div>
            
            {article.references && article.references.length > 0 && (
              <div className="references-section">
                <h3 className="references-title">References</h3>
                <ul className="references-list">
                  {article.references.map((ref, index) => (
                    <li key={index} className="reference-item">
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="reference-link"
                      >
                        {ref.title || ref.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleView;

