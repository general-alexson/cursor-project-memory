import * as vscode from "vscode";
import * as path from "path";

const RULES_DIR = ".cursor/rules";
const MEMORY_RULE_FILE = "project-memory.mdc";
const COMPLETED_RULE_FILE = "project-completed.mdc";
const GLOBAL_MEMORY_FILE = "global-memory.mdc";
const HISTORY_DIR = ".cursor/project-memory-history";

/** Candidate file names at workspace root to assimilate into .mdc rules. */
const ASSIMILATE_CANDIDATES: { path: string; target: "memory" | "completed" }[] = [
  { path: "AI-MEMORY.md", target: "memory" },
  { path: "COMPLETED-IMPLEMENTATIONS.md", target: "completed" },
];

const BUILT_IN_TEMPLATES: { id: string; label: string; template: string }[] = [
  { id: "dated", label: "Dated entry", template: "\n## {{date}}\n- \n" },
  { id: "bugfix", label: "Bugfix", template: "\n## Bugfix: {{date}}\n- Issue: \n- Fix: \n" },
  { id: "decision", label: "Decision", template: "\n## Decision: {{date}}\n- Context: \n- Decision: \n" },
  { id: "feature", label: "Feature", template: "\n## Feature: {{date}}\n- What: \n- Notes: \n" },
  { id: "meeting", label: "Meeting notes", template: "\n## Meeting: {{date}}\n- Attendees: \n- Notes: \n" },
];

function getWorkspaceRoot(): vscode.Uri | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return undefined;
  return folders[0].uri;
}

function resolveWorkspacePath(relativePath: string): vscode.Uri | undefined {
  const root = getWorkspaceRoot();
  if (!root) return undefined;
  return vscode.Uri.joinPath(root, ...relativePath.split(/[/\\]/));
}

function getMemoryRuleUri(): vscode.Uri | undefined {
  return resolveWorkspacePath(`${RULES_DIR}/${MEMORY_RULE_FILE}`);
}

function getCompletedRuleUri(): vscode.Uri | undefined {
  return resolveWorkspacePath(`${RULES_DIR}/${COMPLETED_RULE_FILE}`);
}

function getHistoryDirUri(): vscode.Uri | undefined {
  return resolveWorkspacePath(HISTORY_DIR);
}

function getGlobalMemoryUri(context: vscode.ExtensionContext): vscode.Uri {
  return vscode.Uri.joinPath(context.globalStorageUri, GLOBAL_MEMORY_FILE);
}

async function readFileSafe(uri: vscode.Uri): Promise<string> {
  try {
    const buf = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(buf).toString("utf8");
  } catch {
    return "";
  }
}

function expandTemplate(template: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return template.replace(/\{\{date\}\}/g, date);
}

// --- History ---

function getConfig<T>(key: string): T | undefined {
  return vscode.workspace.getConfiguration("cursorProjectMemory").get<T>(key);
}

async function saveHistorySnapshot(content: string): Promise<void> {
  if (!getConfig<boolean>("history.enabled")) return;
  const root = getWorkspaceRoot();
  if (!root) return;
  const historyDir = getHistoryDirUri();
  if (!historyDir) return;
  await ensureDir(historyDir);
  const name = `${new Date().toISOString().replace(/[:.]/g, "-")}.mdc`;
  const uri = vscode.Uri.joinPath(historyDir, name);
  await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));
  await pruneHistory(historyDir);
}

async function ensureDir(uri: vscode.Uri): Promise<void> {
  const root = getWorkspaceRoot();
  if (!root || !uri.fsPath.startsWith(root.fsPath)) return;
  const rel = path.relative(root.fsPath, uri.fsPath);
  const parts = rel.split(path.sep).filter(Boolean);
  let current = root;
  for (const segment of parts) {
    current = vscode.Uri.joinPath(current, segment);
    try {
      await vscode.workspace.fs.createDirectory(current);
    } catch {
      /* exists */
    }
  }
}

async function pruneHistory(historyDir: vscode.Uri): Promise<void> {
  const max = getConfig<number>("history.maxEntries") ?? 20;
  let entries: { name: string; uri: vscode.Uri }[] = [];
  try {
    const names = await vscode.workspace.fs.readDirectory(historyDir);
    entries = names
      .filter(([n]) => n.endsWith(".mdc"))
      .map(([n]) => ({ name: n, uri: vscode.Uri.joinPath(historyDir, n) }))
      .sort((a, b) => b.name.localeCompare(a.name));
  } catch {
    return;
  }
  for (let i = max; i < entries.length; i++) {
    try {
      await vscode.workspace.fs.delete(entries[i].uri);
    } catch {
      /* ignore */
    }
  }
}

async function getHistoryEntries(): Promise<{ label: string; uri: vscode.Uri }[]> {
  const historyDir = getHistoryDirUri();
  if (!historyDir) return [];
  try {
    const names = await vscode.workspace.fs.readDirectory(historyDir);
    return names
      .filter(([n]) => n.endsWith(".mdc"))
      .map(([n]) => ({
        label: n.replace(/-/g, " ").replace(".mdc", ""),
        uri: vscode.Uri.joinPath(historyDir, n),
      }))
      .sort((a, b) => b.label.localeCompare(a.label));
  } catch {
    return [];
  }
}

