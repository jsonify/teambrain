# Core Features Specification

## Feature 1: Quick Search

**Command:** `TeamBrain: Search Knowledge Base`
**Shortcut:** `Cmd+Shift+K` (Mac) / `Ctrl+Shift+K` (Windows/Linux)

### User Flow

1. User presses shortcut or runs command
2. Quick Pick opens with search box
3. User types query: "database migration process"
4. Extension searches Google Drive with AI-enhanced relevance
5. Results appear with preview snippets
6. User selects document to open in VS Code editor or browser

### Technical Implementation

```typescript
// commands/search.ts
export async function searchCommand() {
    const query = await vscode.window.showInputBox({
        placeHolder: 'Search team knowledge base...',
        prompt: 'Enter keywords to search'
    });

    if (!query) return;

    // Show loading
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Searching...",
    }, async (progress) => {
        const results = await driveService.searchFiles(query);
        const rankedResults = await rankSearchResults(query, results);

        return showSearchResults(rankedResults);
    });
}
```

### Features

- Fuzzy search across file names and content
- AI-powered relevance ranking using Copilot embeddings
- Preview snippets showing match context
- Recently accessed docs appear first
- Supports filters: file type, folder, date range

### Search Ranking Algorithm

```typescript
async function rankSearchResults(
    query: string,
    results: DriveFile[]
): Promise<RankedResult[]> {
    const scoredResults = await Promise.all(
        results.map(async (file) => {
            let score = 0;

            // Keyword matching (basic relevance)
            const titleMatch = file.name.toLowerCase()
                .includes(query.toLowerCase());
            const contentMatch = file.content?.toLowerCase()
                .includes(query.toLowerCase());

            if (titleMatch) score += 10;
            if (contentMatch) score += 5;

            // Recency boost (favor recently modified)
            const daysSinceModified = getDaysSince(file.modifiedTime);
            score += Math.max(0, 5 - daysSinceModified / 30);

            // Access frequency (favor frequently opened docs)
            const accessCount = await getAccessCount(file.id);
            score += Math.min(accessCount, 10);

            // AI semantic similarity (expensive, only for top results)
            if (score > 15) {
                const similarity = await getSemanticSimilarity(
                    query,
                    file.content
                );
                score += similarity * 20;
            }

            return { file, score };
        })
    );

    return scoredResults
        .sort((a, b) => b.score - a.score)
        .map(r => r.file);
}
```

---

## Feature 2: Context-Aware Suggestions

### Automatic Triggers

- Opening a file in specific directories (e.g., `/services/auth/*`)
- Working on files with certain patterns (e.g., `*migration*.sql`)
- Encountering errors (shows relevant troubleshooting docs)

### User Experience

- Non-intrusive notification: "📚 Found 3 related docs"
- Click to expand inline suggestions
- Optionally enable/disable per workspace

### Technical Implementation

```typescript
// ui/suggestions.ts
vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (!editor) return;

    const filePath = editor.document.uri.fsPath;
    const suggestions = await getSuggestedDocs(filePath);

    if (suggestions.length > 0) {
        showSuggestions(suggestions);
    }
});

async function detectRelevantContext(
    filePath: string
): Promise<string[]> {
    const contexts: string[] = [];

    // File path patterns
    if (filePath.includes('/services/auth/')) {
        contexts.push('authentication', 'auth service');
    }
    if (filePath.includes('migration')) {
        contexts.push('database migration', 'schema changes');
    }

    // File content analysis
    const content = await vscode.workspace.fs.readFile(
        vscode.Uri.file(filePath)
    );
    const text = content.toString();

    // Look for imports/keywords
    if (text.includes('import.*kubernetes')) {
        contexts.push('kubernetes', 'k8s deployment');
    }
    if (text.includes('terraform')) {
        contexts.push('infrastructure', 'terraform');
    }

    // Ask Copilot to identify topics
    const aiContexts = await askCopilot(
        `What technical topics are covered in this code?
         Reply with comma-separated keywords only:\n\n${text.substring(0, 1000)}`
    );

    contexts.push(...aiContexts.split(',').map(s => s.trim()));

    return [...new Set(contexts)]; // Deduplicate
}
```

### Configuration

```json
{
  "teambrain.enableContextSuggestions": true,
  "teambrain.suggestionTriggers": [
    {
      "pattern": "/services/auth/**",
      "keywords": ["authentication", "auth"]
    },
    {
      "pattern": "**/*migration*.sql",
      "keywords": ["database migration", "schema"]
    }
  ]
}
```

---

## Feature 3: AI-Powered Q&A

**Command:** `TeamBrain: Ask Question`
**Shortcut:** `Cmd+Shift+?` (Mac) / `Ctrl+Shift+?` (Windows/Linux)

### User Flow

1. User runs command or highlights code and runs command
2. Input box appears: "What do you want to know?"
3. User types: "How do we handle database migrations in production?"
4. Extension:
   - Searches Google Drive for relevant docs
   - Sends docs + question to Copilot API
   - Returns answer with source citations
5. Answer appears in panel with clickable links to source docs

### Technical Implementation

