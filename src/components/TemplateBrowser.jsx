import React, { useState } from 'react';
import { Icons } from './Icons';
import { TEMPLATES } from '../data/templates';

// Extended categories for template browser
const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: Icons.Layers },
  { id: 'landing', label: 'Landing Pages', icon: Icons.Layout },
  { id: 'portfolio', label: 'Portfolio', icon: Icons.Palette },
  { id: 'business', label: 'Business', icon: Icons.Layers },
  { id: 'ecommerce', label: 'E-Commerce', icon: Icons.MousePointer },
  { id: 'blog', label: 'Blog', icon: Icons.Book },
  { id: 'personal', label: 'Personal', icon: Icons.Sparkles },
  { id: 'startup', label: 'Startup', icon: Icons.Sparkles },
  { id: 'agency', label: 'Agency', icon: Icons.Layers },
  { id: 'restaurant', label: 'Restaurant', icon: Icons.Droplet },
  { id: 'event', label: 'Event', icon: Icons.Party },
  { id: 'coming-soon', label: 'Coming Soon', icon: Icons.Eye },
];

function TemplateBrowser({ onSelectTemplate, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="template-browser">
      {/* Sidebar */}
      <aside className="tb-sidebar">
        <div className="tb-sidebar-header">
          <button className="tb-back-btn" onClick={onBack}>
            <Icons.ArrowRight style={{ transform: 'rotate(180deg)' }} />
            Back
          </button>
        </div>

        <div className="tb-search">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <nav className="tb-categories">
          <h4>Categories</h4>
          {CATEGORIES.map(cat => {
            const IconComp = cat.icon;
            return (
              <button
                key={cat.id}
                className={`tb-category ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <IconComp />
                <span>{cat.label}</span>
                <span className="tb-category-count">
                  {cat.id === 'all'
                    ? TEMPLATES.length
                    : TEMPLATES.filter(t => t.category === cat.id).length}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="tb-main">
        <header className="tb-header">
          <div>
            <h1>Choose a Template</h1>
            <p>Start with a professionally designed template and customize it to your needs</p>
          </div>
          <button className="btn-secondary" onClick={() => onSelectTemplate(null)}>
            <Icons.Sparkles />
            Start from Scratch
          </button>
        </header>

        {/* Featured section */}
        {selectedCategory === 'all' && !searchQuery && (
          <section className="tb-featured">
            <h3>Featured Templates</h3>
            <div className="tb-featured-grid">
              {TEMPLATES.slice(0, 3).map(template => (
                <div
                  key={template.id}
                  className="tb-featured-card"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <div className="tb-featured-preview">
                    <div className="template-preview-frame">
                      <div dangerouslySetInnerHTML={{ __html: template.content }} />
                    </div>
                  </div>
                  <div className="tb-featured-info">
                    <h4>{template.label}</h4>
                    <p>{template.description}</p>
                    <div className="tb-featured-actions">
                      <button
                        className="btn-primary"
                        onClick={(e) => { e.stopPropagation(); onSelectTemplate(template); }}
                      >
                        Use Template
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }}
                      >
                        <Icons.Eye />
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All templates grid */}
        <section className="tb-all">
          <h3>
            {selectedCategory === 'all' ? 'All Templates' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
            <span className="count">({filteredTemplates.length})</span>
          </h3>

          {filteredTemplates.length === 0 ? (
            <div className="tb-empty">
              <Icons.Wand />
              <h4>No templates found</h4>
              <p>Try a different search term or category</p>
            </div>
          ) : (
            <div className="tb-grid">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="tb-card"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <div className="tb-card-preview">
                    <div className="template-preview-frame small">
                      <div dangerouslySetInnerHTML={{ __html: template.content }} />
                    </div>
                    <div className="tb-card-overlay">
                      <button
                        className="overlay-btn"
                        onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }}
                      >
                        <Icons.Eye />
                        Preview
                      </button>
                    </div>
                  </div>
                  <div className="tb-card-info">
                    <span className="tb-card-icon">{template.icon}</span>
                    <div>
                      <h4>{template.label}</h4>
                      <p>{template.description}</p>
                    </div>
                  </div>
                  <button
                    className="tb-card-use"
                    onClick={(e) => { e.stopPropagation(); onSelectTemplate(template); }}
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Preview modal */}
      {previewTemplate && (
        <div className="tb-preview-modal" onClick={() => setPreviewTemplate(null)}>
          <div className="tb-preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="tb-preview-header">
              <div>
                <h3>{previewTemplate.label}</h3>
                <p>{previewTemplate.description}</p>
              </div>
              <div className="tb-preview-actions">
                <button
                  className="btn-primary"
                  onClick={() => onSelectTemplate(previewTemplate)}
                >
                  Use This Template
                </button>
                <button
                  className="btn-icon"
                  onClick={() => setPreviewTemplate(null)}
                >
                  <Icons.Close />
                </button>
              </div>
            </div>
            <div className="tb-preview-frame">
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                    </style>
                  </head>
                  <body>${previewTemplate.content}</body>
                  </html>
                `}
                title="Template Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateBrowser;
