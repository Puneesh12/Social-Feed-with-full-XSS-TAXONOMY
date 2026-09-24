import { BUILD_MODE } from '../build';

const FEATURES = [
  { icon: '📝', title: 'Post & share', desc: 'Chirp short messages, attach a link, and set a display name and bio.' },
  { icon: '👥', title: 'Follow & explore', desc: 'Follow other users, browse the feed, and search what people are saying.' },
  { icon: '🧪', title: 'A living XSS lab', desc: 'Every screen doubles as a hands-on demo of the full cross-site-scripting taxonomy.' },
];

const XSS = [
  ['Stored', 'Payloads saved in posts & profiles run for every viewer.'],
  ['Reflected', 'The search page echoes your query back into the HTML.'],
  ['DOM-based', 'The client writes URL data into the page via innerHTML.'],
  ['Mutation', 'A “safe” HTML cleaner is re-parsed and mutates into script.'],
  ['javascript: URL', 'A link whose href runs code when clicked.'],
];

export function Landing() {
  return (
    <div className="landing">
      {/* Nav */}
      <header className="lp-nav">
        <a className="lp-logo" href="#/"><span>🐦</span> Chirp</a>
        <div className="lp-nav-right">
          <span className={`lp-badge ${BUILD_MODE}`}>{BUILD_MODE} build</span>
          <a className="lp-link" href="#/login">Log in</a>
          <a className="btn-primary" href="#/signup">Sign up</a>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-text">
          <span className="lp-eyebrow">BCSE320L · Web Application Security</span>
          <h1>The social feed that <span className="grad">teaches you to hack it</span>.</h1>
          <p>
            Chirp is a tiny Twitter-style app with a twist: it ships in two builds from one code base —
            a deliberately <b>vulnerable</b> one you can break, and a <b>defended</b> one that blocks every attack.
          </p>
          <div className="lp-cta">
            <a className="btn-primary big" href="#/signup">Get started — it's free</a>
            <a className="btn-outline big" href="#/login">I already have an account</a>
          </div>
          <p className="lp-demo">Try the demo: <b>alice</b> / password123</p>
        </div>

        {/* Mock preview */}
        <div className="lp-hero-art">
          <div className="lp-mock">
            <div className="lp-mock-bar"><span></span><span></span><span></span></div>
            <div className="lp-mock-post">
              <div className="lp-mock-av" style={{ background: '#ff7a00' }}>A</div>
              <div><b>Alice</b> <span className="muted">@alice · 2m</span><p>shipping the new profile page today 🚀</p></div>
            </div>
            <div className="lp-mock-post">
              <div className="lp-mock-av" style={{ background: '#00ba7c' }}>B</div>
              <div><b>Bob</b> <span className="muted">@bob · 8m</span><p>anyone else love a good static site?</p></div>
            </div>
            <div className="lp-mock-post danger">
              <div className="lp-mock-av" style={{ background: '#7856ff' }}>E</div>
              <div><b>Eve</b> <span className="muted">@eve · now</span><p><code>&lt;img src=x onerror=…&gt;</code> ← blocked in defended build</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lp-section">
        <div className="lp-features">
          {FEATURES.map((f) => (
            <div className="lp-feature" key={f.title}>
              <div className="lp-feature-ico">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* XSS taxonomy */}
      <section className="lp-section lp-xss">
        <h2>Five kinds of XSS. One switch to defend them all.</h2>
        <p className="lp-sub">Flip <code>BUILD_MODE</code> and watch each attack stop working.</p>
        <div className="lp-xss-grid">
          {XSS.map(([t, d], i) => (
            <div className="lp-xss-card" key={t}>
              <span className="lp-xss-num">{i + 1}</span>
              <div><b>{t}</b><p>{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="lp-cta-band">
        <h2>Ready to break something (safely)?</h2>
        <a className="btn-primary big" href="#/signup">Create your account</a>
      </section>

      <footer className="lp-foot">
        <span>🐦 Chirp</span>
        <span className="muted">BCSE320L Web Application Security lab · Group 9</span>
      </footer>
    </div>
  );
}