// --- Tree view ---

type MemoryNodeKind = "memory" | "completed" | "global";

interface MemoryNode {
  kind: MemoryNodeKind;
  label: string;
  uri: vscode.Uri;
  tooltip: string;
}

class ProjectMemoryTreeProvider implements vscode.TreeDataProvider<MemoryNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<MemoryNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  constructor(private readonly context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: MemoryNode): vscode.TreeItem {
    const item = new vscode.TreeItem(element.label);
    item.resourceUri = element.uri;
    item.command = {
      command: element.kind === "global" ? "cursorProjectMemory.openGlobalMemory" : "vscode.open",
      title: "Open",
      arguments: element.kind === "global" ? [] : [element.uri],
    };
    item.contextValue = element.kind === "memory" ? "memoryFile" : element.kind === "completed" ? "completedFile" : "globalFile";
    item.tooltip = element.tooltip;
    return item;
  }

  async getChildren(_element?: MemoryNode): Promise<MemoryNode[]> {
    const root = getWorkspaceRoot();
    const nodes: MemoryNode[] = [];

    if (root) {
      const memoryUri = getMemoryRuleUri();
      const completedUri = getCompletedRuleUri();
      if (memoryUri) {
        nodes.push({
          kind: "memory",
          label: path.basename(MEMORY_RULE_FILE),
          uri: memoryUri,
          tooltip: `${RULES_DIR}/${MEMORY_RULE_FILE}`,
        });
      }
      if (completedUri) {
        nodes.push({
          kind: "completed",
          label: path.basename(COMPLETED_RULE_FILE),
          uri: completedUri,
          tooltip: `${RULES_DIR}/${COMPLETED_RULE_FILE}`,
        });
      }
    }

    if (getConfig<boolean>("globalMemory.enabled") !== false) {
      const globalUri = getGlobalMemoryUri(this.context);
      nodes.push({
        kind: "global",
        label: "Global memory",
        uri: globalUri,
        tooltip: "Cross-workspace snippet library (stored in extension global storage)",
      });
    }
    return nodes;
  }
}

