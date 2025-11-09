# Command Reference

All commands available in TeamBrain extension.

## Search Commands

### TeamBrain: Search Knowledge Base

**ID:** `teambrain.search`
**Shortcut:** `Cmd+Shift+K` (Mac) / `Ctrl+Shift+K` (Windows/Linux)

**Description:** Open search dialog to find documents across your Google Drive.

**Usage:**
1. Press shortcut or run from Command Palette
2. Enter search query
3. Browse results
4. Select document to open

**Features:**
- Fuzzy search
- AI-powered relevance ranking
- Preview snippets
- Recently accessed docs appear first

---

## AI Commands

### TeamBrain: Ask Question

**ID:** `teambrain.askQuestion`
**Shortcut:** `Cmd+Shift+?` (Mac) / `Ctrl+Shift+?` (Windows/Linux)

**Description:** Ask a question and get AI-powered answers from your documentation.

**Usage:**
1. Press shortcut or run from Command Palette
2. Enter your question
3. Wait for AI response
4. Click citations to view source documents

**Requirements:**
- GitHub Copilot subscription
- Copilot enabled in VS Code

---

### TeamBrain: Show Suggestions

**ID:** `teambrain.showSuggestions`

**Description:** Manually trigger context-aware document suggestions for current file.

**Usage:**
1. Open a file
2. Run command
3. View relevant documentation suggestions

---

## Indexing Commands

### TeamBrain: Refresh Index

**ID:** `teambrain.refreshIndex`

**Description:** Manually refresh the document index from Google Drive.

**Usage:**
1. Run command
2. Wait for indexing to complete
3. TreeView and search will reflect latest changes

**When to use:**
- After major documentation updates
- When new folders added to Drive
- Search results seem stale

---

### TeamBrain: Configure Folders

**ID:** `teambrain.configureFolders`

**Description:** Configure which Google Drive folders to index.

**Usage:**
1. Run command
2. View currently indexed folders
3. Add new folders by ID or browse
4. Remove folders
5. Save configuration

---

## Authentication Commands

### TeamBrain: Sign Out

**ID:** `teambrain.signOut`

**Description:** Sign out of Google Drive and clear authentication.

**Usage:**
1. Run command
2. Confirm sign out
3. Extension will prompt for authentication on next use

**When to use:**
- Switching Google accounts
- Troubleshooting authentication issues
- Security/privacy concerns

---

## View Commands

### TeamBrain: Toggle Sidebar

**ID:** `teambrain.toggleSidebar`
**Shortcut:** `Cmd+Alt+T` (Mac) / `Ctrl+Alt+T` (Windows/Linux)

**Description:** Show or hide the TeamBrain sidebar.

---

### TeamBrain: Open Document

**ID:** `teambrain.openDocument`

**Description:** Open a specific document by ID.

**Parameters:**
- `fileId`: Google Drive file ID

**Usage:**
Typically called internally, but can be invoked with:
```javascript
vscode.commands.executeCommand('teambrain.openDocument', 'file-id-here');
```

---

## Utility Commands

### TeamBrain: Clear Cache

**ID:** `teambrain.clearCache`

**Description:** Clear local document cache.

**Usage:**
1. Run command
2. Cache cleared immediately
3. Next search will fetch fresh from Drive

**When to use:**
- Documents not updating
- Memory usage concerns
- Troubleshooting stale content

---

### TeamBrain: Show Audit Log

**ID:** `teambrain.showAuditLog`

**Description:** View audit log of extension activity.

**Usage:**
1. Run command
2. Output channel opens with log
3. Review authentication, search, and access events

---

### TeamBrain: Show Shortcuts

**ID:** `teambrain.showShortcuts`

**Description:** Display keyboard shortcuts reference.

**Usage:**
1. Run command
2. Webview opens with shortcuts
3. Reference while learning extension

---

### TeamBrain: Show Metrics

**ID:** `teambrain.showMetrics`

**Description:** View performance metrics and statistics.

**Usage:**
1. Run command
2. View dashboard with:
   - Cache hit rate
   - Average search time
   - API call counts
   - Memory usage

---

## TreeView Commands

### TeamBrain: Add to Favorites

**ID:** `teambrain.addToFavorites`

**Context:** Document context menu

**Description:** Add document to favorites list.

---

### TeamBrain: Remove from Favorites

**ID:** `teambrain.removeFromFavorites`

**Context:** Favorites context menu

**Description:** Remove document from favorites.

---

### TeamBrain: Copy Link

**ID:** `teambrain.copyLink`

**Context:** Document context menu

**Description:** Copy Google Drive link to clipboard.

---

## Command Palette Usage

Access all commands via Command Palette:

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "TeamBrain:"
3. Select command from list

## Programmatic Usage

Commands can be invoked from other extensions:

```typescript
// Search
await vscode.commands.executeCommand('teambrain.search');

// Open specific document
await vscode.commands.executeCommand('teambrain.openDocument', fileId);

// Refresh index
await vscode.commands.executeCommand('teambrain.refreshIndex');
```

## Related Documents

- [Keyboard Shortcuts](keyboard-shortcuts.md)
- [Configuration](configuration.md)
- [Features Specification](../design/features.md)
