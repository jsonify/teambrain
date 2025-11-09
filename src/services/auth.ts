import * as vscode from 'vscode';

/**
 * Manages authentication with Google Drive using VS Code's authentication API
 */
export class AuthManager {
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ];

  private static readonly PROVIDER_ID = 'google';
  private static readonly SESSION_ID = 'teambrain.google.session';

  private session: vscode.AuthenticationSession | undefined;
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  /**
   * Get or create an authentication session
   * @param createIfNone Whether to create a new session if none exists
   * @returns Authentication session or undefined
   */
  public async getSession(createIfNone = true): Promise<vscode.AuthenticationSession | undefined> {
    try {
      // Try to get existing session
      this.session = await vscode.authentication.getSession(
        AuthManager.PROVIDER_ID,
        AuthManager.SCOPES,
        { createIfNone }
      );

      if (this.session) {
        this.outputChannel.appendLine(`Authenticated as: ${this.session.account.label}`);
      }

      return this.session;
    } catch (error) {
      this.outputChannel.appendLine(`Authentication error: ${error}`);
      vscode.window.showErrorMessage('Failed to authenticate with Google Drive. Please try again.');
      return undefined;
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns True if authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    if (this.session) {
      return true;
    }

    // Check for existing session without prompting
    const session = await this.getSession(false);
    return session !== undefined;
  }

  /**
   * Get the access token for API calls
   * @returns Access token or undefined if not authenticated
   */
  public async getAccessToken(): Promise<string | undefined> {
    if (!this.session) {
      this.session = await this.getSession(true);
    }

    return this.session?.accessToken;
  }

  /**
   * Sign out and clear the session
   */
  public async signOut(): Promise<void> {
    if (this.session) {
      this.outputChannel.appendLine(`Signing out: ${this.session.account.label}`);
      this.session = undefined;
      vscode.window.showInformationMessage('Signed out from TeamBrain');
    }
  }

  /**
   * Get the current user's account information
   * @returns Account info or undefined
   */
  public getAccountInfo(): vscode.AuthenticationSessionAccountInformation | undefined {
    return this.session?.account;
  }

  /**
   * Listen for authentication changes
   * @param callback Function to call when authentication changes
   * @returns Disposable to stop listening
   */
  public onAuthChange(
    callback: (session: vscode.AuthenticationSession | undefined) => void
  ): vscode.Disposable {
    return vscode.authentication.onDidChangeSessions(async event => {
      if (event.provider.id === AuthManager.PROVIDER_ID) {
        this.session = await this.getSession(false);
        callback(this.session);
      }
    });
  }
}
