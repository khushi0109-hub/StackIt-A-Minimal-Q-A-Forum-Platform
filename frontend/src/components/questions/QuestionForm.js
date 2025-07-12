// QuestionForm.js - Location: frontend/src/components/questions/QuestionForm.js

import React, { useState, useRef } from 'react';
import './QuestionForm.css';

const QuestionForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    tags: initialData?.tags?.join(', ') || '',
    expectedAnswer: initialData?.expectedAnswer || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const contentTextareaRef = useRef(null);

  // Popular tags for suggestions
  const popularTags = [
    'javascript', 'python', 'react', 'node.js', 'css', 'html', 'sql',
    'java', 'mongodb', 'express', 'api', 'database', 'frontend', 'backend',
    'debugging', 'performance', 'security', 'authentication', 'deployment'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Handle tag suggestions
    if (name === 'tags') {
      const lastTag = value.split(',').pop().trim().toLowerCase();
      if (lastTag.length > 0) {
        const suggestions = popularTags.filter(tag => 
          tag.toLowerCase().includes(lastTag) && 
          !value.toLowerCase().includes(tag.toLowerCase())
        );
        setTagSuggestions(suggestions);
        setShowTagSuggestions(suggestions.length > 0);
      } else {
        setShowTagSuggestions(false);
      }
    }
  };

  const handleTagSuggestionClick = (tag) => {
    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    const lastTagIndex = formData.tags.lastIndexOf(',');
    const newTags = lastTagIndex > -1 
      ? formData.tags.substring(0, lastTagIndex + 1) + ' ' + tag
      : tag;
    
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
    setShowTagSuggestions(false);
  };

  const insertTextAtCursor = (text) => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = formData.content.substring(0, start) + text + formData.content.substring(end);
      setFormData(prev => ({
        ...prev,
        content: newContent
      }));
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    }
  };

  const formatText = (type) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    let replacement = '';

    switch (type) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        replacement = `\`${selectedText || 'code'}\``;
        break;
      case 'codeblock':
        replacement = `\n\`\`\`\n${selectedText || 'code block'}\n\`\`\`\n`;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`;
        break;
      case 'list':
        replacement = `\n- ${selectedText || 'list item'}\n`;
        break;
      default:
        return;
    }

    const newContent = formData.content.substring(0, start) + replacement + formData.content.substring(end);
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Question content is required';
    } else if (formData.content.length < 30) {
      newErrors.content = 'Question content must be at least 30 characters long';
    }

    if (!formData.tags.trim()) {
      newErrors.tags = 'At least one tag is required';
    } else {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      if (tags.length === 0) {
        newErrors.tags = 'At least one tag is required';
      } else if (tags.length > 5) {
        newErrors.tags = 'Maximum 5 tags allowed';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const questionData = {
        ...formData,
        tags,
        id: initialData?.id || Date.now(),
        author: {
          id: 1,
          name: 'Current User',
          reputation: 1250,
          avatar: '/api/placeholder/32/32'
        },
        votes: initialData?.votes || 0,
        answers: initialData?.answers || 0,
        views: initialData?.views || 0,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSubmit(questionData);
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreview = () => {
    return (
      <div className="question-preview">
        <h2 className="preview-title">{formData.title || 'Your question title will appear here'}</h2>
        <div className="preview-content">
          {formData.content ? (
            <div dangerouslySetInnerHTML={{ 
              __html: formData.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br/>')
            }} />
          ) : (
            <p className="preview-placeholder">Your question content will appear here with formatting...</p>
          )}
        </div>
        <div className="preview-tags">
          {formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag).map((tag, index) => (
            <span key={index} className="preview-tag">{tag}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="question-form-container">
      <div className="question-form-header">
        <h1>{initialData ? 'Edit Question' : 'Ask a Question'}</h1>
        <p>Be specific and imagine you're asking a question to another person</p>
      </div>

      <form onSubmit={handleSubmit} className="question-form">
        <div className="form-group">
          <label htmlFor="title">Question Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="e.g., How do I implement authentication in React?"
            maxLength={200}
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
          <div className="char-count">{formData.title.length}/200</div>
        </div>

        <div className="form-group">
          <label htmlFor="content">Question Content *</label>
          <div className="content-editor">
            <div className="editor-toolbar">
              <button type="button" onClick={() => formatText('bold')} title="Bold">
                <strong>B</strong>
              </button>
              <button type="button" onClick={() => formatText('italic')} title="Italic">
                <em>I</em>
              </button>
              <button type="button" onClick={() => formatText('code')} title="Inline Code">
                {'<>'}
              </button>
              <button type="button" onClick={() => formatText('codeblock')} title="Code Block">
                {'{}'}
              </button>
              <button type="button" onClick={() => formatText('link')} title="Link">
                🔗
              </button>
              <button type="button" onClick={() => formatText('list')} title="List">
                ≡
              </button>
              <div className="toolbar-divider"></div>
              <button 
                type="button" 
                onClick={() => setPreviewMode(!previewMode)}
                className={previewMode ? 'active' : ''}
              >
                {previewMode ? 'Edit' : 'Preview'}
              </button>
            </div>
            
            {!previewMode ? (
              <textarea
                ref={contentTextareaRef}
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={`form-textarea ${errors.content ? 'error' : ''}`}
                placeholder="Provide details about your question. Include what you've tried, what you expected, and what actually happened."
                rows={12}
              />
            ) : (
              renderPreview()
            )}
          </div>
          {errors.content && <div className="error-message">{errors.content}</div>}
          <div className="char-count">{formData.content.length} characters</div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags *</label>
          <div className="tags-input-container">
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className={`form-input ${errors.tags ? 'error' : ''}`}
              placeholder="e.g., javascript, react, node.js (comma-separated)"
            />
            {showTagSuggestions && (
              <div className="tag-suggestions">
                {tagSuggestions.map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    className="tag-suggestion"
                    onClick={() => handleTagSuggestionClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.tags && <div className="error-message">{errors.tags}</div>}
          <div className="tags-help">
            Use relevant tags to help others find your question. Maximum 5 tags.
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="expectedAnswer">What kind of answer are you looking for? (Optional)</label>
          <textarea
            id="expectedAnswer"
            name="expectedAnswer"
            value={formData.expectedAnswer}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Describe what would make a great answer to your question..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : (initialData ? 'Update Question' : 'Post Question')}
          </button>
          <button type="button" className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;