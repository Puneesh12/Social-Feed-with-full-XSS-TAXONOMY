// Tiny fetch wrapper. Sends the CSRF header in the defended build by reading
// the readable csrf_token cookie (double-submit pattern).
function csrfToken(): string {
  const m = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

async function req(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = csrfToken();
  if (token) headers['X-CSRF-Token'] = token;
  const res = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  mode: () => req('GET', '/api/config'),
  me: () => req('GET', '/api/auth/me'),
  register: (username: string, password: string, displayName: string) =>
    req('POST', '/api/auth/register', { username, password, displayName }),
  login: (username: string, password: string) =>
    req('POST', '/api/auth/login', { username, password }),
  logout: () => req('POST', '/api/auth/logout'),
  feed: () => req('GET', '/api/feed'),
  createPost: (body: string, linkUrl: string) =>
    req('POST', '/api/posts', { body, linkUrl }),
  profile: (username: string) => req('GET', `/api/profile/${encodeURIComponent(username)}`),
  updateProfile: (p: { displayName: string; bio: string; website: string }) =>
    req('PUT', '/api/profile', p),
};
