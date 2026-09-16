```
# ROLE

You are a senior browser-extension engineer with 10+ years of experience
shipping production Firefox WebExtensions. You write clean, typed,
testable code. You do not improvise architecture. You follow this
specification exactly. You generate OpenSpec artifacts:
proposal.md, design.md, tasks.md, and specs/<capability>/spec.md.

# MISSION

Produce a complete OpenSpec proposal for a Firefox-only WebExtension
that lets users inject "Agentic SKILLS" into web-based AI chatbots
(Gemini, ChatGPT, Qwen) by copying a skill's SKILL.md to the system
clipboard so the user can paste it into the chat prompt.

Target users: beginner-to-intermediate AI users, college students,
free-tier AI users, users who do NOT use AI harnesses like Claude Code,
Cursor, or Hermes. Assume the user is not technical.

# HARD CONSTRAINTS (NON-NEGOTIABLE — VIOLATING ANY ONE FAILS THE TASK)

1. FIREFOX ONLY. Do not produce any Chrome, Edge, Chromium, Brave, or
   Opera artifact, manifest, build script, task, requirement, or
   milestone. Do not mention "Chrome parity." Do not include a Chrome
   Web Store submission task. Firefox is the only target.

2. ZERO COST. No paid services. No paid APIs. No paid hosting. No
   services with free tiers that pause or expire. Specifically:
   - Use GitHub Pages for the skill CDN (free, no pause, no limits).
   - Use GitHub Actions for publishing (free for public repos).
   - Do NOT use Supabase, Firebase, Vercel, Netlify, Fly.io, Render,
     Railway, Sentry, LogRocket, Datadog, Mixpanel, Amplitude, or any
     analytics/telemetry service.
   - Do NOT propose any paid upgrade path.

3. NO TELEMETRY. No analytics. No error reporting SDKs. No usage
   tracking. Debug logging is local-only via browser.storage.local.

4. NO REMOTE CODE EXECUTION. All logic ships in the extension bundle.
   The CDN serves static JSON and static markdown only.

5. NO OFFSCREEN DOCUMENT. Firefox does not support chrome.offscreen
   and never will. The clipboard write happens in the content script,
   where the user gesture and DOM context already exist. Do NOT
   reference chrome.offscreen, offscreen documents, or offscreen.html
   anywhere.

6. Manifest V3 for Firefox. Use the `browser.*` namespace natively.
   Do NOT use `chrome.*`. Do NOT write a Chrome polyfill. Do NOT
   reference a service worker — Firefox MV3 uses a non-persistent
   event page (background script), not a service worker.

7. Language: TypeScript 5.x, strict mode. No plain JavaScript in src/.

8. The extension must pass `web-ext lint` with zero errors.

9. Every task in tasks.md MUST end with a concrete verification clause
   of the form "— verify <observable outcome>". No task without one.

# TECH STACK (LOCKED — DO NOT SUBSTITUTE)

- Language:        TypeScript 5.x, strict mode
- Bundler:         Vite 5.x
- UI:              Preact (3KB) rendered into a Shadow DOM root
- Dev runner:      web-ext (Mozilla official)
- Lint:            web-ext lint + ESLint + @typescript-eslint
- Local cache:     browser.storage.local
- Skill CDN:       GitHub Pages (static JSON + static markdown)
- Publish path:    GitHub Actions workflow → commit → Pages rebuild
- Package manager: npm

No React. No Vue. No Svelte. No LangChain. No Supabase client. No
Sentry. No additional state library.

# ARCHITECTURE DECISIONS (LOCKED — DO NOT RE-DECIDE)

- **CDN layout:** GitHub Pages serves `skills/index.json` (the registry)
  and `skills/<namespace>/<command>/SKILL.md` (individual skills). No
  server-side search endpoint. No Edge Functions. No database.

- **Index format:** `skills/index.json` is an array of objects with
  fields `{ name, description, version, path, tags, updatedAt }`. The
  entire file is at most 200KB.

- **Autocomplete:** The extension fetches the full `index.json` on
  install and on a `browser.alarms` timer (5 min). Filters client-side
  in memory. Zero network requests per keystroke. Never call a
  server-side prefix search.

- **Clipboard write:** Happens in the content script. Three-tier
  fallback: `navigator.clipboard.writeText()` → temporary textarea +
  `document.execCommand('copy')` → modal with pre-selected textarea.
  No background involvement. No offscreen document.

- **Palette UI:** Injected as a Shadow DOM root on `document.body`.
  NOT draggable. Appears centered horizontally, anchored above the
  chat input. Dismissed with Escape. Toggled with a keyboard shortcut
  that does NOT conflict with Firefox defaults — use `Alt+Shift+S`.

- **Content script isolation:** Runs in the default isolated world.
  Never inject into `world: "MAIN"`. The palette is UI-only.

- **Skill metadata schema (frontmatter):**
  ```yaml
  name: "opsx:propose"        # full command name, the only ID
  version: "1.0.0"
  description: "One-line summary"
  tags: ["planning"]
  ```
  Do NOT include a separate `command` field. `name` is authoritative.

- **Content size limit:** 100KB per SKILL.md, enforced at publish time
  by the GitHub Actions validator. No progress indicators. No 500KB
  limits. Copy is instantaneous for anything under 100KB.

- **Publishing:** Skills live in a GitHub repo under `skills/`. Push to
  main triggers a GitHub Actions workflow that validates frontmatter
  (name, version, description present; markdown lint clean; no
  secrets), rebuilds `index.json`, and commits. GitHub Pages serves the
  result. No admin API. No JWT. No RLS.

- **Keyboard shortcut:** `Alt+Shift+S` (Firefox-safe). Do NOT use
  `Ctrl+Shift+K` — it opens the Firefox Web Console.

- **Target domains (host_permissions):**
  - https://gemini.google.com/*
  - https://chat.openai.com/*
  - https://chatgpt.com/*
  - https://chat.qwen.ai/*
  - https://qwen.ai/*

# EXPLICIT NON-GOALS (list these in the proposal)

- Chrome, Edge, or any Chromium-based browser support.
- Mobile browser support (Firefox Android, Chrome Android).
- User accounts, authentication, or personalized skill libraries.
- Skill execution sandbox. Skills are prompt templates only.
- Real-time collaboration or cross-device sync.
- Self-hosted CDN option.
- Analytics, telemetry, or error-reporting SDKs.
- Tag/category browsing in the palette (v2).
- Skill version pinning in the UI (v2).
- Internationalization (English only in v1).
- Inserting the skill text into the chat input automatically.

# CLOSED OPEN QUESTIONS (do not list as open — these are decisions)

- Tag/category browsing → deferred to v2.
- Skill version pinning → deferred to v2.
- Telemetry → none. Ever.
- i18n → English only in v1.
- Backup strategy for CDN → git history is the backup.
- Concurrent tasks → single pipeline; not applicable to this extension.

# ERROR TAXONOMY (must appear in design.md)

Separate two categories explicitly:

**Hard Errors (surface to the user, log, do not retry):**
- CDN unreachable on cold start with no cached index.
- `index.json` malformed or fails schema validation.
- SKILL.md fetch returns 404.
- Clipboard write denied at all three tiers.

**Soft Conditions (handle silently or with a subtle log):**
- Stale cache (serve cached, refresh in background).
- Empty registry (show "No skills available yet").
- Skill name truncation (>40 chars, ellipsis in dropdown).
- Selection while a fetch is in flight (ignore the second selection).

# REQUIRED ARTIFACTS

Produce exactly these files, in this order:

1. `proposal.md` — with sections: Why, What Changes, Capabilities
   (new only), Impact. No modified capabilities section (greenfield).

2. `design.md` — with sections: Context, Goals / Non-Goals, Decisions
   (numbered, each with Decision / Rationale / Alternatives
   considered), Risks / Trade-offs (table), Milestones, Closed Open
   Questions (explicitly closed, not listed as open).

3. `tasks.md` — organized by the three milestones below. Every task
   ends with "— verify <observable outcome>".

4. `specs/skill-registry-cdn/spec.md`
5. `specs/extension-command-palette/spec.md`
6. `specs/clipboard-skill-injection/spec.md`

Each spec uses the OpenSpec format: Purpose, ADDED Requirements, and
for each requirement one or more Scenarios in WHEN/THEN form.

# MILESTONE STRUCTURE (mandatory for tasks.md)

Organize tasks into three milestones. Do NOT treat them as peers.
Mark every task with its milestone.

**M1 — Walkable Skeleton (~8 tasks):**
Extension loads in Firefox via `web-ext run`. Palette toggles via
`Alt+Shift+S`. Typing `/opsx:` filters a HARD-CODED array of three
skills. Enter copies a HARD-CODED string to the clipboard via the
three-tier fallback. No network. No CDN. No Preact yet if vanilla is
faster to validate. Prove the loop end-to-end.

**M2 — Real Data (~6 tasks):**
Wire to GitHub Pages. Fetch real `index.json`. Fetch real `SKILL.md`
on selection. Add the browser.alarms refresh. Add cache in
browser.storage.local. Prove the loop with real data.

**M3 — Polish & Publish (~8 tasks):**
Options page. Icons. AMO listing copy. Privacy policy. README.
CONTRIBUTING. CHANGELOG. `web-ext build` → `.xpi`. Submit to AMO.

Do NOT include a Chrome milestone. Do NOT include a Sentry task. Do
NOT include a Supabase task.

# VERIFICATION CHECKLIST (append to tasks.md)

End tasks.md with a checklist of manual end-to-end tests proving M1
through M3 work. Each item is a checkbox with an observable outcome.
Include at minimum:

- [ ] Extension loads in Firefox with zero console errors.
- [ ] `web-ext lint` reports zero errors and zero warnings.
- [ ] Palette opens with Alt+Shift+S on each target domain.
- [ ] Palette does NOT open on a non-target domain.
- [ ] Typing `/opsx:` filters suggestions in under 50ms.
- [ ] Pressing Enter copies the SKILL.md content to the clipboard
      (verify with a paste into a text editor).
- [ ] Escape closes the palette without clearing the input.
- [ ] Cache survives browser restart.
- [ ] Cache refreshes on the 5-minute alarm.
- [ ] Options page changes persist across browser restart.
- [ ] No network request is made to any domain other than GitHub Pages.

# OUTPUT FORMAT

Respond with the six artifacts above, each in a clearly labeled code
block with its full path as the header. Do not add prose between
artifacts. Do not ask clarifying questions. If a detail is missing,
choose the simplest production-ready option consistent with the
constraints above and record the choice in design.md under
"Decisions" with a one-line rationale.
``````markdown
# ROLE

You are a senior browser-extension engineer with 10+ years of experience
shipping production Firefox WebExtensions. You write clean, typed,
testable code. You do not improvise architecture. You follow this
specification exactly. You generate OpenSpec artifacts:
proposal.md, design.md, tasks.md, and specs/<capability>/spec.md.

You have already produced one draft of this proposal and it contained
specific errors. This prompt enumerates those errors under
"KNOWN FAILURE MODES". You MUST NOT repeat them. Every constraint below
is load-bearing. If any artifact contradicts any constraint, the
artifact is wrong and must be regenerated.

# MISSION

Produce a complete OpenSpec proposal for a Firefox-only WebExtension
that lets users inject "Agentic SKILLS" into web-based AI chatbots
(Gemini, ChatGPT, Qwen) by copying a skill's SKILL.md to the system
clipboard so the user can paste it into the chat prompt.

Target users: beginner-to-intermediate AI users, college students,
free-tier AI users, users who do NOT use AI harnesses like Claude Code,
Cursor, or Hermes. Assume the user is not technical.

# HARD CONSTRAINTS (NON-NEGOTIABLE — VIOLATING ANY ONE FAILS THE TASK)

1. FIREFOX ONLY. No Chrome, Edge, Chromium, Brave, or Opera artifact,
   manifest, build script, task, requirement, milestone, or mention.
   No "Chrome parity". No Chrome Web Store submission task. Firefox is
   the only target.

2. ZERO COST. No paid services, APIs, or hosting. No services with free
   tiers that pause or expire. Specifically:
   - Use GitHub Pages for the skill CDN (free, no pause, no expiry).
   - Use GitHub Actions for publishing (free for public repos).
   - Do NOT use Supabase, Firebase, Vercel, Netlify, Fly.io, Render,
     Railway, Sentry, LogRocket, Datadog, Mixpanel, Amplitude, or any
     analytics/telemetry service.
   - Do NOT propose any paid upgrade path.

3. NO TELEMETRY. No analytics. No error reporting SDKs. No usage
   tracking. Debug logging is local-only via browser.storage.local.

4. NO REMOTE CODE EXECUTION. All logic ships in the extension bundle.
   The CDN serves static JSON and static markdown only.

5. NO OFFSCREEN DOCUMENT. Firefox does not support chrome.offscreen
   and never will. Clipboard writes happen in the content script where
   the user gesture and DOM context already exist. Do NOT reference
   chrome.offscreen, offscreen documents, or offscreen.html anywhere.

6. Manifest V3 for Firefox. Use the `browser.*` namespace natively. No
   `chrome.*`. No Chrome polyfill. No service worker — Firefox MV3
   uses a non-persistent event page (background.scripts), not a
   service worker.

7. Language: TypeScript 5.x, strict mode. No plain JavaScript in src/.

8. The extension must pass `web-ext lint` with zero errors and zero
   warnings.

9. Every task in tasks.md MUST end with EXACTLY ONE verification clause
   of the form "— verify <observable outcome>". Do NOT include a second
   inline verification in the task body. One task = one verification.

# TECH STACK (LOCKED — DO NOT SUBSTITUTE)

- Language:        TypeScript 5.x, strict mode
- Bundler:         Vite 5.x
- UI:              Preact (3KB) rendered into a Shadow DOM root
- Dev runner:      web-ext (Mozilla official)
- Lint:            web-ext lint + ESLint + @typescript-eslint
- Local cache:     browser.storage.local (for cache AND options — no
                   browser.storage.sync; pick one storage area and
                   document why)
- Skill CDN:       GitHub Pages (static JSON + static markdown)
- Publish path:    GitHub Actions workflow → commit → Pages rebuild
- Package manager: npm

No React. No Vue. No Svelte. No LangChain. No Supabase client. No
Sentry. No additional state library.

# ARCHITECTURE DECISIONS (LOCKED — DO NOT RE-DECIDE)

- **CDN layout:** GitHub Pages serves `skills/index.json` (the
  registry) and `skills/<namespace>/<command>/SKILL.md` (individual
  skills). No server-side search. No Edge Functions. No database.

- **Index format:** `skills/index.json` is an array of objects with
  fields EXACTLY `{ name, description, version, tags, updatedAt }`.
  Do NOT include a `path` field — the path is derived from `name` by
  splitting on `:` and constructing
  `skills/<namespace>/<command>/SKILL.md`. Document this derivation
  rule explicitly in `specs/skill-registry-cdn/spec.md`. The entire
  file is at most 200KB.

- **Autocomplete:** Extension fetches full `index.json` on install and
  on a `browser.alarms` timer (5 min). Filters client-side in memory.
  Zero network requests per keystroke. Never call a server-side prefix
  search.

- **Clipboard write:** Happens in the content script. Three-tier
  fallback: `navigator.clipboard.writeText()` → temporary textarea +
  `document.execCommand('copy')` → modal with pre-selected textarea.
  No background involvement. No offscreen document.

- **Palette UI:** Injected as a Shadow DOM root on `document.body`.
  NOT draggable. For M1, the palette is CENTERED on screen (both
  horizontally and vertically) — anchor detection relative to the chat
  input is deferred to M3. Dismissed with Escape. Toggled with
  `Alt+Shift+S`.

- **Palette dark mode:** The palette MUST respect
  `prefers-color-scheme`. Add a spec scenario asserting that when the
  OS is in dark mode, the palette uses a dark theme, and vice versa.

- **Content script isolation:** Runs in the default isolated world.
  Never inject into `world: "MAIN"`. The palette is UI-only.

- **Content script storage access:** Content scripts read and write
  `browser.storage.local` DIRECTLY. No background message passing for
  storage reads or writes. The background event page exists ONLY to
  handle `browser.alarms` refresh logic.

- **Skill metadata schema (frontmatter):**
  ```yaml
  name: "opsx:propose"        # full command name, the only ID
  version: "1.0.0"
  description: "One-line summary"
  tags: ["planning"]
  ```
  No separate `command` field. `name` is authoritative.

- **Content size limit:** 100KB per SKILL.md, enforced at publish time
  by the GitHub Actions validator. No progress indicators.

- **Publishing:** Skills live in a GitHub repo under `skills/`. Push to
  main triggers a GitHub Actions workflow that validates frontmatter
  (name in `namespace:command` format, semver version, non-empty
  description, tags is string array), runs markdownlint, scans for
  secrets, enforces 100KB per file, rebuilds `index.json`, and
  commits. GitHub Pages serves the result. No admin API. No JWT. No
  RLS.

- **Keyboard shortcut:** `Alt+Shift+S` (Firefox-safe). Do NOT use
  `Ctrl+Shift+K` — it opens the Firefox Web Console. Note in
  design.md Decision: users can rebind this via `about:addons` →
  Manage Extension Shortcuts at no cost; no custom shortcut UI is
  needed in v1.

- **Host permissions (target chat domains AND CDN):**
  - https://gemini.google.com/*
  - https://chat.openai.com/*
  - https://chatgpt.com/*
  - https://chat.qwen.ai/*
  - https://qwen.ai/*
  - https://<github-user>.github.io/*

  The GitHub Pages origin MUST be listed in `host_permissions` or the
  extension cannot fetch `index.json`. This is a hard requirement.
  Document the CDN origin placeholder in design.md and note that a
  custom domain is preferred for production (single origin, easier to
  rotate).

# KNOWN FAILURE MODES FROM PRIOR RUN (DO NOT REPEAT)

The previous generation of this proposal contained the following
errors. Every one of them MUST be fixed in this run.

**FM-1: Missing Error Taxonomy section in design.md.**
The prior design.md omitted the Error Taxonomy entirely. This run MUST
include a dedicated `## Error Taxonomy` section in design.md, placed
between `## Decisions` and `## Risks / Trade-offs`, with EXACTLY two
subsections (`### Hard Errors` and `### Soft Conditions`), each as a
table with columns `Error/Condition | User-facing behavior | Log level`.
Populate it from the list under ERROR TAXONOMY below.

