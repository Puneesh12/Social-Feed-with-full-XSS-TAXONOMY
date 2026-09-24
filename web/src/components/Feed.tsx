import { useEffect, useState } from 'react';
import { api } from '../api';
import { UserText, safeHref } from '../render';
import { Avatar } from './Avatar';
import { timeAgo } from '../time';

export interface Post {
  id: number;
  body: string;
  link_url: string;
  username: string;
  display_name: string;
  created_at: string;
}

export function PostCard({ p }: { p: Post }) {
  const name = p.display_name || p.username;
  return (
    <article className="post">
      <a className="post-avatar" href={`#/profile/${p.username}`}>
        <Avatar name={name} />
      </a>
      <div className="post-main">
        <header className="post-head">
          {/* display_name is stored user content -> stored-XSS sink */}
          <a className="post-name" href={`#/profile/${p.username}`}>
            <strong><UserText value={name} /></strong>
          </a>
          <span className="post-handle">@{p.username}</span>
          <span className="post-dot">·</span>
          <time className="post-time">{timeAgo(p.created_at)}</time>
        </header>
        {/* body is stored user content -> stored-XSS sink */}
        <div className="post-body"><UserText value={p.body} /></div>
        {p.link_url && (
          <a className="post-link" href={safeHref(p.link_url)} target="_blank" rel="noreferrer">
            🔗 {p.link_url}
          </a>
        )}
        <div className="post-actions">
          <span className="act">💬 <b>{p.id % 7}</b></span>
          <span className="act">🔁 <b>{p.id % 4}</b></span>
          <span className="act">♥ <b>{p.id % 11}</b></span>
          <span className="act">📊 <b>{(p.id * 13) % 90}</b></span>
        </div>
      </div>
    </article>
  );
}

export function Feed({ onLoaded }: { onLoaded?: (posts: Post[]) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.feed()
      .then((d) => { setPosts(d.posts); onLoaded?.(d.posts); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton-list">{[0, 1, 2].map((i) => <div key={i} className="skeleton" />)}</div>;
  if (error) return <p className="error pad">Could not load feed: {error}</p>;
  if (posts.length === 0) return <p className="muted pad">No posts yet — be the first to chirp.</p>;

  return <div className="feed">{posts.map((p) => <PostCard key={p.id} p={p} />)}</div>;
}
