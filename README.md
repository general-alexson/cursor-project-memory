# Project Memory

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![VS Code 1.85+](https://img.shields.io/badge/VS%20Code-1.85+-green)](https://code.visualstudio.com/)
[![Cursor](https://img.shields.io/badge/Cursor-compatible-brightgreen)](https://cursor.com/)

A Cursor/VS Code extension that adds a **Project Memory** sidebar for `.cursor/rules/project-memory.mdc` and `project-completed.mdc`, plus **templates**, **local history**, and **global (cross-workspace) memory**.

**[Usage guide](doc/usage.md)** — Commands, workflows, configuration, and tips.

## Features

- **Project Memory view** — Lists `project-memory.mdc`, `project-completed.mdc`, and **Global memory** (cross-workspace). Single-click a file to open it; right-click for other commands.
- **Add Memory Entry** — Pick a template (Dated entry, Bugfix, Decision, Feature, Meeting notes); appends to `project-memory.mdc` with `{{date}}` filled in.
- **Memory history** — Each save of `project-memory.mdc` creates a snapshot in `.cursor/project-memory-history/`. Use **Show Memory History** to pick a version to restore.
- **Global memory** — A single file (in extension global storage) you can open from any workspace. Use **Add Global Memory to Workspace** to copy it into `.cursor/rules/global-memory.mdc` so Cursor loads it as a rule in the current project.
- **Assimilate existing memory files** — If you have `AI-MEMORY.md` or `COMPLETED-IMPLEMENTATIONS.md` at the workspace root, run **Assimilate Existing Memory Files** to merge their content into `project-memory.mdc` and `project-completed.mdc` (with an "Imported from …" header). No need to migrate by hand.
- **Import .cursorrules into global memory** — Run **Import .cursorrules into Global Memory** to append your workspace `.cursorrules` into global memory (with an "Imported from .cursorrules (date)" section) so you can reuse those rules across projects.

## Commands

| Command | Description |
|--------|-------------|
| **Open Project Memory** | Open `project-memory.mdc`. |
| **Add Memory Entry** | Pick a template and append a dated entry to `project-memory.mdc`. |
| **Show Memory History** | List snapshots and restore a previous version of `project-memory.mdc`. |
| **Open Global Memory** | Open the cross-workspace global memory file (create if missing). |
| **Add Global Memory to Workspace** | Copy global memory into `.cursor/rules/global-memory.mdc` for this workspace. |
| **Assimilate Existing Memory Files** | Find `AI-MEMORY.md` / `COMPLETED-IMPLEMENTATIONS.md` at workspace root and merge into project .mdc rules. |
| **Import .cursorrules into Global Memory** | Append workspace `.cursorrules` into global memory (with dated section). |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `cursorProjectMemory.history.enabled` | `true` | Save a snapshot when `project-memory.mdc` is saved. |
| `cursorProjectMemory.history.maxEntries` | `20` | Maximum history snapshots to keep (1–100). |
| `cursorProjectMemory.globalMemory.enabled` | `true` | Show **Global memory** in the sidebar. |

## Requirements

- VS Code or Cursor `^1.85.0`
- Single workspace folder (first folder is used as root) for project memory and history; global memory works without a workspace.

## Reporting issues

[Open an issue](https://github.com/general-alexson/cursor-project-memory/issues) on GitHub to report bugs or request features.

## License

MIT
