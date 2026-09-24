import { useEffect, useState } from 'react';
import { api } from './api';
import { BUILD_MODE } from './build';
import { useHashRoute, navigate } from './router';
import { Feed } from './components/Feed';
import { Composer } from './components/Composer';
import { Profile } from './components/Profile';
import { ProfileEdit } from './components/ProfileEdit';
import { Auth } from './components/Auth';
import { DomSearchBanner } from './components/DomSearchBanner';

interface Me { id: number; username: string; role: string; display_name: string }

export default function App() {
  const route = useHashRoute();
  const [me, setMe] = useState<Me | null>(null);
  const [feedKey, setFeedKey] = useState(0);

  const refreshMe = () => api.me().then(setMe).catch(() => setMe(null));
  useEffect(() => { refreshMe(); }, []);

  async function logout() {
    await api.logout();
    setMe(null);
    navigate('/feed');
  }

  const view = route.parts[0] || 'feed';

  return (
    <div className="app">
      <header className="app-bar">
        <a className="brand" href="#/feed">🐦 Chirp</a>
        <nav>
          <a href="#/feed">Feed</a>
          <a href="#/search?q=hello">Search</a>
          {me && <a href={`#/profile/${me.username}`}>My profile</a>}
          {me && <a href="#/settings">Settings</a>}
        </nav>
        <div className="right">
          <span className={`mode-badge ${BUILD_MODE}`}>{BUILD_MODE} build</span>
          {me ? (
            <>
              <span className="who">@{me.username}</span>
              <button className="link-btn" onClick={logout}>Log out</button>
            </>
          ) : (
            <a href="#/login">Log in</a>
          )}
        </div>
      </header>

      <main className="content">
        {view === 'feed' && (
          <>
            {me && <Composer onPosted={() => setFeedKey((k) => k + 1)} />}
            <Feed key={feedKey} />
          </>
        )}

        {view === 'search' && (
          <section className="search-view">
            <DomSearchBanner term={route.query.q || ''} />
            <p className="muted">
              This client view demonstrates the DOM sink. The server-rendered
              reflected page is at <a href={`/search?q=${encodeURIComponent(route.query.q || '')}`}>/search</a>.
            </p>
          </section>
        )}

        {view === 'profile' && <Profile username={route.parts[1] || (me?.username ?? '')} />}

        {view === 'settings' && (me ? <ProfileEdit onSaved={() => setFeedKey((k) => k + 1)} /> : <Auth onAuth={refreshMe} />)}

        {view === 'login' && (me ? <p>Already logged in as @{me.username}.</p> : <Auth onAuth={refreshMe} />)}
      </main>

      <footer className="app-foot">
        Chirp — lab build for BCSE320L. {BUILD_MODE === 'vulnerable'
          ? 'Intentionally vulnerable — do not deploy.'
          : 'Defended build.'}
      </footer>
    </div>
  );
}
