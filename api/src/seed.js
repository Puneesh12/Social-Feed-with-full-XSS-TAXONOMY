// -----------------------------------------------------------------------------
// Seed a few users and benign posts so the feed isn't empty on first run.
// Run inside the api container:  docker compose exec api node src/seed.js
// -----------------------------------------------------------------------------
import { query, waitForDb } from './db.js';
import { hashPassword } from './auth.js';

const users = [
  { username: 'alice', password: 'password123', display: 'Alice', role: 'user',
    bio: 'Coffee, code, and cats.', website: 'https://example.com/alice' },
  { username: 'bob', password: 'password123', display: 'Bob', role: 'user',
    bio: 'Just here for the memes.', website: 'https://example.com/bob' },
  { username: 'admin', password: 'admin12345', display: 'Site Admin', role: 'admin',
    bio: 'I moderate the feed.', website: '' },
];

const posts = [
  ['alice', 'Hello Chirp! First post here.'],
  ['bob', 'Anyone else love a good static site?'],
  ['alice', 'Shipping the new profile page today.'],
  ['admin', 'Welcome to the feed — keep it friendly.'],
];

await waitForDb();

const ids = {};
for (const u of users) {
  const hash = await hashPassword(u.password);
  const { rows } = await query(
    `INSERT INTO users (username, password_hash, role) VALUES ($1,$2,$3)
     ON CONFLICT (username) DO UPDATE SET role = EXCLUDED.role
     RETURNING id`,
    [u.username, hash, u.role]
  );
  ids[u.username] = rows[0].id;
  await query(
    `INSERT INTO profiles (user_id, display_name, bio, website) VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id) DO UPDATE
       SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, website = EXCLUDED.website`,
    [ids[u.username], u.display, u.bio, u.website]
  );
}

for (const [author, body] of posts) {
  await query('INSERT INTO posts (author_id, body) VALUES ($1,$2)', [ids[author], body]);
}

console.log('Seeded users:', Object.keys(ids).join(', '));
console.log('Logins: alice/password123, bob/password123, admin/admin12345');
process.exit(0);
