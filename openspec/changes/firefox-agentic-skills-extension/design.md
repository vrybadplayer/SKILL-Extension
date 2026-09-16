## Context

Greenfield Firefox-only WebExtension (Manifest V3, `browser.*` namespace, non-persistent event page). Target domains: Gemini, ChatGPT (two domains), Qwen (two domains), plus a GitHub Pages CDN origin. Tech stack: TypeScript 5.x strict, Vite 5.x, Preact 3KB in Shadow DOM, `web-ext` for dev/build/lint, `browser.storage.local` for cache and options, GitHub Pages for static CDN, GitHub Actions for publish pipeline. No telemetry, no remote code execution, no paid services, no offscreen documents, no service workers.

See proposal.md for motivation and capability overview.

## Goals / Non-Goals

**Goals:**
- Deliver a walkable skeleton in M1 (hard-coded skills, centered palette, three-tier clipboard) that proves the end-to-end loop.
- Wire real GitHub Pages data in M2 (fetch index.json, fetch SKILL.md, alarms refresh, local cache).
- Polish for AMO submission in M3 (options, icons, privacy policy, release flow with source zip).
- Zero `web-ext lint` errors/warnings; zero console errors at runtime.
- All specs satisfied with observable verification steps.

**Non-Goals (explicitly excluded):**
- Chrome/Edge/Chromium/Brave/Opera support or parity.
- Mobile browser support (Firefox Android, Chrome Android).
- User accounts, authentication, personalized libraries.
- Skill execution sandbox (skills are prompt templates only).
- Real-time collaboration or cross-device sync.
- Self-hosted CDN option (git history is the backup).
- Analytics, telemetry, error-reporting SDKs.
- Tag/category browsing in palette (v2).
- Skill version pinning in UI (v2).
- Internationalization (English only in v1).
- Auto-inserting skill text into chat input (clipboard only).
- Custom shortcut UI (free via `about:addons`).

## Decisions

### Decision 1: Firefox-only, Manifest V3 with non-persistent event page
**Rationale:** Hard constraint. Firefox MV3 uses `background.scripts` (event page), not a service worker. Using `browser.*` natively avoids polyfill baggage and matches AMO expectations.
**Alternatives considered:** Chrome MV3 with polyfill — rejected (hard constraint). Manifest V2 — deprecated, not accepted on AMO.

### Decision 2: GitHub Pages as skill CDN (static JSON + markdown)
**Rationale:** Zero cost, no pause/expiry, no server-side logic, free for public repos. Static files map 1:1 to the skill registry structure. Git history provides backup.
**Alternatives considered:** Supabase/Firebase/Vercel/Netlify — rejected (paid tiers, free tiers pause). Custom domain on Pages — preferred for production (single origin, easier rotation) but not required for v1; documented as CDN origin placeholder in manifest `host_permissions`.

### Decision 3: Index schema without `path` field; path derived from `name`
**Rationale:** Eliminates redundancy and mismatch risk. `name` is the authoritative ID in `namespace:command` format; splitting on `:` yields the exact `skills/<namespace>/<command>/SKILL.md` path. Documented in `specs/skill-registry-cdn/spec.md`.
**Alternatives considered:** Explicit `path` field — rejected (FM-6: prior run had both, causing drift).

### Decision 4: Content script reads/writes `browser.storage.local` directly
**Rationale:** Content scripts have full access to `storage.local`. No background round-trip for cache reads keeps palette latency <50ms. Background exists only for `browser.alarms` refresh.
**Alternatives considered:** Background message passing for storage — rejected (FM-4: adds latency, complexity, failure modes).

