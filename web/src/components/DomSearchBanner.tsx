// -----------------------------------------------------------------------------
// DOM-based XSS sink (XSS-D-01).
//
// The client reads the search term straight out of the URL fragment and writes
// it into the page. In the vulnerable build it is assigned via innerHTML (the
// source is the URL, the sink is innerHTML — no server involved). In the
// defended build it is assigned via textContent, and Trusted Types (from the
// CSP) would block a raw innerHTML assignment anyway.
// -----------------------------------------------------------------------------
import { useEffect, useRef } from 'react';
import { isVulnerable } from '../build';

export function DomSearchBanner({ term }: { term: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const message = `Showing results for: ${term}`;
    if (isVulnerable) {
      // (!) THE DOM SINK: URL-derived data assigned as HTML.
      el.innerHTML = message;
    } else {
      el.textContent = message;
    }
  }, [term]);
  return <div className="dom-banner" ref={ref} />;
}
