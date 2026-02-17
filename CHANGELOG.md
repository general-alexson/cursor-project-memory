# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[0.2.0]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.2.0
[0.1.1]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.1.1
[0.1.0]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.1.0
