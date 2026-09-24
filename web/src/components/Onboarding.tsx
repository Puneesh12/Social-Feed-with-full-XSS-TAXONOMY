import { useState } from 'react';
import { navigate } from '../router';

interface Step { icon: string; title: string; body: string; cta?: string; go?: string }

const STEPS: Step[] = [
  {
    icon: '🐦',
    title: 'Welcome to Chirp',
    body: "A tiny Twitter-style social feed — and a hands-on web-security lab. Post, follow, and explore, while learning how cross-site scripting works.",
  },
  {
    icon: '✍️',
    title: 'Share what\'s happening',
    body: 'Use the composer on Home to post a chirp, add a link, and set your display name & bio in Settings. Everything you post shows up in the feed.',
    cta: 'Go to Home', go: '/feed',
  },
  {
    icon: '🧪',
    title: 'Try the lab',
    body: 'The right-hand panel lists five kinds of XSS. In the vulnerable build the payloads actually run; flip the build to defended and they\'re blocked.',
  },
  {
    icon: '🛡️',
    title: 'You\'re all set',
    body: 'Explore the feed, check out a profile, and when you\'re ready, try the lab payloads. Have fun — safely.',
    cta: 'Start exploring', go: '/feed',
  },
];

export function Onboarding({ username, onClose }: { username: string; onClose: () => void }) {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  function finish(go?: string) {
    if (go) navigate(go);
    onClose();
  }

  return (
    <div className="onb-overlay" role="dialog" aria-modal="true">
      <div className="onb-card">
        <button className="onb-skip" onClick={() => finish()}>Skip</button>

        <div className="onb-icon">{step.icon}</div>
        <h2 className="onb-title">{step.title}</h2>
        <p className="onb-body">{step.body}</p>

        <div className="onb-dots">
          {STEPS.map((_, n) => (
            <span key={n} className={`onb-dot ${n === i ? 'active' : ''}`} onClick={() => setI(n)} />
          ))}
        </div>

        <div className="onb-actions">
          {i > 0 && <button className="onb-back" onClick={() => setI(i - 1)}>Back</button>}
          {!last ? (
            <button className="onb-next" onClick={() => (step.go ? finishNext(step.go) : setI(i + 1))}>
              {step.cta || 'Next'} <span className="arrow">→</span>
            </button>
          ) : (
            <button className="onb-next" onClick={() => finish(step.go)}>
              {step.cta || 'Done'} <span className="arrow">→</span>
            </button>
          )}
        </div>

        <p className="onb-hello">Signed in as <b>@{username}</b></p>
      </div>
    </div>
  );

  // Middle steps with a CTA navigate but keep the tour going.
  function finishNext(go: string) {
    navigate(go);
    setI(i + 1);
  }
}
