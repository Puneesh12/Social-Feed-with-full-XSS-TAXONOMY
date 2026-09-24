// -----------------------------------------------------------------------------
// Chirp API entry point. Wires middleware, sessions, security, and routes.
// -----------------------------------------------------------------------------
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import rateLimit from 'express-rate-limit';

import { config } from './config.js';
import { waitForDb } from './db.js';
import { applySecurityHeaders, sessionCookieOptions } from './security.js';
import { issueCsrfToken, verifyCsrf } from './csrf.js';
import { authRouter } from './routes/auth.js';
import { contentRouter } from './routes/content.js';
import { pagesRouter } from './routes/pages.js';
import { adminRouter } from './routes/admin.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// --- Redis-backed sessions (server-side; cookie is an opaque id, report §4.5)
const redisClient = createClient({ socket: { host: config.redis.host, port: config.redis.port } });
redisClient.on('error', (e) => console.error('redis error', e.message));
await redisClient.connect();

// --- Body + cookies ---------------------------------------------------------
app.use(express.json({ limit: '128kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- Security headers on every response (no-op in vulnerable build) ---------
app.use((req, res, next) => { applySecurityHeaders(req, res); next(); });

// --- Sessions ---------------------------------------------------------------
app.use(session({
  store: new RedisStore({ client: redisClient, prefix: 'chirp:sess:' }),
  name: 'sid',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: sessionCookieOptions(),
}));

// --- CSRF (defended build only) ---------------------------------------------
app.use(issueCsrfToken);

// --- Rate limiting on auth (defended build; report §5.4) --------------------
if (config.isDefended) {
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });
  app.use('/api/auth', authLimiter);
}

// --- Health -----------------------------------------------------------------
app.get('/healthz', (req, res) => res.json({ ok: true, mode: config.mode }));
app.get('/api/config', (req, res) => res.json({ mode: config.mode }));

// --- Routes -----------------------------------------------------------------
app.use('/api/auth', authRouter);
app.use('/api', verifyCsrf, contentRouter);   // CSRF-protected in defended build
app.use('/api/admin', verifyCsrf, adminRouter);
app.use('/', pagesRouter);                     // /search, /render/preview

// --- Start ------------------------------------------------------------------
await waitForDb();
app.listen(config.port, () => {
  console.log(`Chirp API listening on :${config.port} (${config.mode})`);
});
