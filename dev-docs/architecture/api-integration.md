# API Integration

## Google Drive API

### Authentication

Uses OAuth 2.0 via VS Code Authentication API:

```typescript
const session = await vscode.authentication.getSession('google', SCOPES, {
    createIfNone: true
});
const accessToken = session.accessToken;
```

### Scopes Required

```typescript
const SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
];
```

### Client Initialization

```typescript
import { google } from 'googleapis';

const auth = new google.auth.OAuth2();
auth.setCredentials({ access_token: accessToken });

const drive = google.drive({ version: 'v3', auth });
```

### API Endpoints

#### Search Files

```typescript
const response = await drive.files.list({
    q: `fullText contains '${query}' and trashed=false`,
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
    pageSize: 50,
    orderBy: 'modifiedTime desc'
});
```

#### Get File Metadata

```typescript
const response = await drive.files.get({
    fileId: fileId,
    fields: 'id, name, mimeType, modifiedTime, webViewLink, owners, permissions'
});
```

#### Get File Content

```typescript
// For Google Docs
const response = await drive.files.export({
    fileId: fileId,
    mimeType: 'text/plain'
});

// For other files
const response = await drive.files.get({
    fileId: fileId,
    alt: 'media'
});
```

#### List Folder

```typescript
const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, modifiedTime)',
    orderBy: 'name',
    pageSize: 1000
});
```

#### Get Changes

```typescript
const response = await drive.changes.list({
    pageToken: startPageToken,
    fields: 'changes(fileId, file(id, name, mimeType, modifiedTime), removed)'
});
```

### Rate Limiting

- **Queries per day:** 1,000,000,000
- **Queries per 100 seconds per user:** 1,000
- **Handle with exponential backoff**

### Error Handling

```typescript
try {
    const response = await drive.files.list(params);
} catch (error) {
    if (error.code === 429) {
        // Rate limit - retry with backoff
    } else if (error.code === 401) {
        // Auth error - re-authenticate
    } else if (error.code === 404) {
        // Not found
    }
}
```

---

## VS Code Language Model API

### Model Selection

```typescript
const models = await vscode.lm.selectChatModels({
    vendor: 'copilot',
    family: 'gpt-4o'
});

if (models.length === 0) {
    throw new Error('No Copilot model available');
}

const model = models[0];
```

### Send Request

```typescript
const messages = [
    vscode.LanguageModelChatMessage.User(prompt)
];

const response = await model.sendRequest(
    messages,
    {},
    new vscode.CancellationTokenSource().token
);

// Stream response
let answer = '';
for await (const fragment of response.text) {
    answer += fragment;
}
```

### Example: Q&A with Context

```typescript
async function askWithContext(question: string, documents: Document[]): Promise<string> {
    const context = documents.map(doc =>
        `Document: ${doc.name}\n${doc.content}`
    ).join('\n\n---\n\n');

    const prompt = `Based on the following documentation, please answer this question:

${question}

Documentation:
${context}

Provide a clear answer with citations to specific documents.`;

    const messages = [vscode.LanguageModelChatMessage.User(prompt)];
    const model = await getModel();
    const response = await model.sendRequest(messages, {}, token);

    let answer = '';
    for await (const fragment of response.text) {
        answer += fragment;
    }

    return answer;
}
```

### Token Limits

- **GPT-4o:** ~128k tokens
- **Limit context to top 5-10 documents**
- **Monitor token usage**

---

## VS Code Authentication API

### Get Session

```typescript
const session = await vscode.authentication.getSession(
    'google',
    SCOPES,
    {
        createIfNone: true,  // Prompt if not authenticated
        clearSessionPreference: false
    }
);
```

### Check Authentication

```typescript
const session = await vscode.authentication.getSession(
    'google',
    SCOPES,
    { createIfNone: false }  // Don't prompt
);

const isAuthenticated = session !== undefined;
```

### Logout

```typescript
await vscode.authentication.logout('google', session.id);
```

### Token Refresh

Handled automatically by VS Code - tokens are refreshed transparently.

---

## VS Code Extension APIs

### Configuration

```typescript
const config = vscode.workspace.getConfiguration('teambrain');
const cacheSize = config.get<number>('cacheSize', 100);

// Watch for changes
vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('teambrain')) {
        reloadConfig();
    }
});
```

### Storage

```typescript
// Global state (across workspaces)
await context.globalState.update('favorites', favoritesList);
const favorites = context.globalState.get<string[]>('favorites', []);

// Workspace state (per workspace)
await context.workspaceState.update('recentDocs', recentList);

// Secrets (secure storage)
await context.secrets.store('oauth-token', token);
const token = await context.secrets.get('oauth-token');
```

### Commands

```typescript
// Register command
const disposable = vscode.commands.registerCommand(
    'teambrain.search',
    async () => {
        // Command implementation
    }
);

context.subscriptions.push(disposable);
```

### Quick Pick

```typescript
const result = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a document',
    matchOnDescription: true,
    matchOnDetail: true
});
```

### Tree View

```typescript
const treeDataProvider = new TeamBrainTreeDataProvider();

const treeView = vscode.window.createTreeView('teambrain.treeView', {
    treeDataProvider,
    showCollapseAll: true
});

context.subscriptions.push(treeView);
```

---

## API Best Practices

### 1. Error Handling

Always wrap API calls in try-catch and provide user-friendly messages.

### 2. Rate Limiting

Implement exponential backoff for rate limit errors.

### 3. Caching

Cache responses to minimize API calls.

### 4. Batching

Batch multiple requests where possible.

### 5. Token Management

Never log or expose tokens.

---

## Related Documents

- [Component Overview](component-overview.md)
- [Authentication Strategy](../design/authentication.md)
- [Security Design](../design/security.md)
