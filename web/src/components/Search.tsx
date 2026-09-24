import { useEffect, useState } from 'react';
import { api } from '../api';
import { navigate } from '../router';
import { DomSearchBanner } from './DomSearchBanner';
import { PostCard, Post } from './Feed';

// Client search view. Keeps the DOM-XSS demo (DomSearchBanner reads the term
// from the URL fragment) and shows real filtered results from the feed. A link
// to the server-rendered /search page (reflected sink) is offered too.
export function Search({ term }: { term: string }) {
  const [q, setQ] = useState(term);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => { setQ(term); }, [term]);
  useEffect(() => { api.feed().then((d) => setPosts(d.posts)).catch(() => {}); }, []);

  const results = term.trim()
    ? posts.filter((p) => (p.body + p.display_name + p.username).toLowerCase().includes(term.toLowerCase()))
    : [];

  return (
    <div className="search-view">
      <form
        className="search-bar big"
        onSubmit={(e) => { e.preventDefault(); navigate(`/search?q=${encodeURIComponent(q)}`); }}
      >
        <span className="search-ico">🔍</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Chirp" />
      </form>

      <DomSearchBanner term={term} />

      {term.trim() ? (
        results.length ? (
          <div className="feed">{results.map((p) => <PostCard key={p.id} p={p} />)}</div>
        ) : (
          <p className="muted pad">No posts match “{term}”.</p>
        )
      ) : (
        <p className="muted pad">Type a query above to search the feed.</p>
      )}

      <p className="muted pad small">
        Demo: the server-rendered reflected page is at{' '}
        <a href={`/search?q=${encodeURIComponent(term)}`}>/search?q={term || '…'}</a>.
      </p>
    </div>
  );
}
