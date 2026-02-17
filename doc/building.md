# Building

## Prerequisites

- Node.js 18+
- npm

## Build steps

```bash
npm install
npm run compile
npm run generate-icon
```

- Output is in the `out/` directory.
- `generate-icon` creates `images/icon.png` (brain icon for the marketplace). Commit this file so the repo is complete.

## Package as VSIX

```bash
npm install -g @vscode/vsce
vsce package
```

This produces a `.vsix` file in the project root.
