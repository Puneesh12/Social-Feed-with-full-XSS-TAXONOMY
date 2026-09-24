import { useEffect, useState } from 'react';
import { api } from '../api';
import { UserText, safeHref } from '../render';

interface ProfileData {
  username: string;
  display_name: string;
  bio: string;
  website: string;
}

export function Profile({ username }: { username: string }) {
  const [p, setP] = useState<ProfileData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.profile(username).then(setP).catch((e) => setError(e.message));
  }, [username]);

  if (error) return <p className="error">{error}</p>;
  if (!p) return <p className="muted">Loading…</p>;

  return (
    <div className="profile">
      {/* display_name + bio are stored user content -> stored-XSS sinks */}
      <h2><UserText value={p.display_name || p.username} /></h2>
      <p className="handle">@{p.username}</p>
      <p className="bio"><UserText value={p.bio} /></p>
      {p.website && (
        // website is user content -> javascript:-URL sink (XSS-P-01)
        <a className="website" href={safeHref(p.website)} target="_blank" rel="noreferrer">
          {p.website}
        </a>
      )}
    </div>
  );
}
