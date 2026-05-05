# OpenAI Design Analysis Basis Document

## Purpose
This document defines the exact contract for AI-powered design analysis in the editor.
It explains:
- what input is sent to OpenAI,
- what the model should do,
- and what response shape the app expects.

## Input to the model
The app sends:
1. `HTML`: current page markup from GrapesJS (`editor.getHtml()`).
2. `CSS`: current page styles from GrapesJS (`editor.getCss()`).
3. `maxSuggestions`: maximum number of suggestions to return.

## Required model behavior
The model must:
1. Analyze visual quality and UX readability.
2. Prioritize practical, high-impact improvements.
3. Return JSON only (no markdown).
4. Focus on: spacing, hierarchy, readability, alignment, consistency.

## Required response shape
```json
{
  "suggestions": [
    {
      "id": "alignment-buttons-row",
      "title": "Align CTA buttons on one baseline",
      "explanation": "Button labels and vertical spacing create a jagged row. Equal line-height and shared top padding improves scanability.",
      "severity": "medium",
      "category": "alignment",
      "preview": {
        "type": "comparison",
        "before": "Mismatched button heights",
        "after": "Consistent 44px button height"
      }
    }
  ]
}
```

## Field definitions
- `id`: short kebab-case unique key.
- `title`: concise summary of one issue.
- `explanation`: one or two sentences.
- `severity`: one of `high | medium | info`.
- `category`: one of `spacing | hierarchy | readability | alignment | consistency`.
- `preview`: always a comparison object with `before` and `after` strings.

## API key behavior
The app reads key in this order:
1. `localStorage.wb_openai_api_key` (saved from sidebar input),
2. `REACT_APP_OPENAI_API_KEY` from environment.

## Fallback behavior
If the key is missing or OpenAI fails:
- the app still returns local rule-based suggestions,
- and shows a non-blocking AI error hint.

## Security note
This is a frontend integration intended for local/demo workflows.
For production, proxy OpenAI calls through a backend server and keep API keys server-side.
