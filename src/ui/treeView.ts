import * as vscode from 'vscode';
import { DriveDocument } from '../models/types';

/**
 * Tree item for the TeamBrain sidebar
 */
export class TeamBrainTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue: string,
    public readonly document?: DriveDocument
  ) {
    super(label, collapsibleState);

    if (document) {
      this.tooltip = `${document.name}\nModified: ${new Date(document.modifiedTime).toLocaleDateString()}`;
      this.description = this.formatDate(document.modifiedTime);
      this.iconPath = new vscode.ThemeIcon(this.getIconForMimeType(document.mimeType));

      // Add command to open document
      this.command = {
        command: 'teambrain.openDocument',
        title: 'Open Document',
        arguments: [document],
      };
    } else {
      this.iconPath = new vscode.ThemeIcon(this.getIconForSection(label));
    }
  }

  /**
   * Format date as relative time
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get icon for MIME type
   */
  private getIconForMimeType(mimeType: string): string {
    if (mimeType.includes('document')) {
      return 'file-text';
    } else if (mimeType.includes('spreadsheet')) {
      return 'table';
    } else if (mimeType.includes('presentation')) {
      return 'file-media';
    } else if (mimeType.includes('folder')) {
      return 'folder';
    } else if (mimeType.includes('pdf')) {
      return 'file-pdf';
    }
    return 'file';
  }

  /**
   * Get icon for section
   */
  private getIconForSection(label: string): string {
    switch (label) {
      case 'Search':
        return 'search';
      case 'Recent':
        return 'history';
      case 'Favorites':
        return 'star';
      case 'Quick Access':
        return 'folder-opened';
      case 'Settings':
        return 'gear';
      default:
        return 'folder';
    }
  }
}

/**
 * Tree data provider for TeamBrain sidebar
 */
export class TeamBrainTreeDataProvider implements vscode.TreeDataProvider<TeamBrainTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TeamBrainTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private recentDocuments: DriveDocument[] = [];
  private favoriteDocuments: DriveDocument[] = [];

  constructor(private context: vscode.ExtensionContext) {
    // Load saved data
    this.loadState();
  }

  /**
   * Refresh the tree view
   */
  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item
   */
  getTreeItem(element: TeamBrainTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children of a tree item
   */
  async getChildren(element?: TeamBrainTreeItem): Promise<TeamBrainTreeItem[]> {
    if (!element) {
      // Root level - show sections
      return [
        new TeamBrainTreeItem('Search', vscode.TreeItemCollapsibleState.None, 'section'),
        new TeamBrainTreeItem('Recent', vscode.TreeItemCollapsibleState.Collapsed, 'section'),
        new TeamBrainTreeItem('Favorites', vscode.TreeItemCollapsibleState.Collapsed, 'section'),
        new TeamBrainTreeItem('Quick Access', vscode.TreeItemCollapsibleState.Collapsed, 'section'),
      ];
    }

    // Section items
    switch (element.label) {
      case 'Recent':
        return this.getRecentItems();
      case 'Favorites':
        return this.getFavoriteItems();
      case 'Quick Access':
        return this.getQuickAccessItems();
      default:
        return [];
    }
  }

  /**
   * Get recent document items
   */
  private getRecentItems(): TeamBrainTreeItem[] {
    if (this.recentDocuments.length === 0) {
      return [new TeamBrainTreeItem('No recent documents', vscode.TreeItemCollapsibleState.None, 'empty')];
    }

    return this.recentDocuments.map(
      doc => new TeamBrainTreeItem(doc.name, vscode.TreeItemCollapsibleState.None, 'document', doc)
    );
  }

  /**
   * Get favorite document items
   */
  private getFavoriteItems(): TeamBrainTreeItem[] {
    if (this.favoriteDocuments.length === 0) {
      return [new TeamBrainTreeItem('No favorites yet', vscode.TreeItemCollapsibleState.None, 'empty')];
    }

    return this.favoriteDocuments.map(
      doc => new TeamBrainTreeItem(doc.name, vscode.TreeItemCollapsibleState.None, 'favorite', doc)
    );
  }

  /**
   * Get quick access items
   */
  private getQuickAccessItems(): TeamBrainTreeItem[] {
    return [
      new TeamBrainTreeItem('Coming soon...', vscode.TreeItemCollapsibleState.None, 'empty')
    ];
  }

  /**
   * Add document to recent list
   */
  public addToRecent(document: DriveDocument): void {
    // Remove if already in list
    this.recentDocuments = this.recentDocuments.filter(doc => doc.id !== document.id);

    // Add to front
    this.recentDocuments.unshift(document);

    // Keep only last 20
    if (this.recentDocuments.length > 20) {
      this.recentDocuments = this.recentDocuments.slice(0, 20);
    }

    this.saveState();
    this.refresh();
  }

  /**
   * Add document to favorites
   */
  public addToFavorites(document: DriveDocument): void {
    if (!this.favoriteDocuments.find(doc => doc.id === document.id)) {
      this.favoriteDocuments.push(document);
      this.saveState();
      this.refresh();
      vscode.window.showInformationMessage(`Added "${document.name}" to favorites`);
    }
  }

  /**
   * Remove document from favorites
   */
  public removeFromFavorites(document: DriveDocument): void {
    this.favoriteDocuments = this.favoriteDocuments.filter(doc => doc.id !== document.id);
    this.saveState();
    this.refresh();
    vscode.window.showInformationMessage(`Removed "${document.name}" from favorites`);
  }

  /**
   * Check if document is in favorites
   */
  public isFavorite(documentId: string): boolean {
    return this.favoriteDocuments.some(doc => doc.id === documentId);
  }

  /**
   * Load state from workspace
   */
  private loadState(): void {
    this.recentDocuments = this.context.workspaceState.get<DriveDocument[]>('recentDocuments', []);
    this.favoriteDocuments = this.context.workspaceState.get<DriveDocument[]>('favoriteDocuments', []);
  }

  /**
   * Save state to workspace
   */
  private saveState(): void {
    this.context.workspaceState.update('recentDocuments', this.recentDocuments);
    this.context.workspaceState.update('favoriteDocuments', this.favoriteDocuments);
  }
}
