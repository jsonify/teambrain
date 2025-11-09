# Security & Compliance

## Security Overview

TeamBrain follows security best practices for VS Code extensions, with a focus on minimal permissions, secure storage, and audit logging.

## Authentication Security

### Threat Model & Mitigations

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| Token theft | Low | High | OS-level encrypted storage (Keychain/Credential Manager) |
| Token leakage in logs | Medium | High | Never log tokens; redact in error messages |
| Session hijacking | Low | Medium | Short-lived tokens with automatic refresh |
| Unauthorized access | Low | High | Minimal OAuth scopes (read-only) |
| Phishing | Low | High | Official Google OAuth flow; can't be intercepted |
| Man-in-the-middle | Low | High | All connections over HTTPS |

### Security Controls

✅ **No password storage:** Extension never sees user credentials
✅ **Token encryption:** OS-level secure storage via VS Code SecretStorage
✅ **Automatic expiry:** Tokens expire per Google policy
✅ **User control:** Easy revocation through VS Code UI
✅ **Audit trail:** Google logs all OAuth grants
✅ **SSO compliance:** Works with PingID, Okta, Azure AD, etc.
✅ **Minimal scope:** Only read-only access requested

### Implementation

```typescript
// GOOD: Token stored securely
const session = await vscode.authentication.getSession('google', SCOPES);
const token = session.accessToken; // Use immediately, don't store

// BAD: Never do this
const token = session.accessToken;
this.storedToken = token; // Don't store in class properties
console.log('Token:', token); // Never log tokens
```

## Data Privacy

### What We Store

| Data Type | Location | Duration | Purpose |
|-----------|----------|----------|---------|
| OAuth tokens | OS SecretStorage | Until revoked | API authentication |
| Document metadata | Workspace Memento | Until cleared | Search indexing |
| Search history | Workspace Memento | 30 days | Result ranking |
| Favorites | Workspace Memento | Permanent | User preferences |
| Access statistics | Workspace Memento | 30 days | Result ranking |
| Cached content | In-memory | 1 hour | Performance |

### What We DON'T Store

❌ Full document contents (only cached temporarily in memory)
❌ User credentials or passwords
❌ Personal information beyond what Drive API provides
❌ Data sent to third parties (only Google and Copilot APIs)
❌ Telemetry or analytics to external servers

### Data Retention

```typescript
class DataRetentionPolicy {
    // Search history: 30 days
    async cleanOldSearchHistory() {
        const history = await this.getSearchHistory();
        const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);

        const cleaned = history.filter(entry => entry.timestamp > cutoff);
        await this.saveSearchHistory(cleaned);
    }

    // Access stats: 30 days
    async cleanOldAccessStats() {
        const stats = await this.getAccessStats();
        const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);

        const cleaned = stats.filter(stat => stat.lastAccess > cutoff);
        await this.saveAccessStats(cleaned);
    }

    // Cache: 1 hour
    async cleanExpiredCache() {
        const cache = this.getCache();
        const cutoff = Date.now() - (60 * 60 * 1000);

        cache.forEach((value, key) => {
            if (value.timestamp < cutoff) {
                cache.delete(key);
            }
        });
    }
}
```

## Compliance

### GDPR Compliance

✅ **User data control:** All data stored locally under user control
✅ **Right to deletion:** "Clear Cache" command deletes all local data
✅ **Data minimization:** Only store what's necessary
✅ **No profiling:** No behavioral tracking or profiling
✅ **Transparency:** Clear documentation of what we store
✅ **No third-party sharing:** Data only flows to Google/GitHub APIs

### SOC2 Compliance

✅ **Audit trail:** OAuth events logged by Google
✅ **Access control:** Users only see what they're authorized for
✅ **Encryption in transit:** All API calls over HTTPS
✅ **Encryption at rest:** OS-level encryption for tokens
✅ **Minimal data retention:** Short TTLs, automatic cleanup
✅ **No persistent storage:** No backend database

### Enterprise Requirements

✅ **SSO Integration:** Works with PingID, Okta, Azure AD
✅ **Drive Permissions:** Respects existing Google Drive ACLs
✅ **Client-side only:** No backend server to secure
✅ **Audit logs:** All access logged in Google Workspace
✅ **Admin control:** Can be restricted via Google Workspace admin

## Network Security

### API Connections

```typescript
// All connections over HTTPS
const auth = new google.auth.OAuth2();
auth.setCredentials({ access_token: token });

const drive = google.drive({
    version: 'v3',
    auth,
    // Enforces HTTPS
});
```

### Endpoints We Connect To

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Google Drive API | `https://www.googleapis.com/drive/v3/*` | File operations |
| Google OAuth | `https://accounts.google.com/o/oauth2/*` | Authentication |
| VS Code LM API | Internal (via VS Code) | AI features |

### Firewall & Proxy

- Respects system proxy settings
- Works through corporate firewalls
- No custom network configuration needed

## Audit & Monitoring

### Audit Logger Implementation

