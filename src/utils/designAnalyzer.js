function parseColor(color) {
  if (!color || color === 'transparent' || color === 'inherit' || color === 'initial' || color === 'none') {
    return null;
  }

  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }

  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16)
    };
  }

  const shortHexMatch = color.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
  if (shortHexMatch) {
    return {
      r: parseInt(shortHexMatch[1] + shortHexMatch[1], 16),
      g: parseInt(shortHexMatch[2] + shortHexMatch[2], 16),
      b: parseInt(shortHexMatch[3] + shortHexMatch[3], 16)
    };
  }

  const colorNames = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    green: { r: 0, g: 128, b: 0 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 }
  };

  return colorNames[color.toLowerCase()] || null;
}

function getLuminance(rgb) {
  if (!rgb) return 1;
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  if (!rgb1 || !rgb2) return 21; // Assume good contrast if can't parse

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parsePixelValue(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const match = String(value).match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function getComponentStyles(component) {
  if (!component) return {};

  const styles = component.getStyle?.() || {};

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

function getComputedStylesFromFrame(component, editor) {
  if (!component || !editor) return {};

  try {
    const frame = editor.Canvas?.getFrame?.();
    const frameEl = frame?.el;
    const frameWindow = frameEl?.contentWindow;
    const frameDocument = frameEl?.contentDocument || frameWindow?.document;

    if (!frameDocument) return {};

    const componentId = component.getId?.() || component.ccid;
    if (!componentId) return {};

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
      paddingTop: computed.paddingTop,
      paddingBottom: computed.paddingBottom,
      paddingLeft: computed.paddingLeft,
      paddingRight: computed.paddingRight,
      margin: computed.margin,
      marginTop: computed.marginTop,
      marginBottom: computed.marginBottom,
      lineHeight: computed.lineHeight,
      textAlign: computed.textAlign,
      width: el.offsetWidth,
      height: el.offsetHeight
    };
  } catch (e) {
    return {};
  }
}

function analyzeSpacing(components, editor) {
  const issues = [];
  components.forEach(comp => {
    const tagName = (comp.get('tagName') || '').toLowerCase();
    const classes = (comp.getClasses?.() || []).join(' ').toLowerCase();

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
    const affected = issues.slice(0, 3).map(i => i.component);
    return {
      id: 'spacing-tight',
      title: 'Sections need more padding',
      explanation: 'Your content sections are cramped. Adding padding creates breathing room and improves readability.',
      severity: 'medium',
      category: 'spacing',
      affectedElements: affected,
      preview: {
        type: 'comparison',
        before: `${issues[0].currentValue}px padding`,
        after: '48px padding'
      },
      fix: (ed) => {
        issues.forEach(({ component }) => {
          component.addStyle({
            'padding': '48px 24px'
          });
        });
      }
    };
  }

  return null;
}

function analyzeTextReadability(components, editor) {
  const issues = [];

  components.forEach(comp => {
    const tagName = (comp.get('tagName') || '').toLowerCase();

    if (!['p', 'span', 'div', 'li', 'td'].includes(tagName)) return;

    const html = comp.toHTML?.() || '';
    const textContent = html.replace(/<[^>]*>/g, '').trim();

    if (textContent.length < 10) return;

    const styles = getComponentStyles(comp);
    const computed = getComputedStylesFromFrame(comp, editor);

    const fontSize = parsePixelValue(styles['font-size'] || computed.fontSize);

    if (fontSize > 0 && fontSize < 14) {
      issues.push({
        component: comp,
        type: 'small-text',
        currentSize: fontSize
      });
    }
  });

  if (issues.length > 0) {
    const affected = issues.slice(0, 3).map(i => i.component);
    return {
      id: 'text-small',
      title: 'Text is too small to read',
      explanation: 'Body text should be at least 16px for comfortable reading on screens.',
      severity: 'high',
      category: 'readability',
      affectedElements: affected,
      preview: {
        type: 'comparison',
        before: `${Math.round(issues[0].currentSize)}px`,
        after: '16px'
      },
      fix: (ed) => {
        issues.forEach(({ component }) => {
          component.addStyle({ 'font-size': '16px' });
        });
      }
    };
  }

  return null;
}

function analyzeHeadingHierarchy(components, editor) {
  const headings = [];
  const bodyText = [];

  components.forEach(comp => {
    const tagName = (comp.get('tagName') || '').toLowerCase();
    const styles = getComponentStyles(comp);
    const computed = getComputedStylesFromFrame(comp, editor);

    const fontSize = parsePixelValue(styles['font-size'] || computed.fontSize) || 16;
    const fontWeight = parseInt(styles['font-weight'] || computed.fontWeight) || 400;

    if (['h1', 'h2', 'h3'].includes(tagName)) {
      headings.push({ component: comp, tagName, fontSize, fontWeight });
    } else if (['p', 'span', 'div'].includes(tagName)) {
      const html = comp.toHTML?.() || '';
      const text = html.replace(/<[^>]*>/g, '').trim();
      if (text.length > 20) {
        bodyText.push({ fontSize });
      }
    }
  });

  if (headings.length === 0 || bodyText.length === 0) return null;

  const avgBodySize = bodyText.reduce((sum, t) => sum + t.fontSize, 0) / bodyText.length;

  const weakHeadings = headings.filter(h => {
    if (h.tagName === 'h1') return h.fontSize < avgBodySize * 1.8 || h.fontWeight < 600;
    if (h.tagName === 'h2') return h.fontSize < avgBodySize * 1.4 || h.fontWeight < 500;
    if (h.tagName === 'h3') return h.fontSize < avgBodySize * 1.15 || h.fontWeight < 500;
    return false;
  });

  if (weakHeadings.length > 0) {
    return {
      id: 'heading-weak',
      title: 'Headings need more emphasis',
      explanation: 'Your headings blend in with body text. Make them larger and bolder to create clear visual hierarchy.',
      severity: 'high',
      category: 'hierarchy',
      affectedElements: weakHeadings.map(h => h.component),
      preview: {
        type: 'comparison',
        before: `${Math.round(weakHeadings[0].fontSize)}px`,
        after: weakHeadings[0].tagName === 'h1' ? '36px bold' : '28px bold'
      },
      fix: (ed) => {
        weakHeadings.forEach(({ component, tagName }) => {
          const sizes = { h1: '36px', h2: '28px', h3: '22px' };
          component.addStyle({
            'font-size': sizes[tagName] || '24px',
            'font-weight': '700',
            'line-height': '1.2',
            'margin-bottom': '16px'
          });
        });
      }
    };
  }

  return null;
}

function analyzeButtonVisibility(components, editor) {
  const weakButtons = [];

  components.forEach(comp => {
    const tagName = (comp.get('tagName') || '').toLowerCase();
    const classes = (comp.getClasses?.() || []).join(' ').toLowerCase();
    const compHtml = comp.toHTML?.() || '';

    const isButton = tagName === 'button' ||
                    (tagName === 'a' && (classes.includes('btn') || classes.includes('button')));

    if (!isButton) return;

    const styles = getComponentStyles(comp);
    const computed = getComputedStylesFromFrame(comp, editor);

    const bgColor = styles['background-color'] || styles.background || computed.backgroundColor;
    const padding = parsePixelValue(styles.padding || computed.padding);
    const fontSize = parsePixelValue(styles['font-size'] || computed.fontSize);

    const bgRgb = parseColor(bgColor);
    const isTransparent = !bgRgb || bgColor === 'transparent' || bgColor?.includes('rgba(0, 0, 0, 0)');
    const isVeryLight = bgRgb && getLuminance(bgRgb) > 0.85;
    const isSmall = padding < 8 || fontSize < 13;

    if (isTransparent || isVeryLight || isSmall) {
      weakButtons.push({
        component: comp,
        issue: isTransparent ? 'no-bg' : isVeryLight ? 'light-bg' : 'small'
      });
    }
  });

  if (weakButtons.length > 0) {
    return {
      id: 'button-weak',
      title: 'Buttons don\'t stand out',
      explanation: 'Your call-to-action buttons are hard to notice. Use bold colors and adequate padding to draw attention.',
      severity: 'high',
      category: 'hierarchy',
      affectedElements: weakButtons.map(b => b.component),
      preview: {
        type: 'visual',
        description: 'Bold blue button with proper padding'
      },
      fix: (ed) => {
        weakButtons.forEach(({ component }) => {
          component.addStyle({
            'background-color': '#2C5F8D',
            'color': '#ffffff',
            'padding': '12px 28px',
            'font-size': '16px',
            'font-weight': '600',
            'border-radius': '8px',
            'border': 'none',
            'cursor': 'pointer',
            'text-decoration': 'none',
            'display': 'inline-block'
          });
        });
      }
    };
  }

  return null;
}

function analyzeColorContrast(components, editor) {
  const issues = [];

  components.forEach(comp => {
    const tagName = (comp.get('tagName') || '').toLowerCase();

    if (!['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'li', 'div', 'button'].includes(tagName)) return;

    const html = comp.toHTML?.() || '';
    const text = html.replace(/<[^>]*>/g, '').trim();
    if (text.length < 3) return;

    const styles = getComponentStyles(comp);
    const computed = getComputedStylesFromFrame(comp, editor);

    const color = styles.color || computed.color;
    const bgColor = styles['background-color'] || computed.backgroundColor;

    if (!color || !bgColor) return;

    const contrast = getContrastRatio(color, bgColor);
    const fontSize = parsePixelValue(styles['font-size'] || computed.fontSize);
    const minContrast = fontSize >= 18 ? 3 : 4.5;

    if (contrast < minContrast) {
      issues.push({
        component: comp,
        contrast,
        minRequired: minContrast,
        bgColor
      });
    }
  });

  if (issues.length > 0) {
    return {
      id: 'contrast-low',
      title: 'Text contrast is too low',
      explanation: 'Some text doesn\'t have enough contrast with its background, making it hard to read.',
      severity: 'high',
      category: 'readability',
      affectedElements: issues.slice(0, 3).map(i => i.component),
      preview: {
        type: 'comparison',
        before: `${issues[0].contrast.toFixed(1)}:1 contrast`,
        after: `${issues[0].minRequired}:1+ (accessible)`
      },
      fix: (ed) => {
        issues.forEach(({ component, bgColor }) => {
          const bgLum = getLuminance(parseColor(bgColor));
          const newColor = bgLum > 0.5 ? '#1a202c' : '#f8fafc';
          component.addStyle({ color: newColor });
        });
      }
    };
  }

  return null;
}

function analyzeClashingColors(components, editor) {
  const issues = [];

  function isHarshColor(rgb) {
    if (!rgb) return false;
    const { r, g, b } = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max > 0 ? (max - min) / max : 0;
    const brightness = max / 255;
    return saturation > 0.8 && brightness > 0.9;
  }

  function isDarkBackground(rgb) {
    if (!rgb) return false;
    return getLuminance(rgb) < 0.3;
  }

  components.forEach(comp => {
    const tagName = (comp.get('tagName') || '').toLowerCase();
    if (!['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'div', 'section', 'header'].includes(tagName)) return;

    const html = comp.toHTML?.() || '';
    const text = html.replace(/<[^>]*>/g, '').trim();

    const styles = getComponentStyles(comp);
    const computed = getComputedStylesFromFrame(comp, editor);

    const color = styles.color || computed.color;
    const bgColor = styles['background-color'] || styles.background || computed.backgroundColor;

    const textRgb = parseColor(color);
    const bgRgb = parseColor(bgColor);

    if (bgRgb) {
      if (bgRgb.r > 180 && bgRgb.g < 100 && bgRgb.b < 100) {
        issues.push({
          component: comp,
          color,
          bgColor,
          issue: 'bright-red-background'
        });
      }
    }

    if (isHarshColor(textRgb) && isDarkBackground(bgRgb)) {
      issues.push({
        component: comp,
        color,
        bgColor,
        issue: 'harsh-on-dark'
      });
    }

    if (textRgb && textRgb.r > 220 && textRgb.g < 50 && textRgb.b < 50) {
      issues.push({
        component: comp,
        color,
        bgColor,
        issue: 'bright-red-text'
      });
    }
  });

  if (issues.length > 0) {
    const firstIssue = issues[0];

    let title, explanation, previewBefore, previewAfter;

    if (firstIssue.issue === 'bright-red-background') {
      title = 'Bright red background is overwhelming';
      explanation = 'Pure red backgrounds are visually intense and can be hard on the eyes. Consider a softer, more muted red or a different accent color.';
      previewBefore = firstIssue.bgColor || '#e53e3e';
      previewAfter = '#dc2626 (softer) or #1e3a5f (dark blue)';
    } else if (firstIssue.issue === 'bright-red-text') {
      title = 'Bright red text is hard to read';
      explanation = 'Bright red text can feel aggressive and is hard to read. Consider a softer red or different accent color.';
      previewBefore = firstIssue.color || '#ff0000';
      previewAfter = '#f87171 (softer red)';
    } else {
      title = 'Harsh color combination detected';
      explanation = 'Very saturated colors on dark backgrounds strain the eyes. Use softer, muted tones instead.';
      previewBefore = firstIssue.color || 'Harsh color';
      previewAfter = '#e2e8f0 (soft gray)';
    }

    return {
      id: 'color-clash',
      title,
      explanation,
      severity: 'high',
      category: 'readability',
      affectedElements: issues.slice(0, 3).map(i => i.component),
      preview: {
        type: 'comparison',
        before: previewBefore,
        after: previewAfter
      },
      fix: (ed) => {
        issues.forEach(({ component, issue }) => {
          if (issue === 'bright-red-background') {
            component.addStyle({ 'background-color': '#991b1b' });
          } else if (issue === 'bright-red-text') {
            component.addStyle({ color: '#f87171' });
          } else {
            component.addStyle({ color: '#e2e8f0' });
          }
        });
      }
    };
  }

  return null;
}

function analyzeSectionSeparation(components, editor) {
  const sections = [];

  components.forEach(comp => {
    const tagName = (comp.get('tagName') || '').toLowerCase();
    const classes = (comp.getClasses?.() || []).join(' ').toLowerCase();

    const isSectionLike = tagName === 'section' ||
                          tagName === 'article' ||
                          classes.includes('section') ||
                          classes.includes('hero') ||
                          classes.includes('features') ||
                          classes.includes('about');

    if (!isSectionLike) return;

    const styles = getComponentStyles(comp);
    const computed = getComputedStylesFromFrame(comp, editor);

    const bgColor = styles['background-color'] || styles.background || computed.backgroundColor;
    const marginBottom = parsePixelValue(styles['margin-bottom'] || computed.marginBottom);
    const paddingBottom = parsePixelValue(styles['padding-bottom'] || computed.paddingBottom);

    const hasVisualSeparation = (bgColor && bgColor !== 'transparent' && !bgColor.includes('rgba(0, 0, 0, 0)')) ||
                                 marginBottom > 32 ||
                                 paddingBottom > 32;

    sections.push({ component: comp, hasVisualSeparation });
  });

  if (sections.length < 2) return null;

  const needsSeparation = [];
  for (let i = 0; i < sections.length - 1; i++) {
    if (!sections[i].hasVisualSeparation && !sections[i + 1].hasVisualSeparation) {
      needsSeparation.push(sections[i].component);
    }
  }

  if (needsSeparation.length > 0) {
    return {
      id: 'section-separation',
      title: 'Sections run together',
      explanation: 'Your content sections blend into each other. Add spacing or alternating backgrounds to separate them clearly.',
      severity: 'medium',
      category: 'structure',
      affectedElements: needsSeparation,
      preview: {
        type: 'visual',
        description: 'Alternating section backgrounds'
      },
      fix: (ed) => {
        needsSeparation.forEach((component, index) => {
          const isEven = index % 2 === 0;
          component.addStyle({
            'padding': '64px 24px',
            'background-color': isEven ? '#f8fafc' : '#ffffff',
            'margin-bottom': '0'
          });
        });
      }
    };
  }

  return null;
}

function analyzeLineLength(components, editor) {
  const issues = [];

  components.forEach(comp => {
    const tagName = (comp.get('tagName') || '').toLowerCase();

    if (!['p', 'div'].includes(tagName)) return;

    const html = comp.toHTML?.() || '';
    const text = html.replace(/<[^>]*>/g, '').trim();

    if (text.length < 100) return;

    const computed = getComputedStylesFromFrame(comp, editor);
    const styles = getComponentStyles(comp);

    const width = computed.width || 0;
    const fontSize = parsePixelValue(styles['font-size'] || computed.fontSize) || 16;
    const maxWidth = parsePixelValue(styles['max-width']);

    const charsPerLine = width / (fontSize * 0.5);

    if (charsPerLine > 90 && !maxWidth) {
      issues.push({
        component: comp,
        width,
        charsPerLine: Math.round(charsPerLine)
      });
    }
  });

  if (issues.length > 0) {
    return {
      id: 'line-length',
      title: 'Text lines are too wide',
      explanation: 'Long lines of text are hard to read. The ideal is 50-75 characters per line.',
      severity: 'medium',
      category: 'readability',
      affectedElements: issues.map(i => i.component),
      preview: {
        type: 'comparison',
        before: `~${issues[0].charsPerLine} chars/line`,
        after: '~65 chars/line'
      },
      fix: (ed) => {
        issues.forEach(({ component }) => {
          component.addStyle({ 'max-width': '700px' });
        });
      }
    };
  }

  return null;
}

export function analyzeDesign(editor, options = {}) {
  if (!editor) return [];

  const { maxSuggestions = 5 } = options;

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
      // ignore
    }
  }

  const severityOrder = { high: 0, medium: 1, low: 2, info: 3 };
  issues.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

  return issues.slice(0, maxSuggestions);
}

export function highlightElements(elements, editor) {
  if (!editor || !elements || elements.length === 0) return () => {};

  const highlightedEls = [];

  try {
    const frame = editor.Canvas?.getFrame?.();
    const frameDoc = frame?.el?.contentDocument;

    if (!frameDoc) return () => {};

    elements.forEach(component => {
      const componentId = component.getId?.() || component.ccid;
      if (!componentId) return;

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

  return () => {
    highlightedEls.forEach(el => {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
  };
}

let undoStack = [];

export function applyFixWithUndo(editor, suggestion) {
  if (!editor || !suggestion || !suggestion.fix) return false;

  const projectData = editor.getProjectData?.();
  if (!projectData) return false;

  undoStack.push({ id: suggestion.id, projectData, timestamp: Date.now() });
  if (undoStack.length > 10) undoStack = undoStack.slice(-10);

  try {
    suggestion.fix(editor);
    return true;
  } catch (e) {
    console.error('Fix failed:', e);
    undoStack.pop();
    return false;
  }
}

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

export function getUndoStackSize() {
  return undoStack.length;
}