/** Find existing memory-style files at workspace root and merge their content into .mdc rule files. */
async function assimilateMemoryFiles(): Promise<void> {
  const root = getWorkspaceRoot();
  if (!root) {
    vscode.window.showWarningMessage("Project Memory: No workspace folder open.");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  const found: { path: string; uri: vscode.Uri; target: "memory" | "completed" }[] = [];
  for (const cand of ASSIMILATE_CANDIDATES) {
    const uri = vscode.Uri.joinPath(root, ...cand.path.split(/[/\\]/));
    try {
      await vscode.workspace.fs.readFile(uri);
      found.push({ path: cand.path, uri, target: cand.target });
    } catch {
      /* not found, skip */
    }
  }
  if (found.length === 0) {
    vscode.window.showInformationMessage(
      "Project Memory: No existing memory files found at workspace root (e.g. AI-MEMORY.md, COMPLETED-IMPLEMENTATIONS.md)."
    );
    return;
  }
  const confirm = await vscode.window.showQuickPick(
    [
      { label: "Import all", description: `Merge ${found.map((f) => f.path).join(", ")} into project .mdc rules` },
      { label: "Cancel", description: "Do nothing" },
    ],
    { title: "Assimilate existing memory files", placeHolder: "Choose an action" }
  );
  if (!confirm || confirm.label === "Cancel") return;

  const memoryUri = getMemoryRuleUri();
  const completedUri = getCompletedRuleUri();
  if (!memoryUri || !completedUri) return;
  await ensureRuleFileExists(memoryUri, "memory");
  await ensureRuleFileExists(completedUri, "completed");

  const imported: string[] = [];
  for (const f of found) {
    const content = await readFileSafe(f.uri);
    if (!content.trim()) continue;
    const targetUri = f.target === "memory" ? memoryUri : completedUri;
    let existing = await readFileSafe(targetUri);
    if (!existing.endsWith("\n")) existing += "\n";
    const block = `\n## Imported from ${f.path} (${date})\n\n${content.trim()}\n\n`;
    await vscode.workspace.fs.writeFile(targetUri, Buffer.from(existing + block, "utf8"));
    imported.push(f.path);
  }
  vscode.window.showInformationMessage(`Project Memory: Imported ${imported.join(", ")} into .cursor/rules.`);
}

async function ensureRuleFileExists(uri: vscode.Uri, kind: "memory" | "completed"): Promise<void> {
  try {
    await vscode.workspace.fs.readFile(uri);
  } catch {
    const root = getWorkspaceRoot();
    if (!root) return;
    const rulesDir = resolveWorkspacePath(RULES_DIR);
    if (!rulesDir) return;
    const parts = RULES_DIR.split("/");
    let current = root;
    for (const segment of parts) {
      current = vscode.Uri.joinPath(current, segment);
      try {
        await vscode.workspace.fs.createDirectory(current);
      } catch {
        /* exists */
      }
    }
    const defaultContent =
      kind === "memory"
        ? "# Project Memory (active)\n\nUse this context for project-specific decisions, patterns, and ongoing work.\n\n"
        : "# Project Memory (completed implementations)\n\nReference for historical context and proven patterns.\n\n";
    await vscode.workspace.fs.writeFile(uri, Buffer.from(defaultContent, "utf8"));
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const treeProvider = new ProjectMemoryTreeProvider(context);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("cursorProjectMemory.memoryView", treeProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("cursorProjectMemory.openMemory", (node?: MemoryNode) => {
      const uri = node?.uri ?? getMemoryRuleUri();
      if (uri) vscode.window.showTextDocument(uri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("cursorProjectMemory.addMemoryEntry", async () => {
      const root = getWorkspaceRoot();
      if (!root) {
        vscode.window.showWarningMessage("Project Memory: No workspace folder open.");
        return;
      }
      const uri = getMemoryRuleUri();
      if (!uri) return;
      await ensureRuleFileExists(uri, "memory");
      const chosen = await vscode.window.showQuickPick(BUILT_IN_TEMPLATES.map((t) => ({ label: t.label, template: t.template })), {
        placeHolder: "Choose template",
        title: "Add Memory Entry",
      });
      const entry = chosen ? expandTemplate(chosen.template) : expandTemplate(BUILT_IN_TEMPLATES[0].template);
      let content = await readFileSafe(uri);
      if (!content.trim()) content = "# Project Memory (active)\n\nUse this context for project-specific decisions, patterns, and ongoing work.\n\n";
      content += entry;
      await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));
      const cursorLine = content.split("\n").length - 1;
      await vscode.window.showTextDocument(uri, {
        selection: new vscode.Range(cursorLine, 0, cursorLine, 0),
      });
      treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("cursorProjectMemory.showHistory", async () => {
      const entries = await getHistoryEntries();
      if (entries.length === 0) {
        vscode.window.showInformationMessage("Project Memory: No history yet. Save project-memory.mdc to create history.");
        return;
      }
      const chosen = await vscode.window.showQuickPick(entries.map((e) => ({ label: e.label, uri: e.uri })), {
        placeHolder: "Select a version to restore",
        title: "Memory History",
      });
      if (!chosen) return;
      const memoryUri = getMemoryRuleUri();
      if (!memoryUri) return;
      const content = await readFileSafe(chosen.uri);
      await vscode.workspace.fs.writeFile(memoryUri, Buffer.from(content, "utf8"));
      vscode.window.showInformationMessage("Project Memory: Restored from history.");
      treeProvider.refresh();
      await vscode.window.showTextDocument(memoryUri);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (doc: vscode.TextDocument) => {
      const memoryUri = getMemoryRuleUri();
      if (!memoryUri || doc.uri.toString() !== memoryUri.toString()) return;
      const content = await readFileSafe(memoryUri);
      if (content) await saveHistorySnapshot(content);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("cursorProjectMemory.openGlobalMemory", async () => {
      const uri = getGlobalMemoryUri(context);
      try {
        await vscode.workspace.fs.readFile(uri);
      } catch {
        await ensureGlobalStorageDir(context);
        const defaultContent = "# Global Memory (cross-workspace)\n\nSnippets and patterns you want to reuse across projects.\n\n";
        await vscode.workspace.fs.writeFile(uri, Buffer.from(defaultContent, "utf8"));
      }
      await vscode.window.showTextDocument(uri);
      treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("cursorProjectMemory.addGlobalMemoryToWorkspace", async () => {
      const root = getWorkspaceRoot();
      if (!root) {
        vscode.window.showWarningMessage("Project Memory: No workspace folder open.");
        return;
      }
      const globalUri = getGlobalMemoryUri(context);
      let content: string;
      try {
        content = Buffer.from(await vscode.workspace.fs.readFile(globalUri)).toString("utf8");
      } catch {
        vscode.window.showWarningMessage("Project Memory: Global memory file is empty or missing. Open it first to add content.");
        return;
      }
      const rulesDir = resolveWorkspacePath(RULES_DIR);
      if (!rulesDir) return;
      await ensureDir(rulesDir);
      const dest = vscode.Uri.joinPath(rulesDir, GLOBAL_MEMORY_FILE);
      await vscode.workspace.fs.writeFile(dest, Buffer.from(content, "utf8"));
      vscode.window.showInformationMessage("Project Memory: Global memory copied to .cursor/rules/global-memory.mdc (Cursor will load it as a rule).");
      treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("cursorProjectMemory.assimilateMemoryFiles", async () => {
      await assimilateMemoryFiles();
      treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration("cursorProjectMemory")) treeProvider.refresh();
    })
  );
}

async function ensureGlobalStorageDir(context: vscode.ExtensionContext): Promise<void> {
  try {
    await vscode.workspace.fs.createDirectory(context.globalStorageUri);
  } catch {
    /* exists */
  }
}

export function deactivate(): void {}
