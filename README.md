# Chirp — Social Feed with a Full XSS Taxonomy

Case-study project for **BCSE320L – Web Application Security**.

Chirp is a minimal social feed (post box, profile display-name/bio, link
sharing, search) built to demonstrate **all four classes of cross-site
scripting** — stored, reflected, DOM-based, and mutation-based — plus a
`javascript:`-URL case, and then to **defend against every one** from the *same
code base*.

> ⚠️ **The vulnerable build is intentionally insecure. Run it only in the
> isolated local lab. Never deploy it or point it at real data or users.**

One switch, `BUILD_MODE=vulnerable | defended`, selects the behaviour
everywhere (report §6.4). The two builds differ **only** in the security
controls, never in features — so you can attribute each blocked attack to a
specific control.

---

## Architecture (report §4.2)

```
Browser (React SPA)  ──HTTP──▶  Nginx edge  ──▶  Express API  ──▶  PostgreSQL
   hash router, DOM sinks         headers/CSP       encoding,        Redis (sessions)
                                                    CSRF, sinks
                                                        │
                                              Attacker collector (lab-only :9000)
```

- **web/** — React 18 + Vite + TypeScript SPA. Client render + DOM sinks.
- **api/** — Node 20 + Express 4. JSON API + two server-rendered pages
  (`/search`, `/render/preview`) that carry the reflected + mutation sinks.
- **nginx/** — edge reverse proxy; adds hardening headers in the defended build.
- **collector/** — tiny attacker listener to *prove* exfiltration in the lab.
- **payloads/** — Appendix C payload catalogue.

---

## Quick start

```bash
cp .env.example .env            # choose BUILD_MODE here (default: vulnerable)
docker compose up --build       # brings up web, api, db, redis, nginx, collector
docker compose exec api node src/seed.js   # seed demo users + posts
```

Then open **http://localhost:8080**.

Demo logins: `alice / password123`, `bob / password123`, `admin / admin12345`.

**Switch builds:** edit `.env` and set both `BUILD_MODE` and `VITE_BUILD_MODE`
to `defended` (or `vulnerable`), then:

```bash
docker compose up --build
```

Check the live mode any time: `curl http://localhost:8080/api/config`.

### No-Docker dev (optional)

```bash
# terminal 1 — API (needs local Postgres + Redis, or point env at them)
cd api && npm install && BUILD_MODE=vulnerable npm start
# terminal 2 — SPA
cd web && npm install && VITE_BUILD_MODE=vulnerable npm run dev   # http://localhost:5173
```

---

## The five findings and where they live

| ID | Class | Sink location (vulnerable build) | Source file |
|----|-------|----------------------------------|-------------|
| **XSS-S-01** | Stored | Feed/profile render user text via `innerHTML` | [web/src/render.tsx](web/src/render.tsx) |
| **XSS-R-01** | Reflected | `/search?q=` echoed into HTML response | [api/src/routes/pages.js](api/src/routes/pages.js) |
| **XSS-D-01** | DOM-based | Hash router term → `innerHTML` | [web/src/components/DomSearchBanner.tsx](web/src/components/DomSearchBanner.tsx) |
| **XSS-M-01** | Mutation | Naive `<script>` strip then re-parse | [api/src/security.js](api/src/security.js) · [api/src/routes/pages.js](api/src/routes/pages.js) |
| **XSS-P-01** | `javascript:` URL | Profile website/link `href`, no scheme check | [api/src/security.js](api/src/security.js) · [web/src/render.tsx](web/src/render.tsx) |

Payloads for each: [payloads/payloads.md](payloads/payloads.md).

---

## Control → finding mapping (report §6.5, §8)

In the **defended** build, each attack is blocked by a named control:

| Finding | Primary control | Defence-in-depth backup |
|---------|-----------------|-------------------------|
| XSS-S-01 (stored) | Contextual output encoding (React text nodes / `escapeHtml`) | CSP `script-src 'self'`; `HttpOnly` cookie limits theft |
| XSS-R-01 (reflected) | HTML output encoding of `q` (`outHtml`) | nonce-based CSP on the page |
| XSS-D-01 (DOM) | `textContent` instead of `innerHTML` | Trusted Types (`require-trusted-types-for 'script'`) |
| XSS-M-01 (mutation) | DOMPurify (parser-based), **no re-parse** | CSP |
| XSS-P-01 (js URL) | URL scheme allow-list (`safeUrl`/`safeHref`) | CSP blocks inline execution |

All of these live in one place server-side —
[api/src/security.js](api/src/security.js) — and one place client-side —
[web/src/render.tsx](web/src/render.tsx) — so the diff between builds is small
and readable.

Additional hardening in the defended build: `Secure`/`HttpOnly`/`SameSite`
cookies, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, CSRF double-submit
tokens, auth rate limiting, Argon2id password hashing, parameterised SQL, and a
least-privilege database role.

---

## Verifying the defence

```bash
# with the stack up in either mode:
./scripts/smoke-test.sh
```

It detects the live mode and asserts the reflected sink behaves correctly
(raw markup in vulnerable, encoded in defended). To demonstrate defence in
depth, disable one control at a time and re-test (report §6.5).

---

## Repository layout

```
.
├── docker-compose.yml        # full stack (report Appendix D)
├── .env.example              # BUILD_MODE switch + config
├── api/                      # Express API + server-rendered sink pages
│   ├── src/security.js       # ← all server-side vulnerable/defended divergence
│   └── src/routes/
├── web/                      # React + Vite SPA
│   ├── src/render.tsx        # ← all client-side vulnerable/defended divergence
│   └── src/components/
├── nginx/                    # edge proxy + per-mode header config
├── collector/                # lab-only exfil listener
├── payloads/payloads.md      # Appendix C
├── scripts/smoke-test.sh
├── docs/                      # place the report (REVIEW1WEBAPP) here
└── .github/workflows/security.yml
```

---

## Ethical use

All testing is performed only against this application, which we built, in an
isolated local lab. No third-party, production, or unauthorised system is
tested, and no real user data is used (report Declaration / Appendix E).

## Team (Group 9)

Puneesh Gulati (23BCI0168) · Abhinav (23BCI0211) · Lakshya (23BCI0153) ·
Anshuman (23BCI0170) · Prince (23BCI0145).
