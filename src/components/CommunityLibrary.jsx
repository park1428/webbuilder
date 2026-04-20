import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { Icons } from './Icons';
import { showToast } from './Toast';

const STORAGE_KEY = 'wb_community_components';

function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'p', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'button', 'input', 'label', 'form', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 'small', 'mark', 'del', 'ins', 'sub', 'sup'],
    ALLOWED_ATTR: ['class', 'id', 'style', 'href', 'src', 'alt', 'title', 'width', 'height', 'target', 'rel', 'type', 'placeholder', 'value', 'name', 'for'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true
  });
}

const CATEGORIES = ['All', 'Layout', 'Navigation', 'Content', 'Forms', 'Interactive', 'Media', 'E-commerce', 'Social', 'Other'];

function CommunityLibrary({ user, onBack, onUseComponent, getUserProjects }) {
  const [components, setComponents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [componentToUse, setComponentToUse] = useState(null);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setComponents(JSON.parse(saved)); } catch { setComponents([]); }
    } else {
      const demo = generateDemoComponents();
      setComponents(demo);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    }
  }, []);

  useEffect(() => {
    if (components.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(components));
    }
  }, [components]);

  const calculateAvgRating = useCallback((component) => {
    if (!component.ratings || component.ratings.length === 0) return 0;
    return component.ratings.reduce((acc, r) => acc + r.value, 0) / component.ratings.length;
  }, []);

  const getTrendingScore = useCallback((component) => {
    const days = (Date.now() - new Date(component.createdAt)) / (1000 * 60 * 60 * 24);
    return (component.usageCount / (days + 1)) * (calculateAvgRating(component) + 1);
  }, [calculateAvgRating]);

  const filteredAndSorted = useMemo(() => {
    let list = components;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'All') {
      list = list.filter(c => c.category === selectedCategory);
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'popularity') return b.usageCount - a.usageCount;
      if (sortBy === 'rating') return calculateAvgRating(b) - calculateAvgRating(a);
      if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'trending') return getTrendingScore(b) - getTrendingScore(a);
      return 0;
    });
  }, [components, searchQuery, selectedCategory, sortBy, calculateAvgRating, getTrendingScore]);

  const handleInitUse = (component) => {
    setComponentToUse(component);
    setShowProjectPicker(true);
  };

  const handleConfirmUse = (projectId) => {
    if (!componentToUse) return;
    setComponents(prev => prev.map(c =>
      c.id === componentToUse.id ? { ...c, usageCount: c.usageCount + 1 } : c
    ));
    setShowProjectPicker(false);
    onUseComponent(componentToUse, projectId);
  };

  const handleRateComponent = (componentId, rating) => {
    if (!user) { showToast.error('Please log in to rate components'); return; }
    setComponents(prev => prev.map(comp => {
      if (comp.id !== componentId) return comp;
      const existing = comp.ratings.findIndex(r => r.userId === user.id);
      const updated = [...comp.ratings];
      if (existing >= 0) {
        updated[existing] = { userId: user.id, value: rating };
      } else {
        updated.push({ userId: user.id, value: rating });
      }
      return { ...comp, ratings: updated };
    }));
    showToast.success(`Rated ${rating} star${rating !== 1 ? 's' : ''}!`);
  };

  const handleAddComment = (componentId, text) => {
    if (!user) { showToast.error('Please log in to comment'); return; }
    if (!text.trim()) return;
    const comment = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '',
      text: text.trim(),
      createdAt: new Date().toISOString()
    };
    setComponents(prev => prev.map(c =>
      c.id === componentId ? { ...c, comments: [...c.comments, comment] } : c
    ));
    setSelectedComponent(prev =>
      prev && prev.id === componentId ? { ...prev, comments: [...prev.comments, comment] } : prev
    );
    showToast.success('Comment posted!');
  };

  const handleDeleteComment = (componentId, commentId) => {
    setComponents(prev => prev.map(c =>
      c.id === componentId
        ? { ...c, comments: c.comments.filter(cm => cm.id !== commentId) }
        : c
    ));
    setSelectedComponent(prev =>
      prev && prev.id === componentId
        ? { ...prev, comments: prev.comments.filter(cm => cm.id !== commentId) }
        : prev
    );
  };

  const handleUpload = (data) => {
    const newComp = {
      id: Date.now(),
      name: data.name,
      description: data.description,
      category: data.category,
      tags: data.tags,
      content: sanitizeHTML(data.content),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar || '',
      createdAt: new Date().toISOString(),
      usageCount: 0,
      ratings: [],
      comments: []
    };
    setComponents(prev => [newComp, ...prev]);
    setShowUploadModal(false);
    showToast.success('Component shared with the community!');
  };

  const handleDeleteComponent = (componentId) => {
    if (!window.confirm('Delete this component? This cannot be undone.')) return;
    setComponents(prev => prev.filter(c => c.id !== componentId));
    showToast.success('Component deleted.');
  };

  const openDetails = (component) => {
    const latest = components.find(c => c.id === component.id) || component;
    setSelectedComponent(latest);
    setShowDetails(true);
  };

  return (
    <div className="community-library">
      <header className="community-header">
        <div className="community-header-left">
          <button className="header-back-btn" onClick={onBack} title="Back to dashboard">
            <Icons.ArrowRight style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div>
            <h1 className="community-title">
              <Icons.Users style={{ width: 24, height: 24 }} />
              Community Library
            </h1>
            <p className="community-subtitle">Discover, use, and share components with the community</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
          <Icons.Upload />
          Share Component
        </button>
      </header>

      <div className="community-toolbar">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search by name, description, or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <Icons.X />
            </button>
          )}
        </div>
        <div className="toolbar-filters">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="recent">Most Recent</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>

      <div className="category-pills">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="community-stats">
        <div className="stat-item">
          <Icons.Layers />
          <span><strong>{components.length}</strong> Components</span>
        </div>
        <div className="stat-item">
          <Icons.Users />
          <span><strong>{new Set(components.map(c => c.authorId)).size}</strong> Contributors</span>
        </div>
        <div className="stat-item">
          <Icons.Download />
          <span><strong>{components.reduce((s, c) => s + c.usageCount, 0)}</strong> Total Uses</span>
        </div>
      </div>

      <div className="community-grid">
        {filteredAndSorted.length === 0 ? (
          <div className="empty-state">
            <Icons.Wand className="empty-icon" />
            <h3>No components found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredAndSorted.map(component => (
            <ComponentCard
              key={component.id}
              component={component}
              user={user}
              onUse={handleInitUse}
              onRate={handleRateComponent}
              onViewDetails={openDetails}
              onDelete={handleDeleteComponent}
              calculateAvgRating={calculateAvgRating}
            />
          ))
        )}
      </div>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}

      {showDetails && selectedComponent && (
        <ComponentDetailsModal
          component={components.find(c => c.id === selectedComponent.id) || selectedComponent}
          user={user}
          onClose={() => { setShowDetails(false); setSelectedComponent(null); }}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onRate={handleRateComponent}
          onUse={handleInitUse}
          calculateAvgRating={calculateAvgRating}
        />
      )}

      {showProjectPicker && componentToUse && (
        <ProjectPickerModal
          component={componentToUse}
          getUserProjects={getUserProjects}
          onSelect={handleConfirmUse}
          onClose={() => { setShowProjectPicker(false); setComponentToUse(null); }}
        />
      )}
    </div>
  );
}

