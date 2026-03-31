/**
 * Get username from email (e.g. "test.name@example" → "Test Name")
 */
export function getUsername(email: string) {
  return email
    .split('@')[0]
    .split('.')
    .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
    .join(' ');
}

/**
 * Format string in Space Case (e.g. "PascalCase" → "Pascal Case")
 */
export const formatSpaceCase = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Extract filename from S3 key (e.g. "path/to/file.txt" → "file.txt")
 */
export const getFilenameFromKey = (key: string): string => {
  return key.split('/').pop() || '';
};