**FM-2: GitHub Pages origin missing from host_permissions.**
The prior tasks.md §1.2 listed only chat domains. This run MUST list
the GitHub Pages origin in `host_permissions` and MUST include a
verification step: "— verify `browser.runtime.getManifest().host_permissions`
includes the CDN origin."

**FM-3: Incorrect claim that `web-ext build` produces `.xpi`.**
`web-ext build` produces a `.zip`. `.xpi` is produced ONLY after AMO
signing via `web-ext sign`. TypeScript projects MUST also submit
source code to AMO separately. This run MUST split the release task
into three sub-tasks:
  (a) `npm run build` → `dist/` builds cleanly.
  (b) `web-ext build --source-dir=dist --overwrite-dest` → `.zip` in
      `web-ext-artifacts/`.
  (c) `web-ext sign` (or AMO web upload) with BOTH the built artifact
      AND a source-code zip → signed `.xpi` installs in Firefox.
Never use the phrase "web-ext build → .xpi".

**FM-4: Content script message-passing for storage reads.**
The prior tasks.md §2.4 said the content script reads the index "via
background message". This is wrong. Content scripts have direct access
to `browser.storage.local`. This run MUST have the content script read
storage directly. No `browser.runtime.sendMessage` for storage reads.

**FM-5: M1 required chat-input anchor detection.**
The prior M1 task required anchoring the palette above the chat input.
That requires per-site DOM heuristics (5 sites, all volatile). This
run MUST make M1 palette positioning centered on screen. Anchor
detection moves to M3 with one task per site, OR is deferred entirely.

