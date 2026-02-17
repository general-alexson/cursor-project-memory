# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[0.1.1]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.1.1
[0.1.0]: https://github.com/general-alexson/cursor-project-memory/releases/tag/v0.1.0
