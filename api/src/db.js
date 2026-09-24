// -----------------------------------------------------------------------------
// PostgreSQL access. Note: ALL queries are parameterised in BOTH builds — this
// project studies XSS, not SQL injection, so the SQL layer stays safe
// throughout (report §3.2 out-of-scope, §7.3 "parameterised queries").
// -----------------------------------------------------------------------------
import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool(config.pg);

export function query(text, params) {
  return pool.query(text, params);
}

// Small retry loop so the API waits for Postgres to accept connections.
export async function waitForDb(retries = 20, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
