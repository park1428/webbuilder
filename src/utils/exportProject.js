import JSZip from 'jszip';

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

export async function copyHTMLToClipboard(html) {
  try {
    await navigator.clipboard.writeText(html);
    return { success: true };
  } catch (error) {
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

export async function copyCSSToClipboard(css) {
  try {
    await navigator.clipboard.writeText(css);
    return { success: true };
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = css;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success };
  }
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function getEstimatedSize(html, css) {
  const encoder = new TextEncoder();
  const htmlSize = encoder.encode(html || '').length;
  const cssSize = encoder.encode(css || '').length;
  return htmlSize + cssSize;
}

function minifyHTML(html) {
  return html
    .replace(/\n\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

function minifyCSS(css) {
  return css
    .replace(/\n\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/;\}/g, '}')
    .trim();
}

export function createPreviewHTML(html, css, options = {}) {
  return createHTMLFile(html, css, options);
}
