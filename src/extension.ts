import * as vscode from 'vscode';
import { AuthManager } from './services/auth';
import { DriveService } from './services/drive';
import { DocumentCache } from './services/cache';
import { SearchCommand } from './commands/search';
import { OpenDocumentCommand } from './commands/openDocument';
import { TeamBrainTreeDataProvider } from './ui/treeView';
import { ConfigManager } from './models/config';
import { DriveDocument } from './models/types';

let outputChannel: vscode.OutputChannel;
let authManager: AuthManager;
let driveService: DriveService;
let treeDataProvider: TeamBrainTreeDataProvider;
let statusBarItem: vscode.StatusBarItem;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('TeamBrain');
  outputChannel.appendLine('TeamBrain extension activating...');

  // Initialize services
  authManager = new AuthManager(outputChannel);
  driveService = new DriveService(outputChannel);

  // Get configuration
  const config = ConfigManager.getConfig();

  // Initialize caches
  const searchCache = new DocumentCache<DriveDocument[]>(config.cacheSize, config.cacheTTL);
  const contentCache = new DocumentCache<string>(config.cacheSize, config.cacheTTL);

  // Create tree data provider
  treeDataProvider = new TeamBrainTreeDataProvider(context);

  // Register tree view
  const treeView = vscode.window.createTreeView('teambrainExplorer', {
    treeDataProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);

  // Create search command
  const searchCommand = new SearchCommand(authManager, driveService, searchCache, outputChannel);

  // Create open document command
  const openDocumentCommand = new OpenDocumentCommand(
    driveService,
    contentCache,
    outputChannel,
    (doc) => treeDataProvider.addToRecent(doc)
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('teambrain.search', () => searchCommand.execute())
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('teambrain.openDocument', (doc: DriveDocument) =>
      openDocumentCommand.execute(doc)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('teambrain.refresh', () => {
      searchCache.clear();
      contentCache.clear();
      treeDataProvider.refresh();
      vscode.window.showInformationMessage('TeamBrain refreshed');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('teambrain.addToFavorites', (item) => {
      if (item && item.document) {
        treeDataProvider.addToFavorites(item.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('teambrain.removeFromFavorites', (item) => {
      if (item && item.document) {
        treeDataProvider.removeFromFavorites(item.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('teambrain.copyLink', (item) => {
      if (item && item.document) {
        vscode.env.clipboard.writeText(item.document.webViewLink);
        vscode.window.showInformationMessage('Link copied to clipboard');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('teambrain.signOut', async () => {
      await authManager.signOut();
      searchCache.clear();
      contentCache.clear();
      treeDataProvider.refresh();
    })
  );

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'teambrain.search';
  statusBarItem.text = '$(cloud) TeamBrain';
  statusBarItem.tooltip = 'Click to search Google Drive';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Listen for authentication changes
  context.subscriptions.push(
    authManager.onAuthChange(async (session) => {
      if (session) {
        outputChannel.appendLine('User authenticated');
        const token = await authManager.getAccessToken();
        if (token) {
          driveService.initialize(token);
        }
        statusBarItem.text = '$(cloud-download) TeamBrain';
        statusBarItem.tooltip = `Connected as ${session.account.label}`;
      } else {
        outputChannel.appendLine('User signed out');
        statusBarItem.text = '$(cloud) TeamBrain';
        statusBarItem.tooltip = 'Click to search Google Drive (Not connected)';
      }
    })
  );

  // Listen for configuration changes
  context.subscriptions.push(
    ConfigManager.onConfigChange(() => {
      outputChannel.appendLine('Configuration updated');
      // Update cache settings
      searchCache.clear();
      contentCache.clear();
    })
  );

  // Try to authenticate on startup (silent)
  const session = await authManager.getSession(false);
  if (session) {
    const token = await authManager.getAccessToken();
    if (token) {
      driveService.initialize(token);
      statusBarItem.text = '$(cloud-download) TeamBrain';
      statusBarItem.tooltip = `Connected as ${session.account.label}`;
    }
  }

  // Show welcome message for first-time users
  const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome', false);
  if (!hasShownWelcome) {
    const authenticate = 'Authenticate';
    const choice = await vscode.window.showInformationMessage(
      'Welcome to TeamBrain! Access your Google Drive documents directly in VS Code.',
      authenticate
    );

    if (choice === authenticate) {
      await vscode.commands.executeCommand('teambrain.search');
    }

    context.globalState.update('hasShownWelcome', true);
  }

  outputChannel.appendLine('TeamBrain extension activated successfully');
}

/**
 * Extension deactivation
 */
export function deactivate() {
  outputChannel.appendLine('TeamBrain extension deactivating...');
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  if (outputChannel) {
    outputChannel.dispose();
  }
}
