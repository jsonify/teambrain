import { google } from 'googleapis';
import { drive_v3 } from 'googleapis';
import * as vscode from 'vscode';
import { DriveDocument, SearchQuery } from '../models/types';

/**
 * Service for interacting with Google Drive API
 */
export class DriveService {
  private drive: drive_v3.Drive | undefined;
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  /**
   * Initialize the Drive API client with an access token
   * @param accessToken OAuth access token
   */
  public initialize(accessToken: string): void {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    this.drive = google.drive({ version: 'v3', auth });
    this.outputChannel.appendLine('Drive API client initialized');
  }

  /**
   * Search for files in Google Drive
   * @param searchQuery Search parameters
   * @returns Array of matching documents
   */
  public async searchFiles(searchQuery: SearchQuery): Promise<DriveDocument[]> {
    if (!this.drive) {
      throw new Error('Drive API not initialized. Please authenticate first.');
    }

    try {
      const { query, maxResults = 50, folderIds, mimeTypes } = searchQuery;

      // Build search query
      let q = `fullText contains '${query.replace(/'/g, "\\'")}'`;

      // Add folder filter
      if (folderIds && folderIds.length > 0) {
        const folderQuery = folderIds.map(id => `'${id}' in parents`).join(' or ');
        q += ` and (${folderQuery})`;
      }

      // Add MIME type filter
      if (mimeTypes && mimeTypes.length > 0) {
        const mimeQuery = mimeTypes.map(type => `mimeType='${type}'`).join(' or ');
        q += ` and (${mimeQuery})`;
      }

      // Exclude trashed files
      q += ' and trashed=false';

      this.outputChannel.appendLine(`Searching with query: ${q}`);

      const response = await this.drive.files.list({
        q,
        pageSize: maxResults,
        fields: 'files(id, name, mimeType, webViewLink, modifiedTime, owners, size, iconLink, parents)',
        orderBy: 'modifiedTime desc',
      });

      const files = response.data.files || [];
      this.outputChannel.appendLine(`Found ${files.length} files`);

      return files.map(file => this.mapToDriveDocument(file));
    } catch (error) {
      this.outputChannel.appendLine(`Search error: ${error}`);
      throw new Error(`Failed to search Drive: ${error}`);
    }
  }

  /**
   * Get file metadata
   * @param fileId File ID
   * @returns Document metadata
   */
  public async getFileMetadata(fileId: string): Promise<DriveDocument> {
    if (!this.drive) {
      throw new Error('Drive API not initialized. Please authenticate first.');
    }

    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, webViewLink, modifiedTime, owners, size, iconLink, parents',
      });

      return this.mapToDriveDocument(response.data);
    } catch (error) {
      this.outputChannel.appendLine(`Get metadata error: ${error}`);
      throw new Error(`Failed to get file metadata: ${error}`);
    }
  }

  /**
   * Get file content
   * @param fileId File ID
   * @param mimeType Original MIME type
   * @returns File content as string
   */
  public async getFileContent(fileId: string, mimeType: string): Promise<string> {
    if (!this.drive) {
      throw new Error('Drive API not initialized. Please authenticate first.');
    }

    try {
      // Determine export MIME type for Google Workspace documents
      const exportMimeType = this.getExportMimeType(mimeType);

      let response;
      if (exportMimeType) {
        // Export Google Workspace document
        response = await this.drive.files.export(
          {
            fileId,
            mimeType: exportMimeType,
          },
          {
            responseType: 'text',
          }
        );
      } else {
        // Download regular file
        response = await this.drive.files.get(
          {
            fileId,
            alt: 'media',
          },
          {
            responseType: 'text',
          }
        );
      }

      return response.data as string;
    } catch (error) {
      this.outputChannel.appendLine(`Get content error: ${error}`);
      throw new Error(`Failed to get file content: ${error}`);
    }
  }

  /**
   * List contents of a folder
   * @param folderId Folder ID
   * @returns Array of documents in the folder
   */
  public async listFolder(folderId: string): Promise<DriveDocument[]> {
    if (!this.drive) {
      throw new Error('Drive API not initialized. Please authenticate first.');
    }

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, webViewLink, modifiedTime, owners, size, iconLink, parents)',
        orderBy: 'name',
      });

      const files = response.data.files || [];
      return files.map(file => this.mapToDriveDocument(file));
    } catch (error) {
      this.outputChannel.appendLine(`List folder error: ${error}`);
      throw new Error(`Failed to list folder: ${error}`);
    }
  }

  /**
   * Map Google Drive file to DriveDocument
   */
  private mapToDriveDocument(file: drive_v3.Schema$File): DriveDocument {
    return {
      id: file.id || '',
      name: file.name || 'Untitled',
      mimeType: file.mimeType || '',
      webViewLink: file.webViewLink || '',
      modifiedTime: file.modifiedTime || '',
      owners: file.owners?.map(owner => ({
        displayName: owner.displayName || '',
        emailAddress: owner.emailAddress || '',
      })),
      size: file.size ?? undefined,
      iconLink: file.iconLink ?? undefined,
      parents: file.parents ?? undefined,
    };
  }

  /**
   * Get the appropriate export MIME type for Google Workspace documents
   */
  private getExportMimeType(mimeType: string): string | null {
    const exportMap: Record<string, string> = {
      'application/vnd.google-apps.document': 'text/plain',
      'application/vnd.google-apps.spreadsheet': 'text/csv',
      'application/vnd.google-apps.presentation': 'text/plain',
      'application/vnd.google-apps.drawing': 'image/png',
    };

    return exportMap[mimeType] || null;
  }

  /**
   * Check if the service is initialized
   */
  public isInitialized(): boolean {
    return this.drive !== undefined;
  }
}
