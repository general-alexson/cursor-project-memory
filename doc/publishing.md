# Publishing

## Publish to Open VSX (e.g. for Cursor)

1. Create an account and token at [open-vsx.org](https://open-vsx.org) (e.g. [user settings → tokens](https://open-vsx.org/user-settings/tokens)).
2. Create the namespace (publisher) once (or let the tag-triggered workflow do it — it checks if the namespace exists and only creates when missing):

   ```bash
   npx ovsx create-namespace cursor-project-memory --pat YOUR_TOKEN
   ```

3. Build and publish:

   ```bash
   npm run compile
   npx ovsx publish *.vsix --pat YOUR_TOKEN
   ```

## Publish to VS Code Marketplace

1. Create a [Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token) (Azure DevOps).
2. Install the VS Code extension manager: `npm install -g @vscode/vsce`.
3. Package and publish:

   ```bash
   vsce package
   vsce publish --pat YOUR_TOKEN
   ```

## Release checklist

1. Update version in `package.json`.
2. Update `CHANGELOG.md` with the release date and any changes.
3. Commit, tag (e.g. `v0.1.0`), and push.
4. Run the publish steps above.
