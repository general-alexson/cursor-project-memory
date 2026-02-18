# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.2] - 2026-02-17

### Fixed

- Publish workflow: check if Open VSX namespace exists (via API) before creating it; skip create when it already exists.

## [0.3.1] - 2026-02-17

### Added

- **Import .cursorrules into Global Memory** — Command appends workspace root `.cursorrules` into global memory with a dated section so you can reuse rules across projects.

### Fixed

- Sidebar: actions moved from inline (hover) to context menu so **single-click** on a file opens it; right-click for other commands.

## [0.3.0] - 2026-02-17

### Added

- **Assimilate existing memory files** — Command **Assimilate Existing Memory Files** looks for `AI-MEMORY.md` and `COMPLETED-IMPLEMENTATIONS.md` at the workspace root and merges their content into `project-memory.mdc` and `project-completed.mdc` with an "Imported from … (date)" section. Confirmation step before importing.

### Fixed

- ESLint: allow unused parameters prefixed with `_` (e.g. `_element` in tree provider) via `argsIgnorePattern` in `.eslintrc.json`.

## [0.2.0] - 2026-02-17

### Added

- **Templates** — **Add Memory Entry** shows a Quick Pick: Dated entry, Bugfix, Decision, Feature, Meeting notes. Each template uses `{{date}}` (ISO date). Default is Dated entry.
- **Memory history** — On save of `project-memory.mdc`, a snapshot is written to `.cursor/project-memory-history/`. **Show Memory History** lists snapshots and restores a chosen version. Config: `history.enabled`, `history.maxEntries` (default 20).
- **Global memory** — Cross-workspace file (in extension global storage). Sidebar shows **Global memory**; **Open Global Memory** opens or creates it. **Add Global Memory to Workspace** copies it to `.cursor/rules/global-memory.mdc` so Cursor loads it in the current project. Config: `globalMemory.enabled`.
- README link to GitHub issues for bugs and feature requests.

## [0.1.1] - 2026-02-17

### Added

- **Auto-sync on save** — When you save the memory or completed-implementations file, project memory is automatically synced to `.cursor/rules`. Configurable via `cursorProjectMemory.syncOnSave` (default: true).
- MIT LICENSE file.

## [0.1.0] - 2025-02-16

### Added

- Project Memory view in the Explorer sidebar
- Open project memory and completed implementations files from the view
- **Sync to Cursor Rules** — write memory into `.cursor/rules/project-memory.mdc`
- **Add Memory Entry** command — append dated entry to memory file
- Configuration: `cursorProjectMemory.memoryFilePath`, `cursorProjectMemory.completedFilePath`, `cursorProjectMemory.syncToRules`

[0.3.2]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.3.2
[0.3.1]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.3.1
[0.3.0]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.3.0
[0.2.0]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.2.0
[0.1.1]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.1.1
[0.1.0]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.1.0
