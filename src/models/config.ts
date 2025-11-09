import * as vscode from 'vscode';
import { TeamBrainConfig } from './types';

/**
 * Configuration manager for TeamBrain extension settings
 */
export class ConfigManager {
  private static readonly SECTION = 'teambrain';

  /**
   * Get the current configuration
   */
  public static getConfig(): TeamBrainConfig {
    const config = vscode.workspace.getConfiguration(this.SECTION);

    return {
      indexedFolders: config.get<string[]>('indexedFolders', []),
      excludePatterns: config.get<string[]>('excludePatterns', ['*.tmp', '~*']),
      cacheSize: config.get<number>('cacheSize', 100),
      cacheTTL: config.get<number>('cacheTTL', 3600),
      enableContextSuggestions: config.get<boolean>('enableContextSuggestions', true),
      maxSearchResults: config.get<number>('maxSearchResults', 50),
    };
  }

  /**
   * Watch for configuration changes
   * @param callback Function to call when configuration changes
   * @returns Disposable to stop watching
   */
  public static onConfigChange(callback: (config: TeamBrainConfig) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(this.SECTION)) {
        callback(this.getConfig());
      }
    });
  }

  /**
   * Update a configuration value
   * @param key Configuration key
   * @param value New value
   * @param global Whether to update globally or for workspace
   */
  public static async updateConfig<K extends keyof TeamBrainConfig>(
    key: K,
    value: TeamBrainConfig[K],
    global = false
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.SECTION);
    await config.update(key, value, global);
  }
}
