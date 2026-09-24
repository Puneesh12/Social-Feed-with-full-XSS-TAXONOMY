import { useState } from 'react';
import { BUILD_MODE } from '../build';

const COVERS = ['Stored', 'Reflected', 'DOM-based', 'Mutation', 'javascript:'];

const FEATURES = [
  { icon: '🐦', title: 'A real social feed', desc: 'Post, follow, edit your profile, search — a full Twitter-style app, not a toy.' },
  { icon: '🧪', title: 'Break it, safely', desc: 'One vulnerable build reproduces all five XSS classes with working proof-of-concepts.' },
  { icon: '🛡️', title: 'Then defend it', desc: 'Flip one switch and the same app blocks every attack — encoding, CSP, sanitisation.' },
];

// Etched-style lighthouse illustration (inline SVG, teal line-art on cream).
function Lighthouse() {
  return (
    <svg className="lp-illus" viewBox="0 0 620 620" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--illus-sea-a)" />
          <stop offset="1" stopColor="var(--illus-sea-b)" />
        </linearGradient>
      </defs>
      {/* clouds */}
      <g stroke="var(--illus-line)" strokeWidth="1.4" opacity=".55" fill="none">
        <path d="M60 150c30-26 84-20 100 6 34-14 78 6 78 34" />
        <path d="M360 96c26-22 74-16 88 8 30-12 70 6 70 30" />
        <path d="M120 92c18-14 46-10 56 6" />
      </g>
      {/* sea */}
      <path d="M0 430c120 26 220-18 320 4s220 28 300-6v222H0z" fill="url(#sea)" />
      <g stroke="var(--illus-line)" strokeWidth="1.5" opacity=".5" fill="none">
        <path d="M20 470c90 20 150-12 240 4s200 22 340-8" />
        <path d="M0 512c110 22 190-14 300 2s210 24 320-6" />
        <path d="M30 556c100 18 170-12 270 2s180 20 290-4" />
        <path d="M0 596c120 16 180-10 300 4s200 16 320-2" />
      </g>
      {/* rock */}
      <path d="M300 470l40-34 60 10 40-26 60 22 60-8 40 34v50H300z" fill="var(--illus-rock)" stroke="var(--illus-line)" strokeWidth="1.6" />
      <g stroke="var(--illus-line)" strokeWidth="1.1" opacity=".55" fill="none">
        <path d="M360 452l14 22M420 448l10 26M470 456l12 20" />
      </g>
      {/* lighthouse */}
      <g stroke="var(--illus-line)" strokeWidth="1.8" strokeLinejoin="round" fill="none">
        <path d="M452 214h56l14 224h-84z" fill="var(--illus-tower)" />
        {/* stripes */}
        <path d="M448 262h72M446 312h76M444 366h80M442 420h84" strokeWidth="1.3" opacity=".7" />
        {/* gallery */}
        <path d="M444 214h72v-16h-72z" fill="var(--illus-band)" />
        {/* lantern room */}
        <path d="M456 198h48v-40h-48z" fill="var(--illus-lantern)" />
        <path d="M468 158v40M492 158v40" strokeWidth="1.2" opacity=".7" />
        {/* dome */}
        <path d="M452 158h56l-28-30z" fill="var(--illus-band)" />
        <circle cx="480" cy="120" r="4" fill="var(--illus-line)" />
      </g>
      {/* light rays */}
      <g stroke="var(--illus-ray)" strokeWidth="2" opacity=".5">
        <path d="M456 178l-70-26M456 190l-74 6M504 178l70-26M504 190l74 6" />
      </g>
      {/* little keeper house */}
      <g stroke="var(--illus-line)" strokeWidth="1.6" fill="none">
        <path d="M360 420h70v-46h-70z" fill="var(--illus-tower)" />
        <path d="M354 374l41-24 41 24z" fill="var(--illus-band)" />
        <rect x="380" y="392" width="16" height="18" fill="var(--illus-lantern)" />
      </g>
      {/* birds */}
      <g stroke="var(--illus-line)" strokeWidth="1.6" fill="none" opacity=".7">
        <path d="M150 200c8-8 14-8 20 0 6-8 12-8 20 0" />
        <path d="M210 168c6-6 11-6 16 0 5-6 10-6 16 0" />
      </g>
    </svg>
  );
}

export function Landing() {
  const [dark, setDark] = useState(false);

  return (
    <div className={`lp ${dark ? '' : 'lp-light'}`}>
      {/* Hero with full-bleed illustration background */}
      <section className="lp-hero-bg">
        <div className="lp-hero-overlay" />

        <header className="lp-nav">
          <a className="lp-logo" href="#/">
            <span className="lp-logo-mark">🐦</span> Chirp
          </a>
          <nav className="lp-links">
            <a href="#/signup">Features</a>
            <a href="https://github.com/Puneesh12/Social-Feed-with-full-XSS-TAXONOMY" target="_blank" rel="noreferrer">GitHub</a>
            <a href="#/login">The Lab</a>
          </nav>
          <div className="lp-nav-cta">
            <a className="lp-ghost" href="#/login">Log in</a>
            <a className="lp-solid" href="#/signup">Get started</a>
            <button className="lp-moon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
              {dark ? '☀' : '☾'}
            </button>
          </div>
        </header>

        <div className="lp-hero-inner">
          <div className="lp-hero-text">
            <span className="lp-badge"><span className="lp-badge-dot">🛡</span> A hands-on web-security lab</span>
            <h1>
              Social feed,<br />built to be <span className="lp-italic">hacked.</span>
            </h1>
            <p>
              Chirp is a full Twitter-style app that ships in two builds from one code base — a deliberately
              vulnerable one you can break, and a defended one that blocks every attack. Learn XSS by doing.
            </p>
            <div className="lp-cta">
              <a className="lp-solid big" href="#/signup">Get started</a>
              <a className="lp-outline big" href="#/login">Try the demo</a>
            </div>
            <div className="lp-trusted">
              <span className="lp-trusted-label">Covers</span>
              {COVERS.map((c) => <span className="lp-chip" key={c}>{c}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lp-band">
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

      {/* CTA */}
      <section className="lp-cta-band">
        <h2>Ready to break something <span className="lp-italic">(safely)</span>?</h2>
        <a className="lp-solid big" href="#/signup">Create your account</a>
      </section>

      <footer className="lp-foot">
        <span className="lp-logo"><span className="lp-logo-mark">🐦</span> Chirp</span>
        <span className="lp-foot-note">BCSE320L · Web Application Security · Group 9</span>
      </footer>
    </div>
  );
}
