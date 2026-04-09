const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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

    // If we have a CSS selector, try to create a fix function
    if (suggestion.cssSelector && suggestion.preview?.after) {
      suggestion.fix = createAIFix(suggestion);
    }

    return suggestion;
  });
}

function createAIFix(suggestion) {
  return (ed) => {
    try {
      // Find components matching the selector
      const wrapper = ed.getWrapper();
      if (!wrapper) return;

      const components = findComponentsBySelector(wrapper, suggestion.cssSelector);

      // Parse the suggested fix from the "after" preview
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

function findComponentsBySelector(wrapper, selector) {
  const results = [];

  function traverse(component) {
    if (!component) return;

    const tagName = (component.get('tagName') || '').toLowerCase();
    const classes = component.getClasses?.() || [];
    const classStr = classes.join(' ').toLowerCase();

    // Simple selector matching
    const selectorLower = selector.toLowerCase();
    const matches =
      selectorLower === tagName ||
      selectorLower === `.${classStr}` ||
      classStr.split(' ').some(c => selectorLower === `.${c}`) ||
      selectorLower.includes(tagName) ||
      (selector.startsWith('h') && tagName.startsWith('h'));

    if (matches) {
      results.push(component);
    }

    const children = component.components?.();
    if (children) {
      children.forEach(traverse);
    }
  }

  traverse(wrapper);
  return results;
}

function parseCSSFromSuggestion(afterText) {
  const properties = {};

  // Common patterns in suggestions
  const colorMatch = afterText.match(/#[a-fA-F0-9]{3,6}/);
  if (colorMatch) {
    if (afterText.toLowerCase().includes('background')) {
      properties['background-color'] = colorMatch[0];
    } else if (afterText.toLowerCase().includes('text') || afterText.toLowerCase().includes('color')) {
      properties['color'] = colorMatch[0];
    }
  }

  // Font size
  const fontSizeMatch = afterText.match(/(\d+)px/);
  if (fontSizeMatch && afterText.toLowerCase().includes('font')) {
    properties['font-size'] = `${fontSizeMatch[1]}px`;
  }

  // Padding
  const paddingMatch = afterText.match(/padding[:\s]+(\d+px(?:\s+\d+px)*)/i);
  if (paddingMatch) {
    properties['padding'] = paddingMatch[1];
  }

  // Font weight
  if (afterText.toLowerCase().includes('bold') || afterText.includes('700')) {
    properties['font-weight'] = '700';
  }

  return properties;
}

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

function extractDesignContext(html, css) {
  const context = {
    colors: new Set(),
    fontSizes: new Set(),
    elements: [],
    potentialIssues: []
  };

  // Extract colors from CSS
  const colorRegex = /#[a-fA-F0-9]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g;
  const colors = (css || '').match(colorRegex) || [];
  colors.forEach(c => context.colors.add(c));

  // Also check inline styles in HTML
  const inlineColors = (html || '').match(colorRegex) || [];
  inlineColors.forEach(c => context.colors.add(c));

  // Extract font sizes
  const fontSizeRegex = /font-size:\s*(\d+(?:\.\d+)?(?:px|em|rem))/g;
  let match;
  while ((match = fontSizeRegex.exec(css || '')) !== null) {
    context.fontSizes.add(match[1]);
  }

  // Identify structural elements
  const tagMatches = (html || '').match(/<(h[1-6]|p|button|a|section|header|footer|nav|div)[^>]*>/gi) || [];
  tagMatches.forEach(tag => {
    const tagName = tag.match(/<(\w+)/)?.[1];
    if (tagName) context.elements.push(tagName.toLowerCase());
  });

  // Check for potential issues to highlight
  // Bright red text
  if (css?.includes('#ff0000') || css?.includes('rgb(255, 0, 0)') || css?.includes('#f00')) {
    context.potentialIssues.push('Bright red (#ff0000) color detected');
  }

  // Very small font sizes
  const smallFonts = [...context.fontSizes].filter(s => {
    const num = parseFloat(s);
    return s.includes('px') && num < 14;
  });
  if (smallFonts.length > 0) {
    context.potentialIssues.push(`Small font sizes detected: ${smallFonts.join(', ')}`);
  }

  return context;
}

export async function analyzeDesignWithOpenAI({ html, css, maxSuggestions = 5 }) {
  const apiKey = (process.env.REACT_APP_OPENAI_API_KEY || '').trim();

  // Diagnostic logging (without exposing the full key)
  console.log('[OpenAI] Checking API key...');
  console.log('[OpenAI] Key exists:', !!apiKey);
  console.log('[OpenAI] Key length:', apiKey.length);
  console.log('[OpenAI] Key prefix:', apiKey.substring(0, 7) + '...');

  if (!apiKey) {
    console.warn('[OpenAI] No API key found. Make sure REACT_APP_OPENAI_API_KEY is set in .env and restart the dev server.');
    // Return a special object to indicate missing key vs empty results
    return { error: 'NO_API_KEY', suggestions: [] };
  }

  // Extract design context for better analysis
  const context = extractDesignContext(html, css);

  // Build a more informative prompt
  let contextInfo = '';
  if (context.colors.size > 0) {
    contextInfo += `\nColors used: ${[...context.colors].slice(0, 10).join(', ')}`;
  }
  if (context.fontSizes.size > 0) {
    contextInfo += `\nFont sizes: ${[...context.fontSizes].join(', ')}`;
  }
  if (context.elements.length > 0) {
    const elementCounts = {};
    context.elements.forEach(el => elementCounts[el] = (elementCounts[el] || 0) + 1);
    contextInfo += `\nElements: ${Object.entries(elementCounts).map(([k, v]) => `${k}(${v})`).join(', ')}`;
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
    response = await fetch(OPENAI_API_URL, {
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
