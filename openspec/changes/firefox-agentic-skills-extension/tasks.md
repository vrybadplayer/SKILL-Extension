## M1 — Walkable Skeleton

- [x] M1.1 Initialize Vite + TypeScript + Preact project with `web-ext` config, `manifest.json` (MV3, `browser.*`, `background.scripts`, `host_permissions` for 5 chat domains + CDN origin placeholder), and `commands` for `Alt+Shift+S` — verify `web-ext lint` passes with zero errors and zero warnings
- [ ] M1.2 Create content script that injects a Shadow DOM root on `document.body`, renders a centered palette (vanilla JS or Preact) toggled by the registered command, and logs "palette ready" — verify palette opens/closes with `Alt+Shift+S` on `https://chat.openai.com/` and does NOT open on `https://example.com/`
- [ ] M1.3 Hard-code an array of three skills (`opsx:propose`, `opsx:plan`, `opsx:review`) with minimal fields (`name`, `description`) and implement client-side filter on `/namespace:command` prefix — verify typing `/opsx:` shows only the three skills, filtering completes in <50ms
- [ ] M1.4 Implement keyboard navigation: `ArrowUp`/`ArrowDown` moves selection, `Enter` triggers copy, `Escape` closes palette without clearing input — verify all three keys behave as specified
- [ ] M1.5 Implement three-tier clipboard fallback in content script: Tier 1 `navigator.clipboard.writeText()`, Tier 2 `textarea` + `execCommand('copy')`, Tier 3 modal with pre-selected textarea and Cancel button (Escape does NOT dismiss) — verify pressing Enter on a skill copies a hard-coded string to clipboard (paste into editor to confirm)
- [ ] M1.6 Add `prefers-color-scheme` CSS media queries for dark/light palette themes — verify palette uses dark theme when OS is in dark mode and light theme when OS is in light mode
- [ ] M1.7 Add distinct placeholder messages: "No skills available yet." for empty registry, "No skills match '<query>'." for no-match — verify both messages appear in the correct conditions
- [ ] M1.8 Run `web-ext run` end-to-end, test on all five target domains, confirm zero console errors — verify extension loads in Firefox with zero console errors on each target domain

## M2 — Real Data

- [ ] M2.1 Create a test GitHub Pages CDN (or local `http-server` mirror) with `skills/index.json` matching the schema from `specs/skill-registry-cdn/spec.md` (fields: `name`, `description`, `version`, `tags`, `updatedAt`, no `path`) and three `SKILL.md` files under `skills/<namespace>/<command>/` — verify `fetch(index.json)` returns valid JSON and `fetch(SKILL.md)` returns markdown
- [ ] M2.2 Replace hard-coded skill array in content script with a direct `browser.storage.local.get('skillIndex')` read (no background message passing) and populate on first load by fetching `index.json` from the CDN origin listed in `host_permissions` — verify `browser.runtime.getManifest().host_permissions` includes the CDN origin and palette populates from real data
- [ ] M2.3 On skill selection, fetch the corresponding `SKILL.md` from the derived path (`skills/<namespace>/<command>/SKILL.md`) and copy its full content via the three-tier fallback — verify pasting yields the exact markdown including frontmatter
- [ ] M2.4 Add background event page (`background.js` under `background.scripts`) that registers a `browser.alarms` timer (5 minutes) to re-fetch `index.json` and write to `browser.storage.local` — verify cache refreshes on the 5-minute alarm (inspect storage in extension DevTools)
- [ ] M2.5 Implement cache validation: on load, parse cached `index.json` against the schema from `specs/skill-registry-cdn/spec.md`; if invalid, clear cache and re-fetch — verify corrupted cache triggers re-fetch and toast "Skill list is corrupted. Try reinstalling."
- [ ] M2.6 Handle Hard/Soft errors per `specs/clipboard-skill-injection/spec.md` Error Taxonomy: toasts for Hard Errors, subtle logs for Soft Conditions — verify each error condition produces the specified user-facing behavior and log level

## M3 — Polish & Publish

- [ ] M3.1 Create options page (`options.html` + `options.ts`) using `browser.storage.local` for CDN origin override and cache TTL — verify options page changes persist across browser restart
- [ ] M3.2 Add extension icons (16, 32, 48, 128px) in `assets/icons/` and reference in `manifest.json` — verify icons appear in `about:addons` and toolbar
- [ ] M3.3 Write AMO listing copy (name, description, screenshots, category, privacy policy URL) — verify all fields comply with AMO guidelines
- [ ] M3.4 Write privacy policy (no data collection, local storage only, no network except CDN) and host at the CDN origin or repo — verify policy is accessible and accurate
- [ ] M3.5 Write README (install, usage, shortcut, contributing), CONTRIBUTING (skill format, PR flow), CHANGELOG (Keep a Changelog format) — verify all three files exist and render on GitHub
- [ ] M3.6 `npm run build` produces a clean `dist/` — verify exit 0 and no TypeScript errors
- [ ] M3.7 `web-ext build --source-dir=dist --overwrite-dest` produces a `.zip` in `web-ext-artifacts/` — verify the file exists and contains `manifest.json` at the root
- [ ] M3.8 Submit to AMO: built `.zip` PLUS a source-code zip via `web-ext sign` (or AMO web upload form), download the signed `.xpi` — verify the `.xpi` installs in a fresh Firefox profile

## Verification Checklist

- [ ] Extension loads in Firefox with zero console errors.
- [ ] `web-ext lint` reports zero errors and zero warnings.
- [ ] Palette opens with Alt+Shift+S on each target domain.
- [ ] Palette does NOT open on a non-target domain (e.g. example.com).
- [ ] Palette respects `prefers-color-scheme` (test light and dark).
- [ ] Typing `/opsx:` filters suggestions in under 50ms.
- [ ] Pressing Enter copies SKILL.md content to clipboard (paste into a text editor to confirm).
- [ ] Escape closes the palette without clearing the input.
- [ ] Tier 3 modal does NOT close on Escape; only on Cancel.
- [ ] Cache survives browser restart.
- [ ] Cache refreshes on the 5-minute alarm.
- [ ] Options page changes persist across browser restart.
- [ ] No network request is made to any origin other than the GitHub Pages CDN, verified in the EXTENSION's DevTools via `about:debugging` → Inspect → Network (NOT the page's Network tab).