function ProjectPickerModal({ component, getUserProjects, onSelect, onClose }) {
  const projects = getUserProjects();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Add to Project</h2>
            <p className="modal-subtitle">
              Choose where to add <strong>"{component.name}"</strong>
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div className="project-picker-body">
          <div className="project-picker-preview">
            <div className="component-preview" dangerouslySetInnerHTML={{ __html: sanitizeHTML(component.content) }} />
          </div>

          <div className="project-picker-list">
            <button className="project-picker-item project-picker-item--new" onClick={() => onSelect('new')}>
              <div className="project-picker-icon">
                <Icons.Upload />
              </div>
              <div className="project-picker-info">
                <span className="project-picker-name">New Project</span>
                <span className="project-picker-meta">Start fresh with this component</span>
              </div>
              <Icons.ArrowRight className="project-picker-arrow" />
            </button>

            {projects.length > 0 && (
              <>
                <div className="project-picker-divider">
                  <span>or add to an existing project</span>
                </div>
                {projects.map(project => (
                  <button key={project.id} className="project-picker-item" onClick={() => onSelect(project.id)}>
                    <div className="project-picker-icon project-picker-icon--project">
                      <Icons.Layout />
                    </div>
                    <div className="project-picker-info">
                      <span className="project-picker-name">{project.name}</span>
                      <span className="project-picker-meta">
                        Updated {formatDate(project.updatedAt)}
                        {project.published && <span className="project-picker-badge">Published</span>}
                      </span>
                    </div>
                    <Icons.ArrowRight className="project-picker-arrow" />
                  </button>
                ))}
              </>
            )}

            {projects.length === 0 && (
              <p className="project-picker-empty">No existing projects. Click "New Project" above to get started.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentCard({ component, user, onUse, onRate, onViewDetails, onDelete, calculateAvgRating }) {
  const [hoverStar, setHoverStar] = useState(0);
  const avgRating = calculateAvgRating(component);
  const userRating = user ? (component.ratings.find(r => r.userId === user.id)?.value || 0) : 0;
  const isOwner = user && component.authorId === user.id;
  const displayRating = hoverStar || userRating || avgRating;

  return (
    <div className="component-card-community">
      {/* Preview */}
      <div
        className="component-preview"
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(component.content) }}
      />

      {isOwner && (
        <div className="component-owner-badge">
          <Icons.Users style={{ width: 12, height: 12 }} />
          Your Component
        </div>
      )}

      <div className="component-details">
        <h3 className="component-name">{component.name}</h3>
        <p className="component-description">{component.description}</p>

        {component.tags.length > 0 && (
          <div className="component-tags">
            {component.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="tag">
                <Icons.Tag style={{ width: 10, height: 10 }} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="component-author">
          <div className="author-avatar">
            {component.authorAvatar
              ? <img src={component.authorAvatar} alt={component.authorName} />
              : <span>{component.authorName.charAt(0).toUpperCase()}</span>
            }
          </div>
          <span className="author-name">{component.authorName}</span>
          <span className="component-date">{formatDate(component.createdAt)}</span>
        </div>

        <div className="component-stats">
          <div className="stat" title="Times used">
            <Icons.Download style={{ width: 14, height: 14 }} />
            <span>{component.usageCount}</span>
          </div>
          <div className="stat" title="Average rating">
            <Icons.StarFilled style={{ width: 14, height: 14, color: '#f59e0b' }} />
            <span>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
          </div>
          <div className="stat" title="Comments">
            <Icons.MessageCircle style={{ width: 14, height: 14 }} />
            <span>{component.comments.length}</span>
          </div>
        </div>

        <div className="quick-rating">
          <span className="quick-rating-label">Rate:</span>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              className="star-btn"
              onMouseEnter={() => setHoverStar(star)}
              onMouseLeave={() => setHoverStar(0)}
              onClick={() => onRate(component.id, star)}
              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              {star <= displayRating ? (
                <Icons.StarFilled style={{ width: 16, height: 16, color: hoverStar >= star ? '#f59e0b' : (userRating >= star ? '#f59e0b' : '#fcd34d') }} />
              ) : (
                <Icons.Star style={{ width: 16, height: 16, color: '#cbd5e1' }} />
              )}
            </button>
          ))}
        </div>

        <div className="component-actions">
          <button className="btn-secondary btn-sm" onClick={() => onViewDetails(component)}>
            <Icons.Eye />
            Details
          </button>
          {isOwner ? (
            <button className="btn-secondary btn-sm btn-danger-subtle" onClick={() => onDelete(component.id)} title="Delete component">
              <Icons.AlertCircle />
              Delete
            </button>
          ) : (
            <button className="btn-primary btn-sm" onClick={() => onUse(component)}>
              <Icons.Download />
              Use This
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ComponentDetailsModal({ component, user, onClose, onAddComment, onDeleteComment, onRate, onUse, calculateAvgRating }) {
  const [commentText, setCommentText] = useState('');
  const [hoverStar, setHoverStar] = useState(0);
  const avgRating = calculateAvgRating(component);
  const userRating = user ? (component.ratings.find(r => r.userId === user.id)?.value || 0) : 0;
  const displayRating = hoverStar || userRating;

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(component.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{component.name}</h2>
            <p className="modal-subtitle">{component.description}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div className="modal-body details-modal-body">
          <div className="details-left">
            <div className="component-preview-large" dangerouslySetInnerHTML={{ __html: sanitizeHTML(component.content) }} />

            <div className="details-meta-grid">
              <div className="details-meta-item">
                <div className="details-meta-icon"><Icons.Users /></div>
                <div>
                  <span className="details-meta-label">Author</span>
                  <span className="details-meta-value">{component.authorName}</span>
                </div>
              </div>
              <div className="details-meta-item">
                <div className="details-meta-icon"><Icons.Download /></div>
                <div>
                  <span className="details-meta-label">Uses</span>
                  <span className="details-meta-value">{component.usageCount}</span>
                </div>
              </div>
              <div className="details-meta-item">
                <div className="details-meta-icon"><Icons.StarFilled style={{ color: '#f59e0b' }} /></div>
                <div>
                  <span className="details-meta-label">Rating</span>
                  <span className="details-meta-value">
                    {avgRating > 0 ? `${avgRating.toFixed(1)} (${component.ratings.length})` : 'No ratings yet'}
                  </span>
                </div>
              </div>
              <div className="details-meta-item">
                <div className="details-meta-icon"><Icons.Tag /></div>
                <div>
                  <span className="details-meta-label">Category</span>
                  <span className="details-meta-value">{component.category}</span>
                </div>
              </div>
            </div>

            {component.tags.length > 0 && (
              <div className="details-tags">
                {component.tags.map((tag, i) => (
                  <span key={i} className="tag">
                    <Icons.Tag style={{ width: 10, height: 10 }} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="details-rating-section">
              <h4>{userRating ? 'Your rating' : 'Rate this component'}</h4>
              <div className="details-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className="star-btn-large"
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => onRate(component.id, star)}
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    {star <= displayRating ? (
                      <Icons.StarFilled style={{ width: 28, height: 28, color: hoverStar >= star ? '#f59e0b' : '#fcd34d' }} />
                    ) : (
                      <Icons.Star style={{ width: 28, height: 28, color: '#cbd5e1' }} />
                    )}
                  </button>
                ))}
                {userRating > 0 && (
                  <span className="your-rating-label">You rated {userRating}/5</span>
                )}
              </div>
            </div>
          </div>

          <div className="details-right">
            <div className="comments-section">
              <h4 className="comments-title">
                <Icons.MessageCircle />
                Comments
                <span className="comments-count">{component.comments.length}</span>
              </h4>

              {user ? (
                <form onSubmit={handleSubmitComment} className="comment-form">
                  <div className="comment-form-avatar">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} />
                      : <span>{user.name.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div className="comment-form-field">
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Share your thoughts, tips, or feedback..."
                      rows={3}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitComment(e);
                      }}
                    />
                    <button type="submit" className="btn-primary btn-sm comment-submit" disabled={!commentText.trim()}>
                      <Icons.MessageCircle />
                      Post
                    </button>
                  </div>
                </form>
              ) : (
                <p className="login-prompt">Log in to leave a comment.</p>
              )}

              <div className="comments-list">
                {component.comments.length === 0 ? (
                  <div className="no-comments">
                    <Icons.MessageCircle style={{ width: 32, height: 32, color: '#cbd5e1' }} />
                    <p>No comments yet. Be the first!</p>
                  </div>
                ) : (
                  [...component.comments].reverse().map(comment => (
                    <div key={comment.id} className="comment">
                      <div className="comment-avatar">
                        {comment.userAvatar
                          ? <img src={comment.userAvatar} alt={comment.userName} />
                          : <span>{comment.userName.charAt(0).toUpperCase()}</span>
                        }
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.userName}</span>
                          <span className="comment-date">{formatDate(comment.createdAt)}</span>
                          {user && comment.userId === user.id && (
                            <button
                              className="comment-delete"
                              onClick={() => onDeleteComment(component.id, comment.id)}
                              title="Delete comment"
                            >
                              <Icons.X style={{ width: 12, height: 12 }} />
                            </button>
                          )}
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          {(!user || component.authorId !== user.id) && (
            <button className="btn-primary" onClick={() => { onUse(component); onClose(); }}>
              <Icons.Download />
              Use This Component
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onUpload }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !content.trim()) {
      showToast.error('Please fill in all required fields');
      return;
    }
    onUpload({
      name: name.trim(),
      description: description.trim(),
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      content
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content upload-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Share Your Component</h2>
            <p className="modal-subtitle">Contribute to the community library</p>
          </div>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="upload-form-grid">
            <div className="upload-form-left">
              <div className="form-group">
                <label>Component Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Modern Hero Section"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description <span className="required">*</span></label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what this component does and when to use it..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="modern, gradient, responsive"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label>HTML Content <span className="required">*</span></label>
                  <button
                    type="button"
                    className="preview-toggle"
                    onClick={() => setPreview(p => !p)}
                  >
                    {preview ? <><Icons.Code /> Code</> : <><Icons.Eye /> Preview</>}
                  </button>
                </div>
                {preview ? (
                  <div className="upload-preview-box">
                    {content
                      ? <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }} />
                      : <p className="upload-preview-empty">Enter HTML to see preview</p>
                    }
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="<div style='padding: 24px; background: white;'>Your component HTML...</div>"
                    rows={10}
                    className="code-textarea"
                    required
                  />
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">
              <Icons.Upload />
              Share Component
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const diff = Date.now() - date;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString();
}

function generateDemoComponents() {
  return [
    {
      id: 1,
      name: 'Glassmorphism Card',
      description: 'Modern card with glass effect and backdrop blur, perfect for dashboards',
      category: 'Content',
      tags: ['modern', 'glass', 'card', 'trendy'],
      content: '<div style="padding: 32px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.1); max-width: 360px; margin: 0 auto;"><h3 style="color: #1a202c; margin: 0 0 12px; font-size: 22px; font-weight: 700;">Glass Card</h3><p style="color: #475569; margin: 0; line-height: 1.6; font-size: 15px;">Beautiful glassmorphism effect for modern, elevated designs.</p></div>',
      authorId: 'user1',
      authorName: 'Sarah Chen',
      authorAvatar: '',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      usageCount: 234,
      ratings: [{ userId: 'user2', value: 5 }, { userId: 'user3', value: 4 }, { userId: 'user4', value: 5 }],
      comments: [{
        id: 1, userId: 'user2', userName: 'Mike Johnson', userAvatar: '',
        text: 'Love this! Perfect for my landing page.',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }]
    },
    {
      id: 2,
      name: 'Animated Gradient Button',
      description: 'Eye-catching CTA button with animated gradient background and hover lift',
      category: 'Interactive',
      tags: ['button', 'gradient', 'animated', 'cta'],
      content: '<div style="text-align: center; padding: 32px;"><a href="#" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #475569 0%, #334155 100%); color: white; border-radius: 50px; font-size: 17px; font-weight: 700; text-decoration: none; box-shadow: 0 8px 24px rgba(44,95,141,0.4); letter-spacing: 0.3px;">Get Started Free →</a></div>',
      authorId: 'user2',
      authorName: 'Alex Rivera',
      authorAvatar: '',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      usageCount: 567,
      ratings: [{ userId: 'user1', value: 5 }, { userId: 'user3', value: 5 }, { userId: 'user4', value: 4 }, { userId: 'user5', value: 5 }],
      comments: []
    },
    {
      id: 3,
      name: 'Testimonial Card',
      description: 'Elegant testimonial with author avatar, quote styling, and social proof',
      category: 'Content',
      tags: ['testimonial', 'review', 'social-proof', 'trust'],
      content: '<div style="padding: 32px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 480px; margin: 20px auto;"><div style="font-size: 48px; color: #475569; line-height: 1; margin-bottom: 16px; font-family: Georgia, serif;">"</div><p style="font-size: 16px; color: #374151; line-height: 1.8; margin: 0 0 24px; font-style: italic;">This product completely transformed our workflow. The results exceeded all our expectations — highly recommended for any team!</p><div style="display: flex; align-items: center; gap: 12px;"><div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #475569, #334155); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px; flex-shrink: 0;">J</div><div><p style="font-weight: 700; color: #1a202c; margin: 0; font-size: 15px;">Jane Doe</p><p style="color: #9ca3af; margin: 4px 0 0; font-size: 13px;">CEO, TechCorp</p></div></div></div>',
      authorId: 'user3',
      authorName: 'Emma Wilson',
      authorAvatar: '',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      usageCount: 189,
      ratings: [{ userId: 'user1', value: 4 }, { userId: 'user2', value: 5 }],
      comments: [{
        id: 2, userId: 'user1', userName: 'Chris Davis', userAvatar: '',
        text: 'Great design! Could you add more color variations?',
        createdAt: new Date(Date.now() - 43200000).toISOString()
      }]
    },
    {
      id: 4,
      name: 'Pricing Toggle',
      description: 'Monthly/yearly billing toggle with savings badge',
      category: 'Interactive',
      tags: ['pricing', 'toggle', 'billing', 'saas'],
      content: '<div style="display: flex; align-items: center; justify-content: center; gap: 16px; padding: 32px; font-family: system-ui, sans-serif;"><span style="font-size: 15px; font-weight: 600; color: #64748b;">Monthly</span><div style="width: 56px; height: 32px; background: #475569; border-radius: 16px; position: relative; cursor: pointer; box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);"><div style="width: 26px; height: 26px; background: white; border-radius: 50%; position: absolute; top: 3px; right: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"></div></div><span style="font-size: 15px; font-weight: 700; color: #1a202c;">Yearly</span><span style="display: inline-block; padding: 4px 12px; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">SAVE 20%</span></div>',
      authorId: 'user4',
      authorName: 'David Kim',
      authorAvatar: '',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      usageCount: 423,
      ratings: [{ userId: 'user1', value: 5 }, { userId: 'user2', value: 5 }, { userId: 'user3', value: 4 }],
      comments: []
    },
    {
      id: 5,
      name: 'Feature Badge Row',
      description: 'Trust-building feature highlight row with icons and short labels',
      category: 'Content',
      tags: ['features', 'badges', 'trust', 'highlights'],
      content: '<div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; padding: 24px; font-family: system-ui, sans-serif;"><div style="display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 40px;"><span style="color: #16a34a; font-size: 16px;">✓</span><span style="font-size: 14px; font-weight: 600; color: #15803d;">Free forever plan</span></div><div style="display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 40px;"><span style="color: #2563eb; font-size: 16px;">✓</span><span style="font-size: 14px; font-weight: 600; color: #1d4ed8;">No credit card needed</span></div><div style="display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 40px;"><span style="color: #7c3aed; font-size: 16px;">✓</span><span style="font-size: 14px; font-weight: 600; color: #6d28d9;">Cancel anytime</span></div></div>',
      authorId: 'user5',
      authorName: 'Lisa Brown',
      authorAvatar: '',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      usageCount: 312,
      ratings: [{ userId: 'user2', value: 4 }],
      comments: []
    },
    {
      id: 6,
      name: 'Stats Counter Row',
      description: 'Social proof stats section with large numbers and descriptions',
      category: 'Content',
      tags: ['stats', 'numbers', 'social-proof', 'metrics'],
      content: '<div style="display: flex; flex-wrap: wrap; gap: 0; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); font-family: system-ui, sans-serif;"><div style="flex: 1; min-width: 140px; padding: 28px 24px; text-align: center; border-right: 1px solid #f1f5f9;"><div style="font-size: 36px; font-weight: 800; color: #475569; line-height: 1;">10K+</div><div style="font-size: 13px; color: #94a3b8; margin-top: 6px; font-weight: 500;">Happy Customers</div></div><div style="flex: 1; min-width: 140px; padding: 28px 24px; text-align: center; border-right: 1px solid #f1f5f9;"><div style="font-size: 36px; font-weight: 800; color: #10b981; line-height: 1;">99%</div><div style="font-size: 13px; color: #94a3b8; margin-top: 6px; font-weight: 500;">Uptime SLA</div></div><div style="flex: 1; min-width: 140px; padding: 28px 24px; text-align: center;"><div style="font-size: 36px; font-weight: 800; color: #f59e0b; line-height: 1;">4.9★</div><div style="font-size: 13px; color: #94a3b8; margin-top: 6px; font-weight: 500;">Average Rating</div></div></div>',
      authorId: 'user1',
      authorName: 'Sarah Chen',
      authorAvatar: '',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      usageCount: 445,
      ratings: [{ userId: 'user2', value: 5 }, { userId: 'user3', value: 5 }],
      comments: []
    }
  ];
}

export default CommunityLibrary;
