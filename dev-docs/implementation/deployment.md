# Deployment Guide

Guide for packaging and publishing TeamBrain to VS Code Marketplace.

## Prerequisites

- Extension fully tested
- Documentation complete
- Version number decided
- Publisher account created

## Packaging

### 1. Install vsce

```bash
pnpm add -g @vscode/vsce
```

### 2. Prepare package.json

Ensure all fields are complete:

```json
{
  "name": "teambrain",
  "displayName": "TeamBrain",
  "description": "Access your team's Google Drive knowledge base in VS Code",
  "version": "1.0.0",
  "publisher": "your-publisher-id",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Other"],
  "keywords": ["google-drive", "documentation", "knowledge-base", "ai"],
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/teambrain"
  },
  "license": "MIT",
  "icon": "resources/icon.png"
}
```

### 3. Configure .vscodeignore

```
.vscode/**
.vscode-test/**
src/**
test/**
node_modules/**
.gitignore
.yarnrc
tsconfig.json
vsc-extension-quickstart.md
*.vsix
dev-docs/**
.github/**
```

### 4. Create Package

```bash
# Compile first
pnpm run compile

# Create package
vsce package

# Output: teambrain-1.0.0.vsix
```

### 5. Test VSIX Locally

```bash
# Install in VS Code
code --install-extension teambrain-1.0.0.vsix

# Test thoroughly
# Uninstall when done
code --uninstall-extension publisher.teambrain
```

## Publishing to Marketplace

### 1. Create Publisher Account

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with Microsoft account
3. Create publisher (e.g., "your-company")

### 2. Get Personal Access Token

1. Go to https://dev.azure.com
2. User Settings → Personal Access Tokens
3. Create new token with Marketplace (Manage) scope
4. Save token securely

### 3. Login with vsce

```bash
vsce login your-publisher-id
# Enter your Personal Access Token
```

### 4. Publish

```bash
# Publish current version
vsce publish

# Or publish with version bump
vsce publish minor  # 1.0.0 → 1.1.0
vsce publish patch  # 1.0.0 → 1.0.1
vsce publish major  # 1.0.0 → 2.0.0
```

### 5. Verify

- Check marketplace: https://marketplace.visualstudio.com/items?itemName=publisher.teambrain
- Install from marketplace
- Test functionality

## Automated Publishing with GitHub Actions

`.github/workflows/publish.yml`:

```yaml
name: Publish Extension

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm run compile
      - run: pnpm run test

      - name: Publish to Marketplace
        run: pnpm vsce publish -p ${{ secrets.VSCE_TOKEN }}
        env:
          VSCE_TOKEN: ${{ secrets.VSCE_TOKEN }}
```

Store PAT in GitHub Secrets as `VSCE_TOKEN`.

## Version Management

### Semantic Versioning

- **Major (1.0.0):** Breaking changes
- **Minor (0.1.0):** New features, backwards compatible
- **Patch (0.0.1):** Bug fixes

### Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Create git tag: `git tag v1.0.0`
5. Push tag: `git push --tags`
6. GitHub Action publishes automatically

## Enterprise Deployment

### Internal Distribution

For organizations that don't use public marketplace:

1. Package extension: `vsce package`
2. Distribute .vsix via internal channels
3. Users install: `code --install-extension teambrain-1.0.0.vsix`

### Custom OAuth Client

1. Create Google Cloud Project
2. Set up OAuth consent screen
3. Create OAuth client ID
4. Configure redirect URI
5. Update extension with custom client ID

## Rollback

If critical issue found after publish:

```bash
# Unpublish version
vsce unpublish your-publisher.teambrain@1.0.0

# Users on that version will keep it, but new installs blocked
```

## Monitoring Post-Release

- Install count
- Error reports
- User reviews
- GitHub issues

## Changelog Format

```markdown
# Changelog

## [1.0.0] - 2025-11-15

### Added
- Initial release
- Google Drive integration
- AI-powered search
- Context-aware suggestions

### Changed
- N/A

### Fixed
- N/A
```

## Pre-Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version number incremented
- [ ] Icon and screenshots ready
- [ ] Marketplace description written
- [ ] LICENSE file included
- [ ] README complete

---

**Ready to publish!**
