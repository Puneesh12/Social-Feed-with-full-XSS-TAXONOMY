// -----------------------------------------------------------------------------
// Security helpers — the single place where the two builds diverge.
//
// Every function here has a vulnerable path and a defended path chosen by
// config.mode. The routes call these helpers so that the feature code is
// identical between builds and only the CONTROL differs (report §6.4, §8.4).
// -----------------------------------------------------------------------------
import crypto from 'node:crypto';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { config } from './config.js';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// --- Contextual output encoding ---------------------------------------------

// HTML body / text-node context.
export function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;');
}

// HTML attribute-value context (quoted attributes).
export function escapeAttr(s) {
  return escapeHtml(s).replaceAll('`', '&#x60;');
}

// Defended: encode for the context. Vulnerable: pass through untouched.
export function outHtml(s) {
  return config.isDefended ? escapeHtml(s) : String(s);
}
export function outAttr(s) {
  return config.isDefended ? escapeAttr(s) : String(s);
}

// --- URL scheme allow-list (fixes XSS-P-01, the javascript: URL) ------------
const ALLOWED_URL_SCHEMES = ['http:', 'https:', 'mailto:'];

// Returns a URL safe to place in an href, or '#' if the scheme is not allowed.
// In the vulnerable build the raw value is returned unchecked.
export function safeUrl(raw) {
  const value = String(raw || '').trim();
  if (config.isVulnerable) return value;
  if (value === '') return '';
  try {
    // Resolve against a base so protocol-relative and relative URLs parse.
    const u = new URL(value, 'http://localhost/');
    if (ALLOWED_URL_SCHEMES.includes(u.protocol)) return value;
    return '#';
  } catch {
    return '#';
  }
}

// --- Rich-text sanitisation (fixes XSS-M-01, the mutation case) -------------
// Vulnerable build: a naive regex strip of <script> then re-parse (classic
// mXSS anti-pattern). Defended build: DOMPurify, a parser-based sanitiser,
// with NO subsequent re-parse.
export function sanitizeRichHtml(dirty) {
  const input = String(dirty || '');
  if (config.isVulnerable) {
    // Naive, bypassable filter — kept deliberately weak for the lab.
    return input.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  }
  return DOMPurify.sanitize(input, {
    USE_PROFILES: { html: true },
    FORBID_ATTR: ['style'],
  });
}

// --- Content Security Policy -------------------------------------------------
// A fresh nonce per request; defended build emits a strict nonce-based CSP with
// Trusted Types. Vulnerable build emits no CSP at all.
export function makeNonce() {
  return crypto.randomBytes(16).toString('base64');
}

export function cspHeader(nonce) {
  if (config.isVulnerable) return null;
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `object-src 'none'`,
    `base-uri 'none'`,
    `frame-ancestors 'none'`,
    `require-trusted-types-for 'script'`,
    `trusted-types default dompurify`,
  ].join('; ');
}

// --- Security response headers (report §7.3, config layer) ------------------
export function applySecurityHeaders(req, res) {
  if (config.isVulnerable) return; // vulnerable build ships no hardening headers
  const nonce = res.locals.cspNonce || makeNonce();
  res.locals.cspNonce = nonce;
  res.setHeader('Content-Security-Policy', cspHeader(nonce));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Frame-Options', 'DENY');
}

// --- Cookie flags (report §7.3) ---------------------------------------------
// Defended: HttpOnly + SameSite=Lax (+ Secure under TLS). Vulnerable: none of
// these, so document.cookie is readable by injected script (enables XSS-S-01
// cookie theft).
export function sessionCookieOptions() {
  if (config.isVulnerable) {
    return { httpOnly: false, sameSite: false, secure: false, maxAge: 1000 * 60 * 60 * 24 };
  }
  return { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 24 };
}
