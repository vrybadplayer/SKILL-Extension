## Context

See proposal.md - Why for motivation. This is a greenfield project with no existing codebase. The three capabilities (skill-registry-cdn, extension-command-palette, clipboard-skill-injection) are independent but interoperable: the CDN serves skill data, the extension consumes it and provides UI, and the clipboard module handles the final copy operation.

Key constraints:
- Firefox Manifest V3 primary target (Chrome/Edge secondary)
- Supabase as backend (PostgreSQL, Storage, Edge Functions)
- No authentication required for skill reading (public CDN)
- Extension size budget: ~50KB gzipped
- Autocomplete latency budget: <50ms local, <200ms CDN p95
- Content Security Policy: extension runs in page context, must not violate host CSP

## Goals / Non-Goals

**Goals:**
- Clean separation between CDN (data), extension (UI/logic), and clipboard (cross-browser copy)
- Firefox-first development with Chrome parity
- Zero-config for end users (install → works on supported sites)
- Admin-friendly skill publishing workflow
- Extensible skill metadata schema for future features (tags, categories, dependencies)

**Non-Goals:**
- User accounts / personalized skill libraries (v1)
- Skill execution sandbox (skills are prompt templates only)
- Real-time collaboration or sync
- Mobile browser support (Firefox Android / Chrome Android)
- Self-hosted CDN option (Supabase only for v1)

## Decisions

### 1. Supabase Schema & API Design
**Decision**: Use Supabase PostgreSQL with a `skills` table and `skill_versions` table, plus Supabase Storage for SKILL.md files and assets. Expose via PostgREST (auto-generated REST) for reads, and Supabase Edge Functions for admin writes and search autocomplete.

**Rationale**: 
- PostgREST gives instant REST API with filtering, pagination, sorting — no custom backend code for reads
- Edge Functions (Deno) for admin writes keep logic close to data, support complex validation
- Storage signed URLs handle asset delivery with expiry
- Row Level Security (RLS) enforces public read / admin write cleanly

**Alternatives considered**:
- Custom Node.js/Express API on Fly.io/Render: more control but more ops burden, duplicate PostgREST features
- Firebase Firestore: good for realtime but worse for structured search/prefix queries
- Static JSON on CDN (GitHub Pages/Netlify): simple but no dynamic search, no admin API, cache invalidation pain

### 2. Extension Architecture: MV3 + React (Preact) + Shadow DOM
**Decision**: Build the palette UI with Preact (3KB) rendered into a Shadow DOM root attached to `document.body`. Content script injects a single mount point; background service worker handles CDN fetch, caching, and clipboard coordination.

**Rationale**:
- Shadow DOM isolates styles from host page (critical for chatbot sites with aggressive CSS)
- Preact gives React ergonomics at 3KB vs 40KB for React
- MV3 service worker (not persistent background page) for lifecycle events
- Content script only for injection; logic lives in service worker + popup/options

**Alternatives considered**:
- Vanilla JS + CSS: smaller but autocomplete dropdown state management gets messy
- Svelte: similar size but less familiar, Preact has better TypeScript DX
- Iframe-based palette: total isolation but complex messaging, clipboard API blocked in cross-origin iframes

### 3. Autocomplete Data Flow & Caching
**Decision**: On palette open, service worker fetches full skill index from CDN (cached 5min in `chrome.storage.local`). Autocomplete filters in-memory in content script (instant). Background syncs index periodically and on browser startup.

**Rationale**:
- Full index (~500 skills × ~200B = ~100KB) fits easily in storage.local (5MB quota)
- In-memory filtering = 0ms perceived latency after initial load
- 5min cache balances freshness vs API calls; user can force refresh via palette button
- Service worker handles fetch so content script stays lightweight

**Alternatives considered**:
- Server-side prefix search on every keystroke: simpler client but 50-200ms latency per keystroke, higher API load
- IndexedDB for larger datasets: overkill for <100KB, async API complicates content script

