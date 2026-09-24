import { useState } from 'react';
import { api } from '../api';

export function Auth({ onAuth }: { onAuth: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') await api.login(username, password);
      else await api.register(username, password, displayName || username);
      onAuth();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo">🐦</div>
        <h2>{mode === 'login' ? 'Sign in to Chirp' : 'Join Chirp today'}</h2>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoFocus />
        {mode === 'register' && (
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" />
        )}
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {error && <p className="error">{error}</p>}
        <button className="btn-primary full" type="submit">{mode === 'login' ? 'Log in' : 'Create account'}</button>
        <button type="button" className="link-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already registered? Log in'}
        </button>
        <p className="muted small demo-note">Demo: <b>alice</b> / password123 · <b>admin</b> / admin12345</p>
      </form>
    </div>
  );
}