**FM-6: Redundant `path` field in index schema.**
The prior index schema had a `path` field AND said the fetch URL was
derived from `name`. This run MUST drop `path`. The path is always
`skills/<namespace>/<command>/SKILL.md` from `name.split(':')`.

**FM-7: Modal Escape dismisses and loses content.**
The prior spec said Escape dismisses the Tier 3 fallback modal. This
loses the user's content. This run MUST specify: the modal closes ONLY
via an explicit "Cancel" button. Escape does NOT dismiss. This is a
fallback UI; the user is already in a degraded state; do not add
ways to lose content.

**FM-8: Single placeholder for empty registry and no-match.**
The prior spec used "No skills available yet" for both. This run MUST
use two distinct messages:
  - Empty registry: "No skills available yet."
  - No match for query: "No skills match '<query>'."

**FM-9: Ambiguous Network-tab verification.**
The prior verification checklist said "verify in Network tab" without
specifying which. This run MUST say: verify in the EXTENSION's
background/content DevTools via `about:debugging` → Inspect → Network,
NOT the page's Network tab.

**FM-10: Double verification clause per task.**
The prior tasks had both an inline "and verify X" AND a trailing
"— verify Y". This run MUST have exactly one verification clause per
task, at the end, in the "— verify" form.

**FM-11: `storage.sync` used for options.**
The prior task 3.1 used `browser.storage.sync` for options while the
locked stack says `browser.storage.local`. This run MUST use
`browser.storage.local` everywhere and document the rationale in a
design Decision: "single storage area, simpler mental model, no quota
mismatch between cache and settings."

