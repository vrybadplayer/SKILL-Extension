## Purpose

Serves a static skill registry (index.json) and individual skill markdown files from GitHub Pages, with publish-time validation that guarantees schema compliance, size limits, and secret-free content so the extension can reliably fetch and cache skills at zero cost.

## ADDED Requirements

### Requirement: Registry index served at a stable URL
The CDN SHALL serve `skills/index.json` at `https://<github-user>.github.io/<repo>/skills/index.json` (or a custom domain equivalent) with HTTP 200 and `Content-Type: application/json`.

#### Scenario: Cold fetch succeeds
- **WHEN** the extension requests `index.json` on first install with an empty cache
- **THEN** the response is valid JSON matching the index schema, served within 5 seconds

#### Scenario: Conditional GET returns 304
- **WHEN** the extension re-fetches `index.json` with `If-None-Match` or `If-Modified-Since` headers
- **THEN** the CDN returns 304 Not Modified when content is unchanged, reducing bandwidth

### Requirement: Index schema is strictly defined
The `index.json` file SHALL be an array of objects where each object has EXACTLY these fields: `name` (string, format `namespace:command`), `description` (non-empty string), `version` (semver string), `tags` (array of strings), `updatedAt` (ISO 8601 timestamp). No additional fields are permitted.

#### Scenario: Valid index passes schema check
- **WHEN** the publish workflow validates `index.json` against the schema
- **THEN** validation passes and the file is committed to Pages

#### Scenario: Invalid index fails publish
- **WHEN** a skill entry omits `version` or has a non-string `tags` field
- **THEN** the GitHub Actions workflow fails and does not deploy

### Requirement: Individual skill files served at derived paths
Each skill SHALL be accessible at `skills/<namespace>/<command>/SKILL.md` where `<namespace>` and `<command>` are derived by splitting the `name` field on `:` (exactly one colon). The file SHALL be served with `Content-Type: text/markdown; charset=utf-8`.

#### Scenario: Skill fetch by derived path succeeds
- **WHEN** the extension selects a skill with `name: "opsx:propose"`
- **THEN** the extension fetches `https://<cdn>/skills/opsx/propose/SKILL.md` and receives the full markdown content

#### Scenario: Missing skill returns 404
- **WHEN** the extension requests a skill path that does not exist in the repo
- **THEN** the CDN returns 404 and the extension surfaces a "This skill is unavailable" toast

### Requirement: Content size limit enforced at publish
Every `SKILL.md` file SHALL be ≤100KB. The GitHub Actions validator SHALL reject any push where any skill file exceeds this limit.

#### Scenario: Oversized skill blocks deploy
- **WHEN** a contributor adds a 150KB `SKILL.md`
- **THEN** the workflow fails with a clear error naming the offending file and its size

### Requirement: Frontmatter validation at publish
Every `SKILL.md` SHALL begin with a YAML frontmatter block containing exactly: `name` (matches the derived path, format `namespace:command`), `version` (semver), `description` (non-empty string), `tags` (array of strings). The validator SHALL reject files with missing, malformed, or mismatched frontmatter.

#### Scenario: Valid frontmatter passes
- **WHEN** a skill file has correct frontmatter matching its path
- **THEN** the workflow proceeds to rebuild `index.json` and deploy

#### Scenario: Mismatched name field fails
- **WHEN** a file at `skills/opsx/propose/SKILL.md` declares `name: "opsx:other"`
- **THEN** the workflow fails with a path/name mismatch error

### Requirement: Markdown lint clean
All `SKILL.md` files SHALL pass `markdownlint` with the project's config (no trailing whitespace, consistent heading styles, fenced code blocks with language tags).

#### Scenario: Lint error blocks deploy
- **WHEN** a skill file uses ATX headings inconsistently
- **THEN** the workflow fails and reports the lint violations

### Requirement: Secret scanning at publish
The GitHub Actions workflow SHALL scan all skill files and `index.json` for secrets (API keys, tokens, passwords) using a pattern-based scanner and SHALL fail the build if any are detected.

#### Scenario: Secret in skill blocks deploy
- **WHEN** a skill file contains `sk_live_abc123`
- **THEN** the workflow fails and redacts the finding in logs

### Requirement: Index rebuild is deterministic
The `index.json` SHALL be regenerated from the `skills/` directory tree on every push to `main` by a script that reads every `SKILL.md`, extracts frontmatter, and writes the array sorted by `name` ascending. The output SHALL be byte-for-byte identical for the same input tree.

#### Scenario: Rebuild produces stable output
- **WHEN** the rebuild script runs twice on an unchanged `skills/` tree
- **THEN** both outputs are identical (verified by `git diff --exit-code`)

### Requirement: GitHub Pages is the only runtime dependency
The CDN SHALL require no server-side logic, Edge Functions, databases, or paid services. GitHub Pages (free tier for public repos) SHALL be the sole hosting mechanism.

#### Scenario: No backend calls at runtime
- **WHEN** the extension fetches `index.json` or a `SKILL.md`
- **THEN** the request terminates at the Pages CDN with no origin compute