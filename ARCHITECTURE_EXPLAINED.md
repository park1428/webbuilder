# WebBuilder - Complete Architecture & Code Explanation

**Total Codebase:** ~6,600 lines of JavaScript/React
**Core Technology:** React 18 + GrapesJS (visual website builder library)
**Storage:** LocalStorage for all persistence
**AI Integration:** OpenAI GPT-4o-mini for design analysis

---

## Part 1: Structural Overview & Architecture

### 1.1 High-Level Architecture

This is a **visual website builder** application that allows users to create websites through drag-and-drop without code knowledge. Think of it like a simplified version of Webflow or Wix.

**Core Architecture Pattern:**
```
User (Browser)
   ↓
App.js (Main Router/State Manager)
   ↓
├─ LoginScreen/Dashboard (User Management Views)
├─ TemplateBrowser (Template Selection)
├─ CommunityLibrary (User-Shared Components)
└─ Editor View (Main Builder)
       ├─ ComponentLibrary (Left: Drag Components)
       ├─ Canvas (Center: GrapesJS Editor)
       └─ RightSidebar (Right: Style Editor + AI Analysis)
```

### 1.2 Data Flow & Storage Model

**All data is stored in LocalStorage** - no backend server:

| Key Pattern | Purpose | Example |
|-------------|---------|---------|
| `wb_user` | Current logged-in user | `{id, name, email}` |
| `wb_projects_{userId}` | User's project list | Array of project objects |
| `wb_content` | Current editor content (HTML) | Raw HTML string |
| `wb_tutorial_seen_{userId}` | Tutorial completion flag | `'true'` |
| `wb_community_components` | User-shared component library | Array of component definitions |

**Project Object Structure:**
```javascript
{
  id: timestamp,
  name: "Project 1",
  content: "<html>...</html>",  // HTML + embedded CSS
  createdAt: ISO8601,
  updatedAt: ISO8601,
  thumbnail: null  // Future feature
}
```

### 1.3 View/Page State Machine

App.js manages a state machine with 5 views:

```
┌──────────┐
│  login   │ ──login──> dashboard
└──────────┘

┌───────────┐
│ dashboard │ ──new/open──> editor
│           │ ──templates─> templates
│           │ ──community─> community
└───────────┘

┌───────────┐          ┌──────────┐
│ templates │ ─select─>│  editor  │
└───────────┘          │          │
                       │ (3-panel │
┌───────────┐          │  layout) │
│ community │ ─select─>│          │
└───────────┘          └──────────┘
```

### 1.4 The GrapesJS Integration Layer

**GrapesJS** is a third-party library that provides:
- Visual drag-and-drop editor in an iframe
- Component tree management (DOM-like structure)
- Style management (CSS properties on elements)
- Undo/redo functionality
- HTML/CSS export

**Our wrapper around it:**
- **Canvas.jsx**: Initializes GrapesJS, configures style manager, handles autosave
- **ComponentLibrary.jsx**: Provides draggable components (GrapesJS "blocks")
- **RightSidebar.jsx**: Custom UI on top of GrapesJS style manager

**Why the iframe?** GrapesJS renders the user's website in an isolated iframe so:
- User's CSS doesn't break the builder UI
- Can accurately preview exactly what they'll export
- Can inject custom CSS for editing experience

### 1.5 AI Analysis System Architecture

Two parallel AI systems:

**System 1: Rule-Based Analyzer (designAnalyzer.js)**
- Runs locally, instant
- 8 hand-coded analysis rules
- Detects common design issues (contrast, spacing, hierarchy)
- Returns `Fix` functions that directly modify GrapesJS components

**System 2: OpenAI Analyzer (openaiDesignAdvisor.js)**
- Calls OpenAI API with HTML/CSS
- Uses GPT-4o-mini with structured JSON output
- Temperature 0.3 for consistency
- Returns natural language suggestions

Both feed into the "Analyze" tab in RightSidebar.

---

## Part 2: File-by-File Deep Dive

### 2.1 Entry Point: index.js

```javascript
// Lines 1-10
```

**Purpose:** Standard React 18 entry point.

**Function Breakdown:**

**`ReactDOM.createRoot()`** (Line 5)
- Uses React 18's concurrent rendering mode
- Finds `<div id="root">` in public/index.html
- Attaches React app to that DOM node

**`<React.StrictMode>`** (Line 7)
- Development-only wrapper
- Runs effects twice to catch side-effect bugs
- Warns about deprecated APIs
- Removed in production builds

**Why it's simple:** All routing/state lives in App.js, not here.

---

### 2.2 Main Router: App.js (491 lines)

This is the **brain** of the application. Manages all top-level state and routing.

#### 2.2.1 Constants (Lines 16-18)

```javascript
const SAVE_KEY = 'wb_content';
const USER_KEY = 'wb_user';
const TUTORIAL_SEEN_KEY = 'wb_tutorial_seen';
```

These are localStorage keys used throughout the app.

#### 2.2.2 State Management (Lines 20-45)

**`currentView`** (Lines 22-25)
- Type: `'login' | 'dashboard' | 'templates' | 'community' | 'editor'`
- Determines which screen renders
- Initialized from localStorage: if user exists → dashboard, else → login

**`user`** (Lines 26-29)
- Current logged-in user object
- Loaded from localStorage on mount
- Structure: `{id: timestamp, name: string, email: string, isGuest?: boolean}`

**`currentProject`** (Line 30)
- The project currently being edited
- null when not in editor view
- Contains: id, name, content (HTML string), timestamps

**`editor`** (Line 32)
- Reference to the GrapesJS editor instance
- Set by Canvas.jsx via onEditorReady callback
- Used by all components to manipulate the canvas

**Panel State** (Lines 33-40)
- `activePanel`: For mobile, which panel is visible
- `isMobile`: Media query result for < 768px
- `leftWidth`/`rightWidth`: Sidebar widths (resizable)
- `saveStatus`: Shows "Saved" indicator after autosave

**Modal State** (Lines 41-42)
- `showTutorial`: Controls TutorialModal visibility
- `showExportModal`: Controls download modal

**Refs** (Lines 43-45)
- `saveTimerRef`: Debounce timer for "Saved" indicator
- `pendingTemplateRef`: HTML to load when editor initializes
- `pendingCommunityComponentRef`: Component to add after project loads

**Why refs for pending content?**
When switching views to editor, the Canvas might not be mounted yet. We store content in refs, then when Canvas calls `onEditorReady`, we check these refs and load the content.

#### 2.2.3 Mobile Detection (Lines 48-57)

```javascript
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
```

**Purpose:** React to screen size changes dynamically.

**matchMedia API:**
- Browser API that evaluates CSS media queries
- Returns MediaQueryList object with `.matches` boolean
- Can listen for changes with event listener

**Why reset to canvas?**
On mobile, only one panel shows at a time. When screen shrinks, default to showing the canvas (main content) rather than sidebars.

**Cleanup function:** Removes event listener to prevent memory leaks.

#### 2.2.4 Pending Template Loader (Lines 60-81)

```javascript
useEffect(() => {
  if (editor && pendingTemplateRef.current !== null) {
    const content = pendingTemplateRef.current;
    pendingTemplateRef.current = null;
    editor.setComponents(content);
    localStorage.setItem(SAVE_KEY, content);

    // Community component injection (lines 68-79)
  }
}, [editor]);
```

**The Problem This Solves:**

When user clicks "Open Project" from dashboard:
1. App sets currentView='editor' and pendingTemplateRef to project HTML
2. React renders editor view
3. Canvas mounts and initializes GrapesJS (async)
4. Canvas calls onEditorReady with editor instance
5. **This effect fires**, sees pending content, loads it

**Community Component Queue (Lines 68-79):**

Some workflows need to add a component AFTER loading a project:
- User browses Community Library
- Clicks "Add to Project" → selects which project
- App loads that project, THEN adds the component

**`isTop` detection (Lines 72-74):**
```javascript
const isTop = /\b(navbar|nav|header|hero|navigation|banner)\b/i.test(
  `${comp.name || ''} ${comp.category || ''}`
);
```
- Navbars/headers should go at the TOP of the page
- Tests name + category against regex
- If matches, inserts at position 0, else appends

**Why setTimeout 300ms?** (Line 71)
- GrapesJS needs time to finish loading the project
- Immediate insertion can cause race conditions
- 300ms ensures project is fully loaded

**Why editor.refresh()?** (Line 76)
- GrapesJS maintains internal state about element positions
- After programmatic changes, refresh recalculates overlays
- Fixes misaligned selection highlights

#### 2.2.5 Save Handler (Lines 83-108)

```javascript
const handleSave = useCallback((payload) => {
  const html = typeof payload === 'string' ? payload : (payload?.html || '');
  const css = typeof payload === 'string' ? '' : (payload?.css || '');

  clearTimeout(saveTimerRef.current);
  setSaveStatus('saved');
  saveTimerRef.current = setTimeout(() => setSaveStatus(''), 2000);

  // Save to current project (lines 92-107)
}, [currentProject, user]);
```

**Called from:** Canvas.jsx autosave (triggered 800ms after any change)

**Dual Save System:**

1. **SAVE_KEY** (`wb_content`): Quick access to current content
   - Used for reopening editor after refresh
   - Single string, not project-specific

2. **Project List** (Lines 92-107): Persists to user's project array
   - Finds project by ID
   - Updates content field
   - Updates updatedAt timestamp
   - Writes entire project array back to localStorage

**Why update entire array?**
LocalStorage only stores strings, so we stringify the whole array and overwrite.

**Save Indicator Logic:**
- Clear any existing timer (prevents stacking)
- Show "Saved" immediately
- After 2 seconds, hide it
- Creates a pleasant UX confirmation

#### 2.2.6 Authentication Handlers (Lines 110-144)

**handleLogin (Lines 111-123):**
```javascript
const handleLogin = (userData) => {
  setUser(userData);
  setCurrentView('dashboard');

  const userTutorialKey = `${TUTORIAL_SEEN_KEY}_${userData.id}`;
  const tutorialSeen = localStorage.getItem(userTutorialKey);
  if (!tutorialSeen) {
    setTimeout(() => setShowTutorial(true), 300);
  }
};
```

**Key Points:**
- No actual authentication (demo app)
- LoginScreen creates user object, calls this
- Tutorial is user-specific (not global)
- 300ms delay lets dashboard render before showing modal

