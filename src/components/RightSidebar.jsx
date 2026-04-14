import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from './Icons';
import {
  analyzeDesign, highlightElements, applyFixWithUndo, undoLastFix, getUndoStackSize
} from '../utils/designAnalyzer';
import { analyzeDesignWithOpenAI } from '../utils/openaiDesignAdvisor';

const TAG_EXPLANATIONS = {
  div: { name: 'Container', desc: 'A generic container that groups other elements together' },
  section: { name: 'Section', desc: 'A thematic grouping of content, like a chapter' },
  header: { name: 'Header', desc: 'The top part of a page or section, usually contains logo/nav' },
  footer: { name: 'Footer', desc: 'The bottom part of a page, usually contains copyright/links' },
  nav: { name: 'Navigation', desc: 'Contains links to navigate around your website' },
  main: { name: 'Main Content', desc: 'The primary content area of your page' },
  article: { name: 'Article', desc: 'Self-contained content that could stand on its own' },
  aside: { name: 'Sidebar', desc: 'Content related to but separate from the main content' },
  h1: { name: 'Main Heading', desc: 'The most important title on the page (use only once)' },
  h2: { name: 'Section Heading', desc: 'A major section title' },
  h3: { name: 'Subsection Heading', desc: 'A smaller section title under h2' },
  h4: { name: 'Minor Heading', desc: 'An even smaller heading level' },
  p: { name: 'Paragraph', desc: 'A block of text content' },
  span: { name: 'Inline Text', desc: 'Used to style a portion of text within another element' },
  a: { name: 'Link', desc: 'Clickable text that takes users to another page or section' },
  button: { name: 'Button', desc: 'A clickable element that triggers an action' },
  img: { name: 'Image', desc: 'Displays a picture on your page' },
  ul: { name: 'Bullet List', desc: 'An unordered list with bullet points' },
  ol: { name: 'Numbered List', desc: 'An ordered list with numbers' },
  li: { name: 'List Item', desc: 'A single item in a list' },
  form: { name: 'Form', desc: 'A container for user input fields' },
  input: { name: 'Input Field', desc: 'Where users can type text, numbers, etc.' },
  label: { name: 'Label', desc: 'Text that describes an input field' },
};

const ATTR_EXPLANATIONS = {
  href: 'The URL this link goes to',
  src: 'The source URL of the image or media',
  alt: 'Text description of the image (important for accessibility)',
  class: 'CSS class names for styling',
  style: 'Inline CSS styles applied directly',
  type: 'The type of input or button',
  placeholder: 'Hint text shown before user types',
  target: 'Where to open the link (_blank = new tab)',
  id: 'Unique identifier for the element',
};

const CSS_EXPLANATIONS = {
  'background-color': 'background color of the element',
  'background': 'background image or color',
  'color': 'text color',
  'font-size': 'text size (bigger = easier to read)',
  'font-weight': 'text thickness (700 = bold)',
  'font-family': 'font typeface',
  'padding': 'inner spacing (space inside element)',
  'padding-top': 'top inner spacing',
  'padding-bottom': 'bottom inner spacing',
  'padding-left': 'left inner spacing',
  'padding-right': 'right inner spacing',
  'margin': 'outer spacing (space around element)',
  'margin-top': 'top outer spacing',
  'margin-bottom': 'bottom outer spacing',
  'margin-left': 'left outer spacing',
  'margin-right': 'right outer spacing',
  'width': 'how wide the element is',
  'height': 'how tall the element is',
  'max-width': 'maximum width allowed',
  'min-width': 'minimum width allowed',
  'display': 'layout type (flex, block, inline)',
  'flex-direction': 'flex layout direction (row/column)',
  'justify-content': 'horizontal alignment in flex',
  'align-items': 'vertical alignment in flex',
  'gap': 'spacing between flex/grid items',
  'border': 'border around element',
  'border-radius': 'rounded corners (higher = rounder)',
  'box-shadow': 'drop shadow effect',
  'text-align': 'text alignment (left/center/right)',
  'line-height': 'spacing between lines of text',
  'position': 'positioning mode (static/relative/absolute)',
  'top': 'position from top edge',
  'bottom': 'position from bottom edge',
  'left': 'position from left edge',
  'right': 'position from right edge',
  'z-index': 'stack order (higher = on top)',
  'opacity': 'transparency (1 = solid, 0 = invisible)',
  'cursor': 'mouse cursor style',
  'overflow': 'how to handle overflow content',
  'text-decoration': 'text styling (underline, etc.)',
  'transform': 'rotate, scale, or move element',
  'transition': 'smooth animation between states',
};

function parseValueUnit(val) {
  if (!val && val !== 0) return { num: '', unit: 'px' };
  const v = String(val).trim();
  if (v === 'auto' || v === 'none' || v === 'fit-content' || v === 'max-content' || v === 'min-content') {
    return { num: '', unit: v };
  }
  const m = v.match(/^(-?\d*\.?\d+)\s*(%|px|rem|em|vh|vw|pt|fr|deg)?$/);
  if (m) return { num: m[1], unit: m[2] || 'px' };
  return { num: '', unit: v };
}

