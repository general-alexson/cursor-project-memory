import * as vscode from "vscode";
import * as path from "path";

const RULES_DIR = ".cursor/rules";
const PROJECT_MEMORY_RULE_FILE = "project-memory.mdc";

function getWorkspaceRoot(): vscode.Uri | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return undefined;
  return folders[0].uri;
}

function getConfig(key: string): string {
  return vscode.workspace.getConfiguration("cursorProjectMemory").get<string>(key) ?? "";
}

function getMemoryFilePath(): string {
  return getConfig("memoryFilePath") || "AI-MEMORY.md";
}

function getCompletedFilePath(): string {
  return getConfig("completedFilePath") || "COMPLETED-IMPLEMENTATIONS.md";
}

function resolveWorkspacePath(relativePath: string): vscode.Uri | undefined {
  const root = getWorkspaceRoot();
  if (!root) return undefined;
  return vscode.Uri.joinPath(root, ...relativePath.split(/[/\\]/));
}

async function readFileSafe(uri: vscode.Uri): Promise<string> {
  try {
    const buf = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(buf).toString("utf8");
  } catch {
    return "";
  }
}

async function ensureDir(uri: vscode.Uri): Promise<void> {
  const root = getWorkspaceRoot();
  if (!root || !uri.fsPath.startsWith(root.fsPath)) return;
  const relative = path.relative(root.fsPath, uri.fsPath);
  const parts = relative.split(path.sep).filter(Boolean);
  let current = root;
  for (const segment of parts) {
    current = vscode.Uri.joinPath(current, segment);
    try {
      await vscode.workspace.fs.createDirectory(current);
    } catch {
      // already exists
    }
  }
}

/** Build content for the Cursor rule: project memory + instruction to read it. */
async function buildRuleContent(memoryUri: vscode.Uri, completedUri: vscode.Uri): Promise<string> {
  const memory = await readFileSafe(memoryUri);
  const completed = await readFileSafe(completedUri);
  const parts: string[] = [
    "# Project Memory (synced from project memory files)",
    "",
    "Use this context for project-specific decisions, patterns, and ongoing work.",
    "",
    "## Active memory (AI-MEMORY.md)",
    "",
    memory || "*No content yet.*",
    "",
    "## Completed implementations (reference)",
    "",
    completed || "*No content yet.*",
    "",
  ];
  return parts.join("\n");
}

/** Normalize URI for comparison (no trailing slash). */
function normalizeUri(uri: vscode.Uri): string {
  return uri.toString().replace(/\/$/, "");
}

/** Write project memory into .cursor/rules/project-memory.mdc so Cursor loads it. */
export async function syncToCursorRules(options?: { quiet?: boolean }): Promise<boolean> {
  const root = getWorkspaceRoot();
  if (!root) {
    if (!options?.quiet) vscode.window.showWarningMessage("Project Memory: No workspace folder open.");
    return false;
  }

  const memoryPath = getMemoryFilePath();
  const completedPath = getCompletedFilePath();
  const memoryUri = resolveWorkspacePath(memoryPath);
  const completedUri = resolveWorkspacePath(completedPath);

  if (!memoryUri) {
    if (!options?.quiet) vscode.window.showWarningMessage("Project Memory: Could not resolve memory file path.");
    return false;
  }

  const rulesDirUri = resolveWorkspacePath(RULES_DIR);
  if (!rulesDirUri) return false;

  const ruleFileUri = vscode.Uri.joinPath(rulesDirUri, PROJECT_MEMORY_RULE_FILE);
  await ensureDir(rulesDirUri);

  const content = await buildRuleContent(memoryUri, completedUri ?? memoryUri);
  const bytes = Buffer.from(content, "utf8");
  await vscode.workspace.fs.writeFile(ruleFileUri, bytes);

  if (!options?.quiet) {
    vscode.window.showInformationMessage(
      "Project Memory synced to .cursor/rules/project-memory.mdc — Cursor will use it as a rule."
    );
  }
  return true;
}

// --- Tree view for Project Memory ---

type MemoryNodeKind = "memory" | "completed" | "sync";

