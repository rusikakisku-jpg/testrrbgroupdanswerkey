/**
 * Zero-dependency HTML Sanitizer for Next.js (Node.js & Edge compatible).
 * Strips executable scripts, dangerous tags, inline event handlers, and javascript: URIs.
 * Prevents XSS attacks without requiring heavy external dependencies like jsdom.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let clean = html;

  // 1. Remove <script> tags and all content inside them
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove <iframe, <object, <embed, <applet, <form, <base, <meta tags and their contents
  clean = clean.replace(/<(iframe|object|embed|applet|form|base|meta)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  // Also remove self-closing or unclosed instances
  clean = clean.replace(/<\/?(iframe|object|embed|applet|form|base|meta)\b[^>]*>/gi, '');

  // 3. Remove inline event handlers (e.g., onload, onerror, onclick, onmouseover, etc.)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');

  // 4. Remove dangerous protocol links (javascript:, data:text/html, vbscript:)
  clean = clean.replace(/(href|src|action)\s*=\s*(["'])\s*(javascript:|vbscript:|data:text\/html)[^"']*\2/gi, '$1="#"');
  clean = clean.replace(/(href|src|action)\s*=\s*(javascript:|vbscript:|data:text\/html)[^\s>]*/gi, '$1="#"');

  return clean;
}
