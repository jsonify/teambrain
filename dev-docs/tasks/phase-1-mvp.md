# Phase 1: Foundation & MVP (Weeks 1-3)

**Goal:** Working extension with core search, authentication, and document viewing

**Duration:** 3 weeks
**Status:** Not Started

---

## Week 1: Core Infrastructure

### Setup & Configuration

- [ ] **Task 1.1:** Initialize TypeScript project
  - Create project directory
  - Run `pnpm init`
  - Install TypeScript: `pnpm add -D typescript @types/node`
  - Create `tsconfig.json`
  - **Estimated Time:** 1 hour

- [ ] **Task 1.2:** Set up VS Code extension boilerplate
  - Install Yeoman: `pnpm add -g yo generator-code`
  - Run generator: `yo code`
  - Configure `package.json` manifest
  - Set up activation events
  - **Estimated Time:** 2 hours

- [ ] **Task 1.3:** Install core dependencies
  ```bash
  pnpm add @googleapis/drive
  pnpm add -D @types/vscode @vscode/test-electron
  ```
  - **Estimated Time:** 30 minutes

- [ ] **Task 1.4:** Create project folder structure
  ```
  src/
  ├── extension.ts
  ├── commands/
  ├── services/
  ├── ui/
  ├── models/
  └── utils/
  test/
  resources/
  ```
  - **Estimated Time:** 30 minutes

### Authentication Implementation

- [ ] **Task 1.5:** Implement AuthManager class
  - File: `src/services/auth.ts`
  - Methods:
    - `getSession()`: Get OAuth session
    - `isAuthenticated()`: Check auth status
    - `signOut()`: Clear session
    - `getAccessToken()`: Get token for API calls
  - **Estimated Time:** 4 hours
  - **Reference:** [Authentication Design](../design/authentication.md)

- [ ] **Task 1.6:** Test authentication flow
  - Manual test: Login flow
  - Manual test: Token persistence
  - Manual test: Sign out
  - **Estimated Time:** 2 hours

### Google Drive Integration

- [ ] **Task 1.7:** Create DriveService wrapper
  - File: `src/services/drive.ts`
  - Methods:
    - `initialize(accessToken)`: Set up API client
    - `searchFiles(query)`: Search Drive
    - `getFileContent(fileId)`: Fetch file content
    - `getFileMetadata(fileId)`: Get file metadata
    - `listFolder(folderId)`: List folder contents
  - **Estimated Time:** 6 hours

- [ ] **Task 1.8:** Implement file export handling
  - Export Google Docs to plain text
  - Handle different MIME types
  - Error handling for unsupported types
  - **Estimated Time:** 3 hours

### Basic Search Command

- [ ] **Task 1.9:** Create search command
  - File: `src/commands/search.ts`
  - Register command: `teambrain.search`
  - Show input box for query
  - Call DriveService to search
  - **Estimated Time:** 3 hours

- [ ] **Task 1.10:** Build Quick Pick UI
  - File: `src/ui/searchPanel.ts`
  - Display search results
  - Show file name, type, modified date
  - Handle selection
  - **Estimated Time:** 4 hours

**Week 1 Total:** ~26 hours

---

## Week 2: UI Components

### Sidebar TreeView

- [ ] **Task 2.1:** Create TreeView data provider
  - File: `src/ui/treeView.ts`
  - Implement `TreeDataProvider` interface
  - Root sections: Search, Favorites, Recent, Quick Access, Settings
  - **Estimated Time:** 5 hours

- [ ] **Task 2.2:** Implement Recent Documents section
  - Track document access
  - Store in workspace state
  - Display with timestamps
  - **Estimated Time:** 3 hours

- [ ] **Task 2.3:** Implement Favorites section
  - Add to favorites action
  - Store in workspace state
  - Remove from favorites
  - Drag-and-drop reordering
  - **Estimated Time:** 4 hours

- [ ] **Task 2.4:** Add context menu actions
  - Right-click menu
  - Actions: Open, Copy Link, Add/Remove Favorite, Refresh
  - **Estimated Time:** 2 hours

- [ ] **Task 2.5:** Register TreeView in extension
  - Update `package.json` with view contribution
  - Register in `extension.ts`
  - Add activity bar icon
  - **Estimated Time:** 2 hours

### Document Viewer

- [ ] **Task 2.6:** Create markdown converter
  - File: `src/utils/markdown.ts`
  - Convert Google Docs to markdown
  - Handle code blocks
  - Handle links
  - Basic image support
  - **Estimated Time:** 5 hours

- [ ] **Task 2.7:** Implement document viewer
  - File: `src/ui/docViewer.ts`
  - Create webview or text document
  - Display converted content
  - Syntax highlighting for code
  - **Estimated Time:** 4 hours

- [ ] **Task 2.8:** Add document open command
  - Register command: `teambrain.openDocument`
  - Fetch content from Drive
  - Convert and display
  - Track access for Recent section
  - **Estimated Time:** 3 hours

### Caching System

- [ ] **Task 2.9:** Implement DocumentCache class
  - File: `src/services/cache.ts`
  - In-memory LRU cache
  - Max 100 documents
  - 1-hour TTL
  - Methods: `get()`, `set()`, `clear()`
  - **Estimated Time:** 4 hours

