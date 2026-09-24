import { useState } from 'react';
import { api } from '../api';
import { Avatar } from './Avatar';

export function Composer({ me, onPosted }: { me: string; onPosted: () => void }) {
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const MAX = 280;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await api.createPost(body, linkUrl);
      setBody('');
      setLinkUrl('');
      onPosted();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const remaining = MAX - body.length;

  return (
    <form className="composer" onSubmit={submit}>
      <Avatar name={me} />
      <div className="composer-main">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's happening?"
          rows={2}
        />
        <input
          className="composer-link"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="Add a link (optional)"
        />
        {error && <p className="error">{error}</p>}
        <div className="composer-bar">
          <span className={`count ${remaining < 0 ? 'over' : ''}`}>{remaining}</span>
          <button type="submit" disabled={busy || !body.trim() || remaining < 0}>
            {busy ? 'Posting…' : 'Chirp'}
          </button>
        </div>
      </div>
    </form>
  );
}
