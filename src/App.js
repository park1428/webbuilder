import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import ComponentLibrary from './components/ComponentLibrary';
import RightSidebar from './components/RightSidebar';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import TemplateBrowser from './components/TemplateBrowser';
import TutorialModal from './components/TutorialModal';
import CommunityLibrary from './components/CommunityLibrary';
import ToastContainer, { showToast } from './components/Toast';
import { Icons } from './components/Icons';
import ExportModal from './components/ExportModal';
import ErrorBoundary from './components/ErrorBoundary';

const SAVE_KEY = 'wb_content';
const USER_KEY = 'wb_user';
const TUTORIAL_SEEN_KEY = 'wb_tutorial_seen';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? 'dashboard' : 'login';
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentProject, setCurrentProject] = useState(null);

  const [editor, setEditor] = useState(null);
  const [activePanel, setActivePanel] = useState('canvas');
  const [isMobile, setIsMobile] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(380);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const saveTimerRef = useRef(null);
  const pendingTemplateRef = useRef(null);
  const pendingCommunityComponentRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => {
      setIsMobile(e.matches);
      if (e.matches) setActivePanel('canvas');
    };
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (editor && pendingTemplateRef.current !== null) {
      const content = pendingTemplateRef.current;
      pendingTemplateRef.current = null;
      editor.setComponents(content);
      localStorage.setItem(SAVE_KEY, content);

      if (pendingCommunityComponentRef.current !== null) {
        const comp = pendingCommunityComponentRef.current;
        pendingCommunityComponentRef.current = null;
        setTimeout(() => {
          const isTop = /\b(navbar|nav|header|hero|navigation|banner)\b/i.test(
            `${comp.name || ''} ${comp.category || ''}`
          );
          editor.addComponents(comp.content, isTop ? { at: 0 } : {});
          setTimeout(() => { try { editor.refresh(); } catch (_) {} }, 50);
          showToast.success(`"${comp.name}" added to your canvas!`);
        }, 300);
      }
    }
  }, [editor]);

  const handleSave = useCallback((payload) => {
    const html = typeof payload === 'string' ? payload : (payload?.html || '');
    const css = typeof payload === 'string' ? '' : (payload?.css || '');

    clearTimeout(saveTimerRef.current);
    setSaveStatus('saved');
    saveTimerRef.current = setTimeout(() => setSaveStatus(''), 2000);

    if (currentProject && user) {
      const userProjectsKey = `wb_projects_${user.id || 'guest'}`;
      const projects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');
      const updatedProjects = projects.map(p => {
        if (p.id === currentProject.id) {
          return {
            ...p,
            content: html + (css ? `<style>${css}</style>` : ''),
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });
      localStorage.setItem(userProjectsKey, JSON.stringify(updatedProjects));
    }
  }, [currentProject, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');

    const userTutorialKey = `${TUTORIAL_SEEN_KEY}_${userData.id}`;
    const tutorialSeen = localStorage.getItem(userTutorialKey);
    if (!tutorialSeen) {
      setTimeout(() => setShowTutorial(true), 300);
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    if (user) {
      localStorage.setItem(`${TUTORIAL_SEEN_KEY}_${user.id}`, 'true');
    }
  };

  const handleOpenTutorial = () => {
    setShowTutorial(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setCurrentProject(null);
    setEditor(null);
    setCurrentView('login');
  };

  const handleOpenProject = (project) => {
    setCurrentProject(project);
    if (project.content) {
      pendingTemplateRef.current = project.content;
    }
    setCurrentView('editor');
  };

  const handleNewProject = () => {
    const userProjectsKey = `wb_projects_${user?.id || 'guest'}`;
    const projects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');
    const newProject = {
      id: Date.now(),
      name: `Project ${projects.length + 1}`,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(userProjectsKey, JSON.stringify([newProject, ...projects]));
    setCurrentProject(newProject);
    pendingTemplateRef.current = '';
    setCurrentView('editor');
  };

  const handleOpenTemplates = () => {
    setCurrentView('templates');
  };

  const handleOpenCommunity = () => {
    setCurrentView('community');
  };

  const getUserProjects = useCallback(() => {
    const userProjectsKey = `wb_projects_${user?.id || 'guest'}`;
    try {
      return JSON.parse(localStorage.getItem(userProjectsKey) || '[]');
    } catch {
      return [];
    }
  }, [user]);

  const handleUseCommunityComponent = useCallback((component, projectId) => {
    const userProjectsKey = `wb_projects_${user?.id || 'guest'}`;
    const existingProjects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');

    let targetProject;
    if (projectId === 'new') {
      targetProject = {
        id: Date.now(),
        name: `Project ${existingProjects.length + 1}`,
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(userProjectsKey, JSON.stringify([targetProject, ...existingProjects]));
    } else {
      targetProject = existingProjects.find(p => p.id === projectId);
      if (!targetProject) return;
    }

    pendingCommunityComponentRef.current = component;
    setCurrentProject(targetProject);
    pendingTemplateRef.current = targetProject.content || '';
    setCurrentView('editor');
  }, [user]);

  const handleTemplateSelect = (template) => {
    const content = template ? template.content : '';

    const newProject = {
      id: Date.now(),
      name: template ? template.label : 'Untitled Project',
      content: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const userProjectsKey = `wb_projects_${user?.id || 'guest'}`;
    const projects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');
    localStorage.setItem(userProjectsKey, JSON.stringify([newProject, ...projects]));

    setCurrentProject(newProject);

    if (editor) {
      editor.setComponents(content);
      localStorage.setItem(SAVE_KEY, content);
    } else {
      pendingTemplateRef.current = content;
    }

    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setCurrentProject(null);
    setEditor(null);
    setCurrentView('dashboard');
  };

  const startLeftResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = leftWidth;
    const onMove = (me) => setLeftWidth(Math.max(200, Math.min(400, startW + me.clientX - startX)));
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [leftWidth]);

  const startRightResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = rightWidth;
    const onMove = (me) => setRightWidth(Math.max(300, Math.min(520, startW - (me.clientX - startX))));
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [rightWidth]);

  const panelClass = (panel) =>
    isMobile && activePanel !== panel ? 'panel-hidden' : '';

  if (currentView === 'login') {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <ToastContainer />
      </>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <>
        <ErrorBoundary fallbackMessage="The dashboard encountered an error. Try refreshing the page.">
          <Dashboard
            user={user}
            onOpenProject={handleOpenProject}
            onNewProject={handleNewProject}
            onOpenTemplates={handleOpenTemplates}
            onOpenCommunity={handleOpenCommunity}
            onOpenTutorial={handleOpenTutorial}
            onLogout={handleLogout}
          />
        </ErrorBoundary>
        <TutorialModal
          isOpen={showTutorial}
          onClose={handleTutorialComplete}
          onComplete={handleTutorialComplete}
        />
        <ToastContainer />
      </>
    );
  }

  if (currentView === 'templates') {
    return (
      <>
        <TemplateBrowser
          onSelectTemplate={handleTemplateSelect}
          onBack={handleBackToDashboard}
        />
        <ToastContainer />
      </>
    );
  }

  if (currentView === 'community') {
    return (
      <>
        <CommunityLibrary
          user={user}
          onBack={handleBackToDashboard}
          onUseComponent={handleUseCommunityComponent}
          getUserProjects={getUserProjects}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <button className="header-back-btn" onClick={handleBackToDashboard}>
            <Icons.ArrowRight style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div className="header-brand">
            <div className="header-logo">
              <Icons.Sparkles />
            </div>
            <div className="header-project-info">
              <h1 className="header-title">{currentProject?.name || 'Untitled Project'}</h1>
              <span className="header-tagline">WebBuilder</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {saveStatus === 'saved' && (
            <span className="save-indicator">
              <Icons.Check /> Saved
            </span>
          )}
          <button
            className="header-btn"
            onClick={() => editor?.runCommand('core:undo')}
            title="Undo (Ctrl+Z)"
          >
            <Icons.Undo />
          </button>
          <button
            className="header-btn"
            onClick={() => editor?.runCommand('core:redo')}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Icons.Redo />
          </button>
          <div className="header-divider" />
          <button
            className="header-btn header-btn--download"
            onClick={() => setShowExportModal(true)}
            title="Download your website as a ZIP file"
            disabled={!editor}
          >
            <Icons.Download />
            Download
          </button>
        </div>
      </header>

      <div className="app-body">

        <aside
          className={`left-sidebar ${panelClass('components')}`}
          style={!isMobile ? { width: leftWidth } : {}}
        >
          <ComponentLibrary editor={editor} />
        </aside>

        {!isMobile && (
          <div className="resize-handle" onMouseDown={startLeftResize} title="Drag to resize" />
        )}

        <main className={`canvas-area ${panelClass('canvas')}`}>
          <ErrorBoundary fallbackMessage="The editor encountered an error. Your work has been saved.">
            <Canvas onEditorReady={setEditor} onSave={handleSave} />
          </ErrorBoundary>
        </main>

        {!isMobile && (
          <div className="resize-handle" onMouseDown={startRightResize} title="Drag to resize" />
        )}

        <aside
          className={`right-sidebar ${panelClass('properties')}`}
          style={!isMobile ? { width: rightWidth } : {}}
        >
          <ErrorBoundary fallbackMessage="The properties panel encountered an error.">
            <RightSidebar editor={editor} />
          </ErrorBoundary>
        </aside>

      </div>

      <nav className="mobile-tab-bar">
        <button
          className={`mobile-tab-btn ${activePanel === 'components' ? 'active' : ''}`}
          onClick={() => setActivePanel('components')}
        >
          <Icons.Layers />
          <span className="mobile-tab-label">Add</span>
        </button>
        <button
          className={`mobile-tab-btn ${activePanel === 'canvas' ? 'active' : ''}`}
          onClick={() => setActivePanel('canvas')}
        >
          <Icons.Layout />
          <span className="mobile-tab-label">Canvas</span>
        </button>
        <button
          className={`mobile-tab-btn ${activePanel === 'properties' ? 'active' : ''}`}
          onClick={() => setActivePanel('properties')}
        >
          <Icons.Sparkles />
          <span className="mobile-tab-label">Style</span>
        </button>
      </nav>

      <ToastContainer />

      {showExportModal && editor && (
        <ExportModal
          project={{
            name: currentProject?.name || 'my-website',
            content: editor.getHtml(),
            css: editor.getCss()
          }}
          onClose={() => setShowExportModal(false)}
        />
      )}

    </div>
  );
}

export default App;
