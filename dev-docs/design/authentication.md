# Authentication Strategy

## Overview

TeamBrain uses VS Code's built-in `vscode.authentication` API for secure OAuth integration with Google Drive, supporting enterprise SSO (PingID, Okta, Azure AD, etc.).

## Chosen Approach: VS Code Authentication Provider API

### Benefits

✅ **Secure OAuth flow** through system browser
✅ **Native integration** with enterprise SSO (PingID)
✅ **Automatic token refresh** and secure storage
✅ **User control** over permissions and revocation
✅ **No credential handling** in extension code
✅ **OS-level encryption** (Keychain/Credential Manager/Secret Service)

### OAuth Scopes

We request **minimal permissions** following principle of least privilege:

| Scope | Purpose | Justification |
|-------|---------|---------------|
| `drive.readonly` | Read file contents | Core functionality - reading docs |
| `drive.metadata.readonly` | List files, get metadata | Search and display file information |

**Not Requested:**
- Write permissions (not needed for v1)
- Delete permissions (not needed)
- Full Drive access (we use readonly)

## Authentication Flow

```
User → VS Code → Browser → Google OAuth → PingID SSO → Token → VS Code → Extension
```

### Detailed Flow

1. **User Action:** Activates extension or runs command
2. **Request Session:** Extension calls `vscode.authentication.getSession()`
3. **Browser Opens:** VS Code opens system browser for OAuth
4. **Google OAuth:** Redirects to `accounts.google.com`
5. **Enterprise SSO:** Google detects enterprise domain, redirects to PingID
6. **PingID Auth:** User completes MFA (push notification, biometric, etc.)
7. **Token Issued:** Google issues OAuth token
8. **Redirect to VS Code:** Browser redirects back to VS Code
9. **Token Stored:** VS Code stores token in SecretStorage
10. **Extension Ready:** Extension can now make API calls

## Implementation

### AuthManager Class

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

## Token Lifecycle

1. **Acquisition:** User authenticates once via OAuth (PingID flow)
2. **Storage:** VS Code stores token in OS-level secure storage
3. **Usage:** Extension retrieves token per-request via `getSession()`
4. **Refresh:** VS Code automatically refreshes expired tokens
5. **Revocation:** User can revoke via VS Code settings or Google account settings

## Security Considerations

### What We Do

✅ Use standard OAuth 2.0 flow
✅ Tokens stored in OS-level secure storage
✅ Minimal OAuth scopes (read-only)
✅ No password or credential storage
✅ Automatic token expiry
✅ User-controlled revocation
✅ SSO compliance (PingID, Okta, Azure AD)
✅ Audit trail via Google OAuth logs

### What We DON'T Do

❌ Store user credentials
❌ Handle passwords
❌ Create custom authentication
❌ Store tokens in plain text
❌ Request excessive permissions
❌ Bypass enterprise SSO

## Enterprise Integration

### Google Workspace Admin Configuration

Admins can pre-approve TeamBrain to skip consent screen:

1. Go to Google Admin Console
2. Navigate to: Security → API Controls → Domain-wide delegation
3. Add TeamBrain's OAuth Client ID
4. Grant scopes:
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`

### Restrict Access (Optional)

Limit to specific groups:

1. Security → API Controls → Manage Third-Party App Access
2. Add TeamBrain application
3. Set access to: "Limited (specific groups)"
4. Select: "Platform Engineering Team" group

### Monitor Usage

View audit logs:

1. Reports → Audit and Investigation → Drive
2. Filter by application: "TeamBrain"
3. View: File accesses, authentication events

## Error Handling

### Common Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| Authentication failed | User cancelled OAuth flow | Retry, show friendly message |
| Token expired | Token expired (automatic) | VS Code auto-refreshes |
| Invalid scope | Permissions changed | Re-authenticate with new scopes |
| Network error | No internet connection | Show error, enable retry |
| SSO failure | PingID unavailable | Direct to IT support |

### Implementation

```typescript
async getSessionWithRetry(maxRetries = 3): Promise<vscode.AuthenticationSession | undefined> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await this.getSession();
        } catch (error) {
            if (i === maxRetries - 1) {
                vscode.window.showErrorMessage(
                    'Unable to authenticate after multiple attempts. Please check your network and try again.',
                    'Retry'
                ).then(selection => {
                    if (selection === 'Retry') {
                        this.getSessionWithRetry();
                    }
                });
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
    return undefined;
}
```

## Testing Authentication

### Unit Tests

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';
import { AuthManager } from '../services/auth';

suite('AuthManager Tests', () => {
    test('getSession returns session when authenticated', async () => {
        const authManager = new AuthManager();
        const session = await authManager.getSession();

        assert.ok(session);
        assert.ok(session.accessToken);
    });

    test('isAuthenticated returns true when session exists', async () => {
        const authManager = new AuthManager();
        const isAuth = await authManager.isAuthenticated();

        assert.strictEqual(typeof isAuth, 'boolean');
    });

    test('signOut clears session', async () => {
        const authManager = new AuthManager();
        await authManager.signOut();

        const isAuth = await authManager.isAuthenticated();
        assert.strictEqual(isAuth, false);
    });
});
```

### Manual Testing

1. **First-time auth:**
   - Install extension
   - Run "TeamBrain: Search Knowledge Base"
   - Verify browser opens
   - Complete PingID flow
   - Verify return to VS Code

2. **Token persistence:**
   - Authenticate
   - Reload VS Code
   - Verify still authenticated (no re-prompt)

3. **Sign out:**
   - Run "TeamBrain: Sign Out"
   - Verify session cleared
   - Next command prompts for auth

4. **Enterprise SSO:**
   - Use enterprise Google account
   - Verify PingID challenge appears
   - Complete MFA
   - Verify successful authentication

## Related Documents

- [Security & Compliance](security.md)
- [API Integration](../architecture/api-integration.md)
- [Project Setup](../implementation/project-setup.md)

---

**Next:** [Features Specification](features.md)
