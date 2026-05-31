/**
 * Client-side syntax highlighting for PANORAMIC BASIC code blocks.
 */
import { PANORAMIC_KEYWORDS_BY_LENGTH } from './panoramic-keywords.js';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function span(cls, text) {
  return `<span class="${cls}">${escapeHtml(text)}</span>`;
}

function isIdentChar(ch) {
  return /[#a-zA-Z0-9_$]/.test(ch);
}

function matchKeywordAt(text, i) {
  if (i > 0 && isIdentChar(text[i - 1])) return null;

  const lower = text.slice(i).toLowerCase();
  for (const kw of PANORAMIC_KEYWORDS_BY_LENGTH) {
    if (!lower.startsWith(kw)) continue;
    const after = i + kw.length;
    if (after < text.length && isIdentChar(text[after])) continue;
    return text.slice(i, i + kw.length);
  }
  return null;
}

function tokenizeCode(text) {
  let out = '';
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (ch === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j++;
      if (j < text.length) j++;
      out += span('str', text.slice(i, j));
      i = j;
      continue;
    }

    if (/\s/.test(ch)) {
      let j = i;
      while (j < text.length && /\s/.test(text[j])) j++;
      out += escapeHtml(text.slice(i, j));
      i = j;
      continue;
    }

    const keyword = matchKeywordAt(text, i);
    if (keyword) {
      out += span('kw', keyword);
      i += keyword.length;
      continue;
    }

    if (/\d/.test(ch) || (ch === '.' && i + 1 < text.length && /\d/.test(text[i + 1]))) {
      let j = i;
      while (j < text.length && /[\d.]/.test(text[j])) j++;
      out += span('num', text.slice(i, j));
      i = j;
      continue;
    }

    if (/[#a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < text.length && /[#a-zA-Z0-9_$]/.test(text[j])) j++;
      out += escapeHtml(text.slice(i, j));
      i = j;
      continue;
    }

    out += escapeHtml(ch);
    i++;
  }

  return out;
}

function highlightLine(line) {
  const remMatch = line.match(/^(\s*)rem\b(.*)$/i);
  if (remMatch) {
    return escapeHtml(remMatch[1]) + span('kw', 'rem') + span('com', remMatch[2]);
  }

  let commentIndex = -1;
  let inString = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inString = !inString;
    } else if (line[i] === "'" && !inString) {
      commentIndex = i;
      break;
    }
  }

  const codePart = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
  const commentPart = commentIndex >= 0 ? line.slice(commentIndex) : '';

  let result = tokenizeCode(codePart);
  if (commentPart) {
    result += span('com', commentPart);
  }
  return result;
}

export function highlightPanoramic(code) {
  if (!code) return '';
  return code.split('\n').map(highlightLine).join('\n');
}

export function isAlreadyHighlighted(codeEl) {
  return codeEl.querySelector('span.kw, span.str, span.num, span.com, span.fn') !== null;
}

export function highlightCodeBlocks(root = document) {
  root.querySelectorAll('.code-editor code').forEach((codeEl) => {
    if (isAlreadyHighlighted(codeEl)) return;

    const source = codeEl.textContent;
    codeEl.innerHTML = highlightPanoramic(source);
    codeEl.dataset.highlighted = 'true';
  });
}
