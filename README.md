# Project Memory

A Cursor/VS Code extension that adds a **Project Memory** sidebar and syncs that memory into Cursor rules (`.cursor/rules`) so the AI automatically has project context.

## Features

- **Project Memory view** — In the Explorer sidebar, a "Project Memory" section lists:
  - Your project memory file (default: `AI-MEMORY.md`)
  - Your completed implementations file (default: `COMPLETED-IMPLEMENTATIONS.md`)
  - **Sync to Cursor Rules** — writes the memory content into `.cursor/rules/project-memory.mdc` so Cursor loads it as a rule
- **Open / edit** — Click a file in the view to open it.
- **Add Memory Entry** — Command to append a dated bullet to the memory file and focus the editor.
- **Configurable paths** — Set `cursorProjectMemory.memoryFilePath` and `cursorProjectMemory.completedFilePath` (relative to workspace root).

## Cursor rules integration

When you run **Sync to Cursor Rules**, the extension:

1. Reads `AI-MEMORY.md` and `COMPLETED-IMPLEMENTATIONS.md` (or your configured paths).
2. Writes `.cursor/rules/project-memory.mdc` with that content plus a short header.
3. Cursor treats `.mdc` files in `.cursor/rules` as rules, so the AI gets your project memory as part of its context.

Run sync after updating the memory files so the rule stays in sync.

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
| `cursorProjectMemory.syncToRules` | `true` | Unused in current version (sync is always to rules). |

## Requirements

- VS Code or Cursor `^1.85.0`
- Single workspace folder (first folder is used as root)

## Development

```bash
npm install
npm run compile
```

Run from VS Code/Cursor via **Run and Debug** (F5) with the "Extension Development Host" launch config.

## License

MIT
