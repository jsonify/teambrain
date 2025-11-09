# Testing Guide

Comprehensive testing strategy for TeamBrain extension.

## Test Levels

### 1. Unit Tests
- Test individual functions and classes
- Mock external dependencies
- Fast execution (<1s per test)

### 2. Integration Tests
- Test component interactions
- Mock VS Code API minimally
- Medium execution (1-5s per test)

### 3. End-to-End Tests
- Test complete user flows
- Minimal mocking
- Slow execution (5-30s per test)

## Test Structure

```
test/
├── suite/
│   ├── index.ts                 # Test runner
│   ├── extension.test.ts        # Extension activation
│   ├── auth.test.ts             # Authentication tests
│   ├── drive.test.ts            # Drive service tests
│   ├── cache.test.ts            # Cache tests
│   ├── copilot.test.ts          # Copilot tests
│   ├── search.test.ts           # Search command tests
│   └── integration.test.ts      # Integration tests
└── runTest.ts                   # Test launcher
```

## Setup

### Install Dependencies

```bash
pnpm add -D @vscode/test-electron mocha @types/mocha chai @types/chai sinon @types/sinon
```

### Test Runner Configuration

`test/runTest.ts`:

```typescript
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath
        });
    } catch (err) {
        console.error('Failed to run tests');
        process.exit(1);
    }
}

main();
```

`test/suite/index.ts`:

```typescript
import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000
    });

    const testsRoot = path.resolve(__dirname, '.');

    return new Promise((resolve, reject) => {
        glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
            if (err) {
                return reject(err);
            }

            files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

            try {
                mocha.run(failures => {
                    if (failures > 0) {
                        reject(new Error(`${failures} tests failed.`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    });
}
```

## Writing Tests

### Unit Test Example: AuthManager

`test/suite/auth.test.ts`:

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { AuthManager } from '../../services/auth';

suite('AuthManager Tests', () => {
    let authManager: AuthManager;
    let getSessionStub: sinon.SinonStub;

    setup(() => {
        authManager = new AuthManager();
        getSessionStub = sinon.stub(vscode.authentication, 'getSession');
    });

    teardown(() => {
        sinon.restore();
    });

    test('getSession returns session when authenticated', async () => {
        const mockSession = {
            id: 'test-session',
            accessToken: 'test-token',
            account: { id: 'user-id', label: 'test@example.com' },
            scopes: []
        };

        getSessionStub.resolves(mockSession);

        const session = await authManager.getSession();

        assert.ok(session);
        assert.strictEqual(session.accessToken, 'test-token');
    });

    test('isAuthenticated returns true when session exists', async () => {
        getSessionStub.resolves({ id: '1', accessToken: 'token' });

        const isAuth = await authManager.isAuthenticated();

        assert.strictEqual(isAuth, true);
    });

    test('isAuthenticated returns false when no session', async () => {
        getSessionStub.resolves(undefined);

        const isAuth = await authManager.isAuthenticated();

        assert.strictEqual(isAuth, false);
    });
});
```

### Integration Test Example: Search Flow

`test/suite/integration.test.ts`:

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Integration Tests', () => {
    test('Search command executes end-to-end', async () => {
        // Activate extension
        await vscode.commands.executeCommand('teambrain.search');

        // Verify Quick Pick appears
        // (In real test, you'd verify UI state)

        // Simulate user input
        // Execute search
        // Verify results

        assert.ok(true); // Placeholder
    });
});
```

## Mocking Strategies

### Mock Google Drive API

```typescript
import * as sinon from 'sinon';
import { DriveService } from '../../services/drive';

// Mock Drive API responses
const mockSearchResponse = {
    data: {
        files: [
            {
                id: 'file-1',
                name: 'Test Document.docx',
                mimeType: 'application/vnd.google-apps.document',
                modifiedTime: '2025-01-01T00:00:00.000Z'
            }
        ]
    }
};

// Stub the API method
const stub = sinon.stub(DriveService.prototype, 'searchFiles');
stub.resolves(mockSearchResponse.data.files);
```

### Mock VS Code API

