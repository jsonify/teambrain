# TeamBrain - Google Drive for VS Code

Access and search your Google Drive documents directly from Visual Studio Code.

## Features

- **🔍 Smart Search**: Search your Google Drive documents instantly with results displayed in VS Code
- **📄 Document Viewer**: View Google Docs, Sheets, and other files as markdown in VS Code
- **⭐ Favorites**: Mark frequently accessed documents as favorites for quick access
- **🕐 Recent Documents**: Track your recently opened documents
- **⚡ Fast Caching**: Intelligent caching for improved performance
- **🔐 Secure Authentication**: Uses VS Code's built-in authentication for Google Drive
- **⚙️ Configurable**: Customize indexed folders, cache settings, and more

## Installation

### From VSIX (Development)

1. Download the latest `.vsix` file
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the "..." menu → "Install from VSIX..."
5. Select the downloaded file

## Getting Started

1. **Authenticate**: Click the TeamBrain icon in the status bar or press `Ctrl+Shift+K` (Mac: `Cmd+Shift+K`) to start searching
2. **Search**: Enter your search query to find documents
3. **View**: Click on any result to view the document in VS Code
4. **Organize**: Add documents to favorites or view your recent documents in the sidebar

## Usage

### Searching Documents

- Press `Ctrl+Shift+K` (Mac: `Cmd+Shift+K`) or use the command palette: "TeamBrain: Search Google Drive"
- Enter your search terms
- Select a document from the results to open it

### Managing Favorites

- Right-click on any document in the sidebar
- Select "Add to Favorites"
- View favorites in the TeamBrain sidebar under the "Favorites" section

### Recent Documents

The TeamBrain sidebar automatically tracks your 20 most recently opened documents for quick access.

## Configuration

Configure TeamBrain in VS Code settings (`Preferences: Open Settings` → search for "TeamBrain"):

### Available Settings

```json
{
  // List of Google Drive folder IDs to search within
  "teambrain.indexedFolders": [],

  // Patterns to exclude from search results
  "teambrain.excludePatterns": ["*.tmp", "~*"],

  // Maximum number of documents to cache
  "teambrain.cacheSize": 100,

  // Cache time-to-live in seconds (default: 1 hour)
  "teambrain.cacheTTL": 3600,

  // Enable AI-powered context suggestions (future feature)
  "teambrain.enableContextSuggestions": true,

  // Maximum number of search results to display
  "teambrain.maxSearchResults": 50
}
```

### Configuring Indexed Folders

To search within specific Google Drive folders:

1. Open your Google Drive in a browser
2. Navigate to the folder you want to index
3. Copy the folder ID from the URL (the part after `/folders/`)
4. Add the ID to `teambrain.indexedFolders` in settings

Example:
```json
{
  "teambrain.indexedFolders": [
    "1a2b3c4d5e6f7g8h9i0j",
    "9i8h7g6f5e4d3c2b1a0"
  ]
}
```

## Commands

All commands are available via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| TeamBrain: Search Google Drive | Search for documents | `Ctrl+Shift+K` (Mac: `Cmd+Shift+K`) |
| TeamBrain: Refresh | Clear cache and refresh | - |
| TeamBrain: Sign Out | Sign out of Google Drive | - |

## Sidebar

The TeamBrain sidebar provides quick access to:

- **Search**: Click to open search
- **Recent**: Your 20 most recently viewed documents
- **Favorites**: Documents you've starred
- **Quick Access**: Frequently accessed folders (coming soon)

## Privacy & Security

- TeamBrain uses VS Code's built-in authentication system
- Only requests read-only access to your Google Drive
- All authentication is handled by Google's OAuth
- No credentials are stored by the extension
- Documents are cached locally only during your session

## Troubleshooting

### Authentication Issues

**Problem**: Cannot authenticate with Google Drive

**Solution**:
1. Open Command Palette
2. Run "TeamBrain: Sign Out"
3. Try searching again to re-authenticate
4. Make sure you're signed in to Google in your default browser

### Search Returns No Results

**Problem**: Search isn't finding documents

**Solution**:
1. Check your search terms
2. If you have `indexedFolders` configured, verify the folder IDs are correct
3. Try removing folder restrictions temporarily
4. Use the "TeamBrain: Refresh" command to clear cache

### Documents Not Loading

**Problem**: Documents fail to open or display incorrectly

**Solution**:
1. Use "TeamBrain: Refresh" to clear cache
2. Check your internet connection
3. Try opening the document in Google Drive web to verify access
4. Some document types may not convert well to plain text

## Known Limitations

- Currently exports Google Docs as plain text (rich formatting is not preserved)
- Images in documents are not displayed
- Some Google Workspace file types may have limited support
- Binary files (PDFs, images, etc.) open in browser instead of in VS Code

## Roadmap

### Phase 2 (Coming Soon)
- 🤖 AI-powered document suggestions based on your code context
- 📊 Enhanced support for Google Sheets with table formatting
- 🖼️ Image preview support

### Phase 3 (Future)
- ✏️ Edit documents directly from VS Code
- 🔄 Real-time collaboration features
- 📱 Mobile document preview

## Contributing

TeamBrain is in active development. Please report issues or suggest features through GitHub issues.

## Support

For questions or issues:
1. Check the Troubleshooting section above
2. Review the documentation
3. File an issue on GitHub

## License

See LICENSE file for details.

## Acknowledgments

- Built with the VS Code Extension API
- Uses Google Drive API v3
- Icons from VS Code's Codicons

---

**Enjoy using TeamBrain!** 🧠
