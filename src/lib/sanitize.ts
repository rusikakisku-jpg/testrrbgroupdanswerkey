/**
 * Zero-dependency, Edge & Node compatible HTML Sanitizer for Next.js.
 * Thoroughly strips executable scripts, dangerous HTML tags, inline event handlers (including slashed attributes),
 * dangerous protocol URIs (including entity-encoded and data: URIs), and prevents recursive/nested XSS bypasses.
 */

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    .replace(/&#([0-9]+);?/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return '';
      }
    })
    .replace(/&colon;/gi, ':')
    .replace(/&tab;/gi, '\t')
    .replace(/&newline;/gi, '\n');
}

function isDangerousUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  // Decode entities and remove control chars, whitespace, and null bytes
  const normalized = decodeHtmlEntities(rawUrl)
    .replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '')
    .toLowerCase();

  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('file:')
  ) {
    return true;
  }

  if (normalized.startsWith('data:')) {
    // Only allow safe, non-executable image data URIs (disallow SVG/HTML data URIs)
    return !/^data:image\/(png|jpeg|jpg|gif|webp|avif);base64,/i.test(normalized);
  }

  return false;
}

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let clean = html;
  const dangerousTags =
    'script|style|iframe|object|embed|applet|form|base|meta|link|svg|math|portal|frame|frameset|template';

  const tagWithContent = new RegExp(
    '<(' + dangerousTags + ')\\b[\\s\\S]*?<\\/\\1>',
    'gi'
  );
  const selfClosingOrUnclosed = new RegExp(
    '<\\/?(' + dangerousTags + ')\\b[^>]*>',
    'gi'
  );

  // 1. Iteratively remove dangerous tags (guards against nested bypasses like <scr<script>ipt>)
  let prev = '';
  let loops = 0;
  while (clean !== prev && loops < 5) {
    prev = clean;
    clean = clean.replace(tagWithContent, '');
    clean = clean.replace(selfClosingOrUnclosed, '');
    loops++;
  }

  // 2. Strip all inline event handlers (e.g. onload, onerror, onclick, onmouseover)
  // Handles spaces, slashes (<img/src=x/onerror=...), newlines, and unquoted values
  clean = clean.replace(/<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)>/gi, (match, tagName, attrs) => {
    const cleanedAttrs = attrs.replace(
      /(?:[\s/]+)on[a-zA-Z0-9_-]+\s*(?:=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)|\b)/gi,
      ' '
    );
    return `<${tagName}${cleanedAttrs}>`;
  });

  // 3. Remove dangerous protocols from URL attributes (href, src, action, formaction, etc.)
  clean = clean.replace(
    /\b(href|src|action|formaction|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (match, attr, qDouble, qSingle, unquoted) => {
      const url = qDouble ?? qSingle ?? unquoted ?? '';
      if (isDangerousUrl(url)) {
        return `${attr}="#"`;
      }
      return match;
    }
  );

  return clean;
}
