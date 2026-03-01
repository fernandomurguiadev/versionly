import { HttpErrorResponse } from '@angular/common/http';

export const formatHttpError = (error: HttpErrorResponse, fallback: string) => {
  const tokenPresent = Boolean(localStorage.getItem('accessToken'));
  const apiMessage =
    (error.error as { error?: { message?: string } } | null)?.error?.message ||
    (error.error as { message?: string } | null)?.message ||
    fallback;
  const statusLabel = error.status ? `HTTP ${error.status}` : '';
  const tokenLabel = `Token ${tokenPresent ? 'presente' : 'ausente'}`;
  return [apiMessage, statusLabel, tokenLabel].filter(Boolean).join(' · ');
};

export const resolveContentHtmlValue = (content: Record<string, unknown> | null) => {
  if (!content) {
    return '';
  }
  const html = (content as { html?: string }).html;
  if (typeof html === 'string' && html.trim()) {
    return html;
  }
  const text = extractPlainText(content);
  if (!text) {
    return '';
  }
  const escaped = text
    .split('\n')
    .map((line) => escapeHtml(line))
    .join('</p><p>');
  return `<p>${escaped}</p>`;
};

export const serializeDraftContent = (html: string) => {
  const text = extractTextFromHtml(html);
  return {
    type: 'doc',
    html,
    content: [
      {
        type: 'paragraph',
        content: text ? [{ type: 'text', text }] : [],
      },
    ],
  };
};

const extractPlainText = (content: Record<string, unknown>) => {
  const lines: string[] = [];
  const walk = (node: Record<string, unknown>) => {
    const text = node['text'];
    if (typeof text === 'string') {
      lines.push(text);
    }
    const children = node['content'];
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (child && typeof child === 'object') {
          walk(child as Record<string, unknown>);
        }
      });
    }
  };
  walk(content);
  return lines.join('\n').trim();
};

const extractTextFromHtml = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return (container.textContent ?? '').trim();
};

const escapeHtml = (text: string) => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
