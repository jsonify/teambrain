/**
 * Represents a Google Drive document in the TeamBrain extension
 */
export interface DriveDocument {
  /** Unique identifier for the document */
  id: string;
  /** Display name of the document */
  name: string;
  /** MIME type of the document */
  mimeType: string;
  /** URL to view the document in Google Drive */
  webViewLink: string;
  /** Last modified timestamp */
  modifiedTime: string;
  /** Document owner information */
  owners?: Array<{ displayName: string; emailAddress: string }>;
  /** File size in bytes (if applicable) */
  size?: string;
  /** Icon URL for the file type */
  iconLink?: string;
  /** Parent folder IDs */
  parents?: string[];
}

/**
 * Cache entry with TTL support
 */
export interface CacheEntry<T> {
  /** Cached data */
  data: T;
  /** Timestamp when the entry was created */
  timestamp: number;
  /** Time to live in milliseconds */
  ttl: number;
}

/**
 * Search query parameters
 */
export interface SearchQuery {
  /** Search term */
  query: string;
  /** Maximum number of results */
  maxResults?: number;
  /** Folder IDs to search within */
  folderIds?: string[];
  /** MIME types to filter */
  mimeTypes?: string[];
}

/**
 * Extension configuration
 */
export interface TeamBrainConfig {
  /** List of folder IDs to index */
  indexedFolders: string[];
  /** Patterns to exclude from search */
  excludePatterns: string[];
  /** Maximum number of documents to cache */
  cacheSize: number;
  /** Cache TTL in seconds */
  cacheTTL: number;
  /** Enable AI context suggestions */
  enableContextSuggestions: boolean;
  /** Maximum search results to display */
  maxSearchResults: number;
}

/**
 * Tree item types for the sidebar
 */
export type TreeItemType = 'section' | 'document' | 'favorite';

/**
 * Tree item context values for commands
 */
export type TreeItemContext = 'section' | 'document' | 'favorite';
