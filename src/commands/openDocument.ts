import * as vscode from 'vscode';
import { DriveService } from '../services/drive';
import { DocumentCache } from '../services/cache';
import { DriveDocument } from '../models/types';
import { convertToMarkdown } from '../utils/markdown';

/**
 * Open document command handler
 */
export class OpenDocumentCommand {
  constructor(
    private driveService: DriveService,
    private contentCache: DocumentCache<string>,
    private outputChannel: vscode.OutputChannel,
    private onDocumentOpened: (doc: DriveDocument) => void
  ) {}

  /**
   * Execute the open document command
   * @param document Document to open
   */
  public async execute(document: DriveDocument): Promise<void> {
    try {
      if (!this.driveService.isInitialized()) {
        vscode.window.showErrorMessage('Please authenticate with Google Drive first.');
        return;
      }

      // Check cache first
      const cacheKey = `content:${document.id}`;
      let content = this.contentCache.get(cacheKey);

      if (!content) {
        // Fetch content with progress indicator
        content = await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Opening ${document.name}...`,
            cancellable: false,
          },
          async () => {
            const rawContent = await this.driveService.getFileContent(document.id, document.mimeType);
            this.contentCache.set(cacheKey, rawContent);
            return rawContent;
          }
        );
      }

      // Display the document
      await this.displayDocument(document, content);

      // Notify that document was opened (for tracking recent documents)
      this.onDocumentOpened(document);
    } catch (error) {
      this.outputChannel.appendLine(`Open document error: ${error}`);
      vscode.window.showErrorMessage(`Failed to open document: ${error}`);
    }
  }

  /**
   * Display document content in VS Code
   */
  private async displayDocument(document: DriveDocument, content: string): Promise<void> {
    // Convert content to markdown
    const markdown = convertToMarkdown(content);

    // Open in editor
    const doc = await vscode.workspace.openTextDocument({
      content: markdown,
      language: 'markdown',
    });

    await vscode.window.showTextDocument(doc, {
      preview: true,
      viewColumn: vscode.ViewColumn.Active,
    });

    // Show notification with link to open in browser
    const openInBrowser = 'Open in Google Drive';
    const choice = await vscode.window.showInformationMessage(
      `Viewing: ${document.name}`,
      openInBrowser
    );

    if (choice === openInBrowser) {
      vscode.env.openExternal(vscode.Uri.parse(document.webViewLink));
    }
  }
}
