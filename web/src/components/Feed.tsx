import { useEffect, useState } from 'react';
import { api } from '../api';
import { UserText, safeHref } from '../render';

interface Post {
  id: number;
  body: string;
  link_url: string;
  username: string;
  display_name: string;
  created_at: string;
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.feed().then((d) => setPosts(d.posts)).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">Could not load feed: {error}</p>;

  return (
    <div className="feed">
      <h2>Feed</h2>
      {posts.length === 0 && <p className="muted">No posts yet.</p>}
      {posts.map((p) => (
        <article className="post" key={p.id}>
          <header>
            {/* display_name is stored user content -> stored-XSS sink */}
            <strong className="name"><UserText value={p.display_name || p.username} /></strong>
            <a className="handle" href={`#/profile/${p.username}`}>@{p.username}</a>
          </header>
          {/* body is stored user content -> stored-XSS sink */}
          <div className="body"><UserText value={p.body} /></div>
          {p.link_url && (
            <a className="link" href={safeHref(p.link_url)} target="_blank" rel="noreferrer">
              {p.link_url}
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
