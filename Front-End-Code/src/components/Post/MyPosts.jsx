import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './MyPosts.css';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getMyPosts();
      setPosts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch your posts. Please try again.');
      console.error('Error fetching user posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setDeleteLoading(postId);
    try {
      await postsAPI.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      setError('Failed to delete post. Please try again.');
      console.error('Error deleting post:', err);
    } finally {
      setDeleteLoading(null);
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
        <p>Loading your posts...</p>
      </div>
    );
  }

  return (
    <div className="my-posts-container">
      <div className="my-posts-header">
        <h1>My Posts</h1>
        <p>Manage your blog posts</p>
        <Link to="/create-post" className="create-post-btn">
          + Create New Post
        </Link>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchMyPosts} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {posts.length === 0 && !loading && !error ? (
        <div className="no-posts">
          <div className="no-posts-content">
            <h3>No posts yet</h3>
            <p>You haven't created any posts yet. Start sharing your thoughts with the world!</p>
            <Link to="/create-post" className="create-first-post-btn">
              Create Your First Post
            </Link>
          </div>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map(post => (
            <div key={post.id} className="post-item">
              <div className="post-content">
                <h3 className="post-title">
                  <Link to={`/post/${post.id}`}>{post.title}</Link>
                </h3>
                
                <p className="post-summary">
                  {post.summary || stripHtml(post.content).substring(0, 200) + '...'}
                </p>
                
                <div className="post-meta">
                  <span className="post-date">
                    Created: {formatDate(post.created_at)}
                  </span>
                  {post.updated_at !== post.created_at && (
                    <span className="post-updated">
                      Updated: {formatDate(post.updated_at)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="post-actions">
                <Link 
                  to={`/post/${post.id}`} 
                  className="view-btn"
                >
                  View
                </Link>
                <Link 
                  to={`/edit-post/${post.id}`} 
                  className="edit-btn"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="delete-btn"
                  disabled={deleteLoading === post.id}
                >
                  {deleteLoading === post.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div className="posts-stats">
          <p>
            You have published {posts.length} post{posts.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyPosts;