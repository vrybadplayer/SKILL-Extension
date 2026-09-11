## 1. Supabase Backend Setup

- [ ] 1.1 Provision Supabase project and run SQL migrations for `skills` and `skill_versions` tables with RLS policies — verify tables exist in Supabase dashboard and `SELECT * FROM skills` returns empty result
- [ ] 1.2 Create Supabase Storage bucket `skills` with public read policy and signed URL generation — verify bucket exists and `GET /storage/v1/object/public/skills/test.txt` returns 200
- [ ] 1.3 Deploy Edge Function `search-skills` for prefix autocomplete (GET `/functions/v1/search-skills?prefix=`) — verify `curl` returns JSON array with skill metadata
- [ ] 1.4 Deploy Edge Function `admin-upsert-skill` for skill publishing (POST `/functions/v1/admin-upsert-skill` with admin JWT) — verify valid admin JWT creates skill record and returns 201
- [ ] 1.5 Deploy Edge Function `admin-deprecate-skill` for deprecation (PATCH `/functions/v1/admin-deprecate-skill/:name`) — verify admin JWT marks skill deprecated and autocomplete excludes it
- [ ] 1.6 Configure Supabase rate limiting (100 req/min metadata, 30 req/min markdown) — verify `429 Too Many Requests` with `Retry-After` header after threshold

## 2. Skill Registry CDN Validation

- [ ] 2.1 Create test skill folder structure locally (`skills/opsx-propose/v1.0.0/SKILL.md`) with valid frontmatter — verify frontmatter parses correctly with `gray-matter`
- [ ] 2.2 Write GitHub Actions workflow `.github/workflows/publish-skills.yml` that validates SKILL.md, calls admin Edge Function — verify workflow runs on push to `skills/**` and publishes to Supabase
- [ ] 2.3 Seed initial skills (opsx:explore, opsx:propose, opsx:apply, opsx:archive, opsx:sync, opsx:verify) via workflow — verify all 6 skills appear in `search-skills` endpoint
- [ ] 2.4 Test autocomplete prefix search: `/opsx:` returns all 6, `/opsx:prop` returns only propose — verify response latency <200ms p95
- [ ] 2.5 Test skill markdown fetch by name returns full SKILL.md content — verify content matches source file exactly

## 3. Extension Core Setup (Manifest V3)

- [ ] 3.1 Initialize extension project with `npm create vite@latest skill-extension -- --template preact-ts` — verify `npm run build` produces `dist/` with manifest.json, background.js, content.js
- [ ] 3.2 Configure `manifest.json` for MV3: permissions (`clipboardWrite`, `storage`, `scripting`, `activeTab`, `offscreen`), host permissions for target domains, `browser_specific_settings.gecko.id` — verify `web-ext lint` passes for Firefox
- [ ] 3.3 Set up build scripts: `npm run build:firefox` (zip for AMO), `npm run build:chrome` (crx) — verify both artifacts generate without errors
- [ ] 3.4 Implement TypeScript types for skill metadata, CDN API responses, extension messages — verify `npm run typecheck` passes

## 4. Background Service Worker

- [ ] 4.1 Implement service worker (`src/background/index.ts`) with lifecycle: install (fetch initial skill index), startup (sync index), periodic sync (alarms API, 5min) — verify index stored in `chrome.storage.local` after install
- [ ] 4.2 Implement `fetchSkillIndex()`: calls CDN `/functions/v1/search-skills` with no prefix, caches to storage with timestamp — verify cache updates and `chrome.storage.local.get('skillIndex')` returns array
- [ ] 4.3 Implement `fetchSkillMarkdown(skillName, version?)`: calls CDN for specific skill, returns markdown text — verify returns correct markdown for seeded skills
- [ ] 4.4 Implement message handlers: `GET_SKILL_INDEX`, `GET_SKILL_MARKDOWN`, `COPY_TO_CLIPBOARD` — verify content script can send/receive messages
- [ ] 4.5 Create offscreen document (`src/offscreen.html` + `src/offscreen.ts`) for clipboard access — verify `chrome.offscreen.createDocument()` succeeds and clipboard write works from offscreen

## 5. Content Script & Palette UI

