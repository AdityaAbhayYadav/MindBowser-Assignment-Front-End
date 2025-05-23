import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Filter posts based on search term
    if (searchTerm.trim() === '') {
      setSearchResults(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchTerm, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAllPosts();
      setPosts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch posts. Please try again later.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to BlogSpace</h1>
        <p>Discover amazing stories and share your thoughts with the world</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search posts by title, content, or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <p className="search-info">
            Found {searchResults.length} post{searchResults.length !== 1 ? 's' : ''} 
            matching "{searchTerm}"
          </p>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPosts} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {searchResults.length === 0 && !loading && !error ? (
        <div className="no-posts">
          {searchTerm ? (
            <p>No posts found matching your search.</p>
          ) : (
            <p>No posts available yet. Be the first to create one!</p>
          )}
        </div>
      ) : (
        <div className="posts-grid">
          {searchResults.map(post => (
            <article key={post.id} className="post-card">
              <div className="post-header">
                <h2 className="post-title">
                  <Link to={`/post/${post.id}`}>{post.title}</Link>
                </h2>
                <div className="post-meta">
                  <span className="post-author">By {post.author}</span>
                  <span className="post-date">{formatDate(post.created_at)}</span>
                </div>
              </div>
              
              <div className="post-summary">
                <p>{post.summary || stripHtml(post.content).substring(0, 150) + '...'}</p>
              </div>
              
              <div className="post-footer">
                <Link to={`/post/${post.id}`} className="read-more-btn">
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;