### 4. Clipboard Strategy: Clipboard API → execCommand → Modal
**Decision**: Three-tier fallback implemented in a shared utility module used by service worker (via offscreen document) and content script.

**Rationale**:
- Clipboard API is standard but requires secure context + user gesture
- `execCommand('copy')` works in more contexts but deprecated
- Modal fallback guarantees user can always get the content
- Offscreen document (MV3) enables clipboard access from service worker

**Alternatives considered**:
- Only Clipboard API: fails on HTTP sites, non-focused windows
- Only execCommand: deprecated, removed in future browsers
- Copy via background page: MV3 service worker can't access clipboard directly; offscreen document is the sanctioned way

### 5. Skill Metadata Schema (Frontmatter)
**Decision**: Enforce a minimal required frontmatter in SKILL.md:
```yaml
name: "opsx:propose"
version: "1.0.0"
description: "Create a new spec-driven change proposal"
author: "openspec"
tags: ["planning", "spec-driven"]
command: "propose"  # the part after /opsx:
```
Optional: `dependencies`, `compatibility`, `icon`, `homepage`.

**Rationale**: 
- `command` field enables exact prefix matching for autocomplete
- `tags` enables future category filtering
- Semantic versioning in `version` supports multiple versions per skill
- Frontmatter is human-readable and parseable by any markdown parser

### 6. Admin Publishing: GitHub Actions → Supabase Edge Function
**Decision**: Skills published via GitHub Actions workflow that validates SKILL.md, bumps version, and calls Supabase Edge Function with admin JWT.

**Rationale**:
- GitHub as source of truth for skill definitions
- CI validates frontmatter schema, markdown lint, no secrets
- Edge Function handles storage upload, DB upsert, search index update atomically
- No manual Supabase dashboard steps

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Host page CSP blocks extension injection | Medium | High | Use `scripting.executeScript` with `world: "MAIN"`; test on all target domains; provide CSP error guidance in docs |
| Firefox `browser` namespace differences | Low | Medium | Polyfill `chrome` → `browser` in build; test on Firefox Nightly + Release |
| Clipboard API blocked on target chatbot pages | High | High | Offscreen document + three-tier fallback; test on each chatbot domain |
| Supabase rate limits / cost at scale | Low | Medium | 100 req/min/IP generous for v1; monitor; add Cloudflare cache layer if needed |
| Skill markdown >500KB breaks clipboard | Low | Low | Enforce 500KB limit at upload; truncate with warning in UI |
| Autocomplete index stale after new skill publish | Medium | Low | 5min cache + manual refresh button; background sync on browser startup |
| Manifest V3 service worker lifecycle kills offscreen doc | Medium | Medium | Recreate offscreen doc on demand; keep clipboard logic stateless |

## Migration Plan

Not applicable (greenfield). Deployment steps:
1. Provision Supabase project; run SQL migrations for schema + RLS
2. Deploy Edge Functions (`search-skills`, `admin-upsert-skill`, `admin-deprecate-skill`)
3. Configure Storage bucket `skills` with public read, signed URLs
4. Build extension (`npm run build` → `dist/`); load unpacked in Firefox/Chrome for testing
5. Publish to Firefox Add-ons (AMO) and Chrome Web Store
6. Seed initial skills via GitHub Actions workflow
7. Monitor Sentry (errors) + Supabase logs (API latency)

Rollback: Unpublish extension from stores; Supabase data remains for re-release.

## Open Questions

1. **Skill discovery beyond prefix**: Should we add tag/category browsing in palette v1, or defer to v2? (Deferrable — doesn't affect specs or core flow)
2. **Skill version pinning**: Should users be able to pin a specific skill version? (Deferrable — CDN supports versions, UI can add later)
3. **Telemetry**: Anonymous usage metrics (palette opens, skills copied, errors)? (Decide before launch; privacy policy needed)
4. **Internationalization**: i18n for palette UI? (Defer to v2 — English only for v1)