import { useEffect, useState } from 'react';
import { navigate } from '../router';

interface Step { icon: string; title: string; body: string; go: string; cta?: string }

export function Onboarding({ username, onClose }: { username: string; onClose: () => void }) {
  const STEPS: Step[] = [
    {
      icon: '🐦', go: '/feed',
      title: 'Welcome to Chirp',
      body: 'A tiny Twitter-style social feed — and a hands-on web-security lab. This quick tour walks you through the main features.',
    },
    {
      icon: '✍️', go: '/feed',
      title: 'Share what\'s happening',
      body: 'This is your Home feed. Use the composer at the top to post a chirp and optionally attach a link. Your posts appear here for everyone.',
    },
    {
      icon: '🔍', go: '/search?q=hello',
      title: 'Explore & search',
      body: 'Search the feed and browse what people are posting. This is also where the DOM-based XSS demo lives.',
    },
    {
      icon: '👤', go: '/settings',
      title: 'Set up your profile',
      body: 'Add a display name, bio, and website in Settings. (In the vulnerable build these fields are exactly where stored XSS can hide.)',
    },
    {
      icon: '🧪', go: '/feed',
      title: 'Try the lab',
      body: 'The right-hand panel lists five kinds of XSS. In the vulnerable build the payloads run; flip to the defended build and they\'re blocked.',
      cta: 'Start exploring',
    },
  ];

  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  // Navigate to the feature this step describes, so it's visible behind the card.
  useEffect(() => { navigate(step.go); }, [i]);

  return (
    <div className="onb-overlay" role="dialog" aria-modal="true">
      <div className="onb-card">
        <button className="onb-skip" onClick={onClose}>Skip tour</button>

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
          <button className="onb-next" onClick={() => (last ? onClose() : setI(i + 1))}>
            {last ? (step.cta || 'Done') : (step.cta || 'Next')} <span className="arrow">→</span>
          </button>
        </div>

        <p className="onb-hello">Step {i + 1} of {STEPS.length} · <b>@{username}</b></p>
      </div>
    </div>
  );
}
