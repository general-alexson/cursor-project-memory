# Project Memory — Usage Guide

This guide explains how to use the Project Memory extension with Cursor or VS Code.

## What the extension does

Project Memory keeps two rule files that Cursor loads automatically:

- **`.cursor/rules/project-memory.mdc`** — Active context: decisions, patterns, and work in progress.
- **`.cursor/rules/project-completed.mdc`** — Completed work and patterns you want to reference later.

You edit these files directly. The extension gives you a **sidebar view**, **templates**, **local history**, **global (cross-workspace) memory**, and a way to **import** existing memory-style files.

---

## Getting started

1. **Install** the extension (from the marketplace or [Open VSX](https://open-vsx.org/extension/cursor-project-memory/cursor-project-memory)).
2. **Open a workspace** (a single folder). The first workspace folder is the project root.
3. In the **Explorer**, find the **Project Memory** section. It lists:
   - **project-memory.mdc** — click to open or edit active memory.
   - **project-completed.mdc** — click to open or edit completed implementations.
   - **Global memory** — cross-workspace snippet library (see below).

The first time you open **project-memory.mdc** or **project-completed.mdc**, the extension creates `.cursor/rules/` and the file with a short default header. You can replace or extend that content.

---

## Project Memory view (sidebar)

| Item | Action |
|------|--------|
| **project-memory.mdc** | Single-click to open. This is the main “active memory” rule Cursor uses. |
| **project-completed.mdc** | Single-click to open. Use it for things you’ve finished and want to reference later. |
| **Global memory** | Click to open the cross-workspace file (stored in extension global storage). |

Other commands (Open Project Memory, Show Memory History, Assimilate, Import .cursorrules into Global Memory) are available via **right-click** on any item or from the Command Palette. They do not appear as hover buttons, so a single click on a file always opens it.

---

## Commands (detailed)

### Open Project Memory

Opens **project-memory.mdc**. Use it from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) or from the Project Memory view context menu.

### Add Memory Entry

Appends a new entry to **project-memory.mdc** and opens the file with the cursor at the new content.

1. Run **Project Memory: Add Memory Entry** (Command Palette or context menu).
2. Choose a **template** (or press Enter for the default “Dated entry”):
   - **Dated entry** — `## YYYY-MM-DD` and a bullet.
   - **Bugfix** — Section for Issue / Fix.
   - **Decision** — Section for Context / Decision.
   - **Feature** — Section for What / Notes.
   - **Meeting notes** — Section for Attendees / Notes.
3. Each template uses today’s date (ISO `YYYY-MM-DD`) where applicable. The new block is added at the end of the file and the editor focuses there so you can type.

Use this to log decisions, bugs, features, or meetings without manually adding headings every time.

### Show Memory History

Every time you **save** **project-memory.mdc**, the extension stores a snapshot under `.cursor/project-memory-history/`.

1. Run **Project Memory: Show Memory History**.
2. If there is no history yet, you’ll see a short message; otherwise you get a list of snapshots (by timestamp).
3. Pick a snapshot to **restore**. That version replaces the current content of **project-memory.mdc** and the file is opened.

History is limited by the **Maximum history snapshots** setting (default 20). Old snapshots are removed automatically.

### Open Global Memory

Opens the **global memory** file. This file is stored in the extension’s global storage (not inside the workspace), so it’s the same in every project.

- Use it for snippets, patterns, or notes you want to reuse across workspaces.
- The first time you open it, the extension creates the file with a short default header.
- You can edit it like any text file. It is **not** automatically loaded as a Cursor rule until you run **Add Global Memory to Workspace** in a project.

### Add Global Memory to Workspace

Copies the current content of the **global memory** file into **`.cursor/rules/global-memory.mdc`** in the **current** workspace. After that, Cursor loads it as a rule for this project only.

- Run this when you want this workspace to use your global snippets/patterns as a rule.
- If you later change global memory, run **Add Global Memory to Workspace** again to update the workspace copy.

### Assimilate Existing Memory Files

If you already have **AI-MEMORY.md** or **COMPLETED-IMPLEMENTATIONS.md** (or similar) at the **workspace root**, this command imports them into the project rule files.

1. Run **Project Memory: Assimilate Existing Memory Files**.
2. The extension looks at the workspace root for:
   - **AI-MEMORY.md** → merged into **project-memory.mdc**
   - **COMPLETED-IMPLEMENTATIONS.md** → merged into **project-completed.mdc**
3. If none are found, you see a short message. If any are found, you get a confirmation: **Import all** or **Cancel**.
4. On **Import all**, the content of each file is appended under a clear section, e.g.:
   - `## Imported from AI-MEMORY.md (YYYY-MM-DD)`
   - `## Imported from COMPLETED-IMPLEMENTATIONS.md (YYYY-MM-DD)`
5. Existing content in the `.mdc` files is kept; the imported content is added below. The original `.md` files are **not** deleted or modified.

Use this when moving from an “AI-MEMORY.md + COMPLETED-IMPLEMENTATIONS.md” workflow to the `.mdc` rule files.

### Import .cursorrules into Global Memory

If you have a **.cursorrules** file at the **workspace root**, this command appends its content into **global memory** so you can reuse those rules across projects.

1. Run **Project Memory: Import .cursorrules into Global Memory** (Command Palette or right-click in the Project Memory view).
2. The extension reads `.cursorrules` and appends it to global memory under **## Imported from .cursorrules (YYYY-MM-DD)**.
3. The global memory file is opened. Existing content is kept; the `.cursorrules` content is added below.

Use this to move workspace rules (e.g. docs, versioning, security) into global memory so they can be loaded in any project via **Add Global Memory to Workspace**.

---

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| **cursorProjectMemory.history.enabled** | `true` | When `true`, each save of **project-memory.mdc** creates a history snapshot. Set to `false` to disable history. |
| **cursorProjectMemory.history.maxEntries** | `20` | Maximum number of snapshots to keep (1–100). Older ones are removed automatically. |
| **cursorProjectMemory.globalMemory.enabled** | `true` | When `true`, **Global memory** appears in the Project Memory view. Set to `false` to hide it. |

Change these in **Settings** (UI or `settings.json`) under the “Project Memory” section.

---

## Workflows

### New project

1. Open the project folder as the workspace.
2. In Project Memory view, click **project-memory.mdc** (it will be created if needed).
3. Add a short overview (e.g. what the project is, stack, conventions).
4. Use **Add Memory Entry** with templates as you make decisions, fix bugs, or finish features. Move completed items into **project-completed.mdc** when done.

### Migrating from AI-MEMORY.md / COMPLETED-IMPLEMENTATIONS.md

1. Keep **AI-MEMORY.md** and/or **COMPLETED-IMPLEMENTATIONS.md** at the workspace root.
2. Run **Assimilate Existing Memory Files** and choose **Import all**.
3. Check **project-memory.mdc** and **project-completed.mdc**; edit or reorganize as you like.
4. Optionally remove or archive the old `.md` files once you’re happy with the `.mdc` content.

### Using global memory across projects

1. Run **Open Global Memory** and add snippets or patterns you reuse. You can also run **Import .cursorrules into Global Memory** once (with a workspace that has `.cursorrules`) to pull those rules into global memory (e.g. “How we do auth”, “Deploy checklist”).
2. In any project where you want that context as a rule, run **Add Global Memory to Workspace**.
3. Cursor will load **.cursor/rules/global-memory.mdc** for that workspace. Update it by editing global memory and running **Add Global Memory to Workspace** again when you want to refresh.

### Restoring a previous version

1. Run **Show Memory History**.
2. Pick the snapshot you want (e.g. from before a big edit).
3. Confirm; the current **project-memory.mdc** is replaced by that snapshot and opened. You can undo in the editor if you change your mind immediately.

---

## Requirements and limits

- **Workspace**: The extension uses the **first** workspace folder as the project root. Project memory and history paths are relative to that root. Global memory works even when no folder is open.
- **Single root**: If you use a multi-root workspace, only the first root is used for `.cursor/rules` and history.
- **Cursor**: Cursor loads any `.mdc` files in **.cursor/rules** as rules; the extension does not change that behavior, it only helps you edit and manage those files.

---

## Tips

- **Keep project-memory.mdc focused** on current work and decisions; move finished items to **project-completed.mdc** so the AI has a clear “active” vs “reference” split.
- **Use templates** to keep entries consistent (e.g. always “Decision: date” or “Bugfix: date”) so they’re easy to scan.
- **History** is per workspace and stored under `.cursor/project-memory-history/`. If you use version control, you can add that folder to `.gitignore` if you don’t want to commit snapshots.
- **Global memory** is a good place for company or personal standards that apply to many projects; **Add Global Memory to Workspace** pulls them in only where needed.

For installation, building, and publishing, see the other docs in this folder ([Installing](installing.md), [Building](building.md), [Publishing](publishing.md)).
