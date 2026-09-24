import { useEffect, useState } from 'react';
import { api } from './api';
import { BUILD_MODE } from './build';
import { useHashRoute, navigate } from './router';
import { Feed } from './components/Feed';
import { Composer } from './components/Composer';
import { Profile } from './components/Profile';
import { ProfileEdit } from './components/ProfileEdit';
import { Search } from './components/Search';
import { Avatar } from './components/Avatar';
import { LabGuide } from './components/LabGuide';
import { Icon } from './components/Icon';
import { AuthPage } from './components/AuthPage';
import { Landing } from './components/Landing';

interface Me { id: number; username: string; role: string; display_name: string }

const NAV = [
  { key: 'feed', label: 'Home', icon: 'home', href: '#/feed' },
  { key: 'search', label: 'Explore', icon: 'explore', href: '#/search?q=' },
  { key: 'profile', label: 'Profile', icon: 'profile', href: '#/profile' },
  { key: 'settings', label: 'Settings', icon: 'settings', href: '#/settings' },
];

export default function App() {
  const route = useHashRoute();
  const [me, setMe] = useState<Me | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [feedKey, setFeedKey] = useState(0);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('chirp:nav') === '1'; } catch { return false; }
  });
  const toggleNav = () => setCollapsed((c) => {
    const next = !c;
    try { localStorage.setItem('chirp:nav', next ? '1' : '0'); } catch { /* ignore */ }
    return next;
  });

  const refreshMe = () =>
    api.me().then(setMe).catch(() => setMe(null)).finally(() => setAuthChecked(true));
  useEffect(() => { refreshMe(); }, []);

  // Logged-in users should never sit on the auth routes — send them to the feed.
  useEffect(() => {
    if (authChecked && me && (route.path === '/login' || route.path === '/signup')) {
      navigate('/feed');
    }
  }, [authChecked, me, route.path]);

  // Gate: nothing loads until we know if you're logged in (avoids a flash).
  if (!authChecked) {
    return <div className="boot"><span className="boot-logo">🐦</span></div>;
  }
  // Logged out: landing page first, then sign in / sign up, then the app.
  if (!me) {
    if (route.path === '/login' || route.path === '/signup') {
      return <AuthPage onAuth={refreshMe} initialMode={route.path === '/signup' ? 'register' : 'login'} />;
    }
    return <Landing />;
  }

  async function logout() {
    await api.logout();
    setMe(null);
    navigate('/feed');
  }

  const view = route.parts[0] || 'feed';
  const titles: Record<string, string> = {
    feed: 'Home', search: 'Explore', profile: 'Profile', settings: 'Settings',
  };

  return (
    <div className={`layout ${collapsed ? 'nav-collapsed' : ''}`}>
      {/* ---------- Left sidebar ---------- */}
      <aside className="sidebar">
        <div className="brand-row">
          <a className="brand" href="#/feed">
            <span className="brand-mark">🐦</span><span className="brand-txt">Chirp</span>
          </a>
          <button className="nav-toggle" onClick={toggleNav} title={collapsed ? 'Expand menu' : 'Collapse menu'} aria-label="Toggle menu">
            {collapsed ? '»' : '«'}
          </button>
        </div>
        <nav className="nav">
          {NAV.map((n) => {
            const href = n.key === 'profile' && me ? `#/profile/${me.username}` : n.href;
            return (
              <a key={n.key} href={href} className={`nav-item ${view === n.key ? 'active' : ''}`} title={n.label}>
                <span className="nav-ico"><Icon name={n.icon} /></span>
                <span className="nav-label">{n.label}</span>
              </a>
            );
          })}
        </nav>
        <a className="btn-compose" href="#/feed">Chirp</a>
        <button className="user-chip" onClick={logout} title="Log out">
          <Avatar name={me.display_name || me.username} size={36} />
          <span className="user-chip-txt">
            <b>{me.display_name || me.username}</b>
            <span className="muted">@{me.username}</span>
          </span>
          <span className="user-chip-more">⏻</span>
        </button>
      </aside>

      {/* ---------- Center column ---------- */}
      <main className="main">
        <header className="main-head">
          <div className="main-inner main-head-inner">
            <h1>{titles[view] || 'Chirp'}</h1>
            <span className={`mode-badge ${BUILD_MODE}`}>{BUILD_MODE}</span>
          </div>
        </header>

        <div className="main-inner">
          {view === 'feed' && (
            <>
              <Composer me={me.display_name || me.username} onPosted={() => setFeedKey((k) => k + 1)} />
              <Feed key={feedKey} />
            </>
          )}

          {view === 'search' && <Search term={route.query.q || ''} />}

          {view === 'profile' && <Profile username={route.parts[1] || me.username} me={me.username} />}

          {view === 'settings' && <ProfileEdit onSaved={() => setFeedKey((k) => k + 1)} />}

          {(view === 'login' || view === 'signup') && (
            <>
              <Composer me={me.display_name || me.username} onPosted={() => setFeedKey((k) => k + 1)} />
              <Feed key={feedKey} />
            </>
          )}
        </div>
      </main>

      {/* ---------- Right rail ---------- */}
      <aside className="rail">
        <form
          className="search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            const v = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
            navigate(`/search?q=${encodeURIComponent(v)}`);
          }}
        >
          <span className="search-ico">🔍</span>
          <input name="q" placeholder="Search Chirp" defaultValue={route.query.q || ''} />
        </form>

        <LabGuide loggedIn={true} />

        <div className="rail-card">
          <h3>Who to follow</h3>
          {['alice', 'bob', 'admin'].map((u) => (
            <a key={u} className="who" href={`#/profile/${u}`}>
              <Avatar name={u} size={38} />
              <span className="who-txt"><b>{u}</b><span className="muted">@{u}</span></span>
              <span className="who-follow">Follow</span>
            </a>
          ))}
        </div>

        <footer className="rail-foot muted small">
          Chirp · BCSE320L lab · {BUILD_MODE} build<br />
          {BUILD_MODE === 'vulnerable' ? 'Intentionally insecure — lab only.' : 'Hardened build.'}
        </footer>
      </aside>
    </div>
  );
}
