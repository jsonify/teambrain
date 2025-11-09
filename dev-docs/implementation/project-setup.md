# Project Setup Guide

This guide walks you through setting up the TeamBrain development environment from scratch.

## Prerequisites

- **Node.js:** 18.x or higher
- **pnpm:** 8.x or higher
- **VS Code:** 1.80.0 or higher
- **Git:** For version control
- **Google Account:** For testing authentication

## Initial Setup

### 1. Create Project Directory

```bash
mkdir teambrain
cd teambrain
git init
```

### 2. Initialize Package Manager

```bash
pnpm init
```

### 3. Install TypeScript

```bash
pnpm add -D typescript @types/node
pnpm tsc --init
```

### 4. Generate VS Code Extension Boilerplate

```bash
# Install Yeoman and VS Code extension generator
pnpm add -g yo generator-code

# Run generator
yo code

# Choose:
# - New Extension (TypeScript)
# - Name: teambrain
# - Identifier: teambrain
# - Description: Access your team's Google Drive knowledge base in VS Code
# - Initialize git: No (already done)
# - Package manager: pnpm
```

### 5. Install Core Dependencies

```bash
# Google Drive API client
pnpm add @googleapis/drive

# VS Code types and testing
pnpm add -D @types/vscode @vscode/test-electron

# Optional: Linting and formatting
pnpm add -D eslint prettier
```

## Project Structure

Create the following directory structure:

```bash
mkdir -p src/{commands,services,ui,models,utils}
mkdir -p test/suite
mkdir -p resources/icons
```

Final structure:

```
teambrain/
├── src/
│   ├── extension.ts              # Entry point
│   ├── commands/                 # Command implementations
│   │   ├── search.ts
│   │   ├── ask.ts
│   │   └── sync.ts
│   ├── services/                 # Core services
│   │   ├── auth.ts              # Authentication manager
│   │   ├── drive.ts             # Google Drive API wrapper
│   │   ├── copilot.ts           # Copilot API wrapper
│   │   ├── cache.ts             # Document cache
│   │   └── indexer.ts           # Background indexer
│   ├── ui/                       # UI components
│   │   ├── treeView.ts          # Sidebar tree view
│   │   ├── searchPanel.ts       # Search Quick Pick
│   │   ├── docViewer.ts         # Document viewer
│   │   └── suggestions.ts       # Context suggestions
│   ├── models/                   # Data models
│   │   ├── document.ts
│   │   ├── searchResult.ts
│   │   └── config.ts
│   └── utils/                    # Utilities
│       ├── logger.ts
│       ├── markdown.ts
│       └── filters.ts
├── test/
│   ├── suite/
│   │   ├── extension.test.ts
│   │   ├── auth.test.ts
│   │   ├── drive.test.ts
│   │   └── cache.test.ts
│   └── runTest.ts
├── resources/
│   └── icons/
│       └── icon.png
├── package.json
├── tsconfig.json
├── .vscodeignore
├── .gitignore
└── README.md
```

## Configuration Files

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "out",
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "out", "test"]
}
```

### package.json

Update with extension configuration:

```json
{
  "name": "teambrain",
  "displayName": "TeamBrain",
  "description": "Access your team's Google Drive knowledge base in VS Code",
  "version": "0.1.0",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onCommand:teambrain.search",
    "onView:teambrain.treeView"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "teambrain.search",
        "title": "TeamBrain: Search Knowledge Base"
      }
    ],
    "keybindings": [
      {
        "command": "teambrain.search",
        "key": "ctrl+shift+k",
        "mac": "cmd+shift+k"
      }
    ],
    "views": {
      "explorer": [
        {
          "id": "teambrain.treeView",
          "name": "TeamBrain"
        }
      ]
    },
    "configuration": {
      "title": "TeamBrain",
      "properties": {
        "teambrain.enableContextSuggestions": {
          "type": "boolean",
          "default": true,
          "description": "Show context-aware document suggestions"
        },
        "teambrain.cacheSize": {
          "type": "number",
          "default": 100,
          "description": "Maximum number of documents to cache"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "pnpm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "pnpm run compile",
    "test": "node ./out/test/runTest.js",
    "lint": "eslint src --ext ts",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "devDependencies": {
    "@types/node": "^18.x",
    "@types/vscode": "^1.80.0",
    "@vscode/test-electron": "^2.3.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  },
  "dependencies": {
    "@googleapis/drive": "^8.0.0"
  }
}
```

### .gitignore

```
node_modules/
out/
*.vsix
.vscode-test/
.env
*.log
```

### .vscodeignore

```
.vscode/**
.vscode-test/**
src/**
test/**
.gitignore
tsconfig.json
*.md
!README.md
```

## Create Entry Point

Create `src/extension.ts`:

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('TeamBrain is now active');

    // Register commands
    const searchCommand = vscode.commands.registerCommand(
        'teambrain.search',
        () => {
            vscode.window.showInformationMessage('Search command triggered!');
        }
    );

    context.subscriptions.push(searchCommand);
}

export function deactivate() {
    console.log('TeamBrain is now deactivated');
}
```

## Build and Test

### Compile

```bash
pnpm run compile
```

### Run Extension

1. Open VS Code in project directory
2. Press `F5` to launch Extension Development Host
3. In the new window, press `Cmd/Ctrl+Shift+P`
4. Run command: "TeamBrain: Search Knowledge Base"
5. You should see the info message

### Run Tests

```bash
pnpm run test
```

## Development Workflow

### 1. Daily Development

```bash
# Start watch mode
pnpm run watch
```

In VS Code:
- Press `F5` to launch Extension Development Host
- Make changes
- Press `Ctrl+R` (or `Cmd+R`) in Extension Development Host to reload

### 2. Testing Changes

```bash
# Run tests
pnpm run test

# Run specific test
pnpm run test -- --grep "AuthManager"
```

### 3. Linting and Formatting

```bash
# Check for issues
pnpm run lint

# Format code
pnpm run format
```

## Debugging

### VS Code Launch Configuration

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${defaultBuildTask}"
    },
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": [
        "${workspaceFolder}/out/test/**/*.js"
      ],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

### Debugging Tips

1. **Set Breakpoints:** Click left margin in VS Code
2. **Use Debug Console:** View variables and execute code
3. **Output Channel:** Create for logging

```typescript
const output = vscode.window.createOutputChannel('TeamBrain');
output.appendLine('Debug message');
output.show();
```

## Common Issues

### Issue: "Cannot find module 'vscode'"

**Solution:** Install types: `pnpm add -D @types/vscode`

### Issue: Extension doesn't activate

**Solution:** Check `activationEvents` in `package.json`

### Issue: Commands not appearing

**Solution:**
1. Verify command registered in `contributes.commands`
2. Reload Extension Development Host

### Issue: TypeScript errors

**Solution:**
1. Run `pnpm run compile` to see errors
2. Check `tsconfig.json` configuration
3. Ensure all dependencies installed

## Next Steps

After setup complete:

1. **Start Phase 1:** [Phase 1 Tasks](../tasks/phase-1-mvp.md)
2. **Read Architecture:** [Component Overview](../architecture/component-overview.md)
3. **Review Design:** [Features Specification](../design/features.md)

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Google Drive API Docs](https://developers.google.com/drive/api/v3/about-sdk)

---

**Setup Complete!** Ready to start development.
