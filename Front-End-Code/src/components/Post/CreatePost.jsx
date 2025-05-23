import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { postsAPI } from '../../services/api';
import './PostForm.css';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editorReady, setEditorReady] = useState(false);
  
  const navigate = useNavigate();

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

    setLoading(true);
    setError('');

    try {
      await postsAPI.createPost({
        title: formData.title.trim(),
        content: formData.content
      });
      
      navigate('/my-posts');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to create post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
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
            placeholder: 'Start writing your blog post...'
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
            placeholder="Start writing your blog post..."
            rows="15"
            className="content-textarea"
          />
        </div>
      );
    }
  };

  return (
    <div className="post-form-container">
      <div className="post-form-header">
        <h1>Create New Post</h1>
        <p>Share your thoughts with the world</p>
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
            disabled={loading}
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
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Publishing...
              </>
            ) : (
              'Publish Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;