- [ ] **Task 2.10:** Integrate caching
  - Cache search results
  - Cache document content
  - Cache metadata
  - **Estimated Time:** 2 hours

### Configuration

- [ ] **Task 2.11:** Define configuration schema
  - Update `package.json` with settings
  - Configuration options:
    - `indexedFolders`
    - `excludePatterns`
    - `cacheSize`
    - `enableContextSuggestions`
  - **Estimated Time:** 2 hours

- [ ] **Task 2.12:** Implement configuration loading
  - File: `src/models/config.ts`
  - Load from workspace settings
  - Provide defaults
  - Watch for changes
  - **Estimated Time:** 2 hours

**Week 2 Total:** ~38 hours

---

## Week 3: Polish & Testing

### Error Handling & UX

- [ ] **Task 3.1:** Implement comprehensive error handling
  - Try-catch blocks throughout
  - User-friendly error messages
  - Log errors to output channel
  - **Estimated Time:** 4 hours

- [ ] **Task 3.2:** Add loading indicators
  - Progress notifications for long operations
  - Quick Pick loading state
  - TreeView loading state
  - **Estimated Time:** 3 hours

- [ ] **Task 3.3:** Create welcome experience
  - First-time user detection
  - Welcome notification
  - Quick start guide
  - Link to documentation
  - **Estimated Time:** 3 hours

- [ ] **Task 3.4:** Add status bar integration
  - Show connection status
  - Show indexed document count
  - Show last sync time
  - Click for quick actions
  - **Estimated Time:** 3 hours

### Testing

- [ ] **Task 3.5:** Set up testing infrastructure
  - Configure `@vscode/test-electron`
  - Create test runner
  - Set up test environment
  - **Estimated Time:** 2 hours

- [ ] **Task 3.6:** Write AuthManager tests
  - File: `test/suite/auth.test.ts`
  - Test: `getSession()` returns session
  - Test: `isAuthenticated()` works
  - Test: `signOut()` clears session
  - **Estimated Time:** 3 hours

- [ ] **Task 3.7:** Write DriveService tests
  - File: `test/suite/drive.test.ts`
  - Test: File search works
  - Test: Content retrieval works
  - Test: Error handling
  - Mock Google API
  - **Estimated Time:** 4 hours

- [ ] **Task 3.8:** Write DocumentCache tests
  - File: `test/suite/cache.test.ts`
  - Test: LRU eviction
  - Test: TTL expiry
  - Test: Get/Set operations
  - **Estimated Time:** 2 hours

- [ ] **Task 3.9:** Write integration tests
  - File: `test/suite/integration.test.ts`
  - Test: End-to-end search flow
  - Test: Document open flow
  - Test: TreeView interactions
  - **Estimated Time:** 4 hours

- [ ] **Task 3.10:** Test extension activation
  - File: `test/suite/extension.test.ts`
  - Test: Extension activates
  - Test: Commands registered
  - Test: Views registered
  - **Estimated Time:** 2 hours

### Documentation

- [ ] **Task 3.11:** Create README.md
  - Installation instructions
  - Features overview
  - Basic usage
  - Configuration
  - Troubleshooting
  - **Estimated Time:** 3 hours

- [ ] **Task 3.12:** Add JSDoc comments
  - Document all public methods
  - Add examples
  - Type annotations
  - **Estimated Time:** 3 hours

- [ ] **Task 3.13:** Create CHANGELOG.md
  - Version 0.1.0 entry
  - List all features
  - Known issues
  - **Estimated Time:** 1 hour

**Week 3 Total:** ~37 hours

---

## Phase 1 Deliverables

### Functional Requirements

✅ User can authenticate with Google Drive
✅ User can search documents
✅ User can view search results
✅ User can open documents in VS Code
✅ User can see recent documents
✅ User can favorite documents
✅ User can configure folders to index
✅ Results are cached for performance

### Technical Requirements

✅ TypeScript project set up
✅ VS Code extension manifest configured
✅ Authentication via VS Code API
✅ Google Drive API integrated
✅ Basic UI components working
✅ Caching implemented
✅ Error handling in place
✅ Tests passing

### Success Criteria

- [ ] Extension can be installed locally
- [ ] User can authenticate successfully
- [ ] Search returns results in <3 seconds
- [ ] Documents display correctly
- [ ] No critical bugs
- [ ] Test coverage >50%
- [ ] Basic documentation complete

---

## Testing Checklist

### Manual Testing

- [ ] Install extension from VSIX
- [ ] Authenticate with Google account
- [ ] Run search command (Cmd+Shift+K)
- [ ] Verify search results appear
- [ ] Select and open a document
- [ ] Verify document displays correctly
- [ ] Add document to favorites
- [ ] Verify favorite appears in sidebar
- [ ] Recent documents update
- [ ] Sign out and verify session cleared
- [ ] Re-authenticate

### Automated Testing

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] No TypeScript errors
- [ ] No linting errors

---

## Known Issues / Technical Debt

Document any issues or shortcuts taken:

- [ ] Issue: ___
- [ ] Technical Debt: ___

---

## Next Phase

After Phase 1 completion, proceed to:
- [Phase 2: AI Features](phase-2-ai-features.md)

---

**Phase 1 Status:** Not Started
**Last Updated:** 2025-11-09
