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
```