# TeamBrain - VS Code Extension Design Document

**Version:** 1.0  
**Date:** November 8, 2025  
**Author:** Platform Engineering Team  
**Status:** Design Phase

---

## Executive Summary

TeamBrain is a VS Code extension that brings your team's Google Drive knowledge base directly into your development environment. By leveraging VS Code's built-in authentication system and the Language Model API (Copilot), it provides intelligent, context-aware access to your organization's documentation, wikis, ADRs, runbooks, and other knowledge artifacts.

**Key Value Proposition:** Reduce context switching and time spent searching for documentation by making institutional knowledge instantly accessible within VS Code, powered by AI that understands both your code and your documentation.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Goals & Non-Goals](#goals--non-goals)
3. [Architecture Overview](#architecture-overview)
4. [Authentication Strategy](#authentication-strategy)
5. [Core Features](#core-features)
6. [Technical Implementation](#technical-implementation)
7. [Security & Compliance](#security--compliance)
8. [User Experience](#user-experience)
9. [Performance Considerations](#performance-considerations)
10. [Development Roadmap](#development-roadmap)
11. [Success Metrics](#success-metrics)

---

## Problem Statement

Platform engineers spend significant time context-switching between their IDE and Google Drive to find relevant documentation:

- **Time Waste:** 15-30 minutes daily searching for docs across multiple Google Drive folders
- **Context Loss:** Breaking flow to search, read, and return to coding
- **Knowledge Silos:** Difficulty discovering relevant docs that exist but aren't known
- **Stale Knowledge:** Unaware when documentation exists for the code being worked on
- **Onboarding Friction:** New team members don't know what docs exist or where to find them

**Current Workaround:** Manual searching in Google Drive, bookmarking, or asking teammates in Slack.

**Impact:** Reduced productivity, repeated questions, slower incident resolution, longer onboarding.

---

## Goals & Non-Goals

### Goals

1. **Seamless Authentication:** Integrate with existing enterprise SSO (PingID) without bypassing security
2. **Intelligent Search:** Use AI to understand intent and surface relevant docs based on context
3. **Context Awareness:** Automatically suggest docs relevant to current file/project
4. **Fast Access:** Sub-second response for cached queries, <3 seconds for fresh searches
5. **Trust & Security:** Respect enterprise security policies, minimal permissions, audit trail
6. **Developer Experience:** Native VS Code UI, keyboard shortcuts, minimal disruption to workflow

### Non-Goals

1. **Not a full Drive client:** Won't replicate all Google Drive features (sharing, comments, etc.)
2. **Not a replacement for Drive:** Complements Drive, doesn't replace it
3. **Not bidirectional sync:** Initial version is read-only (write features in future iterations)
4. **Not multi-tenant:** Designed for single organization's Google Workspace
5. **Not offline-first:** Requires network connection (caching improves experience)

---

## Architecture Overview

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

### Component Descriptions

**Search Panel:** Quick Pick UI for searching across all Drive documents
**AI Context Provider:** Analyzes current file/workspace to suggest relevant docs
**Sidebar TreeView:** Persistent view of recent docs, favorites, and categories
**Extension Core:** Central coordinator for all extension functionality
**Auth Manager:** Handles OAuth flow, token storage, and refresh
**Drive Service:** Wrapper around Google Drive API with caching
**Copilot Service:** Interface to VS Code Language Model API for AI features

---

## Authentication Strategy

### Choice: VS Code Authentication Provider API (Option 3)

We will use VS Code's built-in `vscode.authentication` API, which provides:
- Secure OAuth flow through system browser
- Native integration with enterprise SSO (PingID)
- Automatic token refresh and secure storage
- User control over permissions and revocation

### Authentication Flow

```
┌──────────┐                                    ┌──────────────┐
│   User   │                                    │   VS Code    │
└────┬─────┘                                    └──────┬───────┘
     │                                                 │
     │  1. Activate Extension / Run Command           │
     ├────────────────────────────────────────────────▶
     │                                                 │
     │                    2. Request Auth Session     │
     │                    vscode.authentication        │
     │                         .getSession()           │
     │                                                 │
     │  3. Open Browser for OAuth                     │
     │◀────────────────────────────────────────────────┤
     │                                                 │
┌────▼─────────────────────────────────────────────┐  │
│          System Browser Opens                    │  │
│  ┌────────────────────────────────────────────┐  │  │
│  │  Google OAuth Consent Screen               │  │  │
│  │  "TeamBrain wants to access your Drive"    │  │  │
│  │                                             │  │  │
│  │  Redirects to: accounts.google.com         │  │  │
│  └────────────────────────────────────────────┘  │  │
└──────────────────────────────────────────────────┘  │
     │                                                 │
     │  4. Enterprise Domain Detected                 │
     │     Redirect to PingID                         │
     │                                                 │
┌────▼─────────────────────────────────────────────┐  │
│          PingID SSO Login                        │  │
│  ┌────────────────────────────────────────────┐  │  │
│  │  PingID Authentication                      │  │  │
│  │  - Username/Password (if not logged in)    │  │  │
│  │  - MFA Challenge                            │  │  │
│  │  - Biometric/Push Notification             │  │  │
│  └────────────────────────────────────────────┘  │  │
└──────────────────────────────────────────────────┘  │
     │                                                 │
     │  5. PingID Success → Google Issues Token       │
     │                                                 │
     │  6. Browser Redirects to VS Code               │
     ├────────────────────────────────────────────────▶
     │                                                 │
     │  7. Token Stored in SecretStorage               │
     │     Extension Ready to Use                      │
     │◀────────────────────────────────────────────────┤
     │                                                 │
```

### Implementation Details

```typescript
import * as vscode from 'vscode';

export class AuthManager {
    private static readonly SCOPES = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
    ];

    /**
     * Get authenticated session, prompting user if needed
     */
    async getSession(): Promise<vscode.AuthenticationSession | undefined> {
        try {
            // VS Code handles everything: OAuth, token storage, refresh
            const session = await vscode.authentication.getSession(
                'google',
                AuthManager.SCOPES,
                { 
                    createIfNone: true,  // Show login if not authenticated
                    clearSessionPreference: false
                }
            );
            
            return session;
        } catch (error) {
            vscode.window.showErrorMessage(
                'Failed to authenticate with Google Drive. Please try again.'
            );
            return undefined;
        }
    }

    /**
     * Check if user is currently authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        try {
            const session = await vscode.authentication.getSession(
                'google',
                AuthManager.SCOPES,
                { createIfNone: false }  // Don't prompt, just check
            );
            return session !== undefined;
        } catch {
            return false;
        }
    }

    /**
     * Sign out and clear session
     */
    async signOut(): Promise<void> {
        const session = await vscode.authentication.getSession(
            'google',
            AuthManager.SCOPES,
            { createIfNone: false }
        );

        if (session) {
            // This revokes the token and clears storage
            await vscode.authentication.logout('google', session.id);
            vscode.window.showInformationMessage('Signed out of Google Drive');
        }
    }

    /**
     * Get access token for API calls
     */
    async getAccessToken(): Promise<string | undefined> {
        const session = await this.getSession();
        return session?.accessToken;
    }
}
```

### OAuth Scopes Required

We request **minimal permissions** following principle of least privilege:

| Scope | Purpose | Justification |
|-------|---------|---------------|
| `drive.readonly` | Read file contents | Core functionality - reading docs |
| `drive.metadata.readonly` | List files, get metadata | Search and display file information |

**Not Requested:**
- Write permissions (not needed for v1)
- Delete permissions (not needed)
- Full Drive access (we use readonly)

### Token Lifecycle

1. **Acquisition:** User authenticates once via OAuth (PingID flow)
2. **Storage:** VS Code stores token in OS-level secure storage (Keychain/Credential Manager/Secret Service)
3. **Usage:** Extension retrieves token per-request via `getSession()`
4. **Refresh:** VS Code automatically refreshes expired tokens
5. **Revocation:** User can revoke via VS Code settings or Google account settings

### Security Considerations

✅ **No password storage:** Extension never sees user credentials  
✅ **Token encryption:** OS-level secure storage  
✅ **Automatic expiry:** Tokens expire per Google policy  
✅ **User control:** Easy revocation through VS Code UI  
✅ **Audit trail:** Google logs all OAuth grants  
✅ **SSO compliance:** Works with PingID, Okta, Azure AD, etc.  
✅ **Minimal scope:** Only read-only access requested  

---

## Core Features

### 1. Quick Search (Command Palette)

**Command:** `TeamBrain: Search Knowledge Base`  
**Shortcut:** `Cmd+Shift+K` (Mac) / `Ctrl+Shift+K` (Windows/Linux)

**User Flow:**
1. User presses shortcut or runs command
2. Quick Pick opens with search box
3. User types query: "database migration process"
4. Extension searches Google Drive with AI-enhanced relevance
5. Results appear with preview snippets
6. User selects document to open in VS Code editor or browser

**Features:**
- Fuzzy search across file names and content
- AI-powered relevance ranking using Copilot embeddings
- Preview snippets showing match context
- Recently accessed docs appear first
- Supports filters: file type, folder, date range

### 2. Context-Aware Suggestions

**Automatic Triggers:**
- Opening a file in specific directories (e.g., `/services/auth/*`)
- Working on files with certain patterns (e.g., `*migration*.sql`)
- Encountering errors (shows relevant troubleshooting docs)

**User Experience:**
- Non-intrusive notification: "📚 Found 3 related docs"
- Click to expand inline suggestions
- Optionally enable/disable per workspace

**Implementation:**
```typescript
// Watches for file opens and active editor changes
vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (!editor) return;
    
    const filePath = editor.document.uri.fsPath;
    const suggestions = await getSuggestedDocs(filePath);
    
    if (suggestions.length > 0) {
        showSuggestions(suggestions);
    }
});
```

### 3. AI-Powered Q&A

**Command:** `TeamBrain: Ask Question`  
**Shortcut:** `Cmd+Shift+?` (Mac) / `Ctrl+Shift+?` (Windows/Linux)

**User Flow:**
1. User runs command or highlights code and runs command
2. Input box appears: "What do you want to know?"
3. User types: "How do we handle database migrations in production?"
4. Extension:
   - Searches Google Drive for relevant docs
   - Sends docs + question to Copilot API
   - Returns answer with source citations
5. Answer appears in panel with clickable links to source docs

**Features:**
- Understands context (current file, workspace, language)
- Cites sources with links back to Google Docs
- Remembers conversation history within session
- Can ask follow-up questions

### 4. Sidebar TreeView

**Location:** Activity Bar (new icon: 🧠 or 📚)  
**Name:** "TeamBrain"

**Structure:**
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

**Features:**
- Collapsible sections
- Right-click context menu (Open, Copy Link, Add to Favorites)
- Drag-and-drop to reorder favorites
- Badge showing new/updated docs

### 5. Document Viewer

**Capabilities:**
- View Google Docs content directly in VS Code editor
- Syntax highlighting for code blocks in docs
- Clickable links to other docs
- Inline images (converted from Drive)
- Export to markdown for local storage

**Implementation:**
- Fetch doc content via Drive API
- Convert to markdown or HTML
- Display in VS Code webview or text editor
- Cache locally for offline access

---

## Technical Implementation

### Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Language | TypeScript | Type safety, VS Code standard |
| Package Manager | pnpm | Fast, efficient, user preference |
| VS Code API | ^1.80.0 | Authentication API, LM API support |
| Google API | @googleapis/drive | Official Google client library |
| AI Integration | VS Code LM API | Native Copilot integration |
| Storage | VS Code SecretStorage, Memento | Secure and persistent storage |
| Testing | @vscode/test-electron | VS Code extension testing |

### Project Structure

```
teambrain/
├── src/
│   ├── extension.ts              # Entry point, activation
│   ├── commands/
│   │   ├── search.ts             # Search command
│   │   ├── ask.ts                # Q&A command
│   │   └── sync.ts               # Refresh/sync command
│   ├── services/
│   │   ├── auth.ts               # Authentication manager
│   │   ├── drive.ts              # Google Drive API wrapper
│   │   ├── copilot.ts            # LM API wrapper
│   │   ├── cache.ts              # Local caching layer
│   │   └── indexer.ts            # Document indexing
│   ├── ui/
│   │   ├── treeView.ts           # Sidebar tree provider
│   │   ├── searchPanel.ts        # Quick pick search
│   │   ├── docViewer.ts          # Document viewer webview
│   │   └── suggestions.ts        # Context suggestions
│   ├── models/
│   │   ├── document.ts           # Document model
│   │   ├── searchResult.ts       # Search result model
│   │   └── config.ts             # Configuration model
│   └── utils/
│       ├── logger.ts             # Logging utility
│       ├── markdown.ts           # Doc to markdown converter
│       └── filters.ts            # Search filters
├── resources/
│   └── icons/                    # Extension icons
├── test/
│   ├── suite/
│   │   ├── auth.test.ts
│   │   ├── drive.test.ts
│   │   └── search.test.ts
│   └── runTest.ts
├── package.json                  # Extension manifest
├── tsconfig.json                 # TypeScript config
├── .vscodeignore                 # Files to exclude from package
└── README.md                     # User documentation
```

### Key Algorithms

#### 1. Intelligent Search Ranking

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

#### 2. Context Detection

```typescript
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

#### 3. Document Caching Strategy

```typescript
class DocumentCache {
    private cache: Map<string, CachedDoc> = new Map();
    private maxCacheSize = 100; // Max docs in memory
    private maxAge = 3600000; // 1 hour in milliseconds
    
    async get(fileId: string): Promise<DriveFile | undefined> {
        const cached = this.cache.get(fileId);
        
        if (!cached) return undefined;
        
        // Check if expired
        if (Date.now() - cached.timestamp > this.maxAge) {
            this.cache.delete(fileId);
            return undefined;
        }
        
        // Update access time (LRU)
        cached.lastAccessed = Date.now();
        return cached.document;
    }
    
    async set(fileId: string, document: DriveFile): Promise<void> {
        // Evict oldest if cache full
        if (this.cache.size >= this.maxCacheSize) {
            const oldest = Array.from(this.cache.entries())
                .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)[0];
            this.cache.delete(oldest[0]);
        }
        
        this.cache.set(fileId, {
            document,
            timestamp: Date.now(),
            lastAccessed: Date.now()
        });
    }
    
    clear(): void {
        this.cache.clear();
    }
}
```

### Google Drive API Integration

```typescript
import { google } from 'googleapis';
import * as vscode from 'vscode';

export class DriveService {
    private drive: any;
    
    async initialize(accessToken: string) {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        
        this.drive = google.drive({ version: 'v3', auth });
    }
    
    /**
     * Search files by query
     */
    async searchFiles(query: string): Promise<DriveFile[]> {
        const response = await this.drive.files.list({
            q: `fullText contains '${query}' and trashed=false`,
            fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
            pageSize: 50,
            orderBy: 'modifiedTime desc'
        });
        
        return response.data.files || [];
    }
    
    /**
     * Get file content
     */
    async getFileContent(fileId: string): Promise<string> {
        // For Google Docs, export as plain text or markdown
        if (this.isGoogleDoc(fileId)) {
            const response = await this.drive.files.export({
                fileId,
                mimeType: 'text/plain'
            });
            return response.data;
        }
        
        // For other files, download directly
        const response = await this.drive.files.get({
            fileId,
            alt: 'media'
        });
        return response.data;
    }
    
    /**
     * List files in specific folder
     */
    async listFolder(folderId: string): Promise<DriveFile[]> {
        const response = await this.drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType, modifiedTime)',
            orderBy: 'name'
        });
        
        return response.data.files || [];
    }
}
```

### Copilot Integration

```typescript
import * as vscode from 'vscode';

export class CopilotService {
    /**
     * Ask a question with document context
     */
    async askWithContext(
        question: string,
        documents: DriveFile[]
    ): Promise<string> {
        const model = await this.getModel();
        
        // Build context from documents
        const context = documents.map(doc => 
            `Document: ${doc.name}\n${doc.content}`
        ).join('\n\n---\n\n');
        
        const prompt = `Based on the following documentation, please answer this question:

${question}

Documentation:
${context}

Provide a clear answer with citations to specific documents.`;

        const messages = [
            vscode.LanguageModelChatMessage.User(prompt)
        ];
        
        const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
        
        let answer = '';
        for await (const fragment of response.text) {
            answer += fragment;
        }
        
        return answer;
    }
    
    /**
     * Generate embeddings for semantic search
     */
    async generateEmbedding(text: string): Promise<number[]> {
        // Note: VS Code LM API doesn't directly expose embeddings
        // Alternative: use a lightweight local model or cache semantic matches
        
        // For now, use simpler approach: keyword extraction
        return this.extractKeywords(text);
    }
    
    /**
     * Get semantic similarity between query and document
     */
    async getSemanticSimilarity(
        query: string,
        document: string
    ): Promise<number> {
        const model = await this.getModel();
        
        const prompt = `On a scale of 0.0 to 1.0, how relevant is this document to the query?
        
Query: ${query}

Document: ${document.substring(0, 500)}

Reply with only a number between 0.0 and 1.0.`;

        const messages = [
            vscode.LanguageModelChatMessage.User(prompt)
        ];
        
        const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
        
        let result = '';
        for await (const fragment of response.text) {
            result += fragment;
        }
        
        return parseFloat(result) || 0;
    }
    
    private async getModel(): Promise<vscode.LanguageModelChat> {
        const models = await vscode.lm.selectChatModels({
            vendor: 'copilot',
            family: 'gpt-4o'
        });
        
        if (models.length === 0) {
            throw new Error('No Copilot model available');
        }
        
        return models[0];
    }
}
```

---

## Security & Compliance

### Authentication Security

| Threat | Mitigation |
|--------|-----------|
| Token theft | Stored in OS-level encrypted storage (Keychain/Credential Manager) |
| Token leakage in logs | Never log tokens; redact in error messages |
| Session hijacking | Short-lived tokens with automatic refresh |
| Unauthorized access | Minimal OAuth scopes (read-only) |
| Phishing | Official Google OAuth flow; can't be intercepted |

### Data Privacy

**What We Store:**
- Document metadata (IDs, names, modified dates) - cached locally
- Search history - stored locally, can be cleared
- User preferences - workspace settings
- Access statistics - local only, for ranking

**What We DON'T Store:**
- Full document contents (only cached temporarily in memory)
- User credentials or tokens (managed by VS Code)
- Personal information beyond what Drive API provides
- Data sent to third parties (only Google and Copilot APIs)

### Compliance Considerations

✅ **GDPR Compliance:**
- User data only stored locally
- Easy data deletion (clear cache command)
- No data transfer outside organization

✅ **SOC2 Compliance:**
- Audit trail via Google OAuth logs
- No persistent storage of sensitive data
- Minimal data retention

✅ **Enterprise Requirements:**
- Works with SSO/SAML (PingID, Okta, Azure AD)
- Respects Drive permissions (users only see what they have access to)
- No backend server (client-side only)

### Audit & Monitoring

```typescript
class AuditLogger {
    private output: vscode.OutputChannel;
    
    constructor() {
        this.output = vscode.window.createOutputChannel('TeamBrain Audit');
    }
    
    logAuth(event: 'login' | 'logout' | 'refresh') {
        this.log(`AUTH: ${event} at ${new Date().toISOString()}`);
    }
    
    logSearch(query: string, resultCount: number) {
        this.log(`SEARCH: "${query}" returned ${resultCount} results`);
    }
    
    logDocAccess(documentId: string, documentName: string) {
        this.log(`ACCESS: Document ${documentName} (${documentId})`);
    }
    
    private log(message: string) {
        this.output.appendLine(`[${new Date().toISOString()}] ${message}`);
    }
}
```

---

## User Experience

### Onboarding Flow

**First Time User:**

1. Install extension from VS Code Marketplace
2. Extension activates, shows welcome notification:
   ```
   Welcome to TeamBrain! 🧠
   Connect your Google Drive to access your team's knowledge base.
   [Connect Now] [Learn More] [Dismiss]
   ```
3. Click "Connect Now" → OAuth flow begins
4. Browser opens → PingID authentication
5. Success! Return to VS Code
6. Quick tutorial overlay:
   - "Press Cmd+Shift+K to search"
   - "Open sidebar to browse recent docs"
   - "Get context-aware suggestions while coding"

**Configuration Options:**
```json
{
  "teambrain.enableContextSuggestions": true,
  "teambrain.autoOpenLinks": false,
  "teambrain.cacheSize": 100,
  "teambrain.indexedFolders": [
    "Engineering Wiki",
    "Runbooks",
    "Architecture"
  ],
  "teambrain.excludePatterns": [
    "Archive/*",
    "Personal/*"
  ]
}
```

### Command Palette Integration

| Command | Shortcut | Description |
|---------|----------|-------------|
| `TeamBrain: Search Knowledge Base` | `Cmd+Shift+K` | Open search dialog |
| `TeamBrain: Ask Question` | `Cmd+Shift+?` | AI-powered Q&A |
| `TeamBrain: Show Suggestions` | - | Show context suggestions |
| `TeamBrain: Refresh Index` | - | Re-index Drive files |
| `TeamBrain: Configure Folders` | - | Choose which folders to index |
| `TeamBrain: Clear Cache` | - | Clear local cache |
| `TeamBrain: Sign Out` | - | Disconnect Google Drive |

### Status Bar Integration

```
[🧠 TeamBrain: Connected] [📊 1,247 docs indexed] [🔄 Last sync: 5m ago]
```

Click status bar to open quick actions menu.

### Keyboard Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Search | `Cmd+Shift+K` | `Ctrl+Shift+K` |
| Ask Question | `Cmd+Shift+?` | `Ctrl+Shift+?` |
| Toggle Sidebar | `Cmd+Opt+T` | `Ctrl+Alt+T` |
| Next Suggestion | `Cmd+]` | `Ctrl+]` |
| Previous Suggestion | `Cmd+[` | `Ctrl+[` |

---

## Performance Considerations

### Target Metrics

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| Search response time | <500ms | <2s | >5s |
| Document open time | <1s | <3s | >5s |
| Index refresh time | <30s | <2m | >5m |
| Memory usage | <50MB | <100MB | >200MB |
| CPU usage (idle) | <1% | <5% | >10% |

### Optimization Strategies

**1. Caching:**
- In-memory cache for recently accessed docs (LRU eviction)
- Persistent cache in workspace storage for metadata
- Cache invalidation on file modifications (Drive API change notifications)

**2. Lazy Loading:**
- Only index configured folders, not entire Drive
- Fetch file content on-demand, not during indexing
- Paginated search results (show 10, load more on scroll)

**3. Debouncing:**
- Debounce search input (300ms delay)
- Throttle context detection (don't run on every keystroke)
- Batch Drive API requests where possible

**4. Background Indexing:**
- Index on activation (one-time)
- Incremental updates (only changed files)
- Run during idle time (use `vscode.idle` API)

**5. Request Optimization:**
```typescript
// Bad: N+1 queries
for (const fileId of fileIds) {
    const content = await drive.getFileContent(fileId);
}

// Good: Batch requests
const contents = await drive.batchGetFiles(fileIds);
```

### Resource Limits

```typescript
const CONFIG = {
    MAX_CACHE_SIZE: 100,          // docs
    MAX_CACHE_AGE: 3600000,       // 1 hour
    MAX_SEARCH_RESULTS: 50,       // per query
    MAX_INDEXED_FILES: 10000,     // total
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    DEBOUNCE_DELAY: 300,          // ms
    BACKGROUND_SYNC_INTERVAL: 300000 // 5 minutes
};
```

---

## Team Setup Guide

### Overview

TeamBrain is a **personal extension** that connects to **shared team resources**. Each team member:
- Authenticates with their own Google account
- Connects to shared Google Drive folders
- Sees only documents they have permission to access
- Gets a personalized experience (search history, favorites, recency)

**No central server or shared database** - all data flows directly between VS Code and Google Drive.

### For Team Leads / Admins

#### 1. Prepare Your Google Drive Structure

Before rolling out TeamBrain, ensure your team's Google Drive is organized:

**Recommended Folder Structure:**

```
Google Drive (Shared with Team)
├─ 📁 Engineering Wiki
│  ├─ Getting Started
│  ├─ Service Documentation
│  ├─ API References
│  └─ Best Practices
│
├─ 📁 Platform Team
│  ├─ Runbooks
│  │  ├─ Incident Response
│  │  ├─ Deployment Procedures
│  │  └─ Troubleshooting Guides
│  ├─ Architecture Decisions (ADRs)
│  ├─ Infrastructure Docs
│  └─ Team Processes
│
├─ 📁 Standards & Guidelines
│  ├─ Code Style Guides
│  ├─ Security Requirements
│  ├─ Performance Standards
│  └─ Testing Guidelines
│
└─ 📁 Project Documentation
   ├─ Active Projects
   ├─ Completed Projects
   └─ Proposals & RFCs
```

**Permissions Setup:**
- **Engineering Wiki:** Shared with entire engineering org (read access)
- **Platform Team:** Shared with platform engineers (read/write access)
- **Standards & Guidelines:** Shared with everyone (read access)
- **Project Documentation:** Varies by project (appropriate access levels)

#### 2. Get Folder IDs

You'll need the Google Drive folder IDs to configure TeamBrain:

**How to find a folder ID:**

1. Open the folder in Google Drive (web)
2. Look at the URL: `https://drive.google.com/drive/folders/1abc123xyz456`
3. The ID is the part after `/folders/`: `1abc123xyz456`

**Create a reference document:**

```markdown
# TeamBrain Folder IDs (Internal)

## Core Team Folders

- **Engineering Wiki**: `1abc123xyz456`
  - Link: https://drive.google.com/drive/folders/1abc123xyz456
  - Access: All engineers

- **Platform Team Runbooks**: `2def456uvw789`
  - Link: https://drive.google.com/drive/folders/2def456uvw789
  - Access: Platform team

- **Architecture Decisions**: `3ghi789rst012`
  - Link: https://drive.google.com/drive/folders/3ghi789rst012
  - Access: All engineers

- **Standards & Guidelines**: `4jkl012mno345`
  - Link: https://drive.google.com/drive/folders/4jkl012mno345
  - Access: All engineers
```

#### 3. Create Workspace Settings Template

Create a `.vscode/settings.json` file for team repositories:

```json
{
  "teambrain.indexedFolders": [
    {
      "id": "1abc123xyz456",
      "name": "Engineering Wiki",
      "description": "Core engineering documentation"
    },
    {
      "id": "2def456uvw789",
      "name": "Platform Team Runbooks",
      "description": "Incident response and deployment procedures"
    },
    {
      "id": "3ghi789rst012",
      "name": "Architecture Decisions",
      "description": "ADRs and design documents"
    },
    {
      "id": "4jkl012mno345",
      "name": "Standards & Guidelines",
      "description": "Code style, security, and testing standards"
    }
  ],
  "teambrain.excludePatterns": [
    "Archive/*",
    "Personal/*",
    "Draft/*",
    "Old/*"
  ],
  "teambrain.enableContextSuggestions": true,
  "teambrain.autoIndexOnStartup": true,
  "teambrain.searchResultLimit": 50,
  "teambrain.cacheSize": 100
}
```

#### 4. Create Team Documentation

**Create a wiki page or Google Doc:**

```markdown
# TeamBrain Setup Guide for Platform Engineers

## What is TeamBrain?

TeamBrain brings our team's knowledge base directly into VS Code. Search docs,
get AI-powered answers, and access runbooks without leaving your editor.

## Installation

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "TeamBrain"
4. Click Install

## Initial Setup

### Step 1: Authenticate

1. After installation, you'll see a welcome notification
2. Click "Connect Now"
3. Your browser will open for Google authentication
4. **Use your @company.com email**
5. Complete PingID authentication (if prompted)
6. Return to VS Code - you're connected!

### Step 2: Configure Folders (Automatic)

Our team repositories already have TeamBrain configured! When you open a
workspace, the extension will automatically index these folders:

- Engineering Wiki
- Platform Team Runbooks  
- Architecture Decisions
- Standards & Guidelines

**If you need to manually configure:**

1. Open Command Palette (Cmd+Shift+P)
2. Run "TeamBrain: Configure Folders"
3. Add our team folder IDs (see below)

### Step 3: First Search

Try it out:

1. Press `Cmd+Shift+K` (or `Ctrl+Shift+K` on Windows)
2. Search for "database migration"
3. Select a result to open

## Team Folder IDs

If needed, here are our official folder IDs:

- Engineering Wiki: `1abc123xyz456`
- Platform Runbooks: `2def456uvw789`
- Architecture Decisions: `3ghi789rst012`
- Standards & Guidelines: `4jkl012mno345`

## Key Features

### 1. Quick Search (Cmd+Shift+K)
Search across all team docs instantly.

### 2. AI Q&A (Cmd+Shift+?)
Ask questions and get answers from our documentation:
- "How do we deploy to production?"
- "What's our incident response process?"
- "How do I set up local development?"

### 3. Context Suggestions
When editing files, TeamBrain suggests relevant docs:
- Working on auth service? See auth documentation
- Editing Terraform? See infrastructure guides
- Writing tests? See testing standards

### 4. Sidebar Browser
- View recent docs
- Bookmark favorites
- Browse by category

## Best Practices

1. **Keep docs updated in Drive** - TeamBrain reflects what's in Drive
2. **Use descriptive filenames** - Makes search more effective
3. **Star important docs** - They'll appear in your favorites
4. **Share feedback** - Let us know what works and what doesn't

## Troubleshooting

### Can't authenticate
- Make sure you're using your @company.com email
- Check PingID is working in your browser
- Try signing out and back in: "TeamBrain: Sign Out"

### Not seeing team folders
- Verify you have access to the folders in Google Drive
- Run "TeamBrain: Refresh Index"
- Check your folder configuration: "TeamBrain: Configure Folders"

### Search not working
- Check you're connected: Look for 🧠 in status bar
- Try "TeamBrain: Clear Cache" then "TeamBrain: Refresh Index"
- Verify the folders are shared with you in Google Drive

## Support

- **Slack:** #team-platform-support
- **Email:** platform-team@company.com
- **Issues:** https://github.com/company/teambrain/issues

## Privacy

- Your search history is private (stored locally)
- You only see docs you have access to in Google Drive
- No data is sent to external servers (only Google & Copilot APIs)
- You can revoke access anytime: "TeamBrain: Sign Out"
```

#### 5. Rollout Plan

**Phase 1: Pilot (Week 1-2)**
- Install on 5-10 team members
- Gather feedback
- Fix critical issues
- Refine documentation

**Phase 2: Team Rollout (Week 3-4)**
- Announce in team meeting
- Send setup guide via email/Slack
- Offer office hours for questions
- Monitor adoption metrics

**Phase 3: Organization Rollout (Week 5+)**
- Expand to entire engineering org
- Create training materials
- Present at engineering all-hands
- Establish support channels

**Communication Template:**

```
📢 Introducing TeamBrain - Your Knowledge Base in VS Code

Hey team! We're excited to announce TeamBrain, a new VS Code extension that
brings our Google Drive documentation directly into your editor.

✨ What can it do?
• Search all team docs with Cmd+Shift+K
• Get AI-powered answers to questions
• Automatic suggestions while coding
• No more context switching to Drive!

🚀 Get Started:
1. Install: Search "TeamBrain" in VS Code Extensions
2. Connect: Authenticate with your @company.com account
3. Search: Try Cmd+Shift+K and search for anything

📚 Full Guide: [Link to setup guide]

Questions? Drop them in #team-platform-support

Happy coding! 🧠
```

### For Individual Team Members

#### Quick Start (5 minutes)

**1. Install Extension**
```
VS Code → Extensions → Search "TeamBrain" → Install
```

**2. Connect Google Drive**
```
Click "Connect Now" → Authenticate with @company.com → Complete PingID
```

**3. Try Your First Search**
```
Press Cmd+Shift+K → Search "runbook" → Open a result
```

**4. Explore Features**
```
• Cmd+Shift+?: Ask questions
• Click 🧠 in sidebar: Browse docs
• Check status bar: See connection status
```

#### Keyboard Shortcuts Reference

Print this and keep it handy!

```
┌─────────────────────────────────────────────────────┐
│         TeamBrain Keyboard Shortcuts                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Cmd+Shift+K    Quick Search                       │
│  Cmd+Shift+?    Ask AI Question                    │
│  Cmd+Opt+T      Toggle Sidebar                     │
│  Cmd+]          Next Suggestion                     │
│  Cmd+[          Previous Suggestion                 │
│                                                     │
│  (Windows/Linux: Replace Cmd with Ctrl)            │
└─────────────────────────────────────────────────────┘
```

#### Personal Configuration

You can customize TeamBrain in VS Code Settings:

**Access Settings:**
1. Cmd+, to open Settings
2. Search for "TeamBrain"
3. Adjust preferences

**Common Settings:**

```json
{
  // Show context suggestions while coding
  "teambrain.enableContextSuggestions": true,
  
  // Automatically open links in VS Code (vs browser)
  "teambrain.autoOpenLinks": false,
  
  // Number of docs to cache locally
  "teambrain.cacheSize": 100,
  
  // Show notifications for new/updated docs
  "teambrain.notifyOnUpdates": true,
  
  // Automatically index on VS Code startup
  "teambrain.autoIndexOnStartup": true
}
```

#### Adding Personal Folders

Beyond team folders, you can add your own:

1. Open Command Palette: `Cmd+Shift+P`
2. Run: `TeamBrain: Configure Folders`
3. Click "Add Folder"
4. Paste folder ID or select from your Drive
5. Choose: "Personal" or "Shared with specific people"

**Example:**
```json
{
  "teambrain.indexedFolders": [
    // Team folders (from workspace settings)
    // ...
    
    // Your personal folders
    {
      "id": "my-personal-folder-id",
      "name": "My Project Notes",
      "description": "Personal documentation",
      "personal": true
    }
  ]
}
```

### For Security / IT Teams

#### Security Review Checklist

**Authentication & Authorization:**
- ✅ Uses standard OAuth 2.0 flow
- ✅ Integrates with existing SSO (PingID)
- ✅ No credentials stored by extension
- ✅ Tokens stored in OS-level secure storage
- ✅ Minimal OAuth scopes (read-only)
- ✅ User can revoke access anytime
- ✅ No backdoor access or admin override

**Data Privacy:**
- ✅ No central database or shared server
- ✅ Each user sees only what they're authorized to see
- ✅ Search history stored locally only
- ✅ No telemetry sent to external servers
- ✅ Uses Google Drive permissions (no separate permission layer)
- ✅ Cached data stored locally, can be cleared

**Network & API Usage:**
- ✅ Only connects to Google Drive API (googleapis.com)
- ✅ Uses official Google client libraries
- ✅ VS Code Language Model API for AI (Microsoft/GitHub)
- ✅ No data sent to third-party services
- ✅ All connections over HTTPS
- ✅ Respects corporate firewall/proxy settings

**Compliance:**
- ✅ GDPR compliant (user controls all data)
- ✅ SOC2 compatible (no data persistence beyond cache)
- ✅ Works with enterprise Google Workspace
- ✅ Audit trail via Google OAuth logs
- ✅ Can be deployed via internal marketplace

**Deployment Options:**

**Option 1: Public Marketplace (Recommended)**
- Users install from VS Code Marketplace
- Automatic updates
- Standard OAuth consent screen
- Can be pre-approved via Google Admin Console

**Option 2: Internal Deployment**
- Package as .vsix file
- Distribute via internal channels
- Manual updates
- Custom OAuth client ID

**Option 3: Fork & Customize**
- Open source under MIT license
- Add custom security policies
- Internal code review
- Host on private GitHub/GitLab

#### Google Workspace Admin Configuration

**Pre-approve the OAuth App:**

1. Go to Google Admin Console
2. Navigate to: Security → API Controls → Domain-wide delegation
3. Add TeamBrain's OAuth Client ID
4. Grant scopes:
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`

Users won't see consent screen after this.

**Restrict to Specific Groups (Optional):**

1. Security → API Controls → Manage Third-Party App Access
2. Add TeamBrain application
3. Set access to: "Limited (specific groups)"
4. Select: "Platform Engineering Team" group

**Monitor Usage:**

1. Reports → Audit and Investigation → Drive
2. Filter by application: "TeamBrain"
3. View: File accesses, authentication events

### Maintenance & Support

#### Regular Tasks

**Weekly:**
- [ ] Check support channel for questions
- [ ] Monitor error reports
- [ ] Review usage metrics

**Monthly:**
- [ ] Update team documentation if needed
- [ ] Review and update indexed folders list
- [ ] Collect user feedback
- [ ] Plan feature improvements

**Quarterly:**
- [ ] User satisfaction survey
- [ ] Review security compliance
- [ ] Update folder permissions as team changes
- [ ] Evaluate new feature requests

#### Common Support Issues

**Issue: "I can't see folder X"**
- Verify user has access in Google Drive
- Check folder ID is correct in settings
- Try "TeamBrain: Refresh Index"

**Issue: "Search is slow"**
- Check cache settings
- Verify network connection
- Review number of indexed folders (fewer = faster)
- Consider excluding large archived folders

**Issue: "Extension won't authenticate"**
- Verify using correct email (@company.com)
- Check PingID is working
- Try: "TeamBrain: Sign Out" then reconnect
- Check Google Workspace admin hasn't blocked app

**Issue: "Getting old/stale results"**
- Documents are cached for performance
- Run: "TeamBrain: Refresh Index"
- Check last sync time in status bar
- Verify document was actually updated in Drive

#### Metrics to Track

**Adoption:**
- Number of active users
- Daily/weekly active users
- Installation rate
- Retention rate

**Usage:**
- Searches per day
- Documents opened per day
- Most searched terms
- Most accessed documents

**Performance:**
- Average search response time
- Cache hit rate
- Error rate
- API quota usage

**Satisfaction:**
- Support ticket volume
- User feedback ratings
- Feature requests
- Time saved (survey)

---

## Development Roadmap

### Phase 1: MVP (Weeks 1-3)

**Week 1: Foundation**
- [ ] Project setup (TypeScript, pnpm, VS Code extension boilerplate)
- [ ] Implement AuthManager with VS Code Authentication API
- [ ] Basic DriveService wrapper (list, search, get content)
- [ ] Simple command: "Search Knowledge Base"
- [ ] Display results in Quick Pick

**Week 2: Core Features**
- [ ] Implement TreeView sidebar
- [ ] Add "Recent" and "Favorites" sections
- [ ] Document viewer (convert Google Docs to markdown)
- [ ] Basic caching layer
- [ ] Configuration settings

**Week 3: Polish & Testing**
- [ ] Error handling and user feedback
- [ ] Loading indicators and progress bars
- [ ] Unit tests for core services
- [ ] Integration tests
- [ ] Documentation (README, usage guide)

**Deliverable:** Working extension with search, view, and basic organization

### Phase 2: AI Features (Weeks 4-5)

**Week 4: Copilot Integration**
- [ ] Implement CopilotService wrapper
- [ ] "Ask Question" command with context
- [ ] Semantic search ranking
- [ ] Citation extraction from AI responses

**Week 5: Context Awareness**
- [ ] File path analysis for context detection
- [ ] Automatic suggestion system
- [ ] Suggestion notification UI
- [ ] Context preference learning

**Deliverable:** AI-powered search and suggestions

### Phase 3: Advanced Features (Weeks 6-7)

**Week 6: Performance**
- [ ] Optimized caching strategy
- [ ] Background indexing
- [ ] Incremental updates
- [ ] Performance monitoring

**Week 7: UX Enhancements**
- [ ] Keyboard shortcuts for power users
- [ ] Customizable folder indexing
- [ ] Search filters (date, type, folder)
- [ ] Export/share functionality

**Deliverable:** Production-ready extension

### Phase 4: Enterprise Features (Future)

**Post-Launch Enhancements:**
- [ ] Multi-workspace support
- [ ] Team collaboration features (shared favorites)
- [ ] Admin controls (centralized config)
- [ ] Analytics dashboard
- [ ] Custom embedding models for semantic search
- [ ] Bidirectional sync (write back to Drive)
- [ ] Slack/Teams integration
- [ ] API for other extensions to use

---

## Success Metrics

### User Adoption

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Active users | 25% of team | 60% of team | 80% of team |
| Daily active | 10 users | 30 users | 50 users |
| Searches/day | 50 | 200 | 400 |
| Docs opened/day | 30 | 150 | 300 |

### User Satisfaction

- **NPS Score:** Target >40 (promoters - detractors)
- **User Rating:** Target >4.5/5 stars on marketplace
- **Retention:** Target >70% monthly active users

### Business Impact

- **Time Saved:** 15-20 minutes/day per user (vs. manual Drive search)
- **Context Switches Reduced:** 50% fewer Drive tab opens
- **Onboarding Speed:** 30% faster for new engineers (easier doc discovery)
- **Incident Resolution:** 20% faster MTTR (quick access to runbooks)

### Technical Health

| Metric | Target | Current |
|--------|--------|---------|
| Error rate | <1% | TBD |
| API success rate | >99% | TBD |
| P95 search latency | <2s | TBD |
| Extension size | <10MB | TBD |
| Memory usage | <50MB | TBD |

### Feedback Collection

**Methods:**
1. In-app feedback button (sends to Slack/email)
2. Quarterly user survey
3. Usage analytics (anonymous, opt-in)
4. Office hours (weekly during first month)

**Key Questions:**
- How often do you use TeamBrain?
- What features do you use most?
- What's missing or frustrating?
- How much time does it save you?
- Would you recommend it to teammates?

---

## Open Questions & Decisions Needed

### Technical Decisions

1. **Embedding Model for Semantic Search:**
   - Option A: Use Copilot API (simple, but rate limited)
   - Option B: Local lightweight model (faster, more complex)
   - Option C: Keyword-based for MVP, upgrade later
   - **Recommendation:** Start with C, evaluate A/B after MVP

2. **Document Content Storage:**
   - Option A: Cache full content locally (fast, storage-heavy)
   - Option B: Fetch on-demand (slower, minimal storage)
   - Option C: Hybrid (metadata cached, content on-demand)
   - **Recommendation:** C - best balance

3. **Update Frequency:**
   - How often to sync with Drive for changes?
   - **Options:** On-demand, every 5 min, hourly, daily
   - **Recommendation:** Every 5 min when active, hourly when idle

### Product Decisions

4. **Scope for MVP:**
   - Should we include "Ask Question" in MVP or Phase 2?
   - **Recommendation:** Phase 2 - focus on solid search first

5. **Folder Configuration:**
   - Auto-index entire Drive or require folder selection?
   - **Recommendation:** Require folder selection to respect privacy and performance

6. **Pricing Model (if applicable):**
   - Free for all? Premium features? Enterprise only?
   - **Recommendation:** Free for entire organization initially

### Organizational Questions

7. **Security Review:**
   - Need formal security review before rollout?
   - Who needs to approve?
   - **Action:** Schedule review with security team

8. **Pilot Group:**
   - Which team(s) for initial rollout?
   - **Recommendation:** Platform engineering team (dogfooding)

9. **Support Plan:**
   - Who handles support questions?
   - Where should users report bugs?
   - **Recommendation:** Slack channel + GitHub issues

---

## Appendix A: Competitive Analysis

### Existing Solutions

| Solution | Pros | Cons | Why TeamBrain is Better |
|----------|------|------|-------------------------|
| **Manual Drive Search** | Native, familiar | Slow, context switching | Integrated, AI-powered |
| **Browser Extension** | Works in browser | Doesn't work in IDE | IDE-native, code-aware |
| **Notion/Confluence Integrations** | Good for those tools | Doesn't work with Drive | Designed for Google Workspace |
| **GitHub Copilot** | AI-powered | No Drive integration | Combines AI + Drive knowledge |

### Similar Tools (Other Platforms)

- **Raycast** (Mac productivity): Has Drive integration but not IDE-focused
- **Alfred** (Mac): Workflows can search Drive but not code-aware
- **JetBrains AI**: IDE-integrated but no Drive connection

**Our Differentiation:** Only solution combining VS Code + Google Drive + Copilot AI for platform engineers.

---

## Appendix B: API Reference

### Google Drive API Endpoints Used

```
GET  /drive/v3/files                    # List/search files
GET  /drive/v3/files/{fileId}           # Get file metadata
GET  /drive/v3/files/{fileId}/export    # Export Google Doc content
GET  /drive/v3/files/{fileId}?alt=media # Download file content
GET  /drive/v3/changes                  # Get changes (for sync)
```

### VS Code APIs Used

```typescript
// Authentication
vscode.authentication.getSession()
vscode.authentication.logout()

// Storage
vscode.workspace.getConfiguration()
context.globalState
context.secrets

// UI
vscode.window.createTreeView()
vscode.window.showQuickPick()
vscode.window.showInputBox()
vscode.window.createOutputChannel()

// Language Model
vscode.lm.selectChatModels()
model.sendRequest()

// Events
vscode.window.onDidChangeActiveTextEditor
vscode.workspace.onDidChangeConfiguration
```

---

## Appendix C: Example User Scenarios

### Scenario 1: New Engineer Onboarding

**User:** Sarah, new platform engineer (Week 1)

**Task:** Understand how the auth service works

**Without TeamBrain:**
1. Ask teammate for doc links (5 min)
2. Search Drive manually (10 min)
3. Open 5 different docs to find the right one (15 min)
4. Context switch between Drive and VS Code (constant)
**Total Time:** 30+ minutes

**With TeamBrain:**
1. Open auth service file in VS Code
2. Notification: "📚 Found 3 related docs"
3. Click to view inline suggestions
4. Open "Auth Service Architecture" doc
**Total Time:** 2 minutes

### Scenario 2: Incident Response

**User:** Mike, on-call engineer (Friday night)

**Task:** Resolve production database connection issue

**Without TeamBrain:**
1. Check error logs (2 min)
2. Remember there's a runbook somewhere (1 min)
3. Search Drive for "database runbook" (3 min)
4. Open 3 different docs to find right one (5 min)
5. Copy commands from doc, switch back to terminal (constant)
**Total Time:** 11+ minutes (during outage!)

**With TeamBrain:**
1. Check error logs (2 min)
2. Press Cmd+Shift+K, type "database connection troubleshooting"
3. Open "DB Connection Runbook" (first result)
4. Follow steps (already in VS Code terminal)
**Total Time:** 3 minutes

### Scenario 3: Code Review

**User:** Alex, senior engineer

**Task:** Review PR that adds new Kubernetes deployment

**Without TeamBrain:**
1. Review code changes (10 min)
2. Wonder if this follows our K8s standards
3. Search Drive for "kubernetes guidelines" (5 min)
4. Cross-reference PR with docs (10 min)
**Total Time:** 25 minutes

**With TeamBrain:**
1. Review code changes (10 min)
2. Press Cmd+Shift+?, ask "Does this follow our K8s deployment standards?"
3. AI responds with citations to relevant docs
4. Click through to verify specific requirements
**Total Time:** 12 minutes

---

## Appendix D: Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Google API rate limits** | Medium | Medium | Implement aggressive caching, batch requests |
| **Copilot API availability** | Low | High | Graceful degradation to keyword search |
| **User adoption low** | Medium | High | Strong onboarding, team demos, feedback loop |
| **Performance issues at scale** | Medium | Medium | Performance testing, optimization iteration |
| **Security concerns from IT** | Low | High | Early security review, minimal permissions |
| **Drive API changes** | Low | Medium | Use stable API version, monitor deprecations |
| **Token expiration issues** | Low | Low | VS Code handles refresh automatically |
| **Network connectivity** | Medium | Low | Offline mode with cached data |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-08 | Platform Team | Initial design document |

---

## Sign-off

**Prepared by:** Platform Engineering Team  
**Review Required From:**
- [ ] Security Team (OAuth/SSO review)
- [ ] IT Department (Google Workspace integration approval)
- [ ] Engineering Leadership (Resource allocation)
- [ ] Legal/Compliance (Data privacy review)

**Expected Review Timeline:** 1-2 weeks  
**Expected Development Start:** After approval  
**Expected MVP Launch:** 3 weeks after development start

---

**Questions or Feedback?**  
Contact: [Your Team Slack Channel] or [Email]

**Related Documents:**
- Google Drive API Documentation
- VS Code Extension API Guide
- Company Security Policies
- Engineering Standards Wiki