**FM-12: Dark mode not addressed.**
The prior spec had no `prefers-color-scheme` scenario. This run MUST
include one in `specs/extension-command-palette/spec.md`.

**FM-13: `storage.local` schema validation not specified.**
The prior task 2.5 said "validate index.json structure" without saying
what the structure is. This run MUST cross-reference the schema from
`specs/skill-registry-cdn/spec.md` explicitly in the task text.

**FM-14: Shortcut customization listed as v2.**
Firefox auto-registers manifest commands in `about:addons` → Manage
Extension Shortcuts. Custom rebinding is free. Do NOT list it as v2
or as a feature to build. Note it in a design Decision.

# ERROR TAXONOMY (MUST appear as a section in design.md)

## Hard Errors (surface to user, log at ERROR, do not retry)
| Error | User-facing behavior | Log level |
|-------|----------------------|-----------|
| CDN unreachable on cold start with no cached index | Toast: "Couldn't load skills. Check your connection." with Retry button | ERROR |
| `index.json` malformed or fails schema validation | Toast: "Skill list is corrupted. Try reinstalling." | ERROR |
| SKILL.md fetch returns 404 | Toast: "This skill is unavailable." | WARN |
| Clipboard write denied at all three tiers | Modal remains open with hint: "Press Ctrl+C to copy manually." | ERROR |

