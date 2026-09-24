import { useState } from 'react';
import { api } from '../api';
import { BUILD_MODE } from '../build';

// Full-screen sign-in / sign-up page shown BEFORE the app loads (Instagram
// style). The rest of the app is gated behind this in App.tsx.
export function AuthPage({ onAuth, initialMode = 'login' }: { onAuth: () => void; initialMode?: 'login' | 'register' }) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await api.login(username, password);
      else await api.register(username, password, displayName || username);
      onAuth();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authpage">
      {/* Left brand panel (hidden on small screens) */}
      <aside className="authpage-brand">
        <div className="authpage-brand-inner">
          <div className="authpage-logo"><span>🐦</span> Chirp</div>
          <h1>Share what's happening.</h1>
          <p>A tiny social feed — post, follow, and explore.</p>
          <div className={`authpage-modechip ${BUILD_MODE}`}>
            {BUILD_MODE === 'vulnerable' ? '⚠️ Vulnerable build (lab)' : '🛡️ Defended build'}
          </div>
        </div>
      </aside>

      {/* Right auth card */}
      <main className="authpage-main">
        <form className="authpage-card" onSubmit={submit}>
          <a className="authpage-back" href="#/">← Back to home</a>
          <div className="authpage-card-logo"><span>🐦</span> Chirp</div>
          <h2>{mode === 'login' ? 'Log in to your account' : 'Create your account'}</h2>
          <p className="authpage-sub">
            {mode === 'login' ? 'Welcome back! Please enter your details.' : 'Join Chirp in a few seconds.'}
          </p>

          <label className="fld">
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. alice" autoFocus autoComplete="username" />
          </label>

          {mode === 'register' && (
            <label className="fld">
              <span>Display name</span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
            </label>
          )}

          <label className="fld">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn-primary full big" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>

          <div className="authpage-divider"><span>OR</span></div>

          <button type="button" className="authpage-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>

          <p className="authpage-demo">Demo: <b>alice</b> / password123 · <b>admin</b> / admin12345</p>
        </form>
        <p className="authpage-foot">Chirp · BCSE320L Web Application Security lab</p>
      </main>
    </div>
  );
}
