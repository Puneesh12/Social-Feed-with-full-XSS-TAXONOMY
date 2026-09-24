import { useState } from 'react';
import { isVulnerable } from '../build';
import { navigate } from '../router';

// Friendly, clickable guide to the five XSS demos. Reflects the current build:
// in vulnerable mode the payloads fire; in defended mode they're blocked so you
// can confirm the fix.
const STORED = `<img src=x onerror=alert('stored XSS!')>`;
const JSURL = `javascript:alert(document.domain)`;
const DOMQ = `<img src=x onerror=alert('DOM XSS!')>`;
const REFQ = `<script>alert('reflected XSS!')</script>`;
const MUT = `<noscript><p title="</noscript><img src=x onerror=alert('mutation XSS!')>`;

function copy(text: string, done: () => void) {
  navigator.clipboard?.writeText(text).then(done, done);
}

export function LabGuide({ loggedIn }: { loggedIn: boolean }) {
  const [copied, setCopied] = useState('');
  const flash = (id: string) => { setCopied(id); setTimeout(() => setCopied(''), 1200); };

  return (
    <div className="rail-card lab-guide">
      <h3>🧪 Try the lab</h3>
      <div className={`lab-status ${isVulnerable ? 'vulnerable' : 'defended'}`}>
        {isVulnerable ? '⚠️ Vulnerable — these will fire' : '🛡️ Defended — these are now blocked'}
      </div>
      <p className="lab-intro">
        Five kinds of cross-site scripting. Click to try each one
        {isVulnerable ? ' and watch it run.' : ' and confirm it no longer runs.'}
      </p>

      <div className="lab-item">
        <div className="lab-item-top"><span className="lab-num">1</span><span className="lab-title">Stored</span></div>
        <p className="lab-desc">Save a nasty display name, then everyone who sees your profile runs it.</p>
        <div className="lab-actions">
          <button className="lab-btn" onClick={() => copy(STORED, () => flash('s'))}>{copied === 's' ? 'Copied ✓' : 'Copy payload'}</button>
          <button className="lab-btn ghost" onClick={() => navigate('/settings')}>Open Settings</button>
        </div>
      </div>

      <div className="lab-item">
        <div className="lab-item-top"><span className="lab-num">2</span><span className="lab-title">Reflected</span></div>
        <p className="lab-desc">The search page echoes your query straight back into the HTML.</p>
        <div className="lab-actions">
          <a className="lab-btn" href={`/search?q=${encodeURIComponent(REFQ)}`} target="_blank" rel="noreferrer">Open /search ↗</a>
        </div>
      </div>

      <div className="lab-item">
        <div className="lab-item-top"><span className="lab-num">3</span><span className="lab-title">DOM-based</span></div>
        <p className="lab-desc">The app reads the URL and writes it into the page with innerHTML.</p>
        <div className="lab-actions">
          <button className="lab-btn" onClick={() => navigate(`/search?q=${DOMQ}`)}>Run in app</button>
        </div>
      </div>

      <div className="lab-item">
        <div className="lab-item-top"><span className="lab-num">4</span><span className="lab-title">Mutation</span></div>
        <p className="lab-desc">A “safe” HTML cleaner is re-parsed and mutates back into script.</p>
        <div className="lab-actions">
          {loggedIn ? (
            <a className="lab-btn" href={`/render/preview?url=demo&html=${encodeURIComponent(MUT)}`} target="_blank" rel="noreferrer">Open preview ↗</a>
          ) : (
            <span className="lab-desc" style={{ margin: 0 }}>Log in first to try this one.</span>
          )}
        </div>
      </div>

      <div className="lab-item">
        <div className="lab-item-top"><span className="lab-num">5</span><span className="lab-title">javascript: URL</span></div>
        <p className="lab-desc">Put this in your profile website; clicking the link runs code.</p>
        <div className="lab-actions">
          <button className="lab-btn" onClick={() => copy(JSURL, () => flash('j'))}>{copied === 'j' ? 'Copied ✓' : 'Copy payload'}</button>
          <button className="lab-btn ghost" onClick={() => navigate('/settings')}>Open Settings</button>
        </div>
      </div>

      <p className="lab-hint">
        💡 Flip the whole app between <b>vulnerable</b> and <b>defended</b> with one switch
        (<code>BUILD_MODE</code>) and re-run these to see each defense working.
      </p>
    </div>
  );
}
