## Purpose

Provides a browser extension (Manifest V3, Firefox/Chrome compatible) that injects a floating command chat box into supported web-based AI chatbot pages, enabling users to discover, preview, and copy agentic skills to their clipboard via `/opsx:` command autocomplete.

## ADDED Requirements

### Requirement: Extension injects command palette on target domains
The system SHALL inject a floating, draggable command palette UI element into the DOM of supported chatbot pages (gemini.google.com, chat.openai.com, chat.qwen.ai) when the extension is active. The palette SHALL be accessible via a configurable keyboard shortcut (default: `Ctrl+Shift+K` / `Cmd+Shift+K`) and a toolbar icon click.

#### Scenario: Palette appears on supported page
- **WHEN** user navigates to a supported chatbot domain with extension enabled
- **THEN** the palette UI is injected into the page (initially hidden) and the keyboard shortcut / toolbar icon toggles visibility

#### Scenario: Palette does not inject on unsupported pages
- **WHEN** user navigates to a non-supported domain
- **THEN** no palette UI is injected and keyboard shortcut has no effect

### Requirement: Autocomplete suggestions from CDN skill registry
The system SHALL fetch skill metadata from the skill registry CDN on palette open (with 5-minute client-side cache) and provide real-time autocomplete suggestions as the user types a `/opsx:` command prefix. Suggestions SHALL update within 50ms of keystroke.

#### Scenario: Type /opsx: shows matching skills
- **WHEN** user types `/opsx:` in the palette input
- **THEN** a dropdown appears within 50ms showing up to 10 skill suggestions matching the prefix, each displaying command name, short description, and version

#### Scenario: Continue typing narrows suggestions
- **WHEN** user continues typing after `/opsx:` (e.g., `/opsx:pro`)
- **THEN** suggestions filter in real-time to match the extended prefix

#### Scenario: No matches shows helpful message
- **WHEN** no skills match the typed prefix
- **THEN** the dropdown shows "No skills found for '<prefix>'" with a link to browse all skills

### Requirement: Keyboard navigation and selection
The system SHALL support full keyboard navigation of the autocomplete dropdown: `ArrowUp`/`ArrowDown` to navigate, `Enter` to select, `Escape` to dismiss.

#### Scenario: Select skill with Enter
- **WHEN** user highlights a suggestion and presses `Enter`
- **THEN** the skill is selected and the clipboard copy flow is triggered

#### Scenario: Dismiss with Escape
- **WHEN** user presses `Escape` with dropdown open
- **THEN** dropdown closes and input focus remains

### Requirement: Clipboard copy of full SKILL.md on selection
The system SHALL fetch the full SKILL.md content from the CDN (using the signed URL from metadata) and write it to the system clipboard when a skill is selected. The system SHALL show a toast notification confirming copy success or failure.

#### Scenario: Successful clipboard copy
- **WHEN** user selects a skill from autocomplete
- **THEN** the system fetches SKILL.md, writes to clipboard, and shows "Skill copied to clipboard!" toast

#### Scenario: Clipboard API denied shows fallback
- **WHEN** browser denies clipboard write (non-secure context, no user gesture)
- **THEN** the system shows a modal with the skill markdown in a selectable textarea and "Copy manually" instruction

#### Scenario: Network error shows retry
- **WHEN** fetching SKILL.md fails
- **THEN** the system shows "Failed to load skill. Retry?" toast with retry action

### Requirement: Extension settings and domain management
The system SHALL provide an options page (chrome://extensions → Details → Extension options) allowing users to: enable/disable the extension, add/remove target domains, configure keyboard shortcut, toggle autocomplete cache, and view cache status.

#### Scenario: Add custom domain
- **WHEN** user adds `chat.example.ai` in options
- **THEN** the palette injects on that domain after reload

#### Scenario: Configure shortcut
- **WHEN** user changes shortcut to `Ctrl+Shift+P`
- **THEN** the new shortcut activates the palette (after browser applies the change)

### Requirement: Firefox Manifest V3 compatibility
The system SHALL use the `browser` namespace (with `chrome` fallback) and declare `browser_specific_settings.gecko.id` in manifest.json. The system SHALL NOT use Chrome-only APIs (e.g., `chrome.action.setBadgeTextColor`) without feature detection and fallback.

#### Scenario: Extension loads in Firefox
- **WHEN** extension is installed in Firefox (via .xpi or about:debugging)
- **THEN** all features work: palette injection, autocomplete, clipboard copy, settings

#### Scenario: Extension loads in Chrome/Edge
- **WHEN** extension is installed in Chrome/Edge
- **THEN** all features work identically

## REMOVED Requirements

(none — new capability)