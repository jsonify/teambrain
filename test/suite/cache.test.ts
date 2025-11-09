import * as assert from 'assert';
import { DocumentCache } from '../../src/services/cache';

suite('DocumentCache Test Suite', () => {
  test('Should store and retrieve values', () => {
    const cache = new DocumentCache<string>(10, 60);

    cache.set('key1', 'value1');
    const result = cache.get('key1');

    assert.strictEqual(result, 'value1');
  });

  test('Should return undefined for missing keys', () => {
    const cache = new DocumentCache<string>(10, 60);
    const result = cache.get('nonexistent');

    assert.strictEqual(result, undefined);
  });

  test('Should implement LRU eviction', () => {
    const cache = new DocumentCache<string>(3, 60);

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.set('key4', 'value4'); // Should evict key1

    assert.strictEqual(cache.get('key1'), undefined);
    assert.strictEqual(cache.get('key2'), 'value2');
    assert.strictEqual(cache.get('key3'), 'value3');
    assert.strictEqual(cache.get('key4'), 'value4');
  });

  test('Should expire entries after TTL', (done) => {
    const cache = new DocumentCache<string>(10, 1); // 1 second TTL

    cache.set('key1', 'value1');

    // Should be available immediately
    assert.strictEqual(cache.get('key1'), 'value1');

    // Should expire after TTL
    setTimeout(() => {
      assert.strictEqual(cache.get('key1'), undefined);
      done();
    }, 1100);
  });

  test('Should clear all entries', () => {
    const cache = new DocumentCache<string>(10, 60);

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();

    assert.strictEqual(cache.get('key1'), undefined);
    assert.strictEqual(cache.get('key2'), undefined);
    assert.strictEqual(cache.size(), 0);
  });

  test('Should delete specific entries', () => {
    const cache = new DocumentCache<string>(10, 60);

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.delete('key1');

    assert.strictEqual(cache.get('key1'), undefined);
    assert.strictEqual(cache.get('key2'), 'value2');
  });

  test('Should report correct size', () => {
    const cache = new DocumentCache<string>(10, 60);

    assert.strictEqual(cache.size(), 0);

    cache.set('key1', 'value1');
    assert.strictEqual(cache.size(), 1);

    cache.set('key2', 'value2');
    assert.strictEqual(cache.size(), 2);

    cache.delete('key1');
    assert.strictEqual(cache.size(), 1);
  });

  test('Should check if key exists', () => {
    const cache = new DocumentCache<string>(10, 60);

    cache.set('key1', 'value1');

    assert.strictEqual(cache.has('key1'), true);
    assert.strictEqual(cache.has('nonexistent'), false);
  });
});
