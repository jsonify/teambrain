# Configuration Reference

All configuration options for TeamBrain extension.

## Access Settings

**Via UI:**
1. `Cmd/Ctrl+,` to open Settings
2. Search for "TeamBrain"
3. Configure options

**Via settings.json:**
```json
{
  "teambrain.setting": "value"
}
```

## General Settings

### teambrain.enableContextSuggestions

**Type:** `boolean`
**Default:** `true`

Enable automatic context-aware document suggestions.

```json
{
  "teambrain.enableContextSuggestions": true
}
```

When enabled, TeamBrain shows relevant document suggestions based on the file you're editing.

---

### teambrain.autoIndexOnStartup

**Type:** `boolean`
**Default:** `true`

Automatically index configured folders when VS Code starts.

```json
{
  "teambrain.autoIndexOnStartup": true
}
```

---

### teambrain.autoOpenLinks

**Type:** `boolean`
**Default:** `false`

Automatically open document links in VS Code instead of browser.

```json
{
  "teambrain.autoOpenLinks": false
}
```

When `true`, clicking Google Drive links opens in VS Code document viewer.
When `false`, opens in system browser.

---

## Search Settings

### teambrain.searchResultLimit

**Type:** `number`
**Default:** `50`
**Range:** 1-100

Maximum number of search results to display.

```json
{
  "teambrain.searchResultLimit": 50
}
```

---

### teambrain.enableSemanticSearch

**Type:** `boolean`
**Default:** `true`

Use AI-powered semantic search for better relevance.

```json
{
  "teambrain.enableSemanticSearch": true
}
```

**Requires:** GitHub Copilot subscription

---

## Caching Settings

### teambrain.cacheSize

**Type:** `number`
**Default:** `100`
**Range:** 10-500

Maximum number of documents to cache in memory.

```json
{
  "teambrain.cacheSize": 100
}
```

Higher values = more memory usage but better performance.

---

### teambrain.cacheExpiry

**Type:** `number`
**Default:** `3600000` (1 hour)
**Unit:** milliseconds

How long to cache documents before refetching.

```json
{
  "teambrain.cacheExpiry": 3600000
}
```

---

## Indexing Settings

### teambrain.indexedFolders

**Type:** `array`
**Default:** `[]`

Google Drive folders to index and search.

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
    }
  ]
}
```

**How to get folder ID:**
1. Open folder in Google Drive (web)
2. Look at URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
3. Copy the ID after `/folders/`

---

### teambrain.excludePatterns

**Type:** `array`
**Default:** `[]`

Glob patterns for files/folders to exclude from indexing.

```json
{
  "teambrain.excludePatterns": [
    "Archive/*",
    "Personal/*",
    "Draft/*",
    "Old/*",
    "*.tmp"
  ]
}
```

---

### teambrain.syncInterval

**Type:** `number`
**Default:** `300000` (5 minutes)
**Unit:** milliseconds

How often to sync changes from Google Drive.

```json
{
  "teambrain.syncInterval": 300000
}
```

Set to `0` to disable automatic syncing (manual only).

---

## Suggestion Settings

### teambrain.suggestionDelay

**Type:** `number`
**Default:** `2000` (2 seconds)
**Unit:** milliseconds

Delay before showing context suggestions after opening a file.

```json
{
  "teambrain.suggestionDelay": 2000
}
```

Prevents suggestions from appearing too quickly.

---

### teambrain.maxSuggestions

**Type:** `number`
**Default:** `5`
**Range:** 1-10

Maximum number of suggestions to show at once.

```json
{
  "teambrain.maxSuggestions": 5
}
```

---

## UI Settings

### teambrain.notifyOnUpdates

**Type:** `boolean`
**Default:** `true`

Show notifications when indexed documents are updated.

```json
{
  "teambrain.notifyOnUpdates": true
}
```

---

### teambrain.showStatusBar

**Type:** `boolean`
**Default:** `true`

Show TeamBrain status in status bar.

```json
{
  "teambrain.showStatusBar": true
}
```

---

## Advanced Settings

### teambrain.logLevel

**Type:** `string`
**Default:** `"info"`
**Options:** `"debug"`, `"info"`, `"warn"`, `"error"`

Logging level for extension.

```json
{
  "teambrain.logLevel": "info"
}
```

Set to `"debug"` for troubleshooting.

---

### teambrain.apiTimeout

**Type:** `number`
**Default:** `30000` (30 seconds)
**Unit:** milliseconds

Timeout for Google Drive API requests.

```json
{
  "teambrain.apiTimeout": 30000
}
```

---

## Workspace vs User Settings

### User Settings
Apply to all workspaces (global):
- `cacheSize`
- `autoOpenLinks`
- `logLevel`

### Workspace Settings
Apply to current workspace only:
- `indexedFolders`
- `excludePatterns`
- `enableContextSuggestions`

**Recommended:** Configure `indexedFolders` in workspace settings so each project has relevant folders.

## Example Complete Configuration

```json
{
  // General
  "teambrain.enableContextSuggestions": true,
  "teambrain.autoIndexOnStartup": true,
  "teambrain.autoOpenLinks": false,

  // Search
  "teambrain.searchResultLimit": 50,
  "teambrain.enableSemanticSearch": true,

  // Caching
  "teambrain.cacheSize": 100,
  "teambrain.cacheExpiry": 3600000,

  // Indexing
  "teambrain.indexedFolders": [
    {
      "id": "1abc123xyz456",
      "name": "Engineering Wiki"
    }
  ],
  "teambrain.excludePatterns": ["Archive/*", "Personal/*"],
  "teambrain.syncInterval": 300000,

  // Suggestions
  "teambrain.suggestionDelay": 2000,
  "teambrain.maxSuggestions": 5,

  // UI
  "teambrain.notifyOnUpdates": true,
  "teambrain.showStatusBar": true,

  // Advanced
  "teambrain.logLevel": "info",
  "teambrain.apiTimeout": 30000
}
```

## Related Documents

- [Commands](commands.md)
- [Keyboard Shortcuts](keyboard-shortcuts.md)
- [Features Specification](../design/features.md)
