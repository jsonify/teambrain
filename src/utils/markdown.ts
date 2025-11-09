/**
 * Utility functions for converting document content to markdown
 */

/**
 * Convert plain text to basic markdown with some formatting
 * @param text Plain text content
 * @returns Markdown formatted text
 */
export function convertToMarkdown(text: string): string {
  // For now, we'll do basic formatting
  // In the future, this could be enhanced with more sophisticated parsing

  let markdown = text;

  // Detect and format code blocks (text between triple backticks or indented blocks)
  markdown = formatCodeBlocks(markdown);

  // Detect and format URLs
  markdown = formatUrls(markdown);

  // Detect and format headers (lines that are all caps or end with :)
  markdown = formatHeaders(markdown);

  return markdown;
}

/**
 * Format code blocks in the text
 */
function formatCodeBlocks(text: string): string {
  // Match existing code blocks (already formatted)
  let formatted = text.replace(/```(\w*)\n([\s\S]*?)```/g, '```$1\n$2```');

  // Detect indented code blocks (4+ spaces at start of line)
  formatted = formatted.replace(/^([ ]{4,}.+)$/gm, match => {
    return `\`\`\`\n${match.trim()}\n\`\`\``;
  });

  return formatted;
}

/**
 * Format URLs as markdown links
 */
function formatUrls(text: string): string {
  // Match URLs that aren't already in markdown format
  const urlRegex = /(?<!\()https?:\/\/[^\s<>[\]]+(?!\))/g;

  return text.replace(urlRegex, url => {
    return `[${url}](${url})`;
  });
}

/**
 * Format potential headers
 */
function formatHeaders(text: string): string {
  // Lines that are all caps and relatively short (likely headers)
  let formatted = text.replace(/^([A-Z][A-Z\s]{2,50})$/gm, match => {
    if (match.trim().split(' ').length <= 8) {
      return `## ${match}`;
    }
    return match;
  });

  // Lines ending with colon (section headers)
  formatted = formatted.replace(/^([^:\n]{3,60}):$/gm, '### $1:');

  return formatted;
}

/**
 * Sanitize text for display (remove potentially harmful content)
 */
export function sanitizeText(text: string): string {
  // Remove any HTML tags if present
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Extract a preview snippet from text
 */
export function extractPreview(text: string, maxLength = 200): string {
  const sanitized = sanitizeText(text);
  const firstParagraph = sanitized.split('\n\n')[0];
  return truncateText(firstParagraph, maxLength);
}
