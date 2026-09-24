// -----------------------------------------------------------------------------
// Seed a few users and benign posts so the feed isn't empty on first run.
// Run inside the api container:  docker compose exec api node src/seed.js
// -----------------------------------------------------------------------------
import { createPost, createUser, findUserByUsername, updateUserRole, upsertProfile, waitForDb } from './db.js';
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
  const existing = await findUserByUsername(u.username);
  ids[u.username] = existing?._id.toString() || await createUser({ username: u.username, password_hash: hash, role: u.role });
  if (existing) await updateUserRole(ids[u.username], u.role);
  await upsertProfile(ids[u.username], { display_name: u.display, bio: u.bio, website: u.website, avatar_url: '' });
}

for (const [author, body] of posts) {
  await createPost({ author_id: ids[author], body, link_url: '', visibility: 'public' });
}

console.log('Seeded users:', Object.keys(ids).join(', '));
console.log('Logins: alice/password123, bob/password123, admin/admin12345');
process.exit(0);
