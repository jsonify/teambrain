# TeamBrain Development Guide

Quick reference for developing the TeamBrain VS Code extension.

## Quick Start

### Method 1: Using VS Code Debugger (Recommended)
```bash
git pull
# Open project in VS Code, then press F5
```

The F5 key will automatically:
1. Compile TypeScript (`pnpm run compile`)
2. Launch Extension Development Host
3. Load your extension in a new VS Code window

### Method 2: Using the Dev Script
```bash
./dev-start.sh
# Then press F5 in VS Code
```

### Method 3: Manual Steps
```bash
git pull
pnpm install      # Only if dependencies changed
pnpm run compile
# Then press F5 in VS Code
```

## Common Commands

### Development
```bash
# Compile TypeScript
pnpm run compile

# Watch mode (auto-compile on changes)
pnpm run watch

# Lint code
pnpm run lint

# Run tests
pnpm run test
```

### Packaging
```bash
# Create VSIX package for distribution
pnpm run package

# This creates: teambrain-0.1.0.vsix
```

### Install Locally
```bash
# After creating VSIX
code --install-extension teambrain-0.1.0.vsix
```

## Project Structure

```
teambrain/
├── src/                    # TypeScript source code
│   ├── extension.ts        # Extension entry point
│   ├── commands/           # Command implementations
│   ├── services/           # Core services (auth, drive, cache)
│   ├── ui/                 # UI components (tree view)
│   ├── models/             # Type definitions and config
│   └── utils/              # Utility functions
├── test/                   # Test suite
├── out/                    # Compiled JavaScript (gitignored)
├── resources/              # Icons and assets
└── .vscode/                # VS Code configuration
    ├── launch.json         # Debug configurations
    └── tasks.json          # Build tasks
```

## Debugging

### Debug the Extension
1. Press **F5** (or Run > Start Debugging)
2. A new "Extension Development Host" window opens
3. Set breakpoints in your TypeScript code
4. Use the extension in the new window
5. Breakpoints will hit in your original VS Code window

### Debug Tests
1. Select "Extension Tests" from debug dropdown
2. Press **F5**
3. Tests will run with debugger attached

### View Extension Logs
- Open "Output" panel (`Ctrl+Shift+U` / `Cmd+Shift+U`)
- Select "TeamBrain" from dropdown
- All `outputChannel.appendLine()` messages appear here

## Testing the Extension

### Manual Testing Checklist
- [ ] Press `Ctrl+Shift+K` / `Cmd+Shift+K` to search
- [ ] Authenticate with Google Drive
- [ ] Search for documents
- [ ] Open a document from search results
- [ ] Check sidebar for Recent documents
- [ ] Add a document to Favorites
- [ ] Remove from Favorites
- [ ] Copy document link
- [ ] Sign out
- [ ] Re-authenticate

### Automated Tests
```bash
pnpm run test
```

## Git Workflow

### Development Branch
All work is done on feature branches following this pattern:
```
claude/feature-name-<session-id>
```

Current branch: `claude/finish-phase-one-011CUwqnLpMpFP48PC1E8PeB`

### Commit and Push
```bash
git add .
git commit -m "Your commit message"
git push
```

## Troubleshooting

### Extension Won't Load
1. Check for TypeScript compilation errors: `pnpm run compile`
2. Check for lint errors: `pnpm run lint`
3. Restart VS Code Extension Development Host

### Changes Not Appearing
1. Stop the Extension Development Host
2. Recompile: `pnpm run compile`
3. Press F5 again

### Authentication Issues
- The extension uses VS Code's built-in Google authentication
- Make sure you're signed into Google in your default browser
- Check the TeamBrain output channel for error messages

### Dependencies Changed
```bash
pnpm install
pnpm run compile
```

## VS Code Configuration

### Launch Configurations (F5)
- **Run Extension** - Launch extension in development mode
- **Extension Tests** - Run test suite with debugger

### Build Tasks
- **watch** - Auto-compile on file changes (default)
- **compile** - One-time compilation

### Keyboard Shortcuts
- `F5` - Start debugging
- `Ctrl+Shift+B` / `Cmd+Shift+B` - Run build task
- `Ctrl+Shift+U` / `Cmd+Shift+U` - Show Output panel

## Package.json Scripts

| Script | Description |
|--------|-------------|
| `compile` | Compile TypeScript to JavaScript |
| `watch` | Watch mode - auto-compile on changes |
| `lint` | Run ESLint |
| `test` | Run test suite |
| `package` | Create VSIX package |
| `vscode:prepublish` | Pre-publish hook (runs compile) |

## Configuration Files

- **tsconfig.json** - TypeScript compiler options
- **.eslintrc.json** - ESLint rules
- **package.json** - Extension manifest and dependencies
- **.vscodeignore** - Files to exclude from VSIX package
- **.gitignore** - Files to exclude from git

## Next Steps

### After Pulling Latest Code
```bash
git pull
pnpm install   # If package.json changed
pnpm run compile
# Press F5
```

### Before Creating PR
```bash
pnpm run lint     # Fix any lint errors
pnpm run test     # Ensure tests pass
pnpm run compile  # Ensure it compiles
git push
```

### Creating a Release
```bash
pnpm run package
# Creates: teambrain-0.1.0.vsix
# Install and test locally before publishing
```

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Google Drive API v3](https://developers.google.com/drive/api/v3/reference)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Project README](./README.md)
- [Phase 1 Task List](./dev-docs/tasks/phase-1-mvp.md)