interface MemoryNode {
  kind: MemoryNodeKind;
  label: string;
  uri?: vscode.Uri;
  tooltip?: string;
}

class ProjectMemoryTreeProvider implements vscode.TreeDataProvider<MemoryNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<MemoryNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: MemoryNode): vscode.TreeItem {
    const item = new vscode.TreeItem(element.label);
    if (element.kind === "sync") {
      item.command = {
        command: "cursorProjectMemory.syncToCursorRules",
        title: "Sync to Cursor Rules",
      };
      item.iconPath = new vscode.ThemeIcon("sync");
      item.contextValue = "sync";
    } else {
      item.resourceUri = element.uri;
      item.command = {
        command: "vscode.open",
        title: "Open",
        arguments: [element.uri],
      };
      item.contextValue = element.kind === "memory" ? "memoryFile" : "completedFile";
    }
    if (element.tooltip) item.tooltip = element.tooltip;
    return item;
  }

  async getChildren(element?: MemoryNode): Promise<MemoryNode[]> {
    const root = getWorkspaceRoot();
    if (!root) return [];
    if (element) return [];

    const memoryPath = getMemoryFilePath();
    const completedPath = getCompletedFilePath();
    const memoryUri = resolveWorkspacePath(memoryPath);
    const completedUri = resolveWorkspacePath(completedPath);
    const nodes: MemoryNode[] = [];
    if (memoryUri) {
      nodes.push({
        kind: "memory",
        label: path.basename(memoryPath),
        uri: memoryUri,
        tooltip: memoryPath,
      });
    }
    if (completedUri && completedPath !== memoryPath) {
      nodes.push({
        kind: "completed",
        label: path.basename(completedPath),
        uri: completedUri,
        tooltip: completedPath,
      });
    }
    nodes.push({
      kind: "sync",
      label: "Sync to Cursor Rules",
      tooltip: "Write memory into .cursor/rules so Cursor loads it as a rule",
    });
    return nodes;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const treeProvider = new ProjectMemoryTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("cursorProjectMemory.memoryView", treeProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("cursorProjectMemory.openMemory", (node?: MemoryNode) => {
      const root = getWorkspaceRoot();
      if (!root) return;
      const uri = node?.uri ?? resolveWorkspacePath(getMemoryFilePath());
      if (uri) vscode.window.showTextDocument(uri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("cursorProjectMemory.syncToCursorRules", async () => {
      const ok = await syncToCursorRules();
      if (ok) treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("cursorProjectMemory.addMemoryEntry", async () => {
      const root = getWorkspaceRoot();
      if (!root) {
        vscode.window.showWarningMessage("Project Memory: No workspace folder open.");
        return;
      }
      const uri = resolveWorkspacePath(getMemoryFilePath());
      if (!uri) return;
      let content = await readFileSafe(uri);
      const entry = `\n## ${new Date().toISOString().slice(0, 10)}\n- \n`;
      if (!content.trim()) content = "# Project memory\n\n";
      content += entry;
      await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));
      await vscode.window.showTextDocument(uri, { selection: new vscode.Range(content.length - 3, 0, content.length - 1, 0) });
      treeProvider.refresh();
    })
  );

  // Auto-sync to Cursor rules when memory or completed file is saved
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc: vscode.TextDocument) => {
      const syncOnSave = vscode.workspace.getConfiguration("cursorProjectMemory").get<boolean>("syncOnSave");
      if (!syncOnSave || !doc.uri) return;
      const memoryUri = resolveWorkspacePath(getMemoryFilePath());
      const completedUri = resolveWorkspacePath(getCompletedFilePath());
      const normalized = normalizeUri(doc.uri);
      if (memoryUri && normalizeUri(memoryUri) === normalized) {
        syncToCursorRules({ quiet: true }).then((ok) => ok && treeProvider.refresh());
        return;
      }
      if (completedUri && normalizeUri(completedUri) === normalized) {
        syncToCursorRules({ quiet: true }).then((ok) => ok && treeProvider.refresh());
      }
    })
  );

  // Refresh when config or workspace files change
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration("cursorProjectMemory")) treeProvider.refresh();
    })
  );
}

export function deactivate(): void {}
