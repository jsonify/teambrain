import * as assert from 'assert';
import {
  convertToMarkdown,
  sanitizeText,
  truncateText,
  extractPreview,
} from '../../src/utils/markdown';

suite('Markdown Utils Test Suite', () => {
  test('Should convert URLs to markdown links', () => {
    const text = 'Check out https://example.com for more info';
    const result = convertToMarkdown(text);

    assert.ok(result.includes('[https://example.com](https://example.com)'));
  });

  test('Should sanitize HTML tags', () => {
    const text = '<script>alert("xss")</script>Hello World';
    const result = sanitizeText(text);

    assert.strictEqual(result, 'Hello World');
  });

  test('Should truncate long text', () => {
    const text = 'A'.repeat(100);
    const result = truncateText(text, 50);

    assert.strictEqual(result.length, 50);
    assert.ok(result.endsWith('...'));
  });

  test('Should not truncate short text', () => {
    const text = 'Short text';
    const result = truncateText(text, 50);

    assert.strictEqual(result, text);
  });

  test('Should extract preview from text', () => {
    const text = 'First paragraph\n\nSecond paragraph';
    const result = extractPreview(text, 100);

    assert.strictEqual(result, 'First paragraph');
  });

  test('Should truncate long previews', () => {
    const text = 'A'.repeat(300);
    const result = extractPreview(text, 100);

    assert.strictEqual(result.length, 100);
  });
});