**handleLogout (Lines 138-144):**
- Removes user from localStorage
- Clears all state (user, project, editor)
- Returns to login screen

**Why clear editor ref?**
Prevents stale editor instance from being reused. Forces fresh initialization.

#### 2.2.7 Project Handlers (Lines 146-215)

**handleOpenProject (Lines 147-153):**
```javascript
const handleOpenProject = (project) => {
  setCurrentProject(project);
  if (project.content) {
    pendingTemplateRef.current = project.content;
  }
  setCurrentView('editor');
};
```
- Stores content in ref (not state)
- Switches view to editor
- Canvas will load content via the pending template effect

**handleNewProject (Lines 155-170):**
```javascript
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
```

**Sequential naming:** "Project 1", "Project 2", etc. based on array length

**Why Date.now() for ID?**
- Simple, collision-free timestamp
- No need for UUIDs in localStorage-only app
- Can sort by ID to get chronological order

**Prepend to array:** New project goes to index 0 (most recent first)

**getUserProjects (Lines 181-188):**
- Callback function passed to CommunityLibrary
- Allows community library to list user's projects
- Wrapped in try/catch for corrupt localStorage data

**handleUseCommunityComponent (Lines 191-215):**

Complex flow for adding community components:

```javascript
const handleUseCommunityComponent = useCallback((component, projectId) => {
  const userProjectsKey = `wb_projects_${user?.id || 'guest'}`;
  const existingProjects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');

  let targetProject;
  if (projectId === 'new') {
    targetProject = {/* create new project */};
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
```

**Two paths:**
1. **Add to New Project:** Creates project, then queues component
2. **Add to Existing:** Loads project, then queues component

**Why queue in ref?**
Can't add component until editor fully loads. Ref survives re-render, effect picks it up later.

#### 2.2.8 Template Handler (Lines 217-243)

```javascript
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
```

**Template Selection Flow:**
1. User browses templates
2. Clicks template → calls this handler
3. Creates NEW project (doesn't overwrite existing)
4. Loads template HTML into new project
5. Opens editor with this project

**Optimization (Lines 235-240):**
If editor already exists (user previously opened editor), directly load content. Otherwise use pending ref.

#### 2.2.9 Resize Handlers (Lines 260-285)

**Resizable Sidebars:**

Users can drag the resize handles between panels to adjust widths.

**startLeftResize (Lines 260-271):**
```javascript
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
```

**How it works:**

1. **onMouseDown** (user starts drag):
   - Record starting mouse X position
   - Record starting panel width

2. **onMouseMove** (user dragging):
   - Calculate delta: `currentX - startX`
   - New width = `startWidth + delta`
   - Clamp between 200-400px

3. **onMouseUp** (user releases):
   - Remove event listeners
   - Width stays at final value

**Why window listeners?**
Mouse can move outside the resize handle element. Window-level listeners track it anywhere.

**Math.max/min clamping:**
Prevents panels from being too narrow (< 200px) or too wide (> 400px).

**startRightResize (Lines 274-285):**

Same logic but:
- Wider range: 300-520px (properties panel needs more space)
- Inverted delta: `startW - (currentX - startX)` because dragging left increases width

#### 2.2.10 View Rendering (Lines 290-487)

App.js returns different React trees based on `currentView`:

**Login View (Lines 291-297):**
```javascript
if (currentView === 'login') {
  return (
    <>
      <LoginScreen onLogin={handleLogin} />
      <ToastContainer />
    </>
  );
}
```
Simple: just login form + toast notifications.

**Dashboard View (Lines 301-322):**
```javascript
if (currentView === 'dashboard') {
  return (
    <>
      <ErrorBoundary fallbackMessage="...">
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
      <TutorialModal isOpen={showTutorial} ... />
      <ToastContainer />
    </>
  );
}
```

**ErrorBoundary:**
React error boundary that catches crashes and shows fallback UI instead of white screen.

**Why so many callbacks?**
Dashboard is presentational. All business logic lives in App.js. Dashboard just calls these when user clicks buttons.

**Template/Community Views (Lines 326-350):**
Similar pattern: view component + callbacks + ToastContainer.

**Editor View (Lines 354-487):**

The main 3-panel layout:

```javascript
return (
  <div className="app">
    {/* Header (Lines 357-404) */}
    <header className="app-header">
      <button onClick={handleBackToDashboard}>Back</button>
      <div>Project Name</div>
      <div>Undo/Redo/Download buttons</div>
    </header>

    {/* 3-Column Layout (Lines 407-444) */}
    <div className="app-body">
      {/* Left Sidebar - Components */}
      <aside style={{ width: leftWidth }}>
        <ComponentLibrary editor={editor} />
      </aside>

      {/* Resize Handle */}
      <div onMouseDown={startLeftResize} />

      {/* Center - Canvas */}
      <main>
        <Canvas onEditorReady={setEditor} onSave={handleSave} />
      </main>

      {/* Resize Handle */}
      <div onMouseDown={startRightResize} />

      {/* Right Sidebar - Properties */}
      <aside style={{ width: rightWidth }}>
        <RightSidebar editor={editor} />
      </aside>
    </div>

    {/* Mobile Tab Bar (Lines 447-469) */}
    <nav className="mobile-tab-bar">
      <button onClick={() => setActivePanel('components')}>Add</button>
      <button onClick={() => setActivePanel('canvas')}>Canvas</button>
      <button onClick={() => setActivePanel('properties')}>Style</button>
    </nav>

    {/* Modals */}
    <ToastContainer />
    {showExportModal && <ExportModal ... />}
  </div>
);
```

**Header Actions (Lines 379-392):**

**Undo/Redo:**
```javascript
onClick={() => editor?.runCommand('core:undo')}
```
- `editor.runCommand()` is GrapesJS API
- `core:undo` / `core:redo` are built-in commands
- Optional chaining (`?.`) prevents crash if editor not ready

**Download Button:**
- Opens ExportModal
- Disabled until editor loads (`disabled={!editor}`)

**Mobile Tab Bar (Lines 447-469):**

On mobile, only ONE panel visible at a time:
- "Add" → ComponentLibrary
- "Canvas" → GrapesJS editor
- "Style" → RightSidebar properties

**panelClass helper (Lines 287-288):**
```javascript
const panelClass = (panel) =>
  isMobile && activePanel !== panel ? 'panel-hidden' : '';
```
Adds 'panel-hidden' class to non-active panels on mobile.

**Export Modal (Lines 475-483):**

Conditionally rendered:
```javascript
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
```

Gets fresh HTML/CSS from editor on render (not from saved state).

---

### 2.3 Visual Editor: Canvas.jsx (382 lines)

This component initializes and configures GrapesJS.

#### 2.3.1 Canvas Body CSS (Lines 9-34)

```javascript
const CANVAS_BODY_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    color: #1E293B;
  }
  img { max-width: 100%; height: auto; display: block; }
  a { color: inherit; }
  /* Empty block placeholder */
  [data-gjs-type]:not([data-gjs-type="wrapper"]):not([data-gjs-type="text"]):empty::after {
    content: 'Empty block';
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    padding: 8px 12px;
    font-size: 12px;
    color: #94a3b8;
    border: 1.5px dashed #cbd5e1;
    border-radius: 6px;
    background: rgba(241,245,249,0.5);
    pointer-events: none;
  }
`;
```

**Purpose:** Injected into GrapesJS iframe for better editing experience.

**Empty Block Placeholder:**
When user adds a container with no content, shows "Empty block" with dashed border. Uses CSS `::after` pseudo-element so it doesn't affect actual HTML.

**Why `pointer-events: none`?**
So user can click through the placeholder to select the actual element.

#### 2.3.2 Editor Options (Lines 38-283)

**editorOptions** is a giant config object passed to GrapesJS.

**Core Options (Lines 38-55):**

```javascript
const editorOptions = useMemo(() => ({
  height: '100%',
  width: '100%',
  storageManager: false,  // Disable GrapesJS's storage (we use our own)
  undoManager: { trackSelection: false },
  protectedCss: '',

  // Suppress built-in UI
  panels: { defaults: [] },
  blockManager: { appendTo: '' },
  layerManager: { appendTo: '' },
  traitManager: { appendTo: '' },
  selectorManager: { appendTo: '' },

  // Inject CSS into iframe
  canvas: {
    styles: [`data:text/css;charset=utf-8,${encodeURIComponent(CANVAS_BODY_CSS)}`]
  },
  ...
}), []);
```

**Why disable panels?**
GrapesJS has built-in UI panels. We build our own custom UI (ComponentLibrary, RightSidebar), so we hide theirs.

**appendTo: ''** means "don't render these managers in the DOM."

**CSS Injection:**
Uses data URI to inject CSS as a stylesheet link into the iframe.

**Device Manager (Lines 58-64):**

```javascript
deviceManager: {
  devices: [
    { name: 'Desktop', width: '' },
    { name: 'Tablet', width: '768px', widthMedia: '992px' },
    { name: 'Mobile', width: '375px', widthMedia: '480px' }
  ]
},
```

**width:** Canvas viewport size
**widthMedia:** Breakpoint for CSS `@media` queries

Desktop has empty width = full width.

**Style Manager Sectors (Lines 68-282):**

GrapesJS needs to know which CSS properties to track. We define 7 "sectors":

1. **Layout (Lines 71-126):** display, flex-direction, align-items, justify-content, flex-wrap, gap
2. **Spacing (Lines 128-140):** padding/margin (all 4 sides)
3. **Size (Lines 142-150):** width, height, max-width, min-height
4. **Typography (Lines 152-197):** font-size, font-weight, color, text-align, line-height, letter-spacing, text-transform, text-decoration
5. **Background (Lines 198-224):** background-color, background-image (with gradient presets), background-size
6. **Border (Lines 226-243):** border-width, border-style, border-color, border-radius
7. **Effects (Lines 245-280):** opacity, box-shadow (presets), overflow, cursor

**Number Fields Configuration:**

```javascript
{
  name: 'Padding Top',
  property: 'padding-top',
  type: 'number',
  units: ['px', '%', 'rem'],
  defaults: '0',
  min: 0,
  max: 300
}
```

- **property:** CSS property name
- **units:** Dropdown options
- **min/max:** Input constraints
- **defaults:** Initial value

**Select Fields:**

```javascript
{
  name: 'Display',
  property: 'display',
  type: 'select',
  defaults: 'block',
  options: [
    { value: 'block', name: 'Block' },
    { value: 'flex', name: 'Flex' },
    ...
  ]
}
```

**Why define all this?**
RightSidebar will render custom UI for these properties. This config tells GrapesJS to track changes and persist them in component styles.

#### 2.3.3 Editor Initialization (Lines 285-364)

**handleEditorInit** runs once when GrapesJS loads:

```javascript
const handleEditorInit = useCallback((editor) => {
  let isDestroyed = false;

  editor.on('destroy', () => { isDestroyed = true; });

  editor.on('load', () => {
    const wrapper = editor.getWrapper?.();
    if (wrapper) {
      wrapper.addStyle({
        'min-height': '100vh',
        'font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      });
    }
  });

  // Component auto-scroll (lines 305-316)
  // Block registration (lines 318-326)
  // Text editing (lines 328-334)
  // Autosave (lines 336-355)
  // Load saved content (lines 357-361)

  if (onEditorReady) onEditorReady(editor);
}, [onEditorReady, onSave]);
```

**isDestroyed flag:**
GrapesJS editor can be unmounted while async operations pending. This flag prevents accessing destroyed editor.

**Wrapper Styling (Lines 291-299):**

The "wrapper" is GrapesJS's root component (represents `<body>`). We set default styles:
- min-height: 100vh (full viewport height)
- font-family (system fonts)

**Component Auto-Scroll (Lines 305-316):**

```javascript
editor.on('component:add', (component) => {
  setTimeout(() => {
    if (isDestroyed) return;
    try {
      const el = component.getEl();
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
        editor.refresh();
      }
    } catch (_) {}
  }, 150);
});
```

**Problem:** When user adds component at bottom, it's off-screen.

**Solution:**
1. Wait 150ms for render
2. Scroll element into view
3. Call `editor.refresh()` to update overlays

**Why editor.refresh()?**
GrapesJS's selection highlight is absolutely positioned. After scroll, it's out of sync. Refresh recalculates positions.

**Block Registration (Lines 318-326):**

```javascript
COMPONENTS.forEach(component => {
  editor.BlockManager.add(component.id, {
    label: component.label,
    category: component.category,
    content: component.content,
    attributes: { keywords: component.keywords }
  });
});
```

Registers each component from `data/components.js` as a draggable "block" in GrapesJS.

**Text Editing (Lines 329-334):**

```javascript
editor.on('component:selected', (component) => {
  const type = component.get('type');
  if (type === 'text' || type === 'default') {
    component.set('editable', true);
  }
});
```

Makes text components editable when selected. User can double-click to edit inline.

**Autosave System (Lines 336-355):**

```javascript
let saveTimer = null;
const scheduleSave = () => {
  if (isDestroyed) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (isDestroyed) return;
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      localStorage.setItem(SAVE_KEY, html);
      if (onSave) onSave({ html, css });
    } catch (_) {}
  }, 800);
};

