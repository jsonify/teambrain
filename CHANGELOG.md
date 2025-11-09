# Change Log

All notable changes to the TeamBrain extension will be documented in this file.

## [0.1.0] - 2025-11-09

### Added - Phase 1 MVP

#### Core Features
- ✅ Google Drive authentication using VS Code authentication API
- ✅ Document search functionality with customizable search parameters
- ✅ Quick Pick UI for displaying search results
- ✅ Document viewer with markdown conversion
- ✅ Status bar integration showing connection status
- ✅ Welcome experience for first-time users

#### Sidebar Components
- ✅ TreeView sidebar with collapsible sections
- ✅ Recent documents tracking (last 20 documents)
- ✅ Favorites management (add/remove documents)
- ✅ Context menu actions (Open, Copy Link, Favorites)
- ✅ Quick Access section (placeholder for future features)

#### Services & Infrastructure
- ✅ AuthManager for handling Google OAuth
- ✅ DriveService wrapper for Google Drive API v3
- ✅ LRU cache implementation with TTL support
- ✅ Search result caching
- ✅ Document content caching
- ✅ Configuration management with live updates

#### Commands
- ✅ `teambrain.search` - Search Google Drive (Ctrl+Shift+K / Cmd+Shift+K)
- ✅ `teambrain.openDocument` - Open document in VS Code
- ✅ `teambrain.refresh` - Clear cache and refresh
- ✅ `teambrain.addToFavorites` - Add document to favorites
- ✅ `teambrain.removeFromFavorites` - Remove from favorites
- ✅ `teambrain.copyLink` - Copy Google Drive link to clipboard
- ✅ `teambrain.signOut` - Sign out of Google Drive

#### Configuration Options
- ✅ `indexedFolders` - Specify folders to search within
- ✅ `excludePatterns` - File patterns to exclude
- ✅ `cacheSize` - Maximum cache size
- ✅ `cacheTTL` - Cache time-to-live
- ✅ `enableContextSuggestions` - AI suggestions (reserved for Phase 2)
- ✅ `maxSearchResults` - Maximum search results

#### Developer Experience
- ✅ TypeScript project setup with strict mode
- ✅ ESLint configuration
- ✅ Test infrastructure with Mocha
- ✅ Unit tests for cache service
- ✅ Unit tests for markdown utilities
- ✅ Integration tests for extension activation
- ✅ Comprehensive documentation (README, CHANGELOG)

#### Error Handling & UX
- ✅ User-friendly error messages
- ✅ Progress indicators for long operations
- ✅ Loading states in Quick Pick and TreeView
- ✅ Output channel for debugging
- ✅ Authentication state management
- ✅ Graceful handling of API errors

### Technical Details

#### Supported File Types
- Google Docs (exported as plain text)
- Google Sheets (exported as CSV)
- Google Slides (exported as plain text)
- Regular text files

#### Performance
- In-memory LRU caching with configurable size
- 1-hour default TTL for cached content
- Search results cached per query
- Recent documents persisted in workspace state

#### Security
- Read-only access to Google Drive
- OAuth handled by VS Code authentication API
- No credential storage in extension
- Secure API communication via Google APIs

### Known Issues
- Google Docs rich formatting is not preserved (plain text export only)
- Images in documents are not displayed
- Some binary file types open in browser instead of VS Code
- Code blocks in documents need manual formatting markers

### Technical Debt
- Document export could be enhanced with better formatting preservation
- Need to add more comprehensive error recovery
- Could benefit from retry logic for API calls
- Test coverage could be expanded beyond unit tests

---

## Upcoming in Phase 2

### Planned Features
- 🤖 AI-powered context suggestions
- 📊 Better formatting for spreadsheets
- 🔍 Advanced search filters
- 🖼️ Image preview support
- 📝 Rich text formatting preservation
- 🔄 Incremental folder indexing

---

**Version Format**: [Major.Minor.Patch]
- **Major**: Breaking changes
- **Minor**: New features
- **Patch**: Bug fixes
