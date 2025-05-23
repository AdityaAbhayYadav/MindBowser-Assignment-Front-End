import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './PostDetails.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPost(id);
      setPost(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Post not found');
      } else {
        setError('Failed to load post. Please try again.');
      }
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await postsAPI.deletePost(id);
      navigate('/my-posts');
    } catch (err) {
      setError('Failed to delete post. Please try again.');
      console.error('Error deleting post:', err);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
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

  const isAuthor = user && post && user.id === post.author_id;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-home-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Post Not Found</h2>
          <p>The post you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="back-home-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <article className="post-detail">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <div className="meta-info">
              <span className="post-author">By {post.author}</span>
              <span className="post-date">
                Published on {formatDate(post.created_at)}
              </span>
              {post.updated_at !== post.created_at && (
                <span className="post-updated">
                  Updated on {formatDate(post.updated_at)}
                </span>
              )}
            </div>
            
            {isAuthor && (
              <div className="post-actions">
                <Link 
                  to={`/edit-post/${post.id}`} 
                  className="edit-btn"
                >
                  Edit Post
                </Link>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="delete-btn"
                  disabled={deleteLoading}
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="post-content">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="content-html"
          />
        </div>
      </article>

      <div className="post-navigation">
        <button 
          onClick={() => navigate(-1)} 
          className="back-btn"
        >
          ← Back
        </button>
        <Link to="/" className="home-link">
          All Posts
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Post</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-btn"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="confirm-delete-btn"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;