editor.on('component:add', scheduleSave);
editor.on('component:remove', scheduleSave);
editor.on('component:update', scheduleSave);
editor.on('style:change', scheduleSave);
```

**Debouncing:** Wait 800ms after last change before saving.

**Why debounce?**
User might make 10 rapid changes. Don't want to save after each one. Wait for them to stop editing.

**Events that trigger save:**
- component:add (drag component)
- component:remove (delete)
- component:update (edit text, move)
- style:change (change color, padding, etc.)

**Dual save:**
1. SAVE_KEY → quick access
2. onSave callback → App.js saves to project list

**Load Saved Content (Lines 357-361):**

```javascript
const saved = localStorage.getItem(SAVE_KEY);
if (saved && saved !== '<!-- blank -->') {
  editor.setComponents(saved);
}
```

Loads last edited content from localStorage on mount.

**Why check for '<!-- blank -->'?**
Some legacy code path might have saved that. Skip it.

#### 2.3.4 Component Return (Lines 366-378)

```javascript
const editorComponent = (
  <Editor
    grapesjs="https://unpkg.com/grapesjs"
    options={editorOptions}
    onEditor={handleEditorInit}
  />
);

return (
  <div className="canvas-wrapper">
    {editorComponent}
  </div>
);
```

**@grapesjs/react** is the official React wrapper for GrapesJS.

**grapesjs prop:** CDN URL to load GrapesJS library from.

**onEditor callback:** Fires when editor initializes, passes editor instance.

---

### 2.4 Component Palette: ComponentLibrary.jsx

This sidebar shows draggable components and smart suggestions.

#### 2.4.1 Key Concepts

**Built-in Components:** From `data/components.js` (28 pre-made components)

**Community Components:** User-created components shared in localStorage

**Smart Suggestions:** Analyzes canvas content to suggest relevant components

#### 2.4.2 Helper Functions (Lines 7-22)

**isTopPlacement (Lines 11-13):**
```javascript
function isTopPlacement(id = '', category = '', name = '') {
  return TOP_PLACEMENT_PATTERN.test(`${id} ${category} ${name}`);
}
```

Tests if component should go at page top (nav/header/hero).

**sanitizeHTML (Lines 15-22):**
```javascript
function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'p', 'a', 'img', ...],
    ALLOWED_ATTR: ['class', 'id', 'style', 'href', ...],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true
  });
}
```

**Purpose:** Security. Prevents XSS attacks in community components.

**DOMPurify:**
- Battle-tested XSS sanitization library
- Strips `<script>`, event handlers, etc.
- Allows safe HTML/CSS only

#### 2.4.3 State & Effects (Lines 24-78)

**activeTab (Line 25):** 'builtin' or 'community'

**Suggestion State (Lines 26-29):**
- `suggested`: Array of component IDs to highlight
- `canvasCount`: Number of components on canvas
- `canvasHtml`: Current HTML (for keyword extraction)

**Canvas Tracking Effect (Lines 35-63):**

```javascript
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
```

**Smart Suggestions Algorithm:**

1. Count components on canvas
2. If >= 2 components, analyze
3. Extract keywords from all components
4. Find most common keyword
5. Filter COMPONENTS by that keyword
6. Suggest top 3 matches

**Why >= 2?**
Need some content to detect style/theme. 1 component isn't enough signal.

**Component Load Effect (Lines 66-78):**

```javascript
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
```

Reloads community components when tab opens (in case other tab added some).

#### 2.4.4 Add Component Handlers (Lines 80-105)

**addBuiltinComponent (Lines 80-87):**
```javascript
const addBuiltinComponent = (componentId) => {
  const component = COMPONENTS.find(c => c.id === componentId);
  if (component && editor) {
    const opts = isTopPlacement(componentId) ? { at: 0 } : {};
    editor.addComponents(component.content, opts);
    setTimeout(() => { try { editor.refresh(); } catch (_) {} }, 50);
  }
};
```

**at: 0** inserts at top of page. Otherwise appends to bottom.

**50ms refresh delay:** Gives GrapesJS time to render before recalculating overlays.

**addCommunityComponent (Lines 89-105):**

Similar but also:
1. Increments usage count in localStorage
2. Shows success toast

---

### 2.5 Style Editor: RightSidebar.jsx

This is the most complex UI component. It has 4 tabs:

1. **Style:** Visual style editor (padding, colors, etc.)
2. **Code:** Shows HTML/CSS with explanations
3. **Layers:** Tree view of page structure
4. **Analyze:** AI-powered design suggestions

#### 2.5.1 Helper Components (Lines 83-200)

**ColorField (Lines 83-114):**

```javascript
function ColorField({ label, prop, get, set }) {
  const raw = get(prop) || '';
  const [text, setText] = useState(raw);

  useEffect(() => { setText(get(prop) || ''); }, [get, prop]);

  const applyText = () => { if (text !== get(prop)) set(prop, text); };

  return (
    <div className="sp-row">
      <span className="sp-label">{label}</span>
      <div className="sp-color-field">
        <input
          type="color"
          value={toHex(text)}
          onChange={e => { setText(e.target.value); set(prop, e.target.value); }}
          className="sp-color-swatch"
        />
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={applyText}
          onKeyDown={e => e.key === 'Enter' && applyText()}
          className="sp-color-text"
        />
      </div>
    </div>
  );
}
```

**Two inputs:**
1. Color picker (visual)
2. Text input (for hex codes)

**Sync logic:**
- Color picker immediately applies
- Text input applies onBlur or Enter

**toHex helper (Lines 60-79):**
Converts any color format (named, rgb, rgba) to hex for color picker.

**NumberField (Lines 116-159):**

Handles CSS properties with units (e.g., "24px", "2rem", "auto").

**parseValueUnit (Lines 49-58):**
```javascript
function parseValueUnit(val) {
  if (!val && val !== 0) return { num: '', unit: 'px' };
  const v = String(val).trim();
  if (v === 'auto' || v === 'none' || ...) {
    return { num: '', unit: v };
  }
  const m = v.match(/^(-?\d*\.?\d+)\s*(%|px|rem|em|vh|vw|pt|fr|deg)?$/);
  if (m) return { num: m[1], unit: m[2] || 'px' };
  return { num: '', unit: v };
}
```

Splits "24px" into `{num: '24', unit: 'px'}`.

**Number + Dropdown UI:**
- Number input for value
- Dropdown for unit
- Special handling for keywords (auto, none)

**SelectField / RadioField (Lines 161-200):**
Simpler: just dropdown or radio buttons for predefined options.

#### 2.5.2 Main Component State (Lines 202-221)

**Tab State:**
- `activeTab`: 'style' | 'code' | 'layers' | 'analyze'

**Selection State:**
- `selected`: Currently selected GrapesJS component
- `styles`: Computed styles for selected component

**Analysis State:**
- `suggestions`: Design issues found
- `analyzing`: Loading state for AI call
- `highlightCleanup`: Function to remove visual highlights

**Selection Effect (Lines 223-243):**

```javascript
useEffect(() => {
  if (!editor) return;

  const onSelect = () => {
    const sel = editor.getSelected();
    setSelected(sel);
    if (sel) {
      const computed = sel.getStyle();
      setStyles(computed);
    } else {
      setStyles({});
    }
  };

  editor.on('component:selected', onSelect);
  editor.on('component:updated', onSelect);
  onSelect(); // Initial

  return () => {
    editor.off('component:selected', onSelect);
    editor.off('component:updated', onSelect);
  };
}, [editor]);
```

Keeps `selected` and `styles` in sync with GrapesJS selection.

**Cleanup Effect (Lines 245-251):**

```javascript
useEffect(() => {
  return () => {
    if (highlightCleanup) highlightCleanup();
  };
}, [highlightCleanup]);
```

Removes element highlights when unmounting.

#### 2.5.3 Style Getters/Setters (Lines 253-283)

**get function (Lines 253-266):**

```javascript
const get = useCallback((prop) => {
  if (!selected) return '';

  // Try GrapesJS style first
  const style = selected.getStyle();
  if (style && style[prop] !== undefined && style[prop] !== '') {
    return style[prop];
  }

  // Fallback to computed
  return styles[prop] || '';
}, [selected, styles]);
```

Priority:
1. Component's explicit style
2. Computed style (from CSS rules)
3. Empty string

**set function (Lines 268-283):**

```javascript
const set = useCallback((prop, value) => {
  if (!selected) return;

  const cleanVal = String(value || '').trim();

  if (cleanVal === '' || cleanVal === 'none') {
    selected.removeStyle(prop);
  } else {
    selected.addStyle({ [prop]: cleanVal });
  }

  const updated = selected.getStyle();
  setStyles(updated);
}, [selected]);
```

**removeStyle vs addStyle:**
- Empty value → removes property (reverts to default)
- Non-empty → sets property

**Why update local styles state?**
Triggers re-render so UI reflects change immediately.

#### 2.5.4 Style Tab (Lines 285-433)

Renders custom style editor UI based on GrapesJS style manager config.

**Structure:**

```javascript
{activeTab === 'style' && (
  <div className="style-tab">
    {!selected && <EmptyState />}
    {selected && (
      <>
        <StyleSector title="Layout" icon="📐">
          <SelectField label="Display" ... />
          <SelectField label="Direction" ... />
          ...
        </StyleSector>

        <StyleSector title="Spacing" icon="↔️">
          <NumberField label="Padding Top" ... />
          ...
        </StyleSector>

        {/* Typography, Background, Border, Effects */}
      </>
    )}
  </div>
)}
```

**StyleSector component (Lines 161-175):**
Collapsible section with icon + title.

**Why custom UI?**
GrapesJS's default UI is functional but ugly. We build beautiful custom controls that manipulate the same underlying data.

#### 2.5.5 Code Tab (Lines 435-515)

Shows current element's HTML + CSS with beginner-friendly explanations.

**HTML Section (Lines 445-482):**

```javascript
const tagName = selected.get('tagName') || 'div';
const attrs = selected.getAttributes() || {};
const explain = TAG_EXPLANATIONS[tagName.toLowerCase()];

