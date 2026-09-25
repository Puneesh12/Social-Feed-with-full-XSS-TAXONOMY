# Chirp — How to Present (speaker script)

BCSE320L · "Social Feed with a Full XSS Taxonomy". Target: ~8–10 minutes.
Have both builds running first: `./scripts/demo-up.sh`
→ vulnerable http://localhost:8080 · defended http://localhost:8081 (two windows, side by side).

---

## 0. Setup (before you speak)
- Two browser windows, maximized, side by side: :8080 (left) and :8081 (right).
- Log in on both as `alice / password123`.
- Keep the right-rail **"XSS lab"** panel visible on each.
- Optional backup: `cloudflared tunnel --url http://localhost:8080`.

---

## 1. Intro (30s)
"Our project is **Chirp**, a small Twitter-style social feed. But the real point
isn't the app — it's a **security lab**. We built the *same* application in two
versions: a **vulnerable** one and a **defended** one, and we use it to
demonstrate and then fix the **full cross-site-scripting (XSS) taxonomy** — all
four classes plus a bonus case."

## 2. The problem (45s)
"XSS is OWASP **A03: Injection**, weakness **CWE-79**. It happens when an app
puts data from one user into a page another user's browser then runs as **code**
instead of showing as **text**. A social feed is the perfect target, because its
whole job is to show one person's words to another. A single flaw can hit every
visitor — the 2005 MySpace 'Samy' worm added a million friends in a day this way."

## 3. What we built + architecture (1 min)
Show `docs/architecture.svg`.
"It's a full stack: **React + Vite** front end → **Nginx** → **Express** API →
**MongoDB**, all in Docker. The key design: **one code base, two builds**,
selected by a single switch, `BUILD_MODE`. Everything — features, UI — is
identical. The *only* difference is the security controls, which live in two
files: `security.js` on the server and `render.tsx` on the client. That makes the
comparison fair: same app, flip one switch, and attacks go from working to
blocked."

## 4. Live demo — the heart (4–5 min)
> For each: **do it on :8080 (it fires) → do the same on :8081 (blocked)** → name the control.
> The payloads turn the page **red** and set the tab title, so it's visible even
> if the browser blocks `alert()`.

**A) Stored XSS** (the strongest one — do this first)
1. On :8080 → Settings → set **Display name** to
   `<img src=x onerror="alert('stored XSS!');document.body.style.background='#c0392b'">` → Save.
   (Use the lab panel's **Copy payload** button.)
2. Go Home → the feed renders it → **page/name breaks, script runs.**
3. Say: "This is *stored* — it's saved on the server and runs for **every**
   visitor. With a real payload it steals their session cookie." (Optionally show
   the collector at :9000/log with the beacon payload from `payloads/payloads.md`.)
4. On :8081 → same steps → the name shows as **plain text**. "Blocked by
   **contextual output encoding** — the browser shows the characters, doesn't run them."

**B) Reflected XSS**
- On :8080 open `/search?q=<script>…</script>` (lab panel → **Open /search**) →
  **page turns red**. On :8081 → shown as text. "Fixed by output encoding + a CSP."

**C) DOM-based XSS**
- On :8080, lab panel → **Run in app** (writes the URL into the page via
  `innerHTML`). On :8081 → nothing. "The attack never touches the server — it's
  the client's own JS. Fixed with `textContent` + Trusted Types."

**D) Mutation XSS**
- On :8080, lab panel → **Open preview** → the 'safe' cleaner's output re-parses
  into a script. On :8081 → clean. "This is why home-grown sanitisers fail; we use
  **DOMPurify** and never re-parse."

**E) javascript: URL**
- Profile website = `javascript:alert(document.domain)`. On :8080 clicking runs
  code; on :8081 it's neutralised to `#`. "Encoding alone doesn't help here — you
  need a **URL scheme allow-list**."

## 5. The lesson (45s)
"The root cause of all five is the same: **untrusted data placed into an output
context without encoding for that context.** So the durable fix is to **encode at
the point of output** and **never re-parse** sanitised content — backed by a
**Content Security Policy** as a second layer. And no single control is enough —
that's why the defended build layers encoding + CSP + sanitisation + cookie
flags + a URL allow-list."

## 6. Wrap (20s)
"So: one code base, two builds, the complete XSS taxonomy reproduced with real
impact and then fully defended — with each block attributed to a named control.
Everything runs locally in Docker; nothing external was touched."

---

## Likely questions (prep)
- **Why MongoDB / is there SQL injection?** We use MongoDB with parameterised
  queries; inputs are coerced to strings so Mongo operator injection is closed
  too. The project scope is XSS, not injection into the DB.
- **Is HttpOnly enough?** No — it limits cookie theft but a script still acts *in*
  the victim's session. The real fix is stopping script execution at render.
- **Why is `alert` blocked in your browser?** Some embedded browsers suppress
  dialogs; that's why our payloads also deface visibly. In normal Chrome the
  alert pops too.
- **Could the defended build still be broken?** We disable one control at a time
  to show defence-in-depth; a strict nonce CSP + Trusted Types is the backstop.

## One-liner if you have 30 seconds total
"Chirp is one social-feed app built two ways from a single switch: we show all
five kinds of XSS actually working in the vulnerable build, then flip to the
defended build where every one is blocked — proving each fix against a live attack."
