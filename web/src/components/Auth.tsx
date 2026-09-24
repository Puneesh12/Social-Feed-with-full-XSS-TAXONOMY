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
    <form className="auth" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
      {mode === 'register' && (
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="display name" />
      )}
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
      {error && <p className="error">{error}</p>}
      <button type="submit">{mode === 'login' ? 'Log in' : 'Register'}</button>
      <button type="button" className="link-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Log in'}
      </button>
      <p className="muted small">Demo logins: alice / password123 · admin / admin12345</p>
    </form>
  );
}