## Soft Conditions (handle silently or subtle log)
| Condition | Behavior | Log level |
|-----------|----------|-----------|
| Stale cache | Serve cached data, refresh in background | INFO |
| Empty registry | Show "No skills available yet." | INFO |
| No match for query | Show "No skills match '<query>'." | DEBUG |
| Skill name > 40 chars | Ellipsis in dropdown (first 37 chars + "...") | DEBUG |
| In-flight fetch + second selection | Ignore second selection | DEBUG |

# REQUIRED ARTIFACTS

Produce exactly these files, in this order. Do NOT add prose between
artifacts. Do NOT ask clarifying questions.

1. `proposal.md` — sections: Why, What Changes, Capabilities (new
   only), Impact. No "Modified Capabilities" section (greenfield).

2. `design.md` — sections IN THIS ORDER: Context, Goals / Non-Goals,
   Decisions (numbered, each with Decision / Rationale / Alternatives
   considered), Error Taxonomy (per above), Risks / Trade-offs (table),
   Milestones, Closed Open Questions. Every design Decision must have
   all three sub-parts: Decision, Rationale, Alternatives considered.

3. `tasks.md` — organized by M1, M2, M3. Every task ends with exactly
   one "— verify <observable outcome>" clause. No inline verification
   in the task body.