### Decision 5: Three-tier clipboard fallback in content script
**Rationale:** `navigator.clipboard.writeText()` is the modern standard but requires secure context + user gesture. `execCommand('copy')` covers edge cases. Modal with manual copy is the ultimate safety net. All tiers run in the content script where the gesture and DOM exist.
**Alternatives considered:** Offscreen document — rejected (FM-5: Firefox doesn't support `chrome.offscreen`). Background clipboard write — rejected (no user gesture context).

### Decision 6: Tier 3 modal closes only via Cancel button, not Escape
**Rationale:** In the degraded state where both automated tiers failed, the user's only copy of the skill text is in that modal. Escape dismissal would lose it. Explicit Cancel is intentional.
**Alternatives considered:** Escape dismisses — rejected (FM-7: loses content).

### Decision 7: Two distinct placeholder messages for empty registry vs no match
**Rationale:** "No skills available yet" (empty cache) and "No skills match '<query>'" (filter result) are semantically different; conflating them confuses users.
**Alternatives considered:** Single message — rejected (FM-8).

### Decision 8: Palette centered on screen in M1; anchor detection deferred
**Rationale:** Per-site DOM heuristics for 5 chat inputs are volatile and scope-creep M1. Centering is deterministic and testable. Anchor detection can be added per-site in M3 or later.
**Alternatives considered:** Anchor detection in M1 — rejected (FM-5).

### Decision 9: `browser.storage.local` for both cache and options
**Rationale:** Single storage area simplifies mental model, avoids quota mismatch (sync has 100KB total, local has 5MB+), and eliminates sync/conflict edge cases. Options are simple key-values; no need for sync across devices.
**Alternatives considered:** `storage.sync` for options — rejected (FM-11: quota mismatch, sync latency, no user-visible benefit).

### Decision 10: `Alt+Shift+S` shortcut registered in manifest commands
**Rationale:** Firefox-safe (doesn't conflict with Web Console `Ctrl+Shift+K`). Manifest registration exposes it in `about:addons` → Manage Extension Shortcuts for free user rebinding — no custom UI needed.
**Alternatives considered:** Custom shortcut settings page — rejected (FM-14: native UI is free and sufficient).

### Decision 11: `prefers-color-scheme` for dark mode, no manual toggle
**Rationale:** Respects system preference automatically. Zero config for users. Manual toggle adds UI complexity for v1.
**Alternatives considered:** Manual theme selector — rejected (FM-12: v1 scope).

### Decision 12: Publish pipeline: GitHub Actions validates, rebuilds index.json, commits to Pages
**Rationale:** Fully automated, zero cost, runs on push to `main`. Validates frontmatter, markdownlint, secrets, 100KB limit. Deterministic index rebuild sorted by `name`.
**Alternatives considered:** Manual index editing — rejected (error-prone, not scalable). Separate admin API — rejected (paid hosting, auth complexity).

### Decision 13: Release flow splits build → zip → sign+source
**Rationale:** `web-ext build` produces `.zip`; `.xpi` only after AMO signing via `web-ext sign`. TypeScript projects must submit source code separately. Three distinct steps prevent the "web-ext build → .xpi" misconception.
**Alternatives considered:** Single build step — rejected (FM-3: produces wrong artifact).

### Decision 14: Verification uses extension DevTools (`about:debugging` → Inspect → Network)
**Rationale:** The page's Network tab shows page requests, not extension background/content script requests. Extension DevTools is the correct place to verify no off-origin requests.
**Alternatives considered:** Page Network tab — rejected (FM-9: shows wrong context).

## Error Taxonomy

### Hard Errors (surface to user, log at ERROR, do not retry)

| Error | User-facing behavior | Log level |
|-------|----------------------|-----------|
| CDN unreachable on cold start with no cached index | Toast: "Couldn't load skills. Check your connection." with Retry button | ERROR |
| `index.json` malformed or fails schema validation | Toast: "Skill list is corrupted. Try reinstalling." | ERROR |
| SKILL.md fetch returns 404 | Toast: "This skill is unavailable." | WARN |
| Clipboard write denied at all three tiers | Modal remains open with hint: "Press Ctrl+C to copy manually." | ERROR |

### Soft Conditions (handle silently or subtle log)

| Condition | Behavior | Log level |
|-----------|----------|-----------|
| Stale cache | Serve cached data, refresh in background | INFO |
| Empty registry | Show "No skills available yet." | INFO |
| No match for query | Show "No skills match '<query>'." | DEBUG |
| Skill name > 40 chars | Ellipsis in dropdown (first 37 chars + "...") | DEBUG |
| In-flight fetch + second selection | Ignore second selection | DEBUG |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Chat sites change DOM/selectors, breaking anchor detection (M3) | Deferred to M3; M1 uses centered palette. Per-site tasks can be updated independently. |
| GitHub Pages rate limits or downtime | 5-min alarm + local cache serves stale data. Pages has generous limits for static assets. |
| Clipboard API permissions vary by context | Three-tier fallback covers all known Firefox contexts. Tier 3 is ultimate safety net. |
| `index.json` grows beyond 200KB | Enforced at publish; 200KB ≈ 2000 skills. If exceeded, paginate or shard in v2. |
| AMO review delays or policy changes | Follow WebExtensions best practices; no remote code, no telemetry, minimal permissions. |
| Contributor adds invalid skill frontmatter | GitHub Actions validator catches before deploy; PR reviews as second gate. |
| User rebinds shortcut to something conflicting | Native Firefox UI shows current binding; user controls it. |
| Firefox updates break `browser.*` APIs | Use stable APIs; `web-ext lint` catches deprecated usage. |

## Milestones

**M1 — Walkable Skeleton (~8 tasks):**
Extension loads via `web-ext run`. Palette toggles via `Alt+Shift+S`, centered. Hard-coded 3 skills. `/opsx:` filters. Enter copies hard-coded string via three-tier fallback. No network, no CDN, no background script, no Preact if vanilla is faster.

**M2 — Real Data (~6 tasks):**
Fetch real `index.json` from GitHub Pages (content script direct). Fetch real `SKILL.md` on selection. Add background event page with `browser.alarms` (5 min). Add `browser.storage.local` cache written by content script. Prove loop with real data.

**M3 — Polish & Publish (~8 tasks):**
Options page (`browser.storage.local`). Icons (16/32/48/128). AMO listing copy. Privacy policy. README. CONTRIBUTING. CHANGELOG. Release flow: `npm run build` → `web-ext build --source-dir=dist` → `web-ext sign` with built zip + source zip. Submit to AMO.

## Closed Open Questions

- Tag/category browsing → deferred to v2.
- Skill version pinning → deferred to v2.
- Telemetry → none. Ever.
- i18n → English only in v1.
- Backup strategy for CDN → git history is the backup.
- Concurrent tasks → single pipeline; not applicable.
- Shortcut customization → free via `about:addons`; no v1 UI needed.
- Storage area → `browser.storage.local` for both cache and options.
- Anchor detection → deferred to M3 or later; M1 palette is centered.