```typescript
// Mock configuration
const getConfigStub = sinon.stub(vscode.workspace, 'getConfiguration');
getConfigStub.returns({
    get: (key: string) => {
        if (key === 'cacheSize') return 100;
        return undefined;
    }
} as any);
```

## Test Coverage

### Generate Coverage Report

```bash
pnpm add -D nyc
```

Add to `package.json`:

```json
{
  "scripts": {
    "test:coverage": "nyc pnpm run test"
  },
  "nyc": {
    "extension": [".ts"],
    "exclude": ["**/*.test.ts", "test/**"],
    "reporter": ["text", "html"],
    "all": true
  }
}
```

Run:

```bash
pnpm run test:coverage
```

### Coverage Targets

- **Overall:** >80%
- **Services:** >90%
- **Commands:** >80%
- **UI:** >60% (harder to test)

## Manual Testing Checklist

### Authentication Flow
- [ ] First-time authentication works
- [ ] OAuth flow completes successfully
- [ ] Token persists across sessions
- [ ] Sign out clears session
- [ ] Re-authentication works

### Search Functionality
- [ ] Search returns results
- [ ] No results message appears
- [ ] Results are relevant
- [ ] Clicking result opens document
- [ ] Filters work correctly

### AI Features
- [ ] Ask Question works
- [ ] Answer includes citations
- [ ] Citations link to correct docs
- [ ] Context suggestions appear
- [ ] Suggestions are relevant

### Performance
- [ ] Search responds quickly (<2s)
- [ ] No memory leaks
- [ ] Cache improves performance
- [ ] Background indexing doesn't block UI

### Cross-Platform
- [ ] Works on macOS
- [ ] Works on Windows
- [ ] Works on Linux
- [ ] Keyboard shortcuts correct per platform

## Continuous Integration

### GitHub Actions Workflow

`.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18]
    runs-on: ${{ matrix.os }}

    steps:
    - uses: actions/checkout@v3
    - uses: pnpm/action-setup@v2
      with:
        version: 8
    - uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node }}
        cache: 'pnpm'

    - run: pnpm install
    - run: pnpm run lint
    - run: pnpm run compile
    - run: xvfb-run -a pnpm run test
      if: runner.os == 'Linux'
    - run: pnpm run test
      if: runner.os != 'Linux'
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `setup()` and `teardown()`
- Clean up stubs and mocks

### 2. Descriptive Names
```typescript
// Good
test('searchFiles returns empty array when no results found')

// Bad
test('test1')
```

### 3. AAA Pattern
- **Arrange:** Set up test data
- **Act:** Execute the code
- **Assert:** Verify the result

```typescript
test('example', async () => {
    // Arrange
    const input = 'test query';
    const expected = ['result1', 'result2'];

    // Act
    const actual = await search(input);

    // Assert
    assert.deepStrictEqual(actual, expected);
});
```

### 4. Test Edge Cases
- Empty input
- Null/undefined values
- Very large inputs
- Special characters
- Network failures
- API errors

## Debugging Tests

### VS Code Debugger

1. Set breakpoint in test file
2. Run "Extension Tests" launch configuration
3. Debug normally

### Console Logging

```typescript
test('debug example', () => {
    console.log('Debug info:', someValue);
    // ...
});
```

### Test-Specific Output

```typescript
import * as vscode from 'vscode';

const testOutput = vscode.window.createOutputChannel('Test Output');
testOutput.appendLine('Test debug message');
```

## Performance Testing

### Measure Execution Time

```typescript
test('search performance', async () => {
    const start = Date.now();

    await searchCommand('test query');

    const duration = Date.now() - start;

    assert.ok(duration < 2000, `Search took ${duration}ms, expected <2000ms`);
});
```

### Memory Usage

```typescript
test('memory usage', () => {
    const before = process.memoryUsage().heapUsed;

    // Execute operation

    const after = process.memoryUsage().heapUsed;
    const used = (after - before) / 1024 / 1024; // MB

    assert.ok(used < 50, `Used ${used}MB, expected <50MB`);
});
```

## Related Documents

- [Project Setup](project-setup.md)
- [Phase 1 Tasks](../tasks/phase-1-mvp.md)
- [Security Design](../design/security.md)

---

**Remember:** Good tests make refactoring safe and catch bugs early!
