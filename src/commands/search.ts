import * as vscode from 'vscode';
import { DriveService } from '../services/drive';
import { AuthManager } from '../services/auth';
import { DocumentCache } from '../services/cache';
import { DriveDocument, SearchQuery } from '../models/types';
import { ConfigManager } from '../models/config';

/**
 * Search command handler
 */
export class SearchCommand {
  constructor(
    private authManager: AuthManager,
    private driveService: DriveService,
    private searchCache: DocumentCache<DriveDocument[]>,
    private outputChannel: vscode.OutputChannel
  ) {}

  /**
   * Execute the search command
   */
  public async execute(): Promise<void> {
    try {
      // Check authentication
      const isAuth = await this.authManager.isAuthenticated();
      if (!isAuth) {
        const session = await this.authManager.getSession(true);
        if (!session) {
          vscode.window.showWarningMessage('Please authenticate with Google Drive to search documents.');
          return;
        }

        // Initialize Drive service
        const token = await this.authManager.getAccessToken();
        if (token) {
          this.driveService.initialize(token);
        }
      }

      // Show input box for search query
      const query = await vscode.window.showInputBox({
        prompt: 'Search Google Drive documents',
        placeHolder: 'Enter search terms...',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Please enter a search term';
          }
          return null;
        },
      });

      if (!query) {
        return; // User cancelled
      }

      // Check cache first
      const cacheKey = `search:${query}`;
      const cachedResults = this.searchCache.get(cacheKey);

      let results: DriveDocument[];
      if (cachedResults) {
        this.outputChannel.appendLine(`Using cached results for: ${query}`);
        results = cachedResults;
      } else {
        // Show progress
        results = await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Searching Google Drive...',
            cancellable: false,
          },
          async () => {
            const config = ConfigManager.getConfig();
            const searchQuery: SearchQuery = {
              query,
              maxResults: config.maxSearchResults,
              folderIds: config.indexedFolders.length > 0 ? config.indexedFolders : undefined,
            };

            const searchResults = await this.driveService.searchFiles(searchQuery);

            // Cache the results
            this.searchCache.set(cacheKey, searchResults);

            return searchResults;
          }
        );
      }

      if (results.length === 0) {
        vscode.window.showInformationMessage('No documents found matching your search.');
        return;
      }

      // Show results in Quick Pick
      await this.showSearchResults(results);
    } catch (error) {
      this.outputChannel.appendLine(`Search error: ${error}`);
      vscode.window.showErrorMessage(`Search failed: ${error}`);
    }
  }

  /**
   * Display search results in a Quick Pick
   */
  private async showSearchResults(results: DriveDocument[]): Promise<void> {
    interface SearchResultItem extends vscode.QuickPickItem {
      document: DriveDocument;
    }

    const items: SearchResultItem[] = results.map(doc => ({
      label: `$(file) ${doc.name}`,
      description: this.formatModifiedTime(doc.modifiedTime),
      detail: doc.owners?.[0]?.displayName || 'Unknown owner',
      document: doc,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a document to open',
      matchOnDescription: true,
      matchOnDetail: true,
    });

    if (selected) {
      // Execute open document command
      await vscode.commands.executeCommand('teambrain.openDocument', selected.document);
    }
  }

  /**
   * Format modified time as a relative time string
   */
  private formatModifiedTime(modifiedTime: string): string {
    const date = new Date(modifiedTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  }
}
