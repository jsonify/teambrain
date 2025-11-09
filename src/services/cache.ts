import { CacheEntry } from '../models/types';

/**
 * LRU cache implementation with TTL support
 */
export class DocumentCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;

  /**
   * @param maxSize Maximum number of entries to cache
   * @param defaultTTL Default time-to-live in seconds
   */
  constructor(maxSize = 100, defaultTTL = 3600) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL * 1000; // Convert to milliseconds
  }

  /**
   * Get a cached value
   * @param key Cache key
   * @returns Cached value or undefined if not found or expired
   */
  public get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  /**
   * Set a cached value
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time-to-live in milliseconds (optional)
   */
  public set(key: string, value: T, ttl?: number): void {
    // Remove oldest entry if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if a key exists in cache and is not expired
   * @param key Cache key
   * @returns True if key exists and is valid
   */
  public has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Remove a specific entry from cache
   * @param key Cache key
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached entries
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Get all valid (non-expired) cache keys
   */
  public keys(): string[] {
    const validKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() - entry.timestamp <= entry.ttl) {
        validKeys.push(key);
      } else {
        this.cache.delete(key);
      }
    }

    return validKeys;
  }
}
