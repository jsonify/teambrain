# Component Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VS Code IDE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              TeamBrain Extension                      │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │   Search   │  │  AI Context  │  │   Sidebar    │ │  │
│  │  │   Panel    │  │   Provider   │  │  TreeView    │ │  │
│  │  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘ │  │
│  │        │                │                  │         │  │
│  │  ┌─────▼────────────────▼──────────────────▼───────┐ │  │
│  │  │         Extension Core Controller               │ │  │
│  │  │  - Command Handler                              │ │  │
│  │  │  - State Management                             │ │  │
│  │  │  - Event Coordination                           │ │  │
│  │  └─────┬───────────────┬───────────────┬───────────┘ │  │
│  │        │               │               │             │  │
│  │  ┌─────▼─────┐  ┌──────▼──────┐  ┌────▼──────────┐  │  │
│  │  │   Auth    │  │   Drive     │  │   Copilot     │  │  │
│  │  │  Manager  │  │   Service   │  │   Service     │  │  │
│  │  └─────┬─────┘  └──────┬──────┘  └────┬──────────┘  │  │
│  └────────┼────────────────┼──────────────┼─────────────┘  │
└───────────┼────────────────┼──────────────┼─────────────────┘
            │                │              │
     ┌──────▼──────┐  ┌──────▼──────┐  ┌───▼──────────┐
     │  VS Code    │  │   Google    │  │  VS Code     │
     │  Auth API   │  │  Drive API  │  │  LM API      │
     │  (OAuth)    │  │  (REST)     │  │  (Copilot)   │
     └─────────────┘  └─────────────┘  └──────────────┘
```

## Core Components

### 1. Extension Core (extension.ts)

**Responsibilities:**
- Extension lifecycle (activate/deactivate)
- Command registration
- View registration
- State coordination

**Key Methods:**
```typescript
export function activate(context: vscode.ExtensionContext)
export function deactivate()
```

---

### 2. Services Layer

#### AuthManager (services/auth.ts)

**Purpose:** Manage Google OAuth authentication

**Key Methods:**
- `getSession()`: Get authenticated session
- `isAuthenticated()`: Check auth status
- `signOut()`: Clear session
- `getAccessToken()`: Get token for API calls

**Dependencies:**
- VS Code Authentication API

---

#### DriveService (services/drive.ts)

**Purpose:** Wrapper around Google Drive API

**Key Methods:**
- `initialize(accessToken)`: Set up API client
- `searchFiles(query)`: Search Drive
- `getFileContent(fileId)`: Fetch file content
- `getFileMetadata(fileId)`: Get metadata
- `listFolder(folderId)`: List folder contents

**Dependencies:**
- `@googleapis/drive`
- AuthManager

---

#### CopilotService (services/copilot.ts)

**Purpose:** Wrapper around VS Code Language Model API

**Key Methods:**
- `askWithContext(question, docs)`: AI Q&A
- `getSemanticSimilarity(query, doc)`: Similarity scoring
- `extractKeywords(text)`: Keyword extraction

**Dependencies:**
- VS Code LM API

---

#### DocumentCache (services/cache.ts)

**Purpose:** In-memory LRU cache for documents

**Key Methods:**
- `get(fileId)`: Retrieve cached document
- `set(fileId, document)`: Store document
- `clear()`: Clear all cache

**Configuration:**
- Max size: 100 documents
- TTL: 1 hour

---

#### Indexer (services/indexer.ts)

**Purpose:** Background indexing of Drive folders

**Key Methods:**
- `indexFolder(folderId)`: Index a folder
- `incrementalUpdate()`: Update changed files
- `getIndexStatus()`: Check indexing progress

**Dependencies:**
- DriveService
- WorkspaceState (for persistence)

---

### 3. Commands Layer

#### SearchCommand (commands/search.ts)

**Purpose:** Implement search functionality

**Flow:**
1. Show input box
2. Query DriveService
3. Rank results
4. Display in Quick Pick
5. Handle selection

---

#### AskCommand (commands/ask.ts)

**Purpose:** AI-powered Q&A

**Flow:**
1. Show input box
2. Find relevant docs (DriveService)
3. Send to Copilot with context
4. Display answer with citations

---

#### SyncCommand (commands/sync.ts)

**Purpose:** Manual refresh/sync

**Flow:**
1. Show progress notification
2. Call Indexer.incrementalUpdate()
3. Update TreeView
4. Show completion message

---

### 4. UI Layer

#### TreeView (ui/treeView.ts)

**Purpose:** Sidebar navigation

**Structure:**
- Search
- Favorites
- Recent
- Quick Access
- Settings

**Implements:** `vscode.TreeDataProvider`

---

#### SearchPanel (ui/searchPanel.ts)

**Purpose:** Search interface using Quick Pick

**Features:**
- Input field
- Result list with metadata
- Preview snippets
- Filters

---

#### DocViewer (ui/docViewer.ts)

**Purpose:** Display documents in VS Code

**Methods:**
- `openDocument(fileId)`: Open doc in editor
- `convertToMarkdown(content)`: Convert Google Docs

**Supports:**
- Google Docs → Markdown
- PDF → Text
- Plain text

---

#### Suggestions (ui/suggestions.ts)

**Purpose:** Context-aware suggestions

**Triggers:**
- File open
- Editor change

**Flow:**
1. Detect context from file
2. Search relevant docs
3. Show notification
4. Handle user interaction

---

### 5. Models Layer

#### Document (models/document.ts)

```typescript
interface Document {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: Date;
  webViewLink: string;
  content?: string;
}
```

#### SearchResult (models/searchResult.ts)

```typescript
interface SearchResult extends Document {
  score: number;
  snippet?: string;
  matchedKeywords: string[];
}
```

#### Config (models/config.ts)

```typescript
interface Config {
  indexedFolders: IndexedFolder[];
  excludePatterns: string[];
  cacheSize: number;
  enableContextSuggestions: boolean;
  // ...
}
```

---

### 6. Utils Layer

#### Logger (utils/logger.ts)

**Purpose:** Logging and debugging

**Methods:**
- `info(message)`: Info logs
- `warn(message)`: Warnings
- `error(message, error)`: Errors
- `debug(message)`: Debug logs

---

#### Markdown Converter (utils/markdown.ts)

**Purpose:** Convert Google Docs to Markdown

**Methods:**
- `convertGoogleDocToMarkdown(content)`: Main converter
- `handleCodeBlocks(content)`: Preserve code
- `handleImages(content)`: Convert images

---

#### Filters (utils/filters.ts)

**Purpose:** Search filtering logic

**Methods:**
- `filterByType(results, type)`: Filter by file type
- `filterByDate(results, range)`: Filter by date
- `filterByFolder(results, folderId)`: Filter by folder

---

## Data Flow

### Search Flow

```
User Input
    ↓