```typescript
// commands/ask.ts
export async function askQuestionCommand() {
    const question = await vscode.window.showInputBox({
        placeHolder: 'Ask a question about your team\'s documentation...',
        prompt: 'What would you like to know?'
    });

    if (!question) return;

    // Search for relevant docs
    const relevantDocs = await findRelevantDocs(question);

    // Get AI answer with context
    const answer = await copilotService.askWithContext(
        question,
        relevantDocs
    );

    // Show answer in webview panel
    showAnswerPanel(answer, relevantDocs);
}
```

### Features

- Understands context (current file, workspace, language)
- Cites sources with links back to Google Docs
- Remembers conversation history within session
- Can ask follow-up questions

---

## Feature 4: Sidebar TreeView

**Location:** Activity Bar (new icon: 🧠)
**Name:** "TeamBrain"

### Structure

```
TeamBrain
├── 🔍 Search...
├── ⭐ Favorites
│   ├── Production Runbook.docx
│   └── API Guidelines.docx
├── 📝 Recent
│   ├── DB Migration Guide.docx (2 hours ago)
│   ├── Incident Response.docx (Yesterday)
│   └── ...
├── 📂 Quick Access
│   ├── Engineering Wiki
│   ├── Architecture Decisions
│   ├── Runbooks
│   └── Standards & Guidelines
└── ⚙️ Settings
    ├── Configure Folders
    ├── Refresh Index
    └── Sign Out
```

### Technical Implementation

```typescript
// ui/treeView.ts
export class TeamBrainTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        if (!element) {
            // Root level
            return [
                new TreeItem('Search', 'search'),
                new TreeItem('Favorites', 'favorites'),
                new TreeItem('Recent', 'recent'),
                new TreeItem('Quick Access', 'quick-access'),
                new TreeItem('Settings', 'settings')
            ];
        }

        // Get children based on element type
        switch (element.type) {
            case 'favorites':
                return this.getFavorites();
            case 'recent':
                return this.getRecentDocs();
            case 'quick-access':
                return this.getQuickAccessFolders();
            case 'settings':
                return this.getSettingsItems();
            default:
                return [];
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
}
```

### Features

- Collapsible sections
- Right-click context menu (Open, Copy Link, Add to Favorites)
- Drag-and-drop to reorder favorites
- Badge showing new/updated docs

---

## Feature 5: Document Viewer

### Capabilities

- View Google Docs content directly in VS Code editor
- Syntax highlighting for code blocks in docs
- Clickable links to other docs
- Inline images (converted from Drive)
- Export to markdown for local storage

### Technical Implementation

```typescript
// ui/docViewer.ts
export async function openDocument(fileId: string) {
    // Get document content
    const content = await driveService.getFileContent(fileId);
    const metadata = await driveService.getFileMetadata(fileId);

    // Convert to markdown
    const markdown = convertToMarkdown(content, metadata.mimeType);

    // Create webview or text document
    if (shouldUseWebview(metadata.mimeType)) {
        showWebviewDocument(markdown, metadata);
    } else {
        showTextDocument(markdown, metadata);
    }

    // Track access for recency
    await trackDocumentAccess(fileId);
}

function convertToMarkdown(content: string, mimeType: string): string {
    switch (mimeType) {
        case 'application/vnd.google-apps.document':
            return convertGoogleDocToMarkdown(content);
        case 'application/vnd.google-apps.spreadsheet':
            return convertGoogleSheetToMarkdown(content);
        case 'text/plain':
        case 'text/markdown':
            return content;
        default:
            return content;
    }
}
```

### Supported File Types

| Type | View | Export |
|------|------|--------|
| Google Docs | ✅ Markdown | ✅ .md |
| Google Sheets | ✅ Table | ✅ .csv |
| PDF | ✅ Text | ✅ .pdf |
| Markdown | ✅ Native | ✅ .md |
| Plain Text | ✅ Native | ✅ .txt |

---

## Configuration Options

All features can be customized via VS Code settings:

```json
{
  // Search settings
  "teambrain.searchResultLimit": 50,
  "teambrain.enableSemanticSearch": true,

  // Context suggestions
  "teambrain.enableContextSuggestions": true,
  "teambrain.suggestionDelay": 2000,

  // Caching
  "teambrain.cacheSize": 100,
  "teambrain.cacheExpiry": 3600000,

  // Indexing
  "teambrain.indexedFolders": [
    {
      "id": "folder-id-1",
      "name": "Engineering Wiki"
    }
  ],
  "teambrain.excludePatterns": [
    "Archive/*",
    "Personal/*"
  ],
  "teambrain.autoIndexOnStartup": true,

  // UI preferences
  "teambrain.autoOpenLinks": false,
  "teambrain.notifyOnUpdates": true
}
```

---

## Performance Targets

| Feature | Target | Acceptable | Unacceptable |
|---------|--------|------------|--------------|
| Search response | <500ms | <2s | >5s |
| Document open | <1s | <3s | >5s |
| Context detection | <200ms | <1s | >2s |
| AI Q&A response | <3s | <10s | >15s |
| Sidebar refresh | <500ms | <2s | >5s |

---

## Related Documents

- [Design Overview](overview.md)
- [Authentication Strategy](authentication.md)
- [Component Overview](../architecture/component-overview.md)
- [Commands Reference](../reference/commands.md)
