// -----------------------------------------------------------------------------
// CSRF protection (report §5.4, §7.3). Double-submit token pattern.
//
// Defended build: a readable (non-HttpOnly) CSRF cookie is set, and every
// state-changing request must echo it in the X-CSRF-Token header. This is the
// control that stops the XSS-driven CSRF impact from a *different* origin —
// though note the report's honest point (§8.5): CSRF tokens do NOT stop script
// running in the victim's own page, which is why stopping XSS at the render
// boundary is the real fix.
//
// Vulnerable build: no CSRF check at all.
// -----------------------------------------------------------------------------
import crypto from 'node:crypto';
import { config } from './config.js';

const CSRF_COOKIE = 'csrf_token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function issueCsrfToken(req, res, next) {
  if (config.isVulnerable) return next();
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(24).toString('hex');
    // Readable by JS so the SPA can echo it back in a header.
    res.cookie(CSRF_COOKIE, token, { httpOnly: false, sameSite: 'lax' });
    req.cookies = req.cookies || {};
    req.cookies[CSRF_COOKIE] = token;
  }
  next();
}

export function verifyCsrf(req, res, next) {
  if (config.isVulnerable) return next();
  if (SAFE_METHODS.has(req.method)) return next();
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get('X-CSRF-Token');
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'invalid or missing CSRF token' });
  }
  next();
}
