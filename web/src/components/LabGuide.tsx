import { useState } from 'react';
import { isVulnerable } from '../build';
import { navigate } from '../router';

// Clickable, self-explaining guide to the five XSS demos. Each item explains
// what the attack is, where it lives in Chirp, and (in defended mode) what stops
// it — so the panel reads as documentation, not just buttons.
// A visible marker so the demo is obvious even when the browser blocks alert():
// it turns the page red and sets the tab title. alert() still fires in a normal
// browser as the classic proof.
const MARK = "document.body.style.background='#c0392b';document.title='XSS executed'";
const STORED = `<img src=x onerror="alert('stored XSS!');${MARK}">`;
const JSURL = `javascript:alert(document.domain),${MARK}`;
const DOMQ = `<img src=x onerror="alert('DOM XSS!');${MARK}">`;
const REFQ = `<script>alert('reflected XSS!');${MARK}</script>`;
const MUT = `<noscript><p title="</noscript><img src=x onerror="alert('mutation XSS!');${MARK}">`;

interface Item {
  n: number;
  title: string;
  tag: string;               // class / CWE
  what: string;              // plain-English explanation
  where: string;            // where it lives in Chirp
  blocked: string;          // the control that stops it (defended)
  actions: React.ReactNode;  // buttons
}

function copy(text: string, done: () => void) {
  navigator.clipboard?.writeText(text).then(done, done);
}

export function LabGuide({ loggedIn }: { loggedIn: boolean }) {
  const [copied, setCopied] = useState('');
  const flash = (id: string) => { setCopied(id); setTimeout(() => setCopied(''), 1200); };

  const items: Item[] = [
    {
      n: 1, title: 'Stored XSS', tag: 'CWE-79 · persistent',
      what: 'You save text (a display name, bio, or post). The server stores it and serves it to everyone. If it is not encoded when rendered, your script runs in every visitor\'s browser — and can steal their session cookie.',
      where: 'Settings → Display name / Bio, or any post body.',
      blocked: 'Output is HTML-encoded and rendered as text (React text node), so the browser shows the characters instead of executing them.',
      actions: (
        <>
          <button className="lab-btn" onClick={() => copy(STORED, () => flash('s'))}>{copied === 's' ? 'Copied ✓' : 'Copy payload'}</button>
          <button className="lab-btn ghost" onClick={() => navigate('/settings')}>Open Settings</button>
        </>
      ),
    },
    {
      n: 2, title: 'Reflected XSS', tag: 'CWE-79 · in the URL',
      what: 'The server-rendered search page drops your ?q= value straight back into the HTML it returns. Anyone who opens a crafted link runs the script immediately — no data is stored.',
      where: 'GET /search?q=…',
      blocked: 'The query is HTML-encoded before it is written into the page, and a nonce-based CSP blocks any inline script.',
      actions: (
        <a className="lab-btn" href={`/search?q=${encodeURIComponent(REFQ)}`} target="_blank" rel="noreferrer">Open /search ↗</a>
      ),
    },
    {
      n: 3, title: 'DOM-based XSS', tag: 'CWE-79 · client-side',
      what: 'The attack never reaches the server. The app\'s own JavaScript reads the URL fragment (#/search?q=…) and writes it into the page with innerHTML, so the payload executes purely in the browser.',
      where: 'Client hash router → the search banner.',
      blocked: 'The value is written with textContent (not innerHTML), and Trusted Types would reject a raw HTML assignment anyway.',
      actions: (
        <button className="lab-btn" onClick={() => navigate(`/search?q=${DOMQ}`)}>Run in app</button>
      ),
    },
    {
      n: 4, title: 'Mutation XSS (mXSS)', tag: 'CWE-79 · re-parse',
      what: 'A naive "HTML cleaner" strips <script> and looks safe — but when its output is inserted and the browser re-parses it, the markup mutates back into a working script. Home-grown sanitisers fail this way.',
      where: 'GET /render/preview (link-preview card).',
      blocked: 'DOMPurify (a real parser-based sanitiser) cleans the markup once, and the result is never re-parsed.',
      actions: loggedIn ? (
        <a className="lab-btn" href={`/render/preview?url=demo&html=${encodeURIComponent(MUT)}`} target="_blank" rel="noreferrer">Open preview ↗</a>
      ) : (
        <span className="lab-note">Log in first to try this one.</span>
      ),
    },
    {
      n: 5, title: 'javascript: URL', tag: 'CWE-79 · unsafe scheme',
      what: 'A link whose address is javascript:… runs code when clicked. Output encoding alone does not stop it, because the value sits in an href, not in text.',
      where: 'Settings → Website (and post links).',
      blocked: 'A URL scheme allow-list keeps only http/https/mailto; anything else becomes an inert "#".',
      actions: (
        <>
          <button className="lab-btn" onClick={() => copy(JSURL, () => flash('j'))}>{copied === 'j' ? 'Copied ✓' : 'Copy payload'}</button>
          <button className="lab-btn ghost" onClick={() => navigate('/settings')}>Open Settings</button>
        </>
      ),
    },
  ];

  return (
    <div className="rail-card lab-guide">
      <h3>🧪 XSS lab</h3>
      <div className={`lab-status ${isVulnerable ? 'vulnerable' : 'defended'}`}>
        {isVulnerable ? '⚠️ Vulnerable build — these attacks work' : '🛡️ Defended build — these attacks are blocked'}
      </div>
      <p className="lab-intro">
        The same five attacks are wired to the buttons below. In this build they
        {isVulnerable ? ' execute — watch them run.' : ' are stopped — confirm nothing runs.'}
        {' '}Each card explains what the flaw is and how it's fixed.
      </p>

      {items.map((it) => (
        <div className="lab-item" key={it.n}>
          <div className="lab-item-top">
            <span className="lab-num">{it.n}</span>
            <span className="lab-title">{it.title}</span>
            <span className="lab-tag">{it.tag}</span>
          </div>
          <p className="lab-desc">{it.what}</p>
          <p className="lab-meta"><b>Where:</b> {it.where}</p>
          {!isVulnerable && <p className="lab-fix"><b>Blocked by:</b> {it.blocked}</p>}
          <div className="lab-actions">{it.actions}</div>
        </div>
      ))}

      <p className="lab-hint">
        💡 It's one code base. The switch <code>BUILD_MODE</code> chooses vulnerable or
        defended — the features are identical, only the controls change.
      </p>
    </div>
  );
}
