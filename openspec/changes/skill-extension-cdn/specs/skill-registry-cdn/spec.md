## Purpose

Provides a cloud-hosted, queryable registry of agentic skills where each skill is stored as a folder containing a SKILL.md file and optional assets, accessible via REST API for extension autocomplete and clipboard injection.

## ADDED Requirements

### Requirement: Skill registry stores skills as versioned folders
The system SHALL store each skill as a folder at `skills/<skill-name>/` containing at minimum a `SKILL.md` file with YAML frontmatter and markdown body. The system SHALL support multiple versions of the same skill under `skills/<skill-name>/v<semver>/`.

#### Scenario: List all available skills
- **WHEN** a client requests the skill index
- **THEN** the system returns a JSON array of skill metadata objects containing `name`, `version`, `description`, `tags`, `updatedAt`, and `skillMdUrl` (signed URL to fetch the full markdown)

#### Scenario: Fetch a specific skill's markdown
- **WHEN** a client requests a skill by name and optional version (defaults to latest)
- **THEN** the system returns the full SKILL.md content as plain text with a `200 OK` response

#### Scenario: Skill not found returns 404
- **WHEN** a client requests a skill that does not exist
- **THEN** the system returns `404 Not Found` with a JSON error body

### Requirement: Skill metadata is queryable for autocomplete
The system SHALL provide a search endpoint that accepts a prefix string (e.g., "/opsx:") and returns matching skill names and metadata for dropdown autocomplete, with response latency under 200ms p95.

#### Scenario: Autocomplete prefix search
- **WHEN** a client sends a GET request with `?prefix=/opsx:`
- **THEN** the system returns skills whose command names start with the prefix, sorted by relevance (exact matches first, then alphabetical), limited to 20 results

#### Scenario: Empty prefix returns popular skills
- **WHEN** a client sends a request with no prefix or empty prefix
- **THEN** the system returns the top 20 most recently updated or most popular skills

### Requirement: Public read access with rate limiting
The system SHALL allow anonymous read access to skill metadata and markdown content without authentication. The system SHALL enforce rate limits of 100 requests/minute per IP for metadata endpoints and 30 requests/minute per IP for markdown fetch endpoints.

#### Scenario: Rate limit exceeded
- **WHEN** a client exceeds the rate limit
- **THEN** the system returns `429 Too Many Requests` with a `Retry-After` header

### Requirement: Skill upload and management (admin only)
The system SHALL provide authenticated admin endpoints for uploading new skills, updating existing skills, and deprecating skills. Admin actions require a valid Supabase JWT with `admin` role claim.

#### Scenario: Upload new skill
- **WHEN** an admin POSTs to `/admin/skills` with multipart form data containing skill folder
- **THEN** the system validates SKILL.md frontmatter schema, stores the skill at `skills/<name>/v<version>/`, and returns `201 Created` with the new skill metadata

#### Scenario: Deprecate skill
- **WHEN** an admin PATCHes `/admin/skills/<name>` with `{ "deprecated": true }`
- **THEN** the system marks the skill as deprecated in the index (excluded from autocomplete by default) but keeps markdown fetchable for existing users

## REMOVED Requirements

(none — new capability)