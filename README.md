# Project Memory

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![VS Code 1.85+](https://img.shields.io/badge/VS%20Code-1.85+-green)](https://code.visualstudio.com/)
[![Cursor](https://img.shields.io/badge/Cursor-compatible-brightgreen)](https://cursor.com/)

A Cursor/VS Code extension that adds a **Project Memory** sidebar and syncs your memory files into `.cursor/rules` so they are available as Cursor rules.

## Features

- **Project Memory view** — In the Explorer sidebar, a "Project Memory" section lists your project memory file and completed implementations file, plus a **Sync to Cursor Rules** action.
- **Open / edit** — Click a file in the view to open it.
- **Add Memory Entry** — Command to append a dated bullet to the memory file and focus the editor.
- **Configurable paths** — Set `cursorProjectMemory.memoryFilePath` and `cursorProjectMemory.completedFilePath` (relative to workspace root).

## Commands

| Command | Description |
|--------|-------------|
| **Open Project Memory** | Open the project memory file. |
| **Sync Project Memory to Cursor Rules** | Write memory into `.cursor/rules/project-memory.mdc`. |
| **Add Memory Entry** | Append a new dated entry to the memory file and open it. |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `cursorProjectMemory.memoryFilePath` | `AI-MEMORY.md` | Path to the project memory file (relative to workspace root). |
| `cursorProjectMemory.completedFilePath` | `COMPLETED-IMPLEMENTATIONS.md` | Path to the completed implementations log. |
| `cursorProjectMemory.syncToRules` | `true` | Reserved for future use. |

## Requirements

- VS Code or Cursor `^1.85.0`
- Single workspace folder (first folder is used as root)

## License

MIT