// Render
<div className="code-block">
  <span className="ct-bracket">&lt;</span>
  <span className="ct-tag">{tagName}</span>
  {Object.entries(attrs).map(([key, val]) => (
    <span>
      <span className="ct-attr"> {key}</span>
      <span className="ct-bracket">=</span>
      <span className="ct-val">"{val}"</span>
    </span>
  ))}
  <span className="ct-bracket">&gt;</span>
</div>
```

**Syntax highlighting:** Separate spans with CSS classes for colors.

**Attribute Explanations:**

```javascript
{Object.entries(attrs).map(([key, val]) => {
  const attrInfo = ATTR_EXPLANATIONS[key];
  if (attrInfo) {
    return <p key={key}><strong>{key}:</strong> {attrInfo}</p>;
  }
})}
```

Shows plain-English explanation of each attribute.

**CSS Section (Lines 484-515):**

Displays computed styles as CSS rules:

```javascript
<pre className="code-block">
  {tagName} {'{'}
  {Object.entries(styles)
    .filter(([k, v]) => v && v !== '' && v !== 'none')
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}
  {'}'}
</pre>
```

Filters out empty/none values for cleaner display.

#### 2.5.6 Layers Tab (Lines 517-543)

Tree view of page structure.

**Recursive ComponentNode (Lines 519-539):**

```javascript
function ComponentNode({ component, depth = 0, onSelect }) {
  const tagName = component.get('tagName') || 'div';
  const children = component.components?.() || [];
  const isSelected = component === selected;

  return (
    <div>
      <div
        style={{ paddingLeft: depth * 16 + 8 }}
        className={isSelected ? 'layer-item-active' : 'layer-item'}
        onClick={() => onSelect(component)}
      >
        {tagName}
      </div>
      {children.map(child => (
        <ComponentNode
          component={child}
          depth={depth + 1}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
```

**Indentation:** `depth * 16px` creates visual hierarchy.

**Click to select:** Clicking a layer selects that component in editor.

#### 2.5.7 Analyze Tab (Lines 545-685)

AI-powered design analysis.

**Analyze Button Handler (Lines 555-600):**

```javascript
const handleAnalyze = async () => {
  setAnalyzing(true);
  setSuggestions([]);

  try {
    // Run local analyzer
    const localIssues = analyzeDesign(editor, { maxSuggestions: 5 });

    // Run OpenAI analyzer
    const html = editor.getHtml();
    const css = editor.getCss();
    const aiResult = await analyzeDesignWithOpenAI({ html, css, maxSuggestions: 3 });

    // Merge results
    const combined = [...localIssues];
    if (aiResult?.suggestions) {
      combined.push(...aiResult.suggestions);
    }

    // Deduplicate by ID
    const unique = Array.from(new Map(combined.map(s => [s.id, s])).values());

    setSuggestions(unique);
  } catch (error) {
    showToast.error('Analysis failed');
  } finally {
    setAnalyzing(false);
  }
};
```

**Dual Analysis:**
1. Local (instant, rule-based)
2. OpenAI (slower, AI-based)

**Merge Strategy:**
- Combine both result arrays
- Deduplicate by ID (prevents showing same issue twice)

**Suggestion Display (Lines 615-685):**

Each suggestion shows:
- Severity badge (high/medium/low)
- Title + explanation
- Preview (before/after)
- Hover to highlight affected elements
- Buttons: Apply Fix, Undo

**Highlight on Hover (Lines 635-650):**

```javascript
onMouseEnter={() => {
  if (highlightCleanup) highlightCleanup();
  const cleanup = highlightElements(suggestion.affectedElements, editor);
  setHighlightCleanup(() => cleanup);
}}
onMouseLeave={() => {
  if (highlightCleanup) {
    highlightCleanup();
    setHighlightCleanup(null);
  }
}}
```

**highlightElements** (from designAnalyzer.js):
- Finds DOM elements in iframe
- Adds blue outline
- Returns cleanup function

**Apply Fix (Lines 660-670):**

```javascript
const handleApplyFix = (suggestion) => {
  if (highlightCleanup) {
    highlightCleanup();
    setHighlightCleanup(null);
  }

  const success = applyFixWithUndo(editor, suggestion);
  if (success) {
    showToast.success('Fix applied! Check the Undo button if needed.');
    // Remove from list
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }
};
```

**applyFixWithUndo** (from designAnalyzer.js):
- Takes snapshot of editor state
- Runs suggestion.fix(editor)
- Stores snapshot in undo stack

---

### 2.6 Utility: exportProject.js (185 lines)

Handles exporting projects as downloadable ZIP files.

#### 2.6.1 Main Export Function (Lines 9-47)

```javascript
export async function exportAsZip(project, options = {}) {
  const {
    minified = false,
    separateFiles = true,
    filename = 'project'
  } = options;

  const zip = new JSZip();

  const html = project.content || '';
  const css = project.css || '';

  if (separateFiles) {
    const htmlContent = createHTMLFile(html, css, { separateCSS: true, minified });
    const cssContent = minified ? minifyCSS(css) : css;

    zip.file('index.html', htmlContent);
    zip.file('style.css', cssContent);
  } else {
    const htmlContent = createHTMLFile(html, css, { separateCSS: false, minified });
    zip.file('index.html', htmlContent);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, size: blob.size };
}
```

**Two Export Modes:**

1. **Separate Files:** index.html + style.css
   Better for editing after download

2. **Single File:** index.html with inline `<style>`
   Easier to share (one file)

**Download Mechanism:**
1. Create ZIP blob with JSZip library
2. Create blob URL with `URL.createObjectURL()`
3. Create temporary `<a>` element
4. Trigger click (starts download)
5. Remove element and revoke URL

**Why revoke URL?**
Blob URLs persist in memory. Revoking frees memory after download starts.

#### 2.6.2 HTML File Creation (Lines 52-89)

```javascript
function createHTMLFile(content, css, options = {}) {
  const { separateCSS = true, minified = false } = options;

  const htmlContent = minified ? minifyHTML(content) : content;
  const cssContent = minified ? minifyCSS(css) : css;

  if (separateCSS) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Website built with WebBuilder">
  <title>My Website</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${htmlContent}
</body>
</html>`;
  } else {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Website built with WebBuilder">
  <title>My Website</title>
  <style>
${cssContent}
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
  }
}
```

**Complete HTML Document:**
- DOCTYPE declaration
- meta tags (charset, viewport)
- Title + description
- CSS inclusion (link or inline)

**User's HTML goes in body:**
GrapesJS exports just body content, we wrap it in full document structure.

#### 2.6.3 Minification (Lines 156-177)

**minifyHTML (Lines 156-162):**
```javascript
function minifyHTML(html) {
  return html
    .replace(/\n\s*/g, '')           // Remove newlines + indentation
    .replace(/\s{2,}/g, ' ')         // Collapse multiple spaces to one
    .replace(/>\s+</g, '><')         // Remove space between tags
    .trim();
}
```

**minifyCSS (Lines 167-177):**
```javascript
function minifyCSS(css) {
  return css
    .replace(/\n\s*/g, '')           // Remove newlines
    .replace(/\s{2,}/g, ' ')         // Collapse spaces
    .replace(/\s*{\s*/g, '{')        // Remove space around {
    .replace(/\s*}\s*/g, '}')        // Remove space around }
    .replace(/\s*:\s*/g, ':')        // Remove space around :
    .replace(/\s*;\s*/g, ';')        // Remove space around ;
    .replace(/;\}/g, '}')            // Remove last semicolon before }
    .trim();
}
```

**Purpose:** Reduce file size by removing whitespace.

**Basic minification:**
Not as aggressive as UglifyJS/Terser, but good enough for user-generated content.

#### 2.6.4 Clipboard Functions (Lines 94-130)

**copyHTMLToClipboard (Lines 94-110):**
```javascript
export async function copyHTMLToClipboard(html) {
  try {
    await navigator.clipboard.writeText(html);
    return { success: true };
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = html;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success };
  }
}
```

**Modern API:** `navigator.clipboard.writeText()` (async)

**Fallback:** `document.execCommand('copy')` for older browsers
- Create hidden textarea
- Set its value
- Select it
- Execute copy command
- Remove textarea

**copyCSSToClipboard:** Same pattern for CSS.

#### 2.6.5 Size Calculation (Lines 135-151)

**formatFileSize (Lines 135-141):**
```javascript
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
```

**Algorithm:**
1. Calculate order of magnitude: log(bytes) / log(1024)
2. Divide bytes by 1024^i
3. Round to 2 decimal places
4. Append unit

**getEstimatedSize (Lines 146-151):**
```javascript
export function getEstimatedSize(html, css) {
  const encoder = new TextEncoder();
  const htmlSize = encoder.encode(html || '').length;
  const cssSize = encoder.encode(css || '').length;
  return htmlSize + cssSize;
}
```

**TextEncoder API:** Converts string to UTF-8 bytes, returns exact byte length.

**Why not string.length?**
JavaScript string length counts UTF-16 code units, not bytes. Emoji and special characters are > 1 byte.

---

### 2.7 AI Analyzer: designAnalyzer.js (946 lines)

Rule-based design issue detector. This is the core intelligence of the app.

#### 2.7.1 Utility Functions (Lines 10-183)

**parseColor (Lines 12-59):**

Converts any color format to RGB object:

```javascript
function parseColor(color) {
  if (!color || color === 'transparent' || ...) return null;

  // RGB/RGBA: "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)"
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
  }

  // Hex: "#ff0000" or "#f00"
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return { r: parseInt(hexMatch[1], 16), g: parseInt(hexMatch[2], 16), b: parseInt(hexMatch[3], 16) };
  }

  // Named colors
  const colorNames = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    ...
  };

  return colorNames[color.toLowerCase()] || null;
}
```

**Returns:** `{r, g, b}` or null if unparseable.

**getLuminance (Lines 61-69):**

Calculates perceived brightness (0-1) using W3C formula:

```javascript
function getLuminance(rgb) {
  if (!rgb) return 1;
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
```

**Gamma correction:** The `.map()` function applies sRGB gamma correction.

**Weighted formula:** Eyes are more sensitive to green (0.7152) than red (0.2126) or blue (0.0722).

**getContrastRatio (Lines 71-81):**

WCAG contrast ratio formula:

```javascript
function getContrastRatio(color1, color2) {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  if (!rgb1 || !rgb2) return 21; // Assume good if can't parse

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

**WCAG Standards:**
- 4.5:1 for normal text
- 3:1 for large text
- 21:1 is maximum (black on white)

**getComponentStyles (Lines 91-117):**

Extracts styles from GrapesJS component:

```javascript
function getComponentStyles(component) {
  if (!component) return {};

  // Get GrapesJS inline styles
  const styles = component.getStyle?.() || {};

  // Also parse style attribute
  const attrs = component.getAttributes?.() || {};
  if (attrs.style) {
    const inlineStyles = {};
    attrs.style.split(';').forEach(rule => {
      const [prop, val] = rule.split(':').map(s => s?.trim());
      if (prop && val) {
        inlineStyles[prop] = val;
      }
    });
    Object.assign(styles, inlineStyles);
  }

  return styles;
}
```

**Two sources:**
1. GrapesJS style object (managed by editor)
2. Raw style attribute (from templates)

**getComputedStylesFromFrame (Lines 120-182):**

Gets ACTUAL rendered styles from iframe DOM:

```javascript
function getComputedStylesFromFrame(component, editor) {
  try {
    const frame = editor.Canvas?.getFrame?.();
    const frameDocument = frame?.el?.contentDocument;

    const componentId = component.getId?.() || component.ccid;
    const el = frameDocument.querySelector(`[data-gjs-id="${componentId}"]`) ||
               frameDocument.getElementById(componentId);

    if (!el) return {};

    const computed = frameWindow.getComputedStyle(el);
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      padding: computed.padding,
      // ... all properties
      width: el.offsetWidth,
      height: el.offsetHeight
    };
  } catch (e) {
    return {};
  }
}
```

**Why computed styles?**
- CSS inheritance (parent styles)
- Default browser styles
- Actual rendered values

**Why both getComponentStyles and getComputedStylesFromFrame?**
- getComponentStyles: Fast, from GrapesJS data
- getComputedStylesFromFrame: Accurate, but requires iframe access

#### 2.7.2 Analysis Rules (Lines 186-767)

Each rule function:
1. Receives array of components + editor
2. Analyzes them
3. Returns issue object or null

**analyzeSpacing (Lines 188-247):**

Detects sections with too little padding:

```javascript
function analyzeSpacing(components, editor) {
  const issues = [];

  components.forEach(comp => {
    const tagName = (comp.get('tagName') || '').toLowerCase();
    const classes = (comp.getClasses?.() || []).join(' ').toLowerCase();

    // Is this a section-like element?
    const isSectionLike = tagName === 'section' ||
                          tagName === 'article' ||
                          classes.includes('section') ||
                          classes.includes('hero') ||
                          classes.includes('container');

    if (!isSectionLike) return;

    const styles = getComponentStyles(comp);
    const computed = getComputedStylesFromFrame(comp, editor);

    const padding = parsePixelValue(styles.padding || styles['padding-top'] || computed.paddingTop);
    const height = computed.height || 0;

    // Section with content but little padding
    if (height > 100 && padding < 20) {
      issues.push({
        component: comp,
        type: 'tight-padding',
        currentValue: padding,
        suggestedValue: 48
      });
    }
  });

  if (issues.length > 0) {
    return {
      id: 'spacing-tight',
      title: 'Sections need more padding',
      explanation: 'Your content sections are cramped. Adding padding creates breathing room and improves readability.',
      severity: 'medium',
      category: 'spacing',
      affectedElements: issues.slice(0, 3).map(i => i.component),
      preview: {
        type: 'comparison',
        before: `${issues[0].currentValue}px padding`,
        after: '48px padding'
      },
      fix: (ed) => {
        issues.forEach(({ component }) => {
          component.addStyle({ 'padding': '48px 24px' });
        });
      }
    };
  }

  return null;
}
```

**Detection Logic:**
1. Find section-like elements (by tag or class)
2. Check padding value
3. If padding < 20px and height > 100px → issue

**Fix Function:**
```javascript
fix: (ed) => {
  issues.forEach(({ component }) => {
    component.addStyle({ 'padding': '48px 24px' });
  });
}
```

Directly modifies GrapesJS components using `addStyle()` API.

**analyzeTextReadability (Lines 249-302):**

Detects text smaller than 14px:

```javascript
components.forEach(comp => {
  const tagName = (comp.get('tagName') || '').toLowerCase();

  if (!['p', 'span', 'div', 'li', 'td'].includes(tagName)) return;

  const html = comp.toHTML?.() || '';
  const textContent = html.replace(/<[^>]*>/g, '').trim();

  if (textContent.length < 10) return; // Skip short text

  const styles = getComponentStyles(comp);
  const computed = getComputedStylesFromFrame(comp, editor);

  const fontSize = parsePixelValue(styles['font-size'] || computed.fontSize);

  if (fontSize > 0 && fontSize < 14) {
    issues.push({ component: comp, type: 'small-text', currentSize: fontSize });
  }
});
```

**Why check text content length?**
Short snippets (labels, captions) can be smaller. Only flag body text.

**Fix:** Sets font-size to 16px.

**analyzeHeadingHierarchy (Lines 304-367):**

Checks if headings are bigger/bolder than body text:

```javascript
const headings = [];
const bodyText = [];

components.forEach(comp => {
  const tagName = (comp.get('tagName') || '').toLowerCase();
  const fontSize = parsePixelValue(styles['font-size'] || computed.fontSize) || 16;
  const fontWeight = parseInt(styles['font-weight'] || computed.fontWeight) || 400;

  if (['h1', 'h2', 'h3'].includes(tagName)) {
    headings.push({ component: comp, tagName, fontSize, fontWeight });
  } else if (['p', 'span', 'div'].includes(tagName)) {
    const text = comp.toHTML?.().replace(/<[^>]*>/g, '').trim();
    if (text.length > 20) {
      bodyText.push({ fontSize });
    }
  }
});

const avgBodySize = bodyText.reduce((sum, t) => sum + t.fontSize, 0) / bodyText.length;

const weakHeadings = headings.filter(h => {
  if (h.tagName === 'h1') return h.fontSize < avgBodySize * 1.8 || h.fontWeight < 600;
  if (h.tagName === 'h2') return h.fontSize < avgBodySize * 1.4 || h.fontWeight < 500;
  if (h.tagName === 'h3') return h.fontSize < avgBodySize * 1.15 || h.fontWeight < 500;
  return false;
});
```

**Algorithm:**
1. Calculate average body text size
2. Check if each heading is at least:
   - h1: 1.8x body size, 600+ weight
   - h2: 1.4x body size, 500+ weight
   - h3: 1.15x body size, 500+ weight

**Fix:** Sets appropriate size/weight for each heading level.

**analyzeButtonVisibility (Lines 369-444):**

Detects buttons that don't stand out:

```javascript
const isButton = tagName === 'button' ||
                (tagName === 'a' && (classes.includes('btn') || classes.includes('button')));

if (!isButton) return;

const bgColor = styles['background-color'] || styles.background || computed.backgroundColor;
const padding = parsePixelValue(styles.padding || computed.padding);
const fontSize = parsePixelValue(styles['font-size'] || computed.fontSize);

const bgRgb = parseColor(bgColor);
const isTransparent = !bgRgb || bgColor === 'transparent';
const isVeryLight = bgRgb && getLuminance(bgRgb) > 0.85;
const isSmall = padding < 8 || fontSize < 13;

if (isTransparent || isVeryLight || isSmall) {
  weakButtons.push({ component: comp, issue: ... });
}
```

**Button Detection:**
- `<button>` tags
- `<a>` tags with "btn" or "button" class

**Weak Button Criteria:**
- No background color
- Very light background (luminance > 0.85)
- Small padding (< 8px) or font (< 13px)

**Fix:** Applies bold button style with professional blue background.

**analyzeColorContrast (Lines 446-505):**

WCAG contrast compliance:

```javascript
components.forEach(comp => {
  const tagName = (comp.get('tagName') || '').toLowerCase();

  if (!['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'li', 'div', 'button'].includes(tagName)) return;

  const text = comp.toHTML?.().replace(/<[^>]*>/g, '').trim();
  if (text.length < 3) return; // Skip very short text

  const color = styles.color || computed.color;
  const bgColor = styles['background-color'] || computed.backgroundColor;

  if (!color || !bgColor) return;

  const contrast = getContrastRatio(color, bgColor);
  const fontSize = parsePixelValue(styles['font-size'] || computed.fontSize);
  const minContrast = fontSize >= 18 ? 3 : 4.5; // WCAG Level AA

  if (contrast < minContrast) {
    issues.push({ component: comp, contrast, minRequired: minContrast, bgColor });
  }
});
```

**WCAG Levels:**
- Large text (>= 18px): 3:1 minimum
- Normal text: 4.5:1 minimum

**Fix:**
Chooses dark or light text based on background luminance:
```javascript
const bgLum = getLuminance(parseColor(bgColor));
const newColor = bgLum > 0.5 ? '#1a202c' : '#f8fafc';
```

**analyzeClashingColors (Lines 507-640):**

Detects harsh color combinations:

```javascript
function isHarshColor(rgb) {
  if (!rgb) return false;
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max > 0 ? (max - min) / max : 0;
  const brightness = max / 255;

  // Harsh = very saturated AND very bright
  return saturation > 0.8 && brightness > 0.9;
}

function isDarkBackground(rgb) {
  if (!rgb) return false;
  return getLuminance(rgb) < 0.3;
}
```

**Three Issue Types:**

1. **Bright Red Background:**
```javascript
if (bgRgb.r > 180 && bgRgb.g < 100 && bgRgb.b < 100) {
  issues.push({ component: comp, issue: 'bright-red-background' });
}
```

2. **Bright Red Text:**
```javascript
if (textRgb && textRgb.r > 220 && textRgb.g < 50 && textRgb.b < 50) {
  issues.push({ component: comp, issue: 'bright-red-text' });
}
```

3. **Harsh Color on Dark Background:**
```javascript
if (isHarshColor(textRgb) && isDarkBackground(bgRgb)) {
  issues.push({ component: comp, issue: 'harsh-on-dark' });
}
```

**Why detect red specifically?**
Red backgrounds/text are common beginner mistakes and visually jarring.

**analyzeSectionSeparation (Lines 642-709):**

Checks if sections visually separate from each other:

```javascript
sections.forEach(comp => {
  const tagName = (comp.get('tagName') || '').toLowerCase();
  const classes = (comp.getClasses?.() || []).join(' ').toLowerCase();

  const isSectionLike = tagName === 'section' ||
                        tagName === 'article' ||
                        classes.includes('section') ||
                        classes.includes('hero');

  if (!isSectionLike) return;

  const bgColor = styles['background-color'] || styles.background || computed.backgroundColor;
  const marginBottom = parsePixelValue(styles['margin-bottom'] || computed.marginBottom);
  const paddingBottom = parsePixelValue(styles['padding-bottom'] || computed.paddingBottom);

  const hasVisualSeparation =
    (bgColor && bgColor !== 'transparent' && !bgColor.includes('rgba(0, 0, 0, 0)')) ||
    marginBottom > 32 ||
    paddingBottom > 32;

  sections.push({ component: comp, hasVisualSeparation });
});

// Check consecutive sections
for (let i = 0; i < sections.length - 1; i++) {
  if (!sections[i].hasVisualSeparation && !sections[i + 1].hasVisualSeparation) {
    needsSeparation.push(sections[i].component);
  }
}
```

**Visual Separation Methods:**
- Background color different from default
- Large bottom margin (> 32px)
- Large bottom padding (> 32px)

**Fix:** Alternating background colors (#f8fafc and #ffffff).

**analyzeLineLength (Lines 711-766):**

Checks if text lines are too wide:

```javascript
const width = computed.width || 0;
const fontSize = parsePixelValue(styles['font-size'] || computed.fontSize) || 16;

// Approximate characters per line
const charsPerLine = width / (fontSize * 0.5);

if (charsPerLine > 90 && !maxWidth) {
  issues.push({ component: comp, width, charsPerLine: Math.round(charsPerLine) });
}
```

**Readability Rule:** 50-75 characters per line is optimal.

**Estimation:** width / (fontSize * 0.5)
Assumes average character is 0.5em wide.

**Fix:** Sets max-width: 700px to constrain line length.

#### 2.7.3 Main Analyzer (Lines 772-859)

**analyzeDesign function:**

```javascript
export function analyzeDesign(editor, options = {}) {
  if (!editor) return [];

  const { maxSuggestions = 5 } = options;

  // Get all components recursively
  const wrapper = editor.getWrapper();
  if (!wrapper) return [];

  const allComponents = [];

  function collectComponents(component) {
    if (!component) return;
    allComponents.push(component);
    const children = component.components?.();
    if (children) {
      children.forEach(collectComponents);
    }
  }

  collectComponents(wrapper);

  // Skip if canvas is empty
  if (allComponents.length <= 1) {
    return [{
      id: 'empty-canvas',
      title: 'Canvas is empty',
      explanation: 'Add some components from the left panel to start building your page.',
      severity: 'info',
      category: 'structure',
      affectedElements: [],
      preview: null,
      fix: null
    }];
  }

  // Run analysis rules
  const analysisRules = [
    analyzeClashingColors,
    analyzeHeadingHierarchy,
    analyzeButtonVisibility,
    analyzeColorContrast,
    analyzeTextReadability,
    analyzeSpacing,
    analyzeSectionSeparation,
    analyzeLineLength
  ];

  const issues = [];

  for (const rule of analysisRules) {
    try {
      const result = rule(allComponents, editor);
      if (result) {
        issues.push(result);
      }
    } catch (e) {
      console.warn('Design rule failed:', e);
    }
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2, info: 3 };
  issues.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

  return issues.slice(0, maxSuggestions);
}
```

**Component Collection:**
Recursive traversal to flatten component tree.

**Rule Execution:**
Try/catch around each rule prevents one bad rule from crashing entire analysis.

**Sorting:**
High severity issues shown first.

**Limiting:**
Return top N suggestions to avoid overwhelming user.

#### 2.7.4 Highlighting & Undo (Lines 865-945)

**highlightElements (Lines 865-900):**

```javascript
export function highlightElements(elements, editor) {
  if (!editor || !elements || elements.length === 0) return () => {};

  const highlightedEls = [];

  try {
    const frame = editor.Canvas?.getFrame?.();
    const frameDoc = frame?.el?.contentDocument;

    elements.forEach(component => {
      const componentId = component.getId?.() || component.ccid;
      const el = frameDoc.querySelector(`[data-gjs-id="${componentId}"]`) ||
                 frameDoc.getElementById(componentId);

      if (el) {
        el.style.outline = '3px solid #2C5F8D';
        el.style.outlineOffset = '2px';
        el.style.transition = 'outline 0.2s ease';
        highlightedEls.push(el);
      }
    });
  } catch (e) {
    console.warn('Highlight failed:', e);
  }

  // Return cleanup function
  return () => {
    highlightedEls.forEach(el => {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
  };
}
```

**How it works:**
1. Find DOM elements in iframe by GrapesJS ID
2. Add blue outline
3. Return function that removes outline

**Why return cleanup function?**
Caller can remove highlights by calling returned function.

**Undo System (Lines 906-945):**

**applyFixWithUndo:**
```javascript
let undoStack = [];

export function applyFixWithUndo(editor, suggestion) {
  if (!editor || !suggestion || !suggestion.fix) return false;

  // Snapshot FULL project data
  const projectData = editor.getProjectData?.();
  if (!projectData) return false;

  undoStack.push({ id: suggestion.id, projectData, timestamp: Date.now() });
  if (undoStack.length > 10) undoStack = undoStack.slice(-10);

  try {
    suggestion.fix(editor);
    return true;
  } catch (e) {
    console.error('Fix failed:', e);
    undoStack.pop(); // Remove snapshot if fix failed
    return false;
  }
}
```

**Why getProjectData() not getHtml()+getCss()?**

GrapesJS components have internal IDs. When you call:
```javascript
const html = editor.getHtml();
const css = editor.getCss();
editor.setComponents(html); // REGENERATES IDs!
```

New components get new IDs, breaking CSS rules that reference old IDs.

**getProjectData()** preserves internal structure with IDs intact.

**undoLastFix:**
```javascript
export function undoLastFix(editor) {
  if (!editor || undoStack.length === 0) return false;

  const lastState = undoStack.pop();
  try {
    editor.loadProjectData?.(lastState.projectData);
    return true;
  } catch (e) {
    console.error('Undo failed:', e);
    return false;
  }
}
```

**Stack Limit:** Only keep last 10 snapshots to avoid memory bloat.

---

### 2.8 OpenAI Analyzer: openaiDesignAdvisor.js (376 lines)

Sends HTML/CSS to OpenAI for AI-powered analysis.

#### 2.8.1 System Prompt (Lines 3-58)

```javascript
export const DESIGN_BASIS_PROMPT = `You are an expert web design reviewer analyzing a website for visual and UX issues.
You must analyze the ACTUAL HTML and CSS provided, not give generic advice.

CRITICAL ANALYSIS AREAS (check each one):

1. COLOR CONTRAST & ACCESSIBILITY:
   - Look for text colors that clash with backgrounds (e.g., bright red #ff0000 on dark backgrounds)
   - Check for low contrast combinations that are hard to read
   - Flag neon/fluorescent colors that hurt eyes

2. VISUAL HIERARCHY:
   - Are headings clearly larger/bolder than body text?
   - Do buttons stand out with contrasting backgrounds?
   - Is there clear visual separation between sections?

3. SPACING & LAYOUT:
   - Are sections cramped with little padding?
   - Is there consistent spacing throughout?
   - Do elements feel properly aligned?

4. TYPOGRAPHY:
   - Is text too small (under 14px)?
   - Are line heights too tight for readability?
   - Is letter spacing appropriate?

5. CONSISTENCY:
   - Are similar elements styled the same way?
   - Are colors from a cohesive palette?
   - Do buttons/links have consistent styling?

IMPORTANT:
- ONLY report issues you actually see in the provided HTML/CSS
- Be specific about which elements have problems (use tag names, classes, or describe location)
- Include the actual problematic values in your "before" preview
- Suggest specific CSS fixes in your "after" preview

Output JSON format:
{
  "suggestions": [
    {
      "id": "kebab-case-id",
      "title": "Short problem description",
      "explanation": "Specific issue found in the provided code and why it's a problem",
      "severity": "high" | "medium" | "info",
      "category": "color" | "spacing" | "hierarchy" | "readability" | "consistency",
      "cssSelector": "CSS selector for the problematic element (if applicable)",
      "preview": {
        "type": "comparison",
        "before": "Current problematic value",
        "after": "Suggested fix"
      }
    }
  ]
}

Do not return markdown, code fences, or generic advice.`;
```

**Key Directives:**

1. **Analyze actual code** - Not generic tips
2. **Be specific** - Name exact elements with problems
3. **Include values** - Show current bad value and suggested fix
4. **Structured output** - JSON only, no markdown

**Why so prescriptive?**
GPT models tend to give generic advice without this. The prompt forces concrete analysis.

#### 2.8.2 Response Schema (Lines 179-215)

```javascript
const RESPONSE_SCHEMA = {
  name: 'design_suggestions',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            explanation: { type: 'string' },
            severity: { type: 'string', enum: ['high', 'medium', 'info'] },
            category: { type: 'string', enum: ['color', 'spacing', 'hierarchy', 'readability', 'consistency'] },
            cssSelector: { type: 'string' },
            preview: {
              type: 'object',
              additionalProperties: false,
              properties: {
                type: { type: 'string', enum: ['comparison'] },
                before: { type: 'string' },
                after: { type: 'string' }
              },
              required: ['type', 'before', 'after']
            }
          },
          required: ['id', 'title', 'explanation', 'severity', 'category', 'cssSelector', 'preview']
        }
      }
    },
    required: ['suggestions']
  }
};
```

**Structured Output:**
OpenAI's new feature (Nov 2024) that enforces JSON schema.

**Benefits:**
- No more parsing failures
- Guaranteed valid structure
- No markdown code fences to strip

**strict: true:**
Model MUST follow schema exactly or return error.

#### 2.8.3 Main Analysis Function (Lines 267-375)

```javascript
export async function analyzeDesignWithOpenAI({ html, css, maxSuggestions = 5 }) {
  const apiKey = (process.env.REACT_APP_OPENAI_API_KEY || '').trim();

  console.log('[OpenAI] Checking API key...');
  console.log('[OpenAI] Key exists:', !!apiKey);
  console.log('[OpenAI] Key length:', apiKey.length);
  console.log('[OpenAI] Key prefix:', apiKey.substring(0, 7) + '...');

  if (!apiKey) {
    console.warn('[OpenAI] No API key found...');
    return { error: 'NO_API_KEY', suggestions: [] };
  }

  // Extract design context
  const context = extractDesignContext(html, css);

  // Build user message
  let contextInfo = '';
  if (context.colors.size > 0) {
    contextInfo += `\nColors used: ${[...context.colors].slice(0, 10).join(', ')}`;
  }
  if (context.fontSizes.size > 0) {
    contextInfo += `\nFont sizes: ${[...context.fontSizes].join(', ')}`;
  }
  if (context.potentialIssues.length > 0) {
    contextInfo += `\n\nPOTENTIAL ISSUES TO CHECK:\n${context.potentialIssues.map(i => `- ${i}`).join('\n')}`;
  }

  const userMessage = `Analyze this webpage and return at most ${maxSuggestions} specific suggestions based on actual issues found.
${contextInfo}

HTML:
${html || '<empty>'}

CSS:
${css || '<empty>'}

Remember: Only report issues you actually see in the code above. Be specific about elements and values.`;

  console.log('[OpenAI] Making API request...');

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: {
          type: 'json_schema',
          json_schema: RESPONSE_SCHEMA
        },
        messages: [
          { role: 'system', content: DESIGN_BASIS_PROMPT },
          { role: 'user', content: userMessage }
        ]
      })
    });
  } catch (networkError) {
    console.error('[OpenAI] Network error:', networkError.message);
    return { error: 'NETWORK_ERROR', message: networkError.message, suggestions: [] };
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error('[OpenAI] API error:', response.status, errorBody);

    if (response.status === 401) {
      return { error: 'INVALID_API_KEY', message: 'API key is invalid or expired', suggestions: [] };
    } else if (response.status === 429) {
      return { error: 'RATE_LIMIT', message: 'Rate limit exceeded. Try again later.', suggestions: [] };
    } else if (response.status === 404) {
      return { error: 'MODEL_NOT_FOUND', message: 'AI model not available', suggestions: [] };
    }
    return { error: 'API_ERROR', message: `API error (${response.status})`, suggestions: [] };
  }

  const data = await response.json();
  console.log('[OpenAI] Response received:', data.usage);
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    console.warn('[OpenAI] No content in response');
    return { suggestions: [] };
  }

  let parsed;
  try {
    parsed = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (parseError) {
    console.error('[OpenAI] Failed to parse response:', parseError);
    return { suggestions: [] };
  }

  const suggestions = Array.isArray(parsed?.suggestions) ? parsed.suggestions.slice(0, maxSuggestions) : [];
  console.log('[OpenAI] Got', suggestions.length, 'suggestions');
  return { suggestions: normalizeSuggestions(suggestions) };
}
```

**API Configuration:**

**Model:** gpt-4o-mini
- Fast, cheap ($0.15/1M input tokens)
- Good enough for design analysis
- Not overkill like GPT-4

**Temperature:** 0.3
- Low temperature = more consistent
- Reduces randomness in suggestions

**extractDesignContext (Lines 218-265):**

Pre-processes HTML/CSS to help GPT focus:

```javascript
function extractDesignContext(html, css) {
  const context = {
    colors: new Set(),
    fontSizes: new Set(),
    elements: [],
    potentialIssues: []
  };

  // Extract colors
  const colorRegex = /#[a-fA-F0-9]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g;
  const colors = (css || '').match(colorRegex) || [];
  colors.forEach(c => context.colors.add(c));

  // Extract font sizes
  const fontSizeRegex = /font-size:\s*(\d+(?:\.\d+)?(?:px|em|rem))/g;
  let match;
  while ((match = fontSizeRegex.exec(css || '')) !== null) {
    context.fontSizes.add(match[1]);
  }

  // Detect potential issues
  if (css?.includes('#ff0000') || css?.includes('rgb(255, 0, 0)')) {
    context.potentialIssues.push('Bright red (#ff0000) color detected');
  }

  const smallFonts = [...context.fontSizes].filter(s => {
    const num = parseFloat(s);
    return s.includes('px') && num < 14;
  });
  if (smallFonts.length > 0) {
    context.potentialIssues.push(`Small font sizes detected: ${smallFonts.join(', ')}`);
  }

  return context;
}
```

**Why pre-extract?**
Helps GPT focus on specific issues. Instead of "analyze this", we say "here are the colors used, check if #ff0000 is a problem".

**normalizeSuggestions (Lines 60-84):**

Ensures every suggestion has correct structure:

```javascript
function normalizeSuggestions(items = []) {
  return items.map((item, index) => {
    const suggestion = {
      id: item.id || `ai-suggestion-${index + 1}`,
      title: item.title || 'Design improvement',
      explanation: item.explanation || 'Suggested by AI analysis.',
      severity: item.severity || 'info',
      category: item.category || 'consistency',
      cssSelector: item.cssSelector || null,
      preview: item.preview || {
        type: 'comparison',
        before: 'Current design',
        after: 'Improved design'
      },
      affectedElements: [],
      fix: null
    };

    // Try to create a fix function
    if (suggestion.cssSelector && suggestion.preview?.after) {
      suggestion.fix = createAIFix(suggestion);
    }

    return suggestion;
  });
}
```

**createAIFix (Lines 87-109):**

Attempts to auto-generate fix function from AI suggestion:

```javascript
function createAIFix(suggestion) {
  return (ed) => {
    try {
      const wrapper = ed.getWrapper();
      if (!wrapper) return;

      const components = findComponentsBySelector(wrapper, suggestion.cssSelector);

      // Parse "after" text to extract CSS properties
      const cssProperties = parseCSSFromSuggestion(suggestion.preview.after);

      components.forEach(comp => {
        if (cssProperties && Object.keys(cssProperties).length > 0) {
          comp.addStyle(cssProperties);
        }
      });
    } catch (e) {
      console.warn('AI fix failed:', e);
    }
  };
}
```

**Limitations:**
Only works for simple cases (color changes, font size). Complex fixes can't be auto-generated.

**parseCSSFromSuggestion (Lines 146-177):**

Regex-based CSS extraction from natural language:

```javascript
function parseCSSFromSuggestion(afterText) {
  const properties = {};

  // Color: "#e53e3e (softer)" → background-color: #e53e3e
  const colorMatch = afterText.match(/#[a-fA-F0-9]{3,6}/);
  if (colorMatch) {
    if (afterText.toLowerCase().includes('background')) {
      properties['background-color'] = colorMatch[0];
    } else if (afterText.toLowerCase().includes('text') || afterText.toLowerCase().includes('color')) {
      properties['color'] = colorMatch[0];
    }
  }

  // Font size: "16px bold" → font-size: 16px
  const fontSizeMatch = afterText.match(/(\d+)px/);
  if (fontSizeMatch && afterText.toLowerCase().includes('font')) {
    properties['font-size'] = `${fontSizeMatch[1]}px`;
  }

  // Font weight: "bold" or "700" → font-weight: 700
  if (afterText.toLowerCase().includes('bold') || afterText.includes('700')) {
    properties['font-weight'] = '700';
  }

  return properties;
}
```

**Why heuristic parsing?**
GPT gives natural language like "softer red #dc2626". We extract the color code with regex.

---

### 2.9 Data: components.js & templates.js

These files define the component library and starter templates.

#### 2.9.1 components.js Structure

```javascript
export const COMPONENTS = [
  {
    id: 'navbar',
    label: 'Navigation Bar',
    description: 'Site-wide top navigation',
    category: 'Layout',
    keywords: ['professional', 'corporate', 'navigation', 'formal'],
    content: `<nav style="...">...</nav>`
  },
  {
    id: 'hero',
    label: 'Hero Section',
    description: 'Big attention-grabbing intro block',
    category: 'Content',
    keywords: ['visual', 'creative', 'call-to-action', 'feature', 'landing'],
    content: `<section style="...">...</section>`
  },
  // ... 26 more components
];
```

**Fields:**

- **id:** Unique identifier (used by suggestions system)
- **label:** Display name in component library
- **description:** Short explanation
- **category:** Layout, Content, Interactive, Forms
- **keywords:** For smart suggestions (e.g., "professional" sites suggest "navbar")
- **content:** HTML string (all styles inline for portability)

**Why inline styles?**
Component can be added to any project without external CSS dependencies.

**28 Components Total:**

**Layout (5):** navbar, header, footer, two-column, divider

**Content (9):** hero, text-block, image-text, feature-card, testimonial, cta-section, stats-grid, pricing-card, faq-item

**Interactive (7):** button-primary, button-outline, link, badge, animated-gradient-button, yearly-toggle, icon-button

**Forms (7):** input-field, textarea, checkbox, radio, dropdown, newsletter-form, contact-form

#### 2.9.2 templates.js Structure

```javascript
export const TEMPLATES = [
  {
    id: 'blank',
    label: 'Blank Page',
    description: 'Start with an empty canvas',
    category: 'Basic',
    thumbnail: null,
    content: ''
  },
  {
    id: 'landing',
    label: 'Landing Page',
    description: 'Modern landing page with hero and features',
    category: 'Marketing',
    thumbnail: null,
    content: `<section>...</section><section>...</section>...`
  },
  // ... 8 more templates
];
```

**10 Templates:**

1. **Blank Page** - Empty (for experienced users)
2. **Landing Page** - Hero + features + CTA
3. **Business Site** - Navbar + about + services + contact
4. **Portfolio** - Projects grid + about
5. **Blog Layout** - Article listing
6. **Pricing Page** - Pricing cards comparison
7. **Contact Page** - Form + info
8. **Coming Soon** - Countdown + email signup
9. **About Page** - Team + mission
10. **Features Page** - Feature grid

**Usage:**
User clicks template in TemplateBrowser → creates new project with this HTML.

---

## Part 3: Key Architectural Patterns & Insights

### 3.1 The Refs Pattern for Async Content Loading

**Problem:** When switching views, React unmounts/remounts components. Can't pass data to a component that doesn't exist yet.

**Solution:** Use refs to store pending data.

```javascript
const pendingTemplateRef = useRef(null);

// When user clicks "Open Project"
pendingTemplateRef.current = project.content;
setCurrentView('editor');

// Later, when Canvas mounts and editor initializes
useEffect(() => {
  if (editor && pendingTemplateRef.current !== null) {
    const content = pendingTemplateRef.current;
    pendingTemplateRef.current = null; // Clear
    editor.setComponents(content);
  }
}, [editor]);
```

**Why not state?**
State triggers re-renders. Refs survive re-renders without causing them.

### 3.2 The Dual-Storage Pattern

**Two localStorage systems:**

1. **Quick Access:** `wb_content`
   - Latest editor content
   - Single string
   - Fast to load on refresh

2. **Project Archive:** `wb_projects_{userId}`
   - Array of all projects
   - Full metadata (name, timestamps)
   - Slower to load/save (must parse/stringify whole array)

**Why both?**
Opening editor should be instant. Loading project list can be slower (only happens on dashboard).

### 3.3 The Component Tree Traversal Pattern

GrapesJS stores components in a tree:

```
Wrapper (body)
├─ Section
│  ├─ Heading
│  └─ Paragraph
└─ Section
   └─ Button
```

**Flattening for analysis:**

```javascript
const allComponents = [];

function collectComponents(component) {
  allComponents.push(component);
  const children = component.components?.();
  if (children) {
    children.forEach(collectComponents);
  }
}

collectComponents(wrapper);
// allComponents now contains [Wrapper, Section, Heading, Paragraph, Section, Button]
```

**Used by:**
- Design analyzer (needs to check every element)
- Smart suggestions (keyword extraction from all components)

### 3.4 The Cleanup Function Pattern

Many effects return cleanup functions:

```javascript
useEffect(() => {
  const onSelect = () => { /* ... */ };

  editor.on('component:selected', onSelect);

  return () => {
    editor.off('component:selected', onSelect);
  };
}, [editor]);
```

**Why cleanup?**
Prevents memory leaks. Without cleanup, event listeners pile up on re-renders.

**Also used for:**
- Highlight removal
- Media query listeners
- Timer cancellation

### 3.5 The Snapshot-Based Undo Pattern

**Challenge:** Undo in a visual editor is hard. Can't just replay operations (order matters).

**Solution:** Full-state snapshots.

```javascript
// Before applying fix
const snapshot = editor.getProjectData(); // Entire editor state
undoStack.push(snapshot);

// Apply fix
suggestion.fix(editor);

// Undo
editor.loadProjectData(snapshot); // Restore entire state
```

**Trade-off:**
- ✅ Simple, always works
- ❌ Memory-intensive (limited to 10 snapshots)

### 3.6 The Dual AI System

**Why two analyzers?**

**Local (Rule-Based):**
- ✅ Instant
- ✅ No API cost
- ✅ Generates fix functions automatically
- ❌ Limited to hardcoded rules
- ❌ Can't adapt to new design trends

**OpenAI (AI-Based):**
- ✅ Understands context and nuance
- ✅ Can explain WHY something is bad
- ✅ Adapts to any design pattern
- ❌ Slow (2-5 seconds)
- ❌ Costs money ($0.001 per analysis)
- ❌ Fix generation is heuristic

**Combination:** Best of both worlds. Show instant feedback, then enhance with AI insights.

---

## Part 4: Critical Code Paths

### 4.1 Adding a Component (Full Flow)

1. **User clicks component in ComponentLibrary**
2. `addBuiltinComponent(componentId)` called
3. Find component in COMPONENTS array
4. Check if should go at top: `isTopPlacement(componentId)`
5. Call GrapesJS: `editor.addComponents(content, opts)`
6. GrapesJS parses HTML string → creates component tree
7. Inserts into DOM at specified position
8. Fires `component:add` event
9. **Three listeners react:**
   - Canvas autosave: schedules save after 800ms
   - Canvas auto-scroll: scrolls into view, refreshes overlays
   - ComponentLibrary suggestions: re-analyzes keywords
10. After 800ms: autosave triggers
11. `handleSave()` in App.js saves to localStorage + project array

### 4.2 Analyzing Design (Full Flow)

1. **User clicks "Analyze" in RightSidebar**
2. `handleAnalyze()` called
3. **Local Analysis:**
   - `analyzeDesign(editor)` called
   - Collects all components via tree traversal
   - Runs 8 analysis rules in sequence
   - Each rule returns issue object or null
   - Collects all issues, sorts by severity
4. **OpenAI Analysis (Parallel):**
   - `analyzeDesignWithOpenAI()` called
   - Extracts design context (colors, fonts)
   - Builds prompt with context + HTML + CSS
   - Makes fetch() call to OpenAI API
   - Waits for response (2-5 seconds)
   - Parses JSON response
   - Normalizes suggestions
5. **Merge Results:**
   - Combine local + AI suggestions
   - Deduplicate by ID
   - Update state: `setSuggestions(combined)`
6. **Render:**
   - Each suggestion displays in list
   - Mouse over → highlights affected elements
   - Click "Apply Fix" → runs fix function → removes from list

### 4.3 Saving a Project (Full Flow)

1. **User edits something in editor**
2. GrapesJS fires event (e.g., `component:update`)
3. Canvas autosave listener triggers
4. `scheduleSave()` clears old timer, sets new 800ms timer
5. **800ms passes without new edits**
6. Timer callback executes:
   ```javascript
   const html = editor.getHtml();
   const css = editor.getCss();
   localStorage.setItem(SAVE_KEY, html);
   onSave({ html, css });
   ```
7. **App.js handleSave() runs:**
   - Combine HTML + CSS
   - Find current project in array
   - Update content and updatedAt timestamp
   - Stringify entire array
   - Write to `wb_projects_{userId}` key
8. **Show "Saved" indicator:**
   - Set saveStatus to 'saved'
   - After 2 seconds, clear indicator

### 4.4 Exporting a Project (Full Flow)

1. **User clicks "Download" button**
2. Sets `showExportModal` to true
3. **ExportModal renders:**
   - Gets fresh HTML/CSS from editor
   - Displays options (separate/single, minified)
4. **User clicks "Download ZIP"**
5. `exportAsZip()` called:
   - Creates JSZip instance
   - If separate: creates index.html + style.css
   - If single: creates index.html with inline CSS
   - Calls `createHTMLFile()` to wrap content
   - If minified: applies regex-based minification
   - Generates ZIP blob: `zip.generateAsync()`
6. **Download mechanism:**
   - Creates blob URL
   - Creates temporary `<a>` element
   - Sets href to blob URL
   - Sets download attribute to filename
   - Clicks the link (triggers browser download)
   - Removes link from DOM
   - Revokes blob URL
7. Modal closes, user has ZIP file

---

## Summary

This is a **6,600-line visual website builder** that:

1. **Wraps GrapesJS** (third-party editor) with custom UI and features
2. **Stores everything in localStorage** (no backend required)
3. **Uses dual AI analysis** (local rules + OpenAI API) for design feedback
4. **Manages complex state** with React hooks, refs, and view routing
5. **Handles edge cases** like async content loading, iframe DOM manipulation, and undo/redo

**Core Technologies:**
- React 18 (hooks, concurrent mode)
- GrapesJS (visual editor engine)
- JSZip (file export)
- DOMPurify (XSS protection)
- OpenAI API (design analysis)

**Key Patterns:**
- Refs for async content queuing
- Dual storage for performance
- Tree traversal for analysis
- Snapshot-based undo
- Rule-based + AI hybrid analysis
- Event-driven autosave

The architecture is surprisingly sophisticated for a no-backend app. Every piece serves a purpose, from the ref-based content loading to the iframe highlight system.