SearchCommand
    ↓
DriveService.searchFiles()
    ↓
Google Drive API
    ↓
Results returned
    ↓
Rank results (keyword + AI)
    ↓
Cache results
    ↓
Display in Quick Pick
    ↓
User selects
    ↓
DocViewer.openDocument()
```

### Authentication Flow

```
User triggers command
    ↓
AuthManager.getSession()
    ↓
VS Code Auth API
    ↓
Browser opens (OAuth)
    ↓
Google + PingID
    ↓
Token issued
    ↓
VS Code stores securely
    ↓
Token available for API calls
```

### Context Suggestion Flow

```
User opens file
    ↓
onDidChangeActiveTextEditor event
    ↓
Suggestions.detectContext()
    ↓
Analyze file path + content
    ↓
DriveService.searchFiles()
    ↓
Rank by relevance
    ↓
Show notification
    ↓
User clicks
    ↓
DocViewer.openDocument()
```

---

## State Management

### Extension Context

```typescript
context.subscriptions   // Disposables
context.globalState     // Global storage
context.workspaceState  // Workspace storage
context.secrets         // Secure storage (tokens)
```

### Workspace State

- Recent documents (30 days)
- Favorites (persistent)
- Access statistics (30 days)
- Index metadata

### In-Memory State

- Document cache (LRU, 1 hour TTL)
- Active queries
- Current session data

---

## Dependencies

### External

- `@googleapis/drive` - Google Drive API
- `vscode` - VS Code Extension API

### Internal

```
extension.ts
  ├── commands/*
  │   ├── services/auth
  │   ├── services/drive
  │   └── services/copilot
  ├── ui/*
  │   └── services/*
  └── utils/*
```

---

## Related Documents

- [API Integration](api-integration.md)
- [Data Flow](data-flow.md)
- [Features Specification](../design/features.md)