function toHex(color) {
  if (!color || color === 'transparent') return '#000000';
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [, r, g, b] = color.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  try {
    const tmp = document.createElement('div');
    tmp.style.color = color;
    document.body.appendChild(tmp);
    const computed = window.getComputedStyle(tmp).color;
    document.body.removeChild(tmp);
    const m = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    }
  } catch (_) {}
  return '#000000';
}

function HelpIcon({ text }) {
  const [show, setShow] = useState(false);
  if (!text) return null;
  return (
    <span
      className="sp-help-icon"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      title={text}
    >
      ?
      {show && <span className="sp-help-tooltip">{text}</span>}
    </span>
  );
}

function ColorField({ label, prop, get, set }) {
  const raw = get(prop) || '';
  const [text, setText] = useState(raw);

  useEffect(() => { setText(get(prop) || ''); }, [get, prop]);

  const applyText = () => { if (text !== get(prop)) set(prop, text); };
  const help = CSS_EXPLANATIONS[prop];

  return (
    <div className="sp-row">
      <span className="sp-label">
        {label}
        <HelpIcon text={help} />
      </span>
      <div className="sp-color-field">
        <input
          type="color"
          value={toHex(text)}
          onChange={e => { setText(e.target.value); set(prop, e.target.value); }}
          className="sp-color-swatch"
          title="Pick a color"
        />
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={applyText}
          onKeyDown={e => e.key === 'Enter' && applyText()}
          className="sp-color-text"
          placeholder="transparent"
        />
      </div>
    </div>
  );
}

function NumberField({ label, prop, get, set, units = ['px', '%', 'rem', 'em', 'auto'], min, max, step = 1 }) {
  const parsed = parseValueUnit(get(prop));
  const isKeyword = ['auto', 'none', 'fit-content', 'max-content', 'min-content'].includes(parsed.unit);
  const help = CSS_EXPLANATIONS[prop];

  const handleNum = (e) => {
    const n = e.target.value;
    if (n === '' && !isKeyword) { set(prop, ''); return; }
    set(prop, n + (parsed.unit || 'px'));
  };

  const handleUnit = (e) => {
    const u = e.target.value;
    if (['auto', 'none', 'fit-content'].includes(u)) {
      set(prop, u);
    } else {
      set(prop, (parsed.num || '0') + u);
    }
  };

  return (
    <div className="sp-row">
      <span className="sp-label">
        {label}
        <HelpIcon text={help} />
      </span>
      <div className="sp-num-unit">
        <input
          type="number"
          value={isKeyword ? '' : (parsed.num || '')}
          onChange={handleNum}
          disabled={isKeyword}
          placeholder={isKeyword ? parsed.unit : '—'}
          min={min}
          max={max}
          step={step}
          className="sp-num-input"
        />
        <select value={parsed.unit || 'px'} onChange={handleUnit} className="sp-unit-sel">
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    </div>
  );
}

