import { useEffect, useState } from 'react';
import { api } from '../api';

// Lets a logged-in user set their display name, bio, and website — the input
// side of the stored (XSS-S-01) and javascript:-URL (XSS-P-01) cases.
export function ProfileEdit({ onSaved }: { onSaved: () => void }) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.me().then((u) => {
      setDisplayName(u.display_name || '');
      setBio(u.bio || '');
      setWebsite(u.website || '');
    }).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await api.updateProfile({ displayName, bio, website });
      setMsg('Saved.');
      onSaved();
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  return (
    <form className="profile-edit" onSubmit={submit}>
      <h3>Edit profile</h3>
      <label>Display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></label>
      <label>Bio<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} /></label>
      <label>Website<input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." /></label>
      {msg && <p className="muted">{msg}</p>}
      <button type="submit">Save</button>
    </form>
  );
}