- [ ] 5.1 Implement content script injection (`src/content/index.ts`): mounts Shadow DOM root on `document.body`, loads Preact app — verify palette UI appears on `gemini.google.com` (hidden initially)
- [ ] 5.2 Build Preact palette component (`src/ui/Palette.tsx`): input with `/opsx:` prefix, autocomplete dropdown, keyboard navigation (ArrowUp/Down, Enter, Escape) — verify dropdown opens and filters on typing
- [ ] 5.3 Connect palette to background: on mount, request skill index via `chrome.runtime.sendMessage({type: 'GET_SKILL_INDEX'})` — verify suggestions populate from cached index
- [ ] 5.4 Implement skill selection flow: on Enter, send `COPY_TO_CLIPBOARD` with skill name, show toast — verify toast "Skill copied to clipboard!" appears
- [ ] 5.5 Add keyboard shortcut registration in manifest (`commands`) and content script listener for `Ctrl+Shift+K` — verify shortcut toggles palette visibility
- [ ] 5.6 Add toolbar icon (`browser_action` / `action`) with popup that opens palette — verify clicking extension icon shows palette

## 6. Clipboard Integration (Three-Tier Fallback)

- [ ] 6.1 Implement `clipboard.ts` utility with `copyToClipboard(text)`: tries `navigator.clipboard.writeText()`, falls back to `execCommand('copy')` via textarea, falls back to modal — verify all three paths work in test page
- [ ] 6.2 Integrate clipboard utility with offscreen document: offscreen receives `COPY_TO_CLIPBOARD` message, calls utility, returns success/failure — verify clipboard write from background via offscreen
- [ ] 6.3 Add clipboard verification (best-effort `readText()` compare) — verify console logs warning on mismatch but UI still shows success
- [ ] 6.4 Test clipboard on target domains: gemini.google.com, chat.openai.com, chat.qwen.ai — verify copy works on all three (may need fallback on some)
- [ ] 6.5 Handle large skill markdown (>100KB): show progress indicator during copy — verify progress shows for 250KB test skill

## 7. Extension Settings & Options Page

- [ ] 7.1 Build options page (`src/options/Options.tsx`): enable/disable toggle, target domain list (add/remove), keyboard shortcut input, cache toggle, cache status display — verify settings persist in `chrome.storage.sync`
- [ ] 7.2 Content script respects enable/disable and domain list — verify palette doesn't inject on disabled/non-listed domains
- [ ] 7.3 Content script respects cache toggle (skip background fetch, use only local cache) — verify no network requests when cache-only mode enabled
- [ ] 7.4 Add "Refresh skills now" button in palette that forces background sync — verify new skills appear after refresh without browser restart

## 8. Firefox Compatibility & Testing

- [ ] 8.1 Test extension in Firefox (load temporary add-on via `about:debugging`) — verify all features work: palette, autocomplete, clipboard, settings
- [ ] 8.2 Fix any `browser` vs `chrome` namespace issues (use `browser` polyfill or `globalThis.browser = globalThis.chrome`) — verify no console errors in Firefox
- [ ] 8.3 Test CSP compliance on target chatbot pages — verify no CSP violations in Firefox/Chrome devtools console
- [ ] 8.4 Run `web-ext run --target=firefox-desktop` for automated testing — verify extension loads and basic smoke test passes
- [ ] 8.5 Build Firefox package (`web-ext build --overwrite-dest`) and verify `.xpi` installs correctly

## 9. Chrome/Edge Compatibility & Polish

- [ ] 9.1 Test extension in Chrome/Edge (load unpacked) — verify feature parity with Firefox
- [ ] 9.2 Fix any Chrome-specific API differences (e.g., `chrome.action` vs `browser.browserAction`) — verify no console errors
- [ ] 9.3 Add extension icons (16, 32, 48, 128px) per store requirements — verify icons display in toolbar and stores
- [ ] 9.4 Write store listings (AMO + Chrome Web Store): description, screenshots, privacy policy — verify both listings pass review guidelines
- [ ] 9.5 Submit to Firefox Add-ons (AMO) and Chrome Web Store — verify both published and installable

## 10. Documentation & Launch Prep

- [ ] 10.1 Write README.md with installation, usage, development setup — verify `npm run dev` works for contributors
- [ ] 10.2 Write CONTRIBUTING.md with skill submission guide (frontmatter schema, GitHub Actions workflow) — verify new skill PR passes CI
- [ ] 10.3 Create CHANGELOG.md with v1.0.0 release notes — verify version matches manifest.json
- [ ] 10.4 Set up Sentry error tracking for extension (source maps uploaded on build) — verify test error appears in Sentry dashboard
- [ ] 10.5 Configure GitHub Actions CI: typecheck, lint, test, build for both browsers — verify CI passes on main branch