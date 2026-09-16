## Purpose

Copies the selected skill's full `SKILL.md` markdown content to the system clipboard from the content script using a three-tier fallback strategy that works without background involvement, offscreen documents, or remote code execution.

## ADDED Requirements

### Requirement: Three-tier clipboard write in content script
The extension SHALL attempt clipboard write in this order, stopping at the first success:
1. `navigator.clipboard.writeText(text)` (async, requires secure context + user gesture)
2. Temporary `textarea` + `document.execCommand('copy')` (sync fallback for older contexts)
3. Modal with pre-selected `textarea` instructing user to press `Ctrl+C` manually

No background script, offscreen document, or service worker SHALL be involved in any tier.

#### Scenario: Tier 1 succeeds on modern Firefox
- **WHEN** user selects a skill on a chat page (HTTPS, user gesture present)
- **THEN** `navigator.clipboard.writeText()` resolves and the palette closes with a brief toast "Copied!"

#### Scenario: Tier 2 succeeds when Tier 1 fails
- **WHEN** `navigator.clipboard` is unavailable or rejected (e.g., non-secure context edge case)
- **THEN** the fallback `textarea.execCommand('copy')` succeeds and the palette closes with "Copied!"

#### Scenario: Tier 3 modal appears when both automated tiers fail
- **WHEN** both Tier 1 and Tier 2 fail (e.g., clipboard permissions denied)
- **THEN** a modal renders in the Shadow DOM with a pre-focused, pre-selected `textarea` containing the skill text and a "Cancel" button

### Requirement: Tier 3 modal does not close on Escape
The fallback modal SHALL ONLY close via an explicit "Cancel" button. Pressing `Escape` SHALL NOT dismiss the modal, to prevent accidental loss of the skill text the user needs to copy manually.

#### Scenario: Escape does not dismiss modal
- **WHEN** Tier 3 modal is open and user presses `Escape`
- **THEN** modal remains open, textarea remains selected

#### Scenario: Cancel button dismisses modal
- **WHEN** Tier 3 modal is open and user clicks "Cancel"
- **THEN** modal closes and palette reopens with previous input intact

### Requirement: Clipboard content is the full SKILL.md
The text copied SHALL be the exact raw markdown content of the fetched `SKILL.md` file, including frontmatter and body, with no transformation, truncation, or wrapper.

#### Scenario: Full markdown copied
- **WHEN** user selects a skill with a 5KB `SKILL.md`
- **THEN** pasting into a text editor yields the identical 5KB markdown

### Requirement: No network request during copy
The clipboard operation SHALL use only the already-fetched skill content (cached in memory from the selection step). No additional fetch SHALL occur at copy time.

#### Scenario: Copy works offline after selection
- **WHEN** user selects a skill, goes offline, then presses `Enter`
- **THEN** the skill text is still copied (from memory cache)

### Requirement: Hard errors surface to user with actionable toasts
The following Hard Errors SHALL display a toast with the specified message and log at ERROR level:
- CDN unreachable on cold start with no cached index → "Couldn't load skills. Check your connection." + Retry button
- `index.json` malformed or fails schema validation → "Skill list is corrupted. Try reinstalling."
- SKILL.md fetch returns 404 → "This skill is unavailable."
- Clipboard write denied at all three tiers → Modal remains open with hint: "Press Ctrl+C to copy manually."

#### Scenario: Cold start CDN failure shows retry toast
- **WHEN** first install, no cache, `fetch(index.json)` fails with network error
- **THEN** toast appears with Retry button; clicking Retry re-attempts fetch

#### Scenario: Corrupted index shows reinstall toast
- **WHEN** cached `index.json` fails JSON.parse or schema validation
- **THEN** toast appears; cache is cleared; Retry triggers fresh fetch

#### Scenario: 404 on skill fetch shows unavailable toast
- **WHEN** user selects a skill but `fetch(SKILL.md)` returns 404
- **THEN** toast "This skill is unavailable." appears; palette stays open

#### Scenario: All clipboard tiers fail shows manual hint
- **WHEN** Tier 1, 2, and 3 all fail
- **THEN** modal stays open with "Press Ctrl+C to copy manually." hint

### Requirement: Soft conditions handled silently or with subtle logs
The following Soft Conditions SHALL NOT surface toasts; they SHALL log at the specified level:
- Stale cache → serve cached data, refresh in background (INFO)
- Empty registry → show "No skills available yet." (INFO)
- No match for query → show "No skills match '<query>'." (DEBUG)
- Skill name > 40 chars → ellipsis in dropdown (DEBUG)
- In-flight fetch + second selection → ignore second selection (DEBUG)

#### Scenario: Stale cache serves silently
- **WHEN** cache exists but is older than 5 minutes
- **THEN** palette shows cached skills immediately; background alarm refreshes index

#### Scenario: In-flight fetch ignores duplicate
- **WHEN** user clicks a skill while its `SKILL.md` fetch is already pending
- **THEN** the second click is ignored; no second fetch issued