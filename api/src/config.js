// -----------------------------------------------------------------------------
// Central configuration + the single build switch (report §6.4).
// BUILD_MODE=vulnerable | defended selects behaviour throughout the code base.
// -----------------------------------------------------------------------------
const MODE = (process.env.BUILD_MODE || 'vulnerable').toLowerCase();

if (!['vulnerable', 'defended'].includes(MODE)) {
  throw new Error(`BUILD_MODE must be "vulnerable" or "defended", got "${MODE}"`);
}

export const config = {
  mode: MODE,
  isDefended: MODE === 'defended',
  isVulnerable: MODE === 'vulnerable',
  port: parseInt(process.env.PORT || '3000', 10),
  pg: {
    host: process.env.POSTGRES_HOST || 'db',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'chirp',
    user: process.env.POSTGRES_USER || 'chirp_app',
    password: process.env.POSTGRES_PASSWORD || 'chirp_app_pw',
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  sessionSecret: process.env.SESSION_SECRET || 'dev-only-session-secret',
  csrfSecret: process.env.CSRF_SECRET || 'dev-only-csrf-secret',
};

// Loud banner so anyone running the lab knows which build is live.
console.log(
  `\n========================================\n` +
  `  Chirp API — BUILD_MODE = ${MODE.toUpperCase()}\n` +
  (config.isVulnerable
    ? `  (!) Intentionally vulnerable. Lab use only.\n`
    : `  Defended build: encoding + CSP + sanitisation active.\n`) +
  `========================================\n`
);
