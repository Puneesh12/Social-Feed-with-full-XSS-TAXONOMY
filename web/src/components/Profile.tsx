import { useEffect, useState } from 'react';
import { api } from '../api';
import { UserText, safeHref } from '../render';
import { Avatar } from './Avatar';
import { PostCard, Post } from './Feed';

interface ProfileData {
  username: string;
  role: string;
  display_name: string;
  bio: string;
  website: string;
}

export function Profile({ username, me }: { username: string; me: string | null }) {
  const [p, setP] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    setP(null);
    setError('');
    api.profile(username).then(setP).catch((e) => setError(e.message));
    api.feed().then((d) => setPosts(d.posts.filter((x: Post) => x.username === username))).catch(() => {});
  }, [username]);

  if (error) return <p className="error pad">{error}</p>;
  if (!p) return <div className="skeleton-list"><div className="skeleton" /></div>;

  const name = p.display_name || p.username;
  const isMe = me === p.username;

  return (
    <div className="profile">
      <div className="profile-banner" />
      <div className="profile-head">
        <div className="profile-avatar"><Avatar name={name} size={84} /></div>
        {isMe ? (
          <a className="btn-outline" href="#/settings">Edit profile</a>
        ) : me ? (
          <button className="btn-outline" onClick={async () => { try { await api.follow(username); setFollowed(true); } catch {} }}>
            {followed ? 'Following' : 'Follow'}
          </button>
        ) : null}
      </div>
      <div className="profile-info">
        <h2 className="profile-name">
          <UserText value={name} />
          {p.role === 'admin' && <span className="badge-admin">Admin</span>}
        </h2>
        <p className="profile-handle">@{p.username}</p>
        {p.bio && <p className="profile-bio"><UserText value={p.bio} /></p>}
        {p.website && (
          <a className="profile-website" href={safeHref(p.website)} target="_blank" rel="noreferrer">
            🔗 {p.website}
          </a>
        )}
      </div>
      <div className="section-title">Posts</div>
      {posts.length === 0
        ? <p className="muted pad">No posts yet.</p>
        : <div className="feed">{posts.map((x) => <PostCard key={x.id} p={x} />)}</div>}
    </div>
  );
}
