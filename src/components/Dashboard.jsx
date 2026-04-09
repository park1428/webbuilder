import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from './Icons';
import ExportModal from './ExportModal';

function Dashboard({ user, onOpenProject, onNewProject, onOpenTemplates, onOpenCommunity, onOpenTutorial, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [exportingProject, setExportingProject] = useState(null);

  const projectsKey = useMemo(() => `wb_projects_${user?.id || 'guest'}`, [user?.id]);

  useEffect(() => {
    const saved = localStorage.getItem(projectsKey);
    if (saved) {
      try { setProjects(JSON.parse(saved)); }
      catch { setProjects([]); }
    } else {
      setProjects([]);
    }
  }, [projectsKey]);

  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    const updated = projects.filter(p => p.id !== projectId);
    setProjects(updated);
    localStorage.setItem(projectsKey, JSON.stringify(updated));
  };

  const handleDuplicateProject = (e, project) => {
    e.stopPropagation();
    const newProject = {
      ...project,
      id: Date.now(),
      name: `${project.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem(projectsKey, JSON.stringify(updated));
  };

  const handleExport = (e, project) => {
    e.stopPropagation();
    setExportingProject(project);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo"><Icons.Sparkles /></div>
          <span>WebBuilder</span>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-link active">
            <Icons.Layout /><span>Projects</span>
          </button>
          <button className="sidebar-link" onClick={onOpenTemplates}>
            <Icons.Layers /><span>Templates</span>
          </button>
          <button className="sidebar-link" onClick={onOpenCommunity}>
            <Icons.Users /><span>Community</span>
          </button>
          <button className="sidebar-link" onClick={onOpenTutorial}>
            <Icons.Book /><span>Learn</span>
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-user">
          <div className="user-avatar">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} />
              : <span>{user.name.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
          <button className="user-menu-btn" onClick={onLogout} title="Sign out">
            <Icons.ExternalLink />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Your Projects</h1>
            <p>Build and manage your websites</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={onOpenTemplates}>
              <Icons.Layers />
              Browse Templates
            </button>
            <button className="btn-primary" onClick={onNewProject}>
              <Icons.Sparkles />
              New Project
            </button>
          </div>
        </header>

        {/* Quick stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon"><Icons.Layout /></div>
            <div className="stat-content">
              <span className="stat-value">{projects.length}</span>
              <span className="stat-label">Total Projects</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Icons.Sparkles /></div>
            <div className="stat-content">
              <span className="stat-value">{projects.filter(p => {
                return Date.now() - new Date(p.updatedAt) < 7 * 86400000;
              }).length}</span>
              <span className="stat-label">Active This Week</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Icons.Download /></div>
            <div className="stat-content">
              <span className="stat-value">{projects.filter(p => p.content && p.content.length > 100).length}</span>
              <span className="stat-label">With Content</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="dashboard-toolbar">
          <div className="search-box">
            <Icons.Search />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                <Icons.X />
              </button>
            )}
          </div>
          <div className="toolbar-right">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="recent">Recently updated</option>
              <option value="name">Name A–Z</option>
            </select>
            <div className="view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Icons.Layout />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <Icons.Layers />
              </button>
            </div>
          </div>
        </div>

        {/* Projects grid / list */}
        {projects.length === 0 ? (
          <div className="empty-projects">
            <Icons.Wand className="empty-icon" />
            <h3>No projects yet</h3>
            <p>Start building your first website from a template or create one from scratch.</p>
            <div className="empty-actions">
              <button className="btn-primary" onClick={onNewProject}>
                <Icons.Sparkles />
                Create New Project
              </button>
              <button className="btn-secondary" onClick={onOpenTemplates}>
                <Icons.Layers />
                Browse Templates
              </button>
            </div>
          </div>
        ) : (
          <div className={`projects-${viewMode}`}>
            {/* New project card */}
            <button className="project-card project-card--new" onClick={onNewProject}>
              <div className="new-project-icon"><Icons.Sparkles /></div>
              <span>New Project</span>
            </button>

            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="project-card project-card--clickable"
                onClick={() => onOpenProject(project)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onOpenProject(project)}
              >
                <div className="project-thumbnail">
                  {project.thumbnail
                    ? <img src={project.thumbnail} alt={project.name} />
                    : <div className="thumbnail-placeholder"><Icons.Layout /></div>
                  }
                  <div className="project-thumbnail-label">Click to open</div>
                </div>

                <div className="project-info">
                  <h4 className="project-name">{project.name}</h4>
                  <span className="project-date">Updated {formatDate(project.updatedAt)}</span>
                </div>

                <div className="project-actions" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => handleDuplicateProject(e, project)}
                    title="Duplicate project"
                    className="project-action-btn"
                  >
                    <Icons.Copy />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={e => handleExport(e, project)}
                    title="Download as ZIP"
                    className="project-action-btn"
                  >
                    <Icons.Download />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={e => handleDeleteProject(e, project.id)}
                    title="Delete project"
                    className="project-action-btn project-action-btn--delete"
                  >
                    <Icons.Trash />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {exportingProject && (
        <ExportModal
          project={exportingProject}
          onClose={() => setExportingProject(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