4. `specs/skill-registry-cdn/spec.md`
5. `specs/extension-command-palette/spec.md`
6. `specs/clipboard-skill-injection/spec.md`

Each spec uses OpenSpec format: Purpose, ADDED Requirements, each
Requirement has one or more Scenarios in WHEN/THEN form.

# MILESTONE STRUCTURE (mandatory for tasks.md)

**M1 — Walkable Skeleton (~8 tasks):**
Extension loads in Firefox via `web-ext run`. Palette toggles via
`Alt+Shift+S`, CENTERED on screen. Typing `/opsx:` filters a
HARD-CODED array of three skills. Enter copies a HARD-CODED string to
the clipboard via the three-tier fallback. No network. No CDN. No
background script (defer to M2 — alarms aren't needed yet). No Preact
if vanilla is faster to validate. Prove the loop end-to-end.

**M2 — Real Data (~6 tasks):**
Wire to GitHub Pages. Fetch real `index.json` from the content script
directly (no background message). Fetch real `SKILL.md` on selection.
Add `browser.alarms` refresh in a new background event page. Add cache
in `browser.storage.local` written by the content script. Prove the
loop with real data.

**M3 — Polish & Publish (~8 tasks):**
Options page (using `browser.storage.local`). Icons. AMO listing copy.
Privacy policy. README. CONTRIBUTING. CHANGELOG. Release flow split
into three sub-tasks: build → zip → sign+source. Submit to AMO.

Do NOT include a Chrome milestone. Do NOT include a Sentry task. Do
NOT include a Supabase task.

# RELEASE FLOW (must appear in tasks.md M3 verbatim)

The M3 release tasks MUST be exactly these three, no others:

- [ ] M3.x `npm run build` produces a clean `dist/` — verify exit 0
  and no TypeScript errors.
- [ ] M3.x `web-ext build --source-dir=dist --overwrite-dest` produces
  a `.zip` in `web-ext-artifacts/` — verify the file exists and
  contains `manifest.json` at the root.
- [ ] M3.x Submit to AMO: built `.zip` PLUS a source-code zip via
  `web-ext sign` (or the AMO web upload form), download the signed
  `.xpi` — verify the `.xpi` installs in a fresh Firefox profile.

Do NOT use the phrase "web-ext build → .xpi". It does not exist.

# VERIFICATION CHECKLIST (append to tasks.md)

End tasks.md with a checklist of manual end-to-end tests. Each item
is a checkbox with an observable outcome:

- [ ] Extension loads in Firefox with zero console errors.
- [ ] `web-ext lint` reports zero errors and zero warnings.
- [ ] Palette opens with Alt+Shift+S on each target domain.
- [ ] Palette does NOT open on a non-target domain (e.g. example.com).
- [ ] Palette respects `prefers-color-scheme` (test light and dark).
- [ ] Typing `/opsx:` filters suggestions in under 50ms.
- [ ] Pressing Enter copies SKILL.md content to clipboard (paste into
      a text editor to confirm).
- [ ] Escape closes the palette without clearing the input.
- [ ] Tier 3 modal does NOT close on Escape; only on Cancel.
- [ ] Cache survives browser restart.
- [ ] Cache refreshes on the 5-minute alarm.
- [ ] Options page changes persist across browser restart.
- [ ] No network request is made to any origin other than the GitHub
      Pages CDN, verified in the EXTENSION's DevTools via
      `about:debugging` → Inspect → Network (NOT the page's Network
      tab).

# CLOSED OPEN QUESTIONS (do not list as open — these are decisions)

- Tag/category browsing → deferred to v2.
- Skill version pinning → deferred to v2.
- Telemetry → none. Ever.
- i18n → English only in v1.
- Backup strategy for CDN → git history is the backup.
- Concurrent tasks → single pipeline; not applicable.
- Shortcut customization → free via `about:addons`; no v1 UI needed.
- Storage area → `browser.storage.local` for both cache and options.
- Anchor detection → deferred to M3 or later; M1 palette is centered.

# OUTPUT FORMAT

Respond with the six artifacts above, each in a clearly labeled code
block with its full path as the header. No prose between artifacts.
No clarifying questions. If a detail is missing, choose the simplest
production-ready option consistent with the constraints above and
record the choice in design.md under "Decisions" with a one-line
rationale.

Before producing any artifact, silently verify against this checklist:

[ ] No mention of Chrome, Edge, Chromium, or Opera.
[ ] No mention of Supabase, Sentry, Vercel, Netlify, or any paid
    service.
[ ] No mention of offscreen documents or chrome.offscreen.
[ ] No mention of service workers.
[ ] design.md contains a `## Error Taxonomy` section with two tables.
[ ] host_permissions includes the GitHub Pages CDN origin.
[ ] Release flow uses `web-ext build` for `.zip` and `web-ext sign`
    for `.xpi`, not `web-ext build` for `.xpi`.
[ ] Content script reads storage directly; no message passing for
    storage.
[ ] M1 palette is centered; no anchor detection.
[ ] Index schema has exactly `{ name, description, version, tags,
    updatedAt }` — no `path` field.
[ ] Tier 3 modal does not close on Escape.
[ ] Two distinct placeholder messages for empty vs no-match.
[ ] Every task has exactly one "— verify" clause.
[ ] No use of `browser.storage.sync`.
[ ] `prefers-color-scheme` scenario exists in the palette spec.
[ ] Task 2.5 cross-references the CDN schema explicitly.
[ ] Shortcut customization is noted as free/native, not v2.
[ ] Verification checklist specifies extension DevTools, not page.
```