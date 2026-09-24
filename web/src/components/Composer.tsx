import { useState } from 'react';
import { api } from '../api';

export function Composer({ onPosted }: { onPosted: () => void }) {
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.createPost(body, linkUrl);
      setBody('');
      setLinkUrl('');
      onPosted();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form className="composer" onSubmit={submit}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What's happening?"
        rows={3}
      />
      <input
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        placeholder="Optional link (https://...)"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Chirp</button>
    </form>
  );
}
