## Why

Browser extension users who rely on web-based AI chatbots (Gemini, ChatGPT, Qwen) currently lack a seamless way to use structured "agentic skills" — reusable prompt templates with defined behaviors, tool integrations, and workflows. These users must manually copy-paste skill definitions, which is error-prone, disrupts flow, and prevents skill discovery. This extension bridges that gap by providing a CDN-backed skill registry with an in-browser command palette that copies skill markdown directly to the clipboard for instant pasting into any web chatbot.

## What Changes

- **New Capability**: `skill-registry-cdn` — A Supabase-backed CDN storage layer hosting skill folders (each containing `SKILL.md` and optional assets) with versioned, queryable metadata.
- **New Capability**: `extension-command-palette` — A browser extension (Manifest V3, Firefox-compatible) that injects a floating command chat box into supported web chatbot pages, offering autocomplete suggestions for `/opsx:` skill commands fetched from the CDN.
- **New Capability**: `clipboard-skill-injection` — One-click clipboard copy of the full `SKILL.md` content (including frontmatter and markdown body) for immediate pasting into the active chatbot input field.
- **Modified Capability**: None — this is a greenfield project with no existing OpenSpec capabilities to modify.

## Capabilities

### New Capabilities
- `skill-registry-cdn`: Supabase-hosted skill registry with folder-based storage (`skills/<skill-name>/SKILL.md`), REST API for listing/searching skills, and signed URLs for asset access.
- `extension-command-palette`: Firefox/Chrome Manifest V3 extension with content script injection on target domains (gemini.google.com, chat.openai.com, chat.qwen.ai), floating command input with `/opsx:` prefix autocomplete dropdown populated from CDN, and clipboard write integration.
- `clipboard-skill-injection`: Secure clipboard API usage to copy full skill markdown content, with fallback for browsers restricting clipboard access on non-focused windows.

### Modified Capabilities
- (none — greenfield project)

## Impact

- **New Dependencies**: Supabase (PostgreSQL + Storage + Edge Functions), `@supabase/supabase-js` for extension, browser extension APIs (Manifest V3: `clipboardWrite`, `storage`, `scripting`, `activeTab`).
- **Target Browsers**: Firefox (primary), Chrome/Edge (secondary) — Manifest V3 with `browser_specific_settings` for Firefox.
- **Target Domains**: `gemini.google.com`, `chat.openai.com`, `chat.qwen.ai` (configurable via extension settings).
- **Data Flow**: Extension → Supabase REST (list skills) → User selects skill → Extension fetches `SKILL.md` → Extension writes to clipboard → User pastes into chatbot.
- **Security**: No API keys in extension (anonymous/public read access to skills bucket); Supabase RLS policies enforce read-only for skill content. Clipboard access requires user gesture (click).
- **Scalability**: Supabase handles CDN, auth (future), and edge caching. Skill metadata indexed for fast autocomplete. Extension bundles minimal JS (~50KB gzipped).