```typescript
export class AuditLogger {
    private output: vscode.OutputChannel;

    constructor() {
        this.output = vscode.window.createOutputChannel('TeamBrain Audit');
    }

    logAuth(event: 'login' | 'logout' | 'refresh', userId?: string) {
        const timestamp = new Date().toISOString();
        const user = userId ? ` user=${userId}` : '';
        this.log(`AUTH: ${event}${user} at ${timestamp}`);
    }

    logSearch(query: string, resultCount: number) {
        // Sanitize query to prevent log injection
        const sanitized = query.replace(/[\n\r]/g, ' ').substring(0, 200);
        this.log(`SEARCH: "${sanitized}" returned ${resultCount} results`);
    }

    logDocAccess(documentId: string, documentName: string) {
        // Sanitize document name
        const sanitized = documentName.replace(/[\n\r]/g, ' ');
        this.log(`ACCESS: Document "${sanitized}" (${documentId})`);
    }

    logError(error: Error, context: string) {
        // Don't log sensitive data in errors
        const sanitized = this.sanitizeError(error);
        this.log(`ERROR: ${context} - ${sanitized.message}`);
    }

    private log(message: string) {
        const timestamp = new Date().toISOString();
        this.output.appendLine(`[${timestamp}] ${message}`);
    }

    private sanitizeError(error: Error): Error {
        // Remove any tokens or sensitive data from error messages
        const sanitized = new Error(error.message);
        sanitized.message = sanitized.message
            .replace(/access_token=[^&\s]+/g, 'access_token=REDACTED')
            .replace(/bearer\s+[^\s]+/gi, 'bearer REDACTED');
        return sanitized;
    }
}
```

### Monitoring Points

1. **Authentication events:** Login, logout, refresh
2. **Search queries:** Query text, result count
3. **Document access:** Which docs are opened
4. **Errors:** Failures with context (sanitized)
5. **Performance:** Response times, cache hits

### User Access

Users can view audit logs:
1. Command Palette → "TeamBrain: Show Audit Log"
2. Opens output channel with all logged events
3. Can be copied for support tickets

## Secure Coding Practices

### Input Validation

```typescript
// GOOD: Validate and sanitize user input
function sanitizeSearchQuery(query: string): string {
    // Remove special characters that could cause issues
    return query
        .trim()
        .replace(/[<>]/g, '') // Remove HTML-like characters
        .substring(0, 500); // Limit length
}

// BAD: Using raw input
const results = await drive.files.list({
    q: `fullText contains '${userInput}'` // SQL injection-like risk
});

// GOOD: Parameterized queries
const results = await drive.files.list({
    q: `fullText contains '${sanitizeSearchQuery(userInput)}'`
});
```

### Error Handling

```typescript
// GOOD: Don't leak sensitive info in errors
try {
    const session = await vscode.authentication.getSession('google', SCOPES);
} catch (error) {
    // Don't show technical details to user
    vscode.window.showErrorMessage(
        'Unable to authenticate. Please try again.'
    );
    // Log detailed error securely (sanitized)
    auditLogger.logError(error, 'authentication');
}

// BAD: Exposing sensitive info
catch (error) {
    vscode.window.showErrorMessage(`Error: ${error.message}`); // Might contain tokens
}
```

### Dependency Security

```json
{
  "scripts": {
    "audit": "pnpm audit",
    "audit:fix": "pnpm audit --fix"
  }
}
```

Run security audits:
```bash
# Check for vulnerabilities
pnpm audit

# Automatically fix when possible
pnpm audit --fix

# Check before every release
pnpm run audit
```

## Deployment Security

### Marketplace Publishing

1. **Code Review:** All code reviewed before release
2. **Version Signing:** Releases tagged and signed
3. **Changelog:** Detailed changelog for transparency
4. **Permissions Review:** OAuth scopes reviewed each release

### Enterprise Deployment

**Option 1: Public Marketplace (Recommended)**
- Users install from VS Code Marketplace
- Automatic updates
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
- Host on private repo

## Incident Response

### Security Issue Reporting

Users should report security issues to:
- **Email:** security@yourcompany.com
- **GitHub:** Private security advisory
- **Slack:** #security-incidents (internal)

### Response Plan

1. **Acknowledge:** Within 24 hours
2. **Assess:** Severity and impact
3. **Fix:** Develop and test patch
4. **Release:** Emergency release if critical
5. **Notify:** Inform affected users
6. **Post-mortem:** Document and improve

## Security Checklist

Before each release:

- [ ] All dependencies up to date
- [ ] Security audit passed (`pnpm audit`)
- [ ] No secrets in code
- [ ] Tokens properly secured
- [ ] Error messages sanitized
- [ ] Input validation in place
- [ ] OAuth scopes minimal
- [ ] Audit logging working
- [ ] HTTPS enforced
- [ ] Data retention policies applied

## Related Documents

- [Authentication Strategy](authentication.md)
- [Design Overview](overview.md)
- [API Integration](../architecture/api-integration.md)

---

**Security Contact:** security@yourcompany.com
**Last Security Review:** 2025-11-09
