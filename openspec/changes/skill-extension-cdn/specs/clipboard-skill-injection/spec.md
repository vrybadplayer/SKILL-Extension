## Purpose

Provides secure, reliable clipboard integration for copying full skill markdown content from the CDN to the user's clipboard, with graceful fallbacks for browsers that restrict clipboard API access on non-focused windows or non-secure contexts.

## ADDED Requirements

### Requirement: Clipboard write via standard Clipboard API
The system SHALL use the modern `navigator.clipboard.writeText()` API to copy skill markdown content when available and permitted (secure context, user gesture). The system SHALL request clipboard-write permission at install time via manifest `permissions: ["clipboardWrite"]`.

#### Scenario: Write succeeds on supported browser
- **WHEN** user selects a skill in the palette on a secure context (https://) with user gesture
- **THEN** `navigator.clipboard.writeText(skillMarkdown)` resolves and toast confirms success

#### Scenario: Write fails due to permissions
- **WHEN** clipboard write is denied (permission revoked, non-secure context)
- **THEN** the system falls back to the legacy textarea method (see below)

### Requirement: Legacy textarea fallback for restricted contexts
The system SHALL implement a fallback that creates a temporary off-screen `<textarea>`, sets its value to the skill markdown, calls `select()` and `document.execCommand('copy')`, then removes the textarea. This works in non-secure contexts and when Clipboard API is unavailable.

#### Scenario: Fallback copies successfully
- **WHEN** Clipboard API fails and fallback executes
- **THEN** the skill markdown is copied to clipboard and toast confirms "Copied (fallback method)"

#### Scenario: Fallback also fails shows manual copy modal
- **WHEN** both Clipboard API and execCommand fallback fail
- **THEN** the system shows a modal dialog with the full markdown in a readonly textarea, pre-selected, with instruction "Press Ctrl+C to copy"

### Requirement: Clipboard content verification
The system SHALL verify the clipboard content after write by reading back via `navigator.clipboard.readText()` (when available) and comparing to the original markdown. Verification SHALL be best-effort (non-blocking).

#### Scenario: Verification passes
- **WHEN** read-back matches original content
- **THEN** no additional UI (success toast already shown)

#### Scenario: Verification fails
- **WHEN** read-back differs or readText() unavailable
- **THEN** system logs warning to console but does not alarm user (toast already showed success)

### Requirement: Large content handling
The system SHALL handle skill markdown up to 500KB without performance degradation. For content over 100KB, the system SHALL show a progress indicator during copy.

#### Scenario: Large skill copied
- **WHEN** skill markdown is 250KB
- **THEN** copy completes within 500ms with progress indicator shown

### Requirement: Clipboard event sanitization
The system SHALL NOT listen to or interfere with `copy`/`cut`/`paste` events on the host page. The system SHALL only write to clipboard in direct response to user skill selection.

#### Scenario: No interference with page clipboard
- **WHEN** user copies text from the chatbot page normally
- **THEN** extension does not modify, log, or block that operation

## REMOVED Requirements

(none — new capability)