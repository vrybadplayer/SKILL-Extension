## Why

Beginner-to-intermediate AI users (college students, free-tier users, non-technical users) who rely on web-based AI chatbots (Gemini, ChatGPT, Qwen) have no easy way to inject structured "Agentic SKILLS" — reusable prompt templates that encode expert workflows — into their chat sessions. Current workflows require manually copying markdown from GitHub, Notion, or local files, which is error-prone, slow, and breaks flow. This extension provides a zero-cost, Firefox-only WebExtension that fetches a curated skill registry from a free GitHub Pages CDN and copies the selected skill's full `SKILL.md` to the system clipboard with a three-tier fallback, so users can paste it directly into any chat input.

## What Changes

- New Firefox-only WebExtension (Manifest V3, `browser.*` namespace, non-persistent event page) targeting five chat domains and a GitHub Pages CDN origin.
- Injected command palette (Shadow DOM, Preact UI) toggled via `Alt+Shift+S`, centered on screen in M1, with client-side autocomplete filtering against a locally cached `index.json`.
- Three-tier clipboard write in the content script: `navigator.clipboard.writeText()` → temporary `textarea` + `document.execCommand('copy')` → modal with pre-selected textarea (Escape does NOT dismiss; explicit Cancel only).
- Skill registry served as static files from GitHub Pages: `skills/index.json` (array of `{ name, description, version, tags, updatedAt }`, ≤200KB) and `skills/<namespace>/<command>/SKILL.md` (≤100KB each, path derived from `name.split(':')`).
- Background event page runs a `browser.alarms` timer (5 min) to refresh the cache in `browser.storage.local`; content scripts read/write storage directly (no message passing for storage).
- GitHub Actions publish pipeline: push to `main` validates frontmatter (name in `namespace:command` format, semver version, non-empty description, tags array), runs markdownlint, scans for secrets, enforces 100KB limit, rebuilds `index.json`, and commits; GitHub Pages serves the result.
- Options page (stored in `browser.storage.local` — single storage area for cache and settings) for CDN origin override and cache TTL.
- Zero telemetry, zero remote code execution, zero paid services.

## Capabilities

### New Capabilities

- `skill-registry-cdn`: Static skill registry and individual skill files served from GitHub Pages with a validated index schema and publish-time guards.
- `extension-command-palette`: Injected Shadow DOM palette with client-side autocomplete, keyboard navigation, dark-mode support via `prefers-color-scheme`, and `Alt+Shift+S` toggle.
- `clipboard-skill-injection`: Three-tier clipboard copy in the content script with graceful degradation and a non-dismissible fallback modal.

### Modified Capabilities

- (none — greenfield project)

## Impact

- New repository with Vite + TypeScript + Preact source under `src/`, built to `dist/`.
- `web-ext` dev workflow (`web-ext run`) and release workflow (`npm run build` → `web-ext build --source-dir=dist` → `web-ext sign` with source zip).
- GitHub Actions workflow for CDN publishing (separate repo or same repo under `skills/`).
- AMO submission assets: icons, privacy policy, listing copy, README, CONTRIBUTING, CHANGELOG.
- No changes to existing codebases (greenfield).