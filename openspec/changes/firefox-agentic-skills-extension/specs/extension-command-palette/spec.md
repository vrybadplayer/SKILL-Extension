## Purpose

Provides an injected command palette UI (Shadow DOM, Preact) that lets users discover, filter, and select skills from the locally cached registry, with keyboard-driven interaction, dark-mode support, and a Firefox-safe shortcut.

## ADDED Requirements

### Requirement: Palette toggles via Alt+Shift+S
The palette SHALL open when the user presses `Alt+Shift+S` on any target domain and SHALL close when the same shortcut is pressed again or when Escape is pressed. The shortcut SHALL be registered in `manifest.json` under `commands` so Firefox exposes it in `about:addons` → Manage Extension Shortcuts for free user rebinding.

#### Scenario: Shortcut opens palette on target domain
- **WHEN** user presses `Alt+Shift+S` on `https://chat.openai.com/`
- **THEN** the palette appears centered on screen within 100ms

#### Scenario: Shortcut does nothing on non-target domain
- **WHEN** user presses `Alt+Shift+S` on `https://example.com/`
- **THEN** no palette appears and no error is logged

#### Scenario: Shortcut is rebindable via Firefox UI
- **WHEN** user visits `about:addons` → Manage Extension Shortcuts
- **THEN** the command appears and can be reassigned without extension code changes

### Requirement: Palette renders in a Shadow DOM root
The palette UI SHALL be rendered into a `ShadowRoot` attached to `document.body` (mode: `open`) so its styles and DOM are isolated from the host page. The root SHALL have a stable ID for DevTools inspection.

#### Scenario: Styles do not leak to host page
- **WHEN** the palette is open on a chat site with conflicting CSS
- **THEN** host page styles do not affect palette elements and palette styles do not affect host page

### Requirement: Palette is centered on screen (M1)
In M1, the palette SHALL be positioned fixed at viewport center (both horizontally and vertically) with a maximum width of 600px and maximum height of 70vh. Anchor detection relative to the chat input is deferred.

#### Scenario: Palette centered on all viewports
- **WHEN** the palette opens on a 1920x1080 screen and on a 1366x768 screen
- **THEN** it is visually centered in both cases without horizontal scroll

### Requirement: Client-side autocomplete filters on /namespace:command prefix
The palette SHALL filter the cached skill list in memory as the user types. Typing `/` followed by a namespace prefix (e.g., `/opsx:`) SHALL narrow suggestions to skills whose `name` starts with that prefix. Filtering SHALL complete in <50ms for a 200KB index.

#### Scenario: Prefix filter narrows results
- **WHEN** user types `/opsx:` with 50 skills cached (5 matching `opsx:*`)
- **THEN** only the 5 matching skills appear in the dropdown

#### Scenario: Empty query shows all skills
- **WHEN** user opens palette and types nothing
- **THEN** all cached skills appear (up to a reasonable render limit, e.g., 50)

#### Scenario: No-match message is distinct from empty registry
- **WHEN** user types `/nonexistent:` and no skills match
- **THEN** the palette shows "No skills match '/nonexistent:'" (not "No skills available yet")

#### Scenario: Empty registry shows distinct message
- **WHEN** cache is empty (cold start, no network)
- **THEN** the palette shows "No skills available yet."

### Requirement: Keyboard navigation and selection
The palette SHALL support: `ArrowUp`/`ArrowDown` to navigate, `Enter` to select the highlighted skill, `Escape` to close the palette without clearing the input buffer. Selection SHALL trigger the clipboard copy flow (see `clipboard-skill-injection` spec).

#### Scenario: Arrow keys move selection
- **WHEN** user presses `ArrowDown` twice
- **THEN** the third item is highlighted and scrolls into view if needed

#### Scenario: Enter selects and copies
- **WHEN** user highlights a skill and presses `Enter`
- **THEN** the skill's markdown is copied to clipboard and the palette closes

#### Scenario: Escape closes without clearing input
- **WHEN** user types `/opsx:`, presses `Escape`, then reopens palette
- **THEN** the input `/opsx:` is still present

### Requirement: Dark mode via prefers-color-scheme
The palette SHALL respect the OS/browser `prefers-color-scheme` media query. When the system is in dark mode, the palette SHALL use a dark color scheme (dark background, light text); when in light mode, a light color scheme. No manual theme toggle in v1.

#### Scenario: Palette dark in dark mode
- **WHEN** OS is set to dark mode and palette opens
- **THEN** background is dark (e.g., #1e1e1e) and text is light (e.g., #e0e0e0)

#### Scenario: Palette light in light mode
- **WHEN** OS is set to light mode and palette opens
- **THEN** background is light (e.g., #ffffff) and text is dark (e.g., #1a1a1a)

### Requirement: Skill name truncation in dropdown
Skill names longer than 40 characters SHALL be displayed as the first 37 characters followed by `...` in the dropdown. The full name SHALL be available in a tooltip or on selection.

#### Scenario: Long name truncated
- **WHEN** a skill named `very-long-namespace:very-long-command-name` (45 chars) appears
- **THEN** the dropdown shows `very-long-namespace:very-long-comman...`

### Requirement: Cache read is direct from browser.storage.local
The content script SHALL read the skill index directly from `browser.storage.local.get('skillIndex')` without messaging the background. The background event page exists only for `browser.alarms` refresh.

#### Scenario: Palette populates without background round-trip
- **WHEN** palette opens on a page with a warm cache
- **THEN** suggestions appear synchronously (no `runtime.sendMessage` in the critical path)