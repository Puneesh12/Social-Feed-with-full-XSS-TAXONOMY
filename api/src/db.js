// -----------------------------------------------------------------------------
// MongoDB access. The repository functions below keep persistence details out
// of the HTTP routes and preserve the API's existing response shapes.
// -----------------------------------------------------------------------------
import { MongoClient, ObjectId } from 'mongodb';
import { config } from './config.js';

const client = new MongoClient(config.mongo.uri);
let database;

function id(value) {
  return new ObjectId(String(value));
}

// Safe cast for caller-supplied ids: returns an ObjectId, or null when the
// value isn't a valid id. Callers turn null into a 404 instead of a 500 crash.
function toId(value) {
  return ObjectId.isValid(value) ? new ObjectId(String(value)) : null;
}

// Force query inputs to strings so a client can't smuggle a Mongo operator
// object (e.g. {"$gt":""}) into a filter — the NoSQL-injection equivalent of
// parameterising SQL.
function str(value) {
  return typeof value === 'string' ? value : String(value ?? '');
}

function collections() {
  return {
    users: database.collection('users'), profiles: database.collection('profiles'),
    posts: database.collection('posts'), comments: database.collection('comments'),
    follows: database.collection('follows'), reports: database.collection('reports'),
    auditLog: database.collection('audit_log'),
  };
}

export async function waitForDb(retries = 20, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      if (!database) {
        await client.connect();
        database = client.db(config.mongo.database);
        await database.command({ ping: 1 });
        await Promise.all([
          database.collection('users').createIndex({ username: 1 }, { unique: true }),
          database.collection('posts').createIndex({ created_at: -1 }),
          database.collection('follows').createIndex({ follower_id: 1, followee_id: 1 }, { unique: true }),
        ]);
      }
      return;
    } catch (err) {
      database = undefined;
      try { await client.close(); } catch {}
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

export async function findUserById(userId) {
  const oid = toId(userId);
  if (!oid) return null;
  const { users, profiles } = collections();
  const user = await users.findOne({ _id: oid });
  if (!user) return null;
  const profile = await profiles.findOne({ user_id: user._id });
  return { id: user._id.toString(), username: user.username, role: user.role,
    display_name: profile?.display_name || '', bio: profile?.bio || '',
    website: profile?.website || '', avatar_url: profile?.avatar_url || '' };
}

export async function findUserByUsername(username, projection) {
  return collections().users.findOne({ username: str(username) }, { projection });
}

export async function createUser({ username, password_hash, role = 'user' }) {
  const result = await collections().users.insertOne({ username: str(username), password_hash, role, created_at: new Date() });
  return result.insertedId.toString();
}

export async function upsertProfile(userId, values) {
  await collections().profiles.updateOne({ user_id: id(userId) },
    { $set: { ...values, user_id: id(userId) }, $setOnInsert: { created_at: new Date() } }, { upsert: true });
}

export async function listFeed(limit) {
  const { posts, users, profiles } = collections();
  const documents = await posts.find({}).sort({ created_at: -1 }).limit(limit).toArray();
  return Promise.all(documents.map(async (post) => {
    const user = await users.findOne({ _id: post.author_id });
    const profile = await profiles.findOne({ user_id: post.author_id });
    return { id: post._id.toString(), body: post.body, link_url: post.link_url, created_at: post.created_at,
      username: user?.username, display_name: profile?.display_name, avatar_url: profile?.avatar_url };
  }));
}

export async function createPost(values) {
  const result = await collections().posts.insertOne({ ...values, author_id: id(values.author_id), created_at: new Date() });
  return result.insertedId.toString();
}

export async function findPost(postId) {
  const oid = toId(postId);
  if (!oid) return null;
  const { posts, users, profiles } = collections();
  const post = await posts.findOne({ _id: oid });
  if (!post) return null;
  const [user, profile] = await Promise.all([users.findOne({ _id: post.author_id }), profiles.findOne({ user_id: post.author_id })]);
  return { id: post._id.toString(), body: post.body, link_url: post.link_url, created_at: post.created_at,
    username: user?.username, display_name: profile?.display_name };
}

export async function deletePost(postId, authorId) {
  const oid = toId(postId);
  if (!oid) return { deletedCount: 0 };
  return collections().posts.deleteOne({ _id: oid, author_id: id(authorId) });
}

export async function createComment(values) {
  const postId = toId(values.post_id);
  if (!postId) return { ok: false };
  await collections().comments.insertOne({ body: str(values.body), post_id: postId, author_id: id(values.author_id), created_at: new Date() });
  return { ok: true };
}

export async function findProfile(username) {
  const user = await findUserByUsername(username);
  return user ? findUserById(user._id) : null;
}

export async function updateProfile(userId, values) { await upsertProfile(userId, values); }

export async function follow(followerId, username) {
  const user = await findUserByUsername(username);
  if (!user) return null;
  await collections().follows.updateOne({ follower_id: id(followerId), followee_id: user._id },
    { $setOnInsert: { created_at: new Date() } }, { upsert: true });
  return user;
}

export async function addAudit(actorId, action, detail) {
  await collections().auditLog.insertOne({ actor_id: id(actorId), action, detail, created_at: new Date() });
}

export async function searchPosts(term) {
  const { posts, users } = collections();
  const documents = await posts.find({ body: { $regex: String(term), $options: 'i' } }).sort({ created_at: -1 }).limit(25).toArray();
  return Promise.all(documents.map(async (post) => {
    const user = await users.findOne({ _id: post.author_id });
    return { id: post._id.toString(), body: post.body, username: user?.username };
  }));
}

export async function listUsers(search) {
  const users = await collections().users.find({ username: { $regex: String(search), $options: 'i' } }).sort({ created_at: 1 }).limit(100).toArray();
  return users.map((user) => ({ id: user._id.toString(), username: user.username, role: user.role, created_at: user.created_at }));
}

export async function updateUserRole(userId, role) {
  return collections().users.updateOne({ _id: id(userId) }, { $set: { role } });
}

export async function listReports(status) {
  const reports = await collections().reports.find({ status: str(status) }).sort({ created_at: -1 }).toArray();
  return Promise.all(reports.map(async (report) => {
    const post = await collections().posts.findOne({ _id: report.post_id });
    return { id: report._id.toString(), status: report.status, created_at: report.created_at,
      post_id: post?._id.toString(), body: post?.body };
  }));
}
