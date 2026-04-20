import React, { useMemo, useCallback } from 'react';
import { Editor } from '@grapesjs/react';
import 'grapesjs/dist/css/grapes.min.css';
import { COMPONENTS } from '../data/components';

const SAVE_KEY = 'wb_content';

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

function Canvas({ onEditorReady, onSave }) {

  const editorOptions = useMemo(() => ({
    height: '100%',
    width: '100%',
    storageManager: false,
    undoManager: { trackSelection: false },
    protectedCss: '',

    panels: { defaults: [] },
    blockManager: { appendTo: '' },
    layerManager: { appendTo: '' },
    traitManager: { appendTo: '' },
    selectorManager: { appendTo: '' },

    canvas: {
      styles: [`data:text/css;charset=utf-8,${encodeURIComponent(CANVAS_BODY_CSS)}`]
    },

    deviceManager: {
      devices: [
        { name: 'Desktop', width: '' },
        { name: 'Tablet', width: '768px', widthMedia: '992px' },
        { name: 'Mobile', width: '375px', widthMedia: '480px' }
      ]
    },

    styleManager: {
      sectors: [
        {
          name: 'Layout',
          open: true,
          properties: [
            {
              name: 'Display', property: 'display', type: 'select', defaults: 'block',
              options: [
                { value: 'block', name: 'Block' },
                { value: 'flex', name: 'Flex' },
                { value: 'inline-flex', name: 'Inline Flex' },
                { value: 'inline-block', name: 'Inline Block' },
                { value: 'inline', name: 'Inline' },
                { value: 'grid', name: 'Grid' },
                { value: 'none', name: 'Hidden' }
              ]
            },
            {
              name: 'Direction', property: 'flex-direction', type: 'select', defaults: 'row',
              options: [
                { value: 'row', name: 'Row →' },
                { value: 'row-reverse', name: 'Row ←' },
                { value: 'column', name: 'Column ↓' },
                { value: 'column-reverse', name: 'Column ↑' }
              ]
            },
            {
              name: 'Align Items', property: 'align-items', type: 'select', defaults: 'stretch',
              options: [
                { value: 'flex-start', name: 'Start' },
                { value: 'center', name: 'Center' },
                { value: 'flex-end', name: 'End' },
                { value: 'stretch', name: 'Stretch' },
                { value: 'baseline', name: 'Baseline' }
              ]
            },
            {
              name: 'Justify', property: 'justify-content', type: 'select', defaults: 'flex-start',
              options: [
                { value: 'flex-start', name: 'Start' },
                { value: 'center', name: 'Center' },
                { value: 'flex-end', name: 'End' },
                { value: 'space-between', name: 'Space Between' },
                { value: 'space-around', name: 'Space Around' },
                { value: 'space-evenly', name: 'Space Evenly' }
              ]
            },
            {
              name: 'Wrap', property: 'flex-wrap', type: 'select', defaults: 'nowrap',
              options: [
                { value: 'nowrap', name: 'No Wrap' },
                { value: 'wrap', name: 'Wrap' },
                { value: 'wrap-reverse', name: 'Wrap Reverse' }
              ]
            },
            { name: 'Gap', property: 'gap', type: 'number', units: ['px', 'rem', '%'], defaults: '0', min: 0, max: 200 }
          ]
        },
        {
          name: 'Spacing',
          open: true,
          properties: [
            { name: 'Padding Top', property: 'padding-top', type: 'number', units: ['px', '%', 'rem'], defaults: '0', min: 0, max: 300 },
            { name: 'Padding Right', property: 'padding-right', type: 'number', units: ['px', '%', 'rem'], defaults: '0', min: 0, max: 300 },
            { name: 'Padding Bottom', property: 'padding-bottom', type: 'number', units: ['px', '%', 'rem'], defaults: '0', min: 0, max: 300 },
            { name: 'Padding Left', property: 'padding-left', type: 'number', units: ['px', '%', 'rem'], defaults: '0', min: 0, max: 300 },
            { name: 'Margin Top', property: 'margin-top', type: 'number', units: ['px', '%', 'rem', 'auto'], defaults: '0', min: -100, max: 300 },
            { name: 'Margin Right', property: 'margin-right', type: 'number', units: ['px', '%', 'rem', 'auto'], defaults: '0', min: -100, max: 300 },
            { name: 'Margin Bottom', property: 'margin-bottom', type: 'number', units: ['px', '%', 'rem', 'auto'], defaults: '0', min: -100, max: 300 },
            { name: 'Margin Left', property: 'margin-left', type: 'number', units: ['px', '%', 'rem', 'auto'], defaults: '0', min: -100, max: 300 }
          ]
        },
        {
          name: 'Size',
          open: false,
          properties: [
            { name: 'Width', property: 'width', type: 'number', units: ['px', '%', 'vw', 'rem', 'auto'], defaults: 'auto', min: 0, max: 2000 },
            { name: 'Height', property: 'height', type: 'number', units: ['px', '%', 'vh', 'rem', 'auto'], defaults: 'auto', min: 0, max: 2000 },
            { name: 'Max Width', property: 'max-width', type: 'number', units: ['px', '%', 'rem', 'none'], defaults: 'none', min: 0, max: 2000 },
            { name: 'Min Height', property: 'min-height', type: 'number', units: ['px', '%', 'vh', 'rem'], defaults: '0', min: 0, max: 2000 }
          ]
        },
        {
          name: 'Typography',
          open: false,
          properties: [
            { name: 'Font Size', property: 'font-size', type: 'number', units: ['px', 'rem', 'em', '%'], defaults: '16px', min: 8, max: 120 },
            {
              name: 'Font Weight', property: 'font-weight', type: 'select', defaults: '400',
              options: [
                { value: '300', name: 'Light 300' },
                { value: '400', name: 'Regular 400' },
                { value: '500', name: 'Medium 500' },
                { value: '600', name: 'Semi-Bold 600' },
                { value: '700', name: 'Bold 700' },
                { value: '800', name: 'Extra Bold 800' }
              ]
            },
            { name: 'Text Color', property: 'color', type: 'color' },
            {
              name: 'Align', property: 'text-align', type: 'radio', defaults: 'left',
              options: [
                { value: 'left', name: 'Left' },
                { value: 'center', name: 'Center' },
                { value: 'right', name: 'Right' },
                { value: 'justify', name: 'Justify' }
              ]
            },
            { name: 'Line Height', property: 'line-height', type: 'number', units: ['', 'px', 'em'], defaults: '1.5', min: 0.5, max: 5, step: 0.1 },
            { name: 'Letter Spacing', property: 'letter-spacing', type: 'number', units: ['px', 'em'], defaults: '0', min: -5, max: 20 },
            {
              name: 'Transform', property: 'text-transform', type: 'select', defaults: 'none',
              options: [
                { value: 'none', name: 'None' },
                { value: 'uppercase', name: 'UPPERCASE' },
                { value: 'lowercase', name: 'lowercase' },
                { value: 'capitalize', name: 'Capitalize' }
              ]
            },
            {
              name: 'Decoration', property: 'text-decoration', type: 'select', defaults: 'none',
              options: [
                { value: 'none', name: 'None' },
                { value: 'underline', name: 'Underline' },
                { value: 'line-through', name: 'Strikethrough' }
              ]
            }
          ]
        },
        {
          name: 'Background',
          open: false,
          properties: [
            { name: 'Color', property: 'background-color', type: 'color' },
            {
              name: 'Image', property: 'background-image', type: 'select', defaults: 'none',
              options: [
                { value: 'none', name: 'None' },
                { value: 'linear-gradient(135deg, #475569 0%, #334155 100%)', name: 'Slate Gradient' },
                { value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Pink Gradient' },
                { value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Blue Gradient' },
                { value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Green Gradient' },
                { value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Sunset Gradient' },
                { value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', name: 'Dark Gradient' }
              ]
            },
            {
              name: 'Size', property: 'background-size', type: 'select', defaults: 'auto',
              options: [
                { value: 'auto', name: 'Auto' },
                { value: 'cover', name: 'Cover' },
                { value: 'contain', name: 'Contain' }
              ]
            }
          ]
        },
        {
          name: 'Border',
          open: false,
          properties: [
            { name: 'Width', property: 'border-width', type: 'number', units: ['px'], defaults: '0', min: 0, max: 20 },
            {
              name: 'Style', property: 'border-style', type: 'select', defaults: 'none',
              options: [
                { value: 'none', name: 'None' },
                { value: 'solid', name: 'Solid' },
                { value: 'dashed', name: 'Dashed' },
                { value: 'dotted', name: 'Dotted' },
                { value: 'double', name: 'Double' }
              ]
            },
            { name: 'Color', property: 'border-color', type: 'color' },
            { name: 'Radius', property: 'border-radius', type: 'number', units: ['px', '%'], defaults: '0', min: 0, max: 200 }
          ]
        },
        {
          name: 'Effects',
          open: false,
          properties: [
            { name: 'Opacity', property: 'opacity', type: 'number', defaults: '1', min: 0, max: 1, step: 0.05 },
            {
              name: 'Box Shadow', property: 'box-shadow', type: 'select', defaults: 'none',
              options: [
                { value: 'none', name: 'None' },
                { value: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)', name: 'XS' },
                { value: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', name: 'Small' },
                { value: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', name: 'Medium' },
                { value: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', name: 'Large' },
                { value: '0 25px 50px -12px rgba(0,0,0,0.25)', name: 'XL' },
                { value: 'inset 0 2px 4px rgba(0,0,0,0.1)', name: 'Inset' }
              ]
            },
            {
              name: 'Overflow', property: 'overflow', type: 'select', defaults: 'visible',
              options: [
                { value: 'visible', name: 'Visible' },
                { value: 'hidden', name: 'Hidden' },
                { value: 'auto', name: 'Auto Scroll' },
                { value: 'clip', name: 'Clip' }
              ]
            },
            {
              name: 'Cursor', property: 'cursor', type: 'select', defaults: 'default',
              options: [
                { value: 'default', name: 'Default' },
                { value: 'pointer', name: 'Pointer' },
                { value: 'text', name: 'Text' },
                { value: 'not-allowed', name: 'Not Allowed' }
              ]
            }
          ]
        }
      ]
    }
  }), []);

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

    COMPONENTS.forEach(component => {
      editor.BlockManager.add(component.id, {
        label: component.label,
        category: component.category,
        content: component.content,
        attributes: { keywords: component.keywords }
      });
    });

    editor.on('component:selected', (component) => {
      const type = component.get('type');
      if (type === 'text' || type === 'default') {
        component.set('editable', true);
      }
    });

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

    const saved = localStorage.getItem(SAVE_KEY);
    if (saved && saved !== '<!-- blank -->') {
      editor.setComponents(saved);
    }

    if (onEditorReady) onEditorReady(editor);
  }, [onEditorReady, onSave]);

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
}

export default Canvas;
