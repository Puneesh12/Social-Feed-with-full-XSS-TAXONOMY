# Chirp — Presentation & Demo Guide

This is the script for demonstrating the project (Review 2 / 3). It shows the
**same application** attacked in the vulnerable build and then **blocked** in the
defended build.

---

## 1. Run both builds side by side

The two builds are one code base selected by `BUILD_MODE`. For a live demo, run
**both at once** on different ports:

```bash
./scripts/demo-up.sh
```

- **Vulnerable** → http://localhost:8080
- **Defended** → http://localhost:8081

Open each in its own browser window, side by side on screen. Log in on both with
`alice / password123`.

Stop everything after:

```bash
./scripts/demo-down.sh
```

> If you only want one build at a time instead, edit `.env`
> (`BUILD_MODE` + `VITE_BUILD_MODE`) and run `docker compose up -d --build`.

---

## 2. Presentation tips (so it "shows properly" on screen)

- **Use a real browser** (Chrome/Firefox), not an embedded preview — pop-ups and
  the attacker collector behave normally there.
- After switching a build, **hard-reload** (Cmd/Ctrl+Shift+R). The SPA bundle is
  cached, so a soft refresh can show the old build.
- `alert()` proves *execution*, but for a slide/recording the **attacker
  collector** is clearer and less intrusive:
  - Vulnerable collector log: http://localhost:9000/log
  - Defended collector log: http://localhost:9001/log
  - A stored payload that beacons the cookie is in `payloads/payloads.md`.
- Keep the **"Try the lab"** panel (right rail) visible — it has one-click
  buttons for each attack and a status badge that reads **red "Vulnerable"** vs
  **green "Defended"**.

---

## 3. The walkthrough (repeat each on :8080 then :8081)

For every attack: **run it on :8080 (it fires)** → **run the same on :8081 (it's
blocked)** → say which control stopped it.

| # | Attack | Where | Vulnerable (:8080) | Defended (:8081) | Control that blocks it |
|---|--------|-------|--------------------|------------------|------------------------|
| 1 | **Stored** | Settings → display name / a post | script runs for every viewer | shows as inert text | contextual output encoding |
| 2 | **Reflected** | `/search?q=<script>…</script>` | echoed & executed | HTML-encoded | output encoding + CSP |
| 3 | **DOM-based** | `#/search?q=<img onerror=…>` | `innerHTML` runs it | `textContent` / Trusted Types | safe DOM sink |
| 4 | **Mutation** | `/render/preview?html=…` | re-parse mutates to script | DOMPurify, no re-parse | parser-based sanitiser |
| 5 | **javascript: URL** | profile website field | link runs code | neutralised to `#` | URL scheme allow-list |

Payloads to paste are in **`payloads/payloads.md`**. The one-click buttons in the
right-rail "Try the lab" panel run 2–4 of these for you.

### Suggested 5-minute flow
1. Show the two windows. Point out the **red vs green** badge — same app, one switch.
2. **Stored XSS:** on :8080, set display name to
   `<img src=x onerror=alert(document.domain)>` → reload feed → it fires. Do the
   same on :8081 → it renders as text. Show `document.cookie` is stealable on
   :8080 (no `HttpOnly`) but not on :8081.
3. **Reflected:** open the `/search?q=<script>alert(1)</script>` link on each.
4. Recap the control→finding table above and the "no single control is enough"
   point (defence in depth).

---

## 4. What to say about the architecture

- Full stack: **React + Vite SPA → Nginx → Express API → MongoDB** (sessions in
  Mongo), all via Docker Compose.
- **One code base, two builds.** The only differences live in
  `api/src/security.js` (server) and `web/src/render.tsx` (client) — everything
  else (UI, features, onboarding) is identical, which is the whole point: the
  *controls* differ, not the features.
- Attacker **collector** proves real exfiltration without touching any external
  system — everything is on localhost.
