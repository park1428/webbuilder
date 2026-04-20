import React, { useState, useEffect } from 'react';
import { COMPONENTS } from '../data/components';
import DOMPurify from 'dompurify';
import { Icons } from './Icons';
import { showToast } from './Toast';

const COMMUNITY_STORAGE_KEY = 'wb_community_components';

const TOP_PLACEMENT_PATTERN = /\b(navbar|nav|header|hero|navigation|banner)\b/i;
function isTopPlacement(id = '', category = '', name = '') {
  return TOP_PLACEMENT_PATTERN.test(`${id} ${category} ${name}`);
}

function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'p', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'button', 'input', 'label', 'form', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 'small', 'mark', 'del', 'ins', 'sub', 'sup'],
    ALLOWED_ATTR: ['class', 'id', 'style', 'href', 'src', 'alt', 'title', 'width', 'height', 'target', 'rel', 'type', 'placeholder', 'value', 'name', 'for'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true
  });
}

function ComponentLibrary({ editor }) {
  const [activeTab, setActiveTab] = useState('builtin'); // 'builtin' | 'community'
  const [suggested, setSuggested] = useState([]);
  const [canvasCount, setCanvasCount] = useState(0);
  const [canvasHtml, setCanvasHtml] = useState('');
  const [search, setSearch] = useState('');
  const [communityComponents, setCommunityComponents] = useState([]);
  const [communitySearch, setCommunitySearch] = useState('');
  const [communityCategory, setCommunityCategory] = useState('All');

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const count = getComponentCount(editor);
      const html = editor.getHtml() || '';
      setCanvasCount(count);
      setCanvasHtml(html);
      if (count >= 2) {
        const keywords = extractKeywords(editor);
        if (keywords.length > 0) {
          const topKw = findMostCommon(keywords);
          const suggs = COMPONENTS
            .filter(c => c.keywords.includes(topKw))
            .slice(0, 3)
            .map(c => c.id);
          setSuggested(suggs);
        }
      } else {
        setSuggested([]);
      }
    };
    editor.on('component:add', update);
    editor.on('component:remove', update);
    update();
    return () => {
      editor.off('component:add', update);
      editor.off('component:remove', update);
    };
  }, [editor]);

  useEffect(() => {
    const loadCommunity = () => {
      try {
        const saved = localStorage.getItem(COMMUNITY_STORAGE_KEY);
        setCommunityComponents(saved ? JSON.parse(saved) : []);
      } catch {
        setCommunityComponents([]);
      }
    };
    loadCommunity();
    if (activeTab === 'community') loadCommunity();
  }, [activeTab]);

  const addBuiltinComponent = (componentId) => {
    const component = COMPONENTS.find(c => c.id === componentId);
    if (component && editor) {
      const opts = isTopPlacement(componentId) ? { at: 0 } : {};
      editor.addComponents(component.content, opts);
      setTimeout(() => { try { editor.refresh(); } catch (_) {} }, 50);
    }
  };

  const addCommunityComponent = (component) => {
    if (!editor) return;
    const opts = isTopPlacement('', component.category, component.name) ? { at: 0 } : {};
    editor.addComponents(component.content, opts);
    setTimeout(() => { try { editor.refresh(); } catch (_) {} }, 50);
    try {
      const saved = localStorage.getItem(COMMUNITY_STORAGE_KEY);
      const components = saved ? JSON.parse(saved) : [];
      const updated = components.map(c =>
        c.id === component.id ? { ...c, usageCount: c.usageCount + 1 } : c
      );
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(updated));
      setCommunityComponents(updated);
    } catch { /* noop */ }
    showToast.success(`"${component.name}" added to canvas!`);
  };

  const guidedHint = getGuidedHint(canvasCount, canvasHtml);
  const hasSuggestions = canvasCount >= 2 && suggested.length > 0;

  const filteredBuiltin = search
    ? COMPONENTS.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
      )
    : COMPONENTS;
  const builtinCategories = [...new Set(filteredBuiltin.map(c => c.category))];

  const categories = ['All', ...new Set(communityComponents.map(c => c.category))];
  const filteredCommunity = communityComponents
    .filter(c => {
      const q = communitySearch.toLowerCase();
      const matchesSearch = !communitySearch ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q));
      const matchesCategory = communityCategory === 'All' || c.category === communityCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => b.usageCount - a.usageCount);

  return (
    <div className="component-library">
      <div className="cl-tabs">
        <button
          className={`cl-tab ${activeTab === 'builtin' ? 'cl-tab--active' : ''}`}
          onClick={() => setActiveTab('builtin')}
        >
          <Icons.Layers style={{ width: 14, height: 14 }} />
          Built-in
        </button>
        <button
          className={`cl-tab ${activeTab === 'community' ? 'cl-tab--active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <Icons.Users style={{ width: 14, height: 14 }} />
          Community
          {communityComponents.length > 0 && (
            <span className="cl-tab-badge">{communityComponents.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'builtin' && (
        <>
          <div className="cl-header">
            <p className="cl-subtitle">Click any item to add it to your page</p>
          </div>

          {guidedHint && (
            <div className="guided-hint">
              <span className="guided-hint-arrow">→</span>
              {guidedHint}
            </div>
          )}

          {hasSuggestions && (
            <div className="suggestion-banner">⭐ Suggested based on your page</div>
          )}

          <div className="cl-search-wrap">
            <input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="cl-search"
              aria-label="Search components"
            />
            {search && (
              <button className="cl-search-clear" onClick={() => setSearch('')} aria-label="Clear search">×</button>
            )}
          </div>

          <div className="cl-list">
            {builtinCategories.map(category => (
              <div key={category} className="cl-category-group">
                <div className="cl-category-label">{category}</div>
                {filteredBuiltin.filter(c => c.category === category).map(component => {
                  const isSuggested = suggested.includes(component.id);
                  return (
                    <button
                      key={component.id}
                      className={`component-card ${isSuggested ? 'component-card--suggested' : ''}`}
                      onClick={() => addBuiltinComponent(component.id)}
                      title={component.description || `Add ${component.label}`}
                    >
                      <span className="component-card-name">
                        {isSuggested && <span className="suggested-star">⭐</span>}
                        {component.label}
                      </span>
                      {component.description && (
                        <span className="component-card-desc">{component.description}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            {filteredBuiltin.length === 0 && (
              <div className="cl-empty">
                No components match <strong>"{search}"</strong>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'community' && (
        <div className="cl-community">
          <div className="cl-community-header">
            <p className="cl-subtitle">Community-built components — click to add</p>
          </div>

          <div className="cl-search-wrap">
            <input
              type="text"
              placeholder="Search community..."
              value={communitySearch}
              onChange={e => setCommunitySearch(e.target.value)}
              className="cl-search"
            />
            {communitySearch && (
              <button className="cl-search-clear" onClick={() => setCommunitySearch('')}>×</button>
            )}
          </div>

          {categories.length > 1 && (
            <div className="cl-community-cats">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`cl-community-cat ${communityCategory === cat ? 'active' : ''}`}
                  onClick={() => setCommunityCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="cl-list">
            {filteredCommunity.length === 0 ? (
              <div className="cl-empty">
                {communityComponents.length === 0
                  ? 'No community components yet. Visit the Community Library to discover some!'
                  : 'No components match your search.'
                }
              </div>
            ) : (
              filteredCommunity.map(component => (
                <CommunityComponentRow
                  key={component.id}
                  component={component}
                  onAdd={addCommunityComponent}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CommunityComponentRow({ component, onAdd }) {
  const [expanded, setExpanded] = useState(false);
  const avgRating = component.ratings && component.ratings.length > 0
    ? (component.ratings.reduce((s, r) => s + r.value, 0) / component.ratings.length).toFixed(1)
    : null;

  return (
    <div className="cl-community-row">
      <div className="cl-community-row-header">
        <div className="cl-community-row-info">
          <button
            className="cl-community-row-name"
            onClick={() => setExpanded(p => !p)}
            title="Preview component"
          >
            <Icons.ChevronRight
              style={{
                width: 12, height: 12, flexShrink: 0,
                transform: expanded ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.15s'
              }}
            />
            {component.name}
          </button>
          <div className="cl-community-row-meta">
            <span>{component.authorName}</span>
            {avgRating && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Icons.StarFilled style={{ width: 10, height: 10, color: '#f59e0b' }} />
                {avgRating}
              </span>
            )}
          </div>
        </div>
        <button
          className="cl-community-add-btn"
          onClick={() => onAdd(component)}
          title={`Add "${component.name}" to canvas`}
        >
          <Icons.Upload style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {expanded && (
        <div className="cl-community-preview">
          <div
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(component.content) }}
            style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '182%', pointerEvents: 'none' }}
          />
        </div>
      )}
    </div>
  );
}

function getGuidedHint(count, html) {
  if (count === 0) return 'Start by adding a Header or Hero section above';
  if (!html.includes('<header') && !html.includes('<nav')) return 'Tip: Add a Header or Nav Bar at the top';
  if (count < 3) return 'Good start! Add content sections to fill your page';
  if (!html.includes('<footer')) return 'Almost done — add a Footer to complete your page';
  if (!html.includes('<button') && !html.includes('href=')) return 'Add a button to guide your visitors';
  return null;
}

function getComponentCount(editor) {
  try {
    return Array.from(editor.getWrapper().find('*').models || [])
      .filter(c => c.get('type') !== 'wrapper').length;
  } catch { return 0; }
}

function extractKeywords(editor) {
  try {
    return Array.from(editor.getWrapper().find('*').models || [])
      .map(c => (c.get('attributes') || {}).keywords || [])
      .flat()
      .filter(kw => typeof kw === 'string');
  } catch { return []; }
}

function findMostCommon(array) {
  if (!array.length) return null;
  const counts = {};
  array.forEach(item => { counts[item] = (counts[item] || 0) + 1; });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
}

export default ComponentLibrary;
