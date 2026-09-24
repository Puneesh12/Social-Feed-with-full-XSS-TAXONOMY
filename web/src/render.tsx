// -----------------------------------------------------------------------------
// Client render helpers — the frontend's half of the XSS story.
//
// Stored content (post bodies, display names, bios) arrives as raw text in the
// JSON API. HOW we put it in the DOM decides whether stored XSS fires:
//
//   Vulnerable build -> dangerouslySetInnerHTML with the raw string   (XSS-S-01)
//   Defended build   -> plain React text node (auto-escaped) or, for the one
//                       rich-text case, DOMPurify-sanitised HTML.
// -----------------------------------------------------------------------------
import DOMPurify from 'dompurify';
import { isVulnerable } from './build';

// Render possibly-hostile user text into the feed.
export function UserText({ value }: { value: string }) {
  if (isVulnerable) {
    // (!) THE STORED SINK: raw user string assigned as HTML.
    return <span dangerouslySetInnerHTML={{ __html: value ?? '' }} />;
  }
  // Defended: React escapes text nodes automatically.
  return <span>{value ?? ''}</span>;
}

// Rich text that is allowed to contain *some* markup (link previews). Defended
// build sanitises with a parser and does not re-parse the output.
export function RichText({ value }: { value: string }) {
  const html = isVulnerable ? (value ?? '') : DOMPurify.sanitize(value ?? '');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// URL scheme allow-list for hrefs on the client (mirrors the server, XSS-P-01).
export function safeHref(raw: string): string {
  const value = (raw || '').trim();
  if (isVulnerable) return value;
  if (!value) return '';
  try {
    const u = new URL(value, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? value : '#';
  } catch {
    return '#';
  }
}
