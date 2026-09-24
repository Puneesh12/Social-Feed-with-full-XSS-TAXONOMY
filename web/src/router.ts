// -----------------------------------------------------------------------------
// Minimal client-side hash router. Routes look like:
//   #/feed
//   #/profile/alice
//   #/search?q=...
//   #/login
//
// The parsed route + query are handed to the app. The DOM-based XSS sink
// (XSS-D-01) is NOT here — it lives in the component that renders the query
// (see DomSearchBanner), so the vulnerable/defended difference stays visible.
// -----------------------------------------------------------------------------
import { useEffect, useState } from 'react';

export interface Route {
  path: string; // e.g. "/profile/alice"
  parts: string[]; // e.g. ["profile", "alice"]
  query: Record<string, string>;
  rawQuery: string; // the exact string after '?', undecoded beyond the browser
}

export function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/feed';
  const [pathPart, queryPart = ''] = hash.split('?');
  const path = pathPart || '/feed';
  const parts = path.split('/').filter(Boolean);
  const query: Record<string, string> = {};
  for (const kv of queryPart.split('&')) {
    if (!kv) continue;
    const [k, v = ''] = kv.split('=');
    try {
      query[decodeURIComponent(k)] = decodeURIComponent(v);
    } catch {
      query[k] = v;
    }
  }
  return { path, parts, query, rawQuery: queryPart };
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash());
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function navigate(to: string) {
  window.location.hash = to;
}
