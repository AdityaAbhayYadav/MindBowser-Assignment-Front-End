import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './PostForm.css';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPost(id);
      const post = response.data;
      
      // Check if current user is the author
      if (!user || user.id !== post.author_id) {
        setError('You can only edit your own posts');
        return;
      }
      
      setFormData({
        title: post.title,
        content: post.content
      });
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Post not found');
      } else if (err.response?.status === 403) {
        setError('You are not authorized to edit this post');
      } else {
        setError('Failed to load post. Please try again.');
      }
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setFormData({
      ...formData,
      content: data
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a title for your post');
      return;
    }

    if (!formData.content.trim() || formData.content === '<p>&nbsp;</p>') {
      setError('Please enter some content for your post');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await postsAPI.updatePost(id, {
        title: formData.title.trim(),
        content: formData.content
      });
      
      navigate(`/post/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to update post. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/post/${id}`);
  };

  // Fallback textarea if CKEditor fails to load
  const renderContentEditor = () => {
    try {
      return (
        <CKEditor
          editor={ClassicEditor}
          data={formData.content}
          onReady={(editor) => {
            setEditorReady(true);
            console.log('CKEditor is ready to use!', editor);
          }}
          onChange={handleEditorChange}
          onError={(error, { willEditorRestart }) => {
            console.error('CKEditor error:', error);
            if (willEditorRestart) {
              console.log('CKEditor will restart');
            }
          }}
          config={{
            toolbar: [
              'heading',
              '|',
              'bold',
              'italic',
              'link',
              'bulletedList',
              'numberedList',
              '|',
              'outdent',
              'indent',
              '|',
              'blockQuote',
              'insertTable',
              'undo',
              'redo'
            ],
            placeholder: 'Edit your blog post...'
          }}
        />
      );
    } catch (error) {
      console.error('CKEditor failed to load, falling back to textarea:', error);
      return (
        <div className="fallback-editor">
          <p className="editor-fallback-notice">
            Rich text editor failed to load. Using simple text editor.
          </p>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Edit your blog post..."
            rows="15"
            className="content-textarea"
          />
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/my-posts')} className="back-btn">
            Back to My Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-form-container">
      <div className="post-form-header">
        <h1>Edit Post</h1>
        <p>Update your blog post</p>
      </div>

      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Post Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter an engaging title for your post"
            required
            disabled={submitting}
            maxLength="255"
          />
          <small className="char-count">
            {formData.title.length}/255 characters
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <div className="editor-container">
            {renderContentEditor()}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-btn"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="btn-spinner"></span>
                Updating...
              </>
            ) : (
              'Update Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;