function SelectField({ label, prop, get, set, options }) {
  const help = CSS_EXPLANATIONS[prop];
  return (
    <div className="sp-row">
      <span className="sp-label">
        {label}
        <HelpIcon text={help} />
      </span>
      <select
        value={get(prop) || ''}
        onChange={e => set(prop, e.target.value)}
        className="sp-select"
      >
        <option value="">—</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function RadioField({ label, prop, get, set, options }) {
  const help = CSS_EXPLANATIONS[prop];
  const current = get(prop) || '';
  return (
    <div className="sp-row">
      <span className="sp-label">
        {label}
        <HelpIcon text={help} />
      </span>
      <div className="sp-radio-group">
        {options.map(o => (
          <button
            key={o.value}
            className={`sp-radio-btn ${current === o.value ? 'sp-radio-btn--active' : ''}`}
            onClick={() => set(prop, current === o.value ? '' : o.value)}
            title={o.label}
          >
            {o.icon || o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Visual spacing box (padding or margin)
function SpacingBox({ label, topProp, rightProp, bottomProp, leftProp, get, set, color }) {
  const sp = (prop) => {
    const { num } = parseValueUnit(get(prop));
    return num || '0';
  };
  const apply = (prop, raw) => {
    const n = raw === '' ? '0' : raw;
    set(prop, n + 'px');
  };

  return (
    <div className="sp-spacing-box" style={{ '--box-color': color }}>
      <div className="sp-spacing-label">{label}</div>
      <div className="sp-spacing-top">
        <input type="number" value={sp(topProp)} min={-100} max={500}
          onChange={e => apply(topProp, e.target.value)} className="sp-spacing-input" />
      </div>
      <div className="sp-spacing-middle">
        <input type="number" value={sp(leftProp)} min={-100} max={500}
          onChange={e => apply(leftProp, e.target.value)} className="sp-spacing-input" />
        <div className="sp-spacing-center" />
        <input type="number" value={sp(rightProp)} min={-100} max={500}
          onChange={e => apply(rightProp, e.target.value)} className="sp-spacing-input" />
      </div>
      <div className="sp-spacing-bottom">
        <input type="number" value={sp(bottomProp)} min={-100} max={500}
          onChange={e => apply(bottomProp, e.target.value)} className="sp-spacing-input" />
      </div>
    </div>
  );
}

function StyleSector({ title, icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`sp-sector ${open ? 'sp-sector--open' : ''}`}>
      <button className="sp-sector-header" onClick={() => setOpen(p => !p)}>
        <span className="sp-sector-icon">{icon}</span>
        <span className="sp-sector-title">{title}</span>
        <span className="sp-sector-caret">
          <Icons.ChevronRight style={{ width: 14, height: 14, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }} />
        </span>
      </button>
      {open && <div className="sp-sector-body">{children}</div>}
    </div>
  );
}

function StylePanel({ editor, selectedComponent }) {
  const [styles, setStyles] = useState({});

  const syncStyles = useCallback(() => {
    if (!selectedComponent) { setStyles({}); return; }
    try { setStyles({ ...selectedComponent.getStyle() }); }
    catch (_) { setStyles({}); }
  }, [selectedComponent]);

  useEffect(() => {
    syncStyles();
    if (!editor) return;
    editor.on('undo', syncStyles);
    editor.on('redo', syncStyles);
    return () => {
      editor.off('undo', syncStyles);
      editor.off('redo', syncStyles);
    };
  }, [editor, syncStyles]);

  const get = useCallback((prop) => styles[prop] || '', [styles]);

  const set = useCallback((prop, val) => {
    if (!selectedComponent) return;
    selectedComponent.addStyle({ [prop]: val });
    setStyles(prev => ({ ...prev, [prop]: val }));
  }, [selectedComponent]);

  const display = get('display') || 'block';
  const isFlex = display === 'flex' || display === 'inline-flex';
  const isGrid = display === 'grid';

  return (
    <div className="style-panel">

      {/* Layout */}
      <StyleSector title="Layout" icon="⬛" defaultOpen>
        <SelectField label="Display" prop="display" get={get} set={set} options={[
          { value: 'block', label: 'Block' },
          { value: 'flex', label: 'Flex' },
          { value: 'inline-flex', label: 'Inline Flex' },
          { value: 'inline-block', label: 'Inline Block' },
          { value: 'inline', label: 'Inline' },
          { value: 'grid', label: 'Grid' },
          { value: 'none', label: 'Hidden' }
        ]} />

        {(isFlex || isGrid) && (
          <>
            {isFlex && (
              <RadioField label="Direction" prop="flex-direction" get={get} set={set} options={[
                { value: 'row', label: 'Row →', icon: '→' },
                { value: 'column', label: 'Column ↓', icon: '↓' },
                { value: 'row-reverse', label: 'Row ←', icon: '←' },
                { value: 'column-reverse', label: 'Col ↑', icon: '↑' }
              ]} />
            )}
            <SelectField label="Align" prop="align-items" get={get} set={set} options={[
              { value: 'flex-start', label: 'Start' },
              { value: 'center', label: 'Center' },
              { value: 'flex-end', label: 'End' },
              { value: 'stretch', label: 'Stretch' },
              { value: 'baseline', label: 'Baseline' }
            ]} />
            <SelectField label="Justify" prop="justify-content" get={get} set={set} options={[
              { value: 'flex-start', label: 'Start' },
              { value: 'center', label: 'Center' },
              { value: 'flex-end', label: 'End' },
              { value: 'space-between', label: 'Space Between' },
              { value: 'space-around', label: 'Space Around' },
              { value: 'space-evenly', label: 'Space Evenly' }
            ]} />
            {isFlex && (
              <SelectField label="Wrap" prop="flex-wrap" get={get} set={set} options={[
                { value: 'nowrap', label: 'No Wrap' },
                { value: 'wrap', label: 'Wrap' },
                { value: 'wrap-reverse', label: 'Wrap Reverse' }
              ]} />
            )}
            <NumberField label="Gap" prop="gap" get={get} set={set} units={['px', 'rem', '%']} min={0} />
          </>
        )}
      </StyleSector>

      {/* Spacing */}
      <StyleSector title="Spacing" icon="◻" defaultOpen>
        <div className="sp-spacing-group">
          <SpacingBox
            label="Padding" color="rgba(102,126,234,0.12)"
            topProp="padding-top" rightProp="padding-right"
            bottomProp="padding-bottom" leftProp="padding-left"
            get={get} set={set}
          />
          <SpacingBox
            label="Margin" color="rgba(251,191,36,0.15)"
            topProp="margin-top" rightProp="margin-right"
            bottomProp="margin-bottom" leftProp="margin-left"
            get={get} set={set}
          />
        </div>
      </StyleSector>

      {/* Size */}
      <StyleSector title="Size" icon="⤡" defaultOpen={false}>
        <NumberField label="Width" prop="width" get={get} set={set} units={['px', '%', 'vw', 'rem', 'auto']} min={0} />
        <NumberField label="Height" prop="height" get={get} set={set} units={['px', '%', 'vh', 'rem', 'auto']} min={0} />
        <NumberField label="Max Width" prop="max-width" get={get} set={set} units={['px', '%', 'rem', 'none']} min={0} />
        <NumberField label="Min Height" prop="min-height" get={get} set={set} units={['px', '%', 'vh', 'rem']} min={0} />
      </StyleSector>

      {/* Typography */}
      <StyleSector title="Typography" icon="T" defaultOpen={false}>
        <ColorField label="Color" prop="color" get={get} set={set} />
        <NumberField label="Font Size" prop="font-size" get={get} set={set} units={['px', 'rem', 'em', '%']} min={8} max={200} />
        <SelectField label="Weight" prop="font-weight" get={get} set={set} options={[
          { value: '300', label: 'Light 300' },
          { value: '400', label: 'Regular 400' },
          { value: '500', label: 'Medium 500' },
          { value: '600', label: 'Semi-Bold 600' },
          { value: '700', label: 'Bold 700' },
          { value: '800', label: 'Extra Bold 800' },
          { value: '900', label: 'Black 900' }
        ]} />
        <SelectField label="Font Family" prop="font-family" get={get} set={set} options={[
          { value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", label: 'System Sans-serif' },
          { value: "Georgia, 'Times New Roman', serif", label: 'Serif' },
          { value: "'Courier New', Courier, monospace", label: 'Monospace' },
          { value: "Arial, Helvetica, sans-serif", label: 'Arial' },
          { value: "Impact, Haettenschweiler, sans-serif", label: 'Impact' }
        ]} />
        <RadioField label="Align" prop="text-align" get={get} set={set} options={[
          { value: 'left', label: 'Left', icon: '⬅' },
          { value: 'center', label: 'Center', icon: '↔' },
          { value: 'right', label: 'Right', icon: '➡' },
          { value: 'justify', label: 'Justify', icon: '≡' }
        ]} />
        <NumberField label="Line Height" prop="line-height" get={get} set={set} units={['', 'px', 'em']} min={0.5} max={6} step={0.05} />
        <NumberField label="Letter Spacing" prop="letter-spacing" get={get} set={set} units={['px', 'em']} min={-5} max={30} step={0.5} />
        <SelectField label="Transform" prop="text-transform" get={get} set={set} options={[
          { value: 'none', label: 'None' },
          { value: 'uppercase', label: 'UPPERCASE' },
          { value: 'lowercase', label: 'lowercase' },
          { value: 'capitalize', label: 'Capitalize' }
        ]} />
        <SelectField label="Decoration" prop="text-decoration" get={get} set={set} options={[
          { value: 'none', label: 'None' },
          { value: 'underline', label: 'Underline' },
          { value: 'line-through', label: 'Strikethrough' }
        ]} />
      </StyleSector>

      {/* Background */}
      <StyleSector title="Background" icon="🎨" defaultOpen={false}>
        <ColorField label="Color" prop="background-color" get={get} set={set} />
        <SelectField label="Gradient" prop="background-image" get={get} set={set} options={[
          { value: 'none', label: 'None' },
          { value: 'linear-gradient(135deg, #475569 0%, #334155 100%)', label: 'Slate' },
          { value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Pink' },
          { value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Blue' },
          { value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Green' },
          { value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Sunset' },
          { value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', label: 'Dark' }
        ]} />
        <SelectField label="Img Size" prop="background-size" get={get} set={set} options={[
          { value: 'auto', label: 'Auto' },
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' }
        ]} />
      </StyleSector>

      {/* Border */}
      <StyleSector title="Border" icon="□" defaultOpen={false}>
        <NumberField label="Width" prop="border-width" get={get} set={set} units={['px']} min={0} max={20} />
        <SelectField label="Style" prop="border-style" get={get} set={set} options={[
          { value: 'none', label: 'None' },
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
          { value: 'double', label: 'Double' }
        ]} />
        <ColorField label="Color" prop="border-color" get={get} set={set} />
        <NumberField label="Radius" prop="border-radius" get={get} set={set} units={['px', '%']} min={0} max={500} />
      </StyleSector>

      {/* Effects */}
      <StyleSector title="Effects" icon="✨" defaultOpen={false}>
        <div className="sp-row">
          <span className="sp-label">Opacity</span>
          <div className="sp-opacity-row">
            <input
              type="range" min={0} max={1} step={0.01}
              value={parseFloat(get('opacity') || '1')}
              onChange={e => set('opacity', e.target.value)}
              className="sp-opacity-slider"
            />
            <span className="sp-opacity-val">
              {Math.round(parseFloat(get('opacity') || '1') * 100)}%
            </span>
          </div>
        </div>
        <SelectField label="Shadow" prop="box-shadow" get={get} set={set} options={[
          { value: 'none', label: 'None' },
          { value: '0 1px 3px rgba(0,0,0,0.12)', label: 'XS' },
          { value: '0 4px 6px -1px rgba(0,0,0,0.1)', label: 'Small' },
          { value: '0 10px 15px -3px rgba(0,0,0,0.1)', label: 'Medium' },
          { value: '0 20px 25px -5px rgba(0,0,0,0.15)', label: 'Large' },
          { value: '0 25px 50px -12px rgba(0,0,0,0.25)', label: 'XL' },
          { value: 'inset 0 2px 4px rgba(0,0,0,0.1)', label: 'Inset' }
        ]} />
        <SelectField label="Overflow" prop="overflow" get={get} set={set} options={[
          { value: 'visible', label: 'Visible' },
          { value: 'hidden', label: 'Hidden' },
          { value: 'auto', label: 'Auto Scroll' },
          { value: 'clip', label: 'Clip' }
        ]} />
        <SelectField label="Cursor" prop="cursor" get={get} set={set} options={[
          { value: 'default', label: 'Default' },
          { value: 'pointer', label: 'Pointer' },
          { value: 'text', label: 'Text' },
          { value: 'not-allowed', label: 'Not Allowed' },
          { value: 'grab', label: 'Grab' }
        ]} />
      </StyleSector>

    </div>
  );
}

function Tooltip({ children, content, position = 'top' }) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, actualPosition: 'top' });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const tw = 220, th = 60, pad = 10;
    let x = rect.left + rect.width / 2;
    let y = position === 'top' ? rect.top - 8 : rect.bottom + 8;
    let actualPosition = position;
    if (position === 'top' && rect.top - th - pad < 0) { actualPosition = 'bottom'; y = rect.bottom + 8; }
    if (position === 'bottom' && rect.bottom + th + pad > vh) { actualPosition = 'top'; y = rect.top - 8; }
    const hw = tw / 2;
    if (x - hw < pad) x = hw + pad;
    else if (x + hw > vw - pad) x = vw - hw - pad;
    setCoords({ x, y, actualPosition });
    setShow(true);
  };

  return (
    <span className="tooltip-trigger" onMouseEnter={handleMouseEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={`tooltip tooltip--${coords.actualPosition}`} style={{
          position: 'fixed', left: coords.x, top: coords.y, zIndex: 10000,
          transform: coords.actualPosition === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
        }}>
          {content}
        </div>
      )}
    </span>
  );
}

function RightSidebar({ editor }) {
  const [activeTab, setActiveTab] = useState('style');
  const [html, setHtml] = useState('');
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);

  const [suggestions, setSuggestions] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [hoveredSuggestion, setHoveredSuggestion] = useState(null);
  const [undoCount, setUndoCount] = useState(0);
  const [aiError, setAiError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeViewMode, setCodeViewMode] = useState('formatted');

  const cleanupHighlightRef = useRef(null);

  useEffect(() => {
    if (!editor) return;

    const handleSelect = (component) => {
      setHasSelection(true);
      setSelectedComponent(component);
      setSelectedName(component.get('tagName') || component.get('type') || 'element');
      try { setHtml(component.toHTML ? component.toHTML() : ''); }
      catch (_) { setHtml(''); }
    };

    const handleDeselect = () => {
      setHasSelection(false);
      setSelectedComponent(null);
      setSelectedName('');
      setHtml('');
    };

    editor.on('component:selected', handleSelect);
    editor.on('component:deselected', handleDeselect);

    return () => {
      editor.off('component:selected', handleSelect);
      editor.off('component:deselected', handleDeselect);
    };
  }, [editor]);

  useEffect(() => {
    if (activeTab !== 'design' || !hoveredSuggestion) {
      if (cleanupHighlightRef.current) {
        cleanupHighlightRef.current();
        cleanupHighlightRef.current = null;
      }
    }
  }, [activeTab, hoveredSuggestion]);

  // Design analysis
  const runDesignAnalysis = useCallback(async () => {
    if (!editor) return;
    setAnalyzing(true);
    setAiError('');
    setAppliedIds(new Set());
    setDismissedIds(new Set());
    try {
      const localResults = analyzeDesign(editor, { maxSuggestions: 5 }) || [];
      const html = editor.getHtml?.() || '';
      const css = editor.getCss?.() || '';
      let aiSuggestions = [];
      try {
        const aiResult = await analyzeDesignWithOpenAI({ html, css, maxSuggestions: 3 });
        if (aiResult.error) {
          const msgs = {
            NO_API_KEY: 'OpenAI API key not found. Add REACT_APP_OPENAI_API_KEY to .env.',
            INVALID_API_KEY: 'OpenAI API key is invalid or expired.',
            RATE_LIMIT: 'OpenAI rate limit hit. Please wait.',
            NETWORK_ERROR: `Network error: ${aiResult.message || 'Check your connection.'}`,
            API_ERROR: aiResult.message || 'OpenAI API error.'
          };
          setAiError(msgs[aiResult.error] || 'AI analysis unavailable.');
        } else {
          setAiError(null);
          aiSuggestions = aiResult.suggestions || [];
        }
      } catch (_) { setAiError('Unexpected error during AI analysis.'); }
      setSuggestions([...localResults, ...aiSuggestions]);
    } finally {
      setAnalyzing(false);
    }
  }, [editor]);

  const handleApplyFix = useCallback((suggestion) => {
    if (!editor || !suggestion.fix) return;
    const ok = applyFixWithUndo(editor, suggestion);
    if (ok) { setAppliedIds(prev => new Set([...prev, suggestion.id])); setUndoCount(getUndoStackSize()); }
  }, [editor]);

  const handleDismiss = useCallback((id) => setDismissedIds(prev => new Set([...prev, id])), []);

  const handleUndo = useCallback(() => {
    if (!editor) return;
    if (undoLastFix(editor)) { setUndoCount(getUndoStackSize()); runDesignAnalysis(); }
  }, [editor, runDesignAnalysis]);

  const handleSuggestionHover = useCallback((suggestion, isHovering) => {
    if (!editor) return;
    if (cleanupHighlightRef.current) { cleanupHighlightRef.current(); cleanupHighlightRef.current = null; }
    if (isHovering && suggestion?.affectedElements?.length > 0) {
      setHoveredSuggestion(suggestion.id);
      cleanupHighlightRef.current = highlightElements(suggestion.affectedElements, editor);
    } else {
      setHoveredSuggestion(null);
    }
  }, [editor]);

  const visibleSuggestions = suggestions?.filter(s => !dismissedIds.has(s.id)) || [];

  const copyCode = useCallback(() => {
    if (!html) return;
    navigator.clipboard.writeText(formatHtmlRaw(html)).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }, [html]);

  const getTagInfo = (tag) => {
    const t = (tag || '').toLowerCase();
    return TAG_EXPLANATIONS[t] || { name: tag, desc: 'An HTML element' };
  };

  const getSelectedStyles = useCallback(() => {
    if (!selectedComponent) return [];
    return Object.entries(selectedComponent.getStyle?.() || {})
      .filter(([, v]) => v)
      .map(([prop, value]) => ({ prop, value }))
      .slice(0, 10);
  }, [selectedComponent]);

  return (
    <div className="right-sidebar-inner">

      {/* Tab bar */}
      <div className="rs-tabs">
        <button className={`rs-tab ${activeTab === 'style' ? 'rs-tab--active' : ''}`} onClick={() => setActiveTab('style')}>
          <Icons.Palette className="rs-tab-icon" /><span>Style</span>
        </button>
        <button className={`rs-tab ${activeTab === 'design' ? 'rs-tab--active' : ''}`} onClick={() => setActiveTab('design')}>
          <Icons.Sparkles className="rs-tab-icon" /><span>Design</span>
        </button>
        <button className={`rs-tab ${activeTab === 'code' ? 'rs-tab--active' : ''}`} onClick={() => setActiveTab('code')}>
          <Icons.Code className="rs-tab-icon" /><span>Code</span>
        </button>
      </div>

      {/* Tab content */}
      <div className="rs-content">

        {/* ── STYLE TAB ── */}
        {activeTab === 'style' && (
          hasSelection ? (
            <>
              <div className="sp-selection-header">
                <span className="sp-tag-badge">&lt;{selectedName}&gt;</span>
                <span className="sp-tag-hint">Click properties below to edit</span>
              </div>
              <StylePanel
                key={selectedComponent?.cid}
                editor={editor}
                selectedComponent={selectedComponent}
              />
            </>
          ) : (
            <div className="rs-empty-state">
              <Icons.Click className="rs-empty-icon-svg" />
              <p className="rs-empty-title">Nothing selected</p>
              <p className="rs-empty-hint">Click any element on the canvas to style it</p>
            </div>
          )
        )}

        {/* ── DESIGN TAB ── */}
        {activeTab === 'design' && (
          <div>
            <div className="design-header">
              <div className="design-header-top">
                <div>
                  <h4 className="design-title">Improve Design</h4>
                  <p className="design-subtitle">Get suggestions to make your page look better</p>
                </div>
                {undoCount > 0 && (
                  <button className="design-undo-btn" onClick={handleUndo}>
                    <Icons.Undo /> Undo
                  </button>
                )}
              </div>
              <button
                className={`design-analyze-btn ${analyzing ? 'design-analyze-btn--running' : ''}`}
                onClick={runDesignAnalysis}
                disabled={analyzing || !editor}
              >
                {analyzing
                  ? <><span className="design-spinner" />Analyzing...</>
                  : <><Icons.Sparkles />Improve Design</>
                }
              </button>
              {aiError && <p className="design-subtitle" style={{ color: '#ef4444', marginTop: 8 }}>{aiError}</p>}
            </div>

            {suggestions === null && !analyzing && (
              <div className="rs-empty-state">
                <Icons.Wand className="rs-empty-icon-svg" />
                <p className="rs-empty-title">Ready to improve</p>
                <p className="rs-empty-hint">Click the button above to get design suggestions</p>
              </div>
            )}

            {suggestions !== null && visibleSuggestions.length === 0 && (
              <div className="design-all-good">
                <Icons.Party className="design-all-good-icon-svg" />
                <p className="design-all-good-title">Looking great!</p>
                <p className="design-all-good-hint">No design issues found.</p>
              </div>
            )}

            {visibleSuggestions.length > 0 && (
              <div className="suggestion-list">
                <p className="suggestion-count">{visibleSuggestions.length} suggestion{visibleSuggestions.length !== 1 ? 's' : ''}</p>
                {visibleSuggestions.map(suggestion => {
                  const isApplied = appliedIds.has(suggestion.id);
                  const isHovered = hoveredSuggestion === suggestion.id;
                  return (
                    <div
                      key={suggestion.id}
                      className={`suggestion-card ${isApplied ? 'suggestion-card--applied' : ''} ${isHovered ? 'suggestion-card--hovered' : ''} suggestion-card--${suggestion.severity}`}
                      onMouseEnter={() => handleSuggestionHover(suggestion, true)}
                      onMouseLeave={() => handleSuggestionHover(suggestion, false)}
                    >
                      <div className="suggestion-header">
                        <span className={`suggestion-severity suggestion-severity--${suggestion.severity}`}>
                          {suggestion.severity === 'high' ? <Icons.AlertCircle /> : <Icons.InfoCircle />}
                        </span>
                        <h5 className="suggestion-title">{suggestion.title}</h5>
                      </div>
                      <p className="suggestion-explanation">{suggestion.explanation}</p>
                      {suggestion.preview && (
                        <div className="suggestion-preview">
                          {suggestion.preview.type === 'comparison' ? (
                            <div className="suggestion-comparison">
                              <div className="comparison-item comparison-before">
                                <span className="comparison-label">Before</span>
                                <span className="comparison-value">{suggestion.preview.before}</span>
                              </div>
                              <Icons.ArrowRight className="comparison-arrow-icon" />
                              <div className="comparison-item comparison-after">
                                <span className="comparison-label">After</span>
                                <span className="comparison-value">{suggestion.preview.after}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="suggestion-visual-preview">
                              <Icons.Eye className="visual-preview-icon" />
                              <span>{suggestion.preview.description}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="suggestion-actions">
                        {suggestion.fix && !isApplied && (
                          <button className="suggestion-apply-btn" onClick={() => handleApplyFix(suggestion)}>Apply fix</button>
                        )}
                        {isApplied && <span className="suggestion-applied-label"><Icons.Check /> Applied</span>}
                        {!isApplied && (
                          <button className="suggestion-dismiss-btn" onClick={() => handleDismiss(suggestion.id)}>Dismiss</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CODE TAB ── */}
        {activeTab === 'code' && (
          hasSelection ? (
            <div className="code-tab-content">
              <div className="code-element-info">
                <div className="code-element-badge">
                  <code>&lt;{selectedName}&gt;</code>
                  <span className="code-element-name">{getTagInfo(selectedName).name}</span>
                </div>
                <p className="code-element-desc">{getTagInfo(selectedName).desc}</p>
              </div>
              <div className="code-view-toggle">
                <button className={`code-view-btn ${codeViewMode === 'formatted' ? 'code-view-btn--active' : ''}`} onClick={() => setCodeViewMode('formatted')}>Formatted</button>
                <button className={`code-view-btn ${codeViewMode === 'raw' ? 'code-view-btn--active' : ''}`} onClick={() => setCodeViewMode('raw')}>Raw HTML</button>
                <button className="code-copy-btn" onClick={copyCode}>
                  {copiedCode ? <><Icons.Check /> Copied!</> : <><Icons.Copy /> Copy</>}
                </button>
              </div>
              <CodeBlockWithTooltips html={html} formatted={codeViewMode === 'formatted'} />
              {getSelectedStyles().length > 0 && (
                <div className="code-styles-section">
                  <h5 className="code-styles-title">Applied Styles</h5>
                  <div className="code-styles-list">
                    {getSelectedStyles().map(({ prop, value }, i) => (
                      <div key={i} className="code-style-item">
                        <span className="code-style-property">{prop}:</span>
                        <span className="code-style-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="code-learn-section">
                <h5 className="code-learn-title">Learn More</h5>
                <div className="code-learn-links">
                  <a href="https://developer.mozilla.org/en-US/docs/Web/HTML" target="_blank" rel="noopener noreferrer" className="code-learn-link">
                    <Icons.Book /> HTML Basics <Icons.ExternalLink className="external-icon" />
                  </a>
                  <a href="https://developer.mozilla.org/en-US/docs/Web/CSS" target="_blank" rel="noopener noreferrer" className="code-learn-link">
                    <Icons.Palette /> CSS Styling <Icons.ExternalLink className="external-icon" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="rs-empty-state">
              <Icons.CodeBlock className="rs-empty-icon-svg" />
              <p className="rs-empty-title">No element selected</p>
              <p className="rs-empty-hint">Select an element on the canvas to view its code</p>
            </div>
          )
        )}

      </div>
    </div>
  );
}

function CodeBlockWithTooltips({ html, formatted }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const handleMouseOver = (e) => {
    const target = e.target;
    if (!target.classList.contains('ct-hoverable')) { setActiveTooltip(null); return; }
    const type = target.dataset.tooltipType;
    const text = target.dataset.tooltipText;
    if (!type || !text) return;
    const rect = target.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const tw = 220, th = 70, pad = 10;
    let x = rect.left + rect.width / 2;
    let y = rect.top - 8;
    let below = false;
    if (y - th - pad < 0) { below = true; y = rect.bottom + 8; }
    if (below && y + th + pad > vh) { below = false; y = rect.top - 8; }
    const hw = tw / 2;
    if (x - hw < pad) x = hw + pad;
    else if (x + hw > vw - pad) x = vw - hw - pad;
    setActiveTooltip({ type, text, x, y, below });
  };

  const processedHtml = formatted
    ? highlightHtmlWithTooltips(formatHtml(html))
    : escapeHtml(formatHtmlRaw(html));

  return (
    <div className="code-block-wrapper">
      <pre className="code-block" onMouseOver={handleMouseOver} onMouseOut={e => { if (e.target.classList.contains('ct-hoverable')) setActiveTooltip(null); }}>
        <code dangerouslySetInnerHTML={{ __html: processedHtml }} />
      </pre>
      {activeTooltip && (
        <div className="code-tooltip" style={{
          position: 'fixed', left: activeTooltip.x, top: activeTooltip.y, zIndex: 10000,
          transform: activeTooltip.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'
        }}>
          <div className="code-tooltip-title">{activeTooltip.type}</div>
          <div className="code-tooltip-desc">{activeTooltip.text}</div>
        </div>
      )}
    </div>
  );
}

function formatHtml(html) {
  if (!html) return '';
  try {
    let s = html.replace(/\s+id="i[a-z0-9_-]*"/gi, '').replace(/></g, '>\n<');
    const lines = s.split('\n').map(l => l.trim()).filter(Boolean);
    let indent = 0;
    return lines.map(line => {
      const isClose = /^<\//.test(line);
      const isSelf = /<[^>]+\/>$/.test(line);
      if (isClose) indent = Math.max(indent - 1, 0);
      const out = '  '.repeat(indent) + line;
      if (/^<[^/!][^>]*>/.test(line) && !isSelf && !isClose) indent++;
      return out;
    }).join('\n');
  } catch (_) { return html; }
}

function formatHtmlRaw(html) {
  return (html || '').replace(/\s+id="i[a-z0-9_-]*"/gi, '');
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlightHtmlWithTooltips(formatted) {
  if (!formatted) return '';
  let out = escapeHtml(formatted);
  out = out.replace(/&lt;\/([a-zA-Z0-9-]+)/g, (_, tag) => {
    const info = TAG_EXPLANATIONS[tag.toLowerCase()] || { name: tag, desc: 'An HTML element' };
    return `&lt;/<span class="ct-tag ct-hoverable" data-tooltip-type="${info.name}" data-tooltip-text="${info.desc}">${tag}</span>`;
  });
  out = out.replace(/&lt;([a-zA-Z0-9-]+)/g, (_, tag) => {
    const info = TAG_EXPLANATIONS[tag.toLowerCase()] || { name: tag, desc: 'An HTML element' };
    return `&lt;<span class="ct-tag ct-hoverable" data-tooltip-type="${info.name}" data-tooltip-text="${info.desc}">${tag}</span>`;
  });
  out = out.replace(/([a-zA-Z-:]+)=(&quot;[^&]*&quot;)/g, (_, name, val) => {
    const explanation = ATTR_EXPLANATIONS[name] || `The ${name} attribute`;
    let processedVal = val;
    if (name === 'style') {
      processedVal = val.replace(/([a-z-]+):/gi, (_, cssProp) => {
        const cssExplanation = CSS_EXPLANATIONS[cssProp.toLowerCase()] || cssProp;
        return `<span class="ct-css-prop ct-hoverable" data-tooltip-type="${cssProp}" data-tooltip-text="${cssExplanation}">${cssProp}</span>:`;
      });
    }
    return `<span class="ct-attr ct-hoverable" data-tooltip-type="Attribute: ${name}" data-tooltip-text="${explanation}">${name}</span>=<span class="ct-val">${processedVal}</span>`;
  });
  out = out.replace(/&gt;/g, '<span class="ct-bracket">&gt;</span>');
  out = out.split('\n').map(line => {
    const sp = line.match(/^\s*/)[0].length;
    return '&nbsp;'.repeat(sp * 2) + line.trim();
  }).join('<br/>');
  return out;
}

export default RightSidebar;
