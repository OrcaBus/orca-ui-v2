import mimeDb from 'mime-db';

/** Scheme prefix on every S3 URI (`s3://bucket/key`). */
export const S3_URI_PREFIX = 's3://';

/**
 * Splits an `s3://bucket/key` URI into its bucket and key parts.
 * Returns `null` when the value is not an S3 URI or names no bucket, so callers
 * can branch on the result instead of guarding against a throw.
 *
 * @example parseS3Uri('s3://my-bucket/results/NA12878.bam')
 *          // → { bucket: 'my-bucket', key: 'results/NA12878.bam' }
 * @example parseS3Uri('s3://my-bucket/analysis/')
 *          // → { bucket: 'my-bucket', key: 'analysis/' }
 * @example parseS3Uri('not-a-uri') // → null
 */
export function parseS3Uri(value: string): { bucket: string; key: string } | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith(S3_URI_PREFIX)) return null;

  const [bucket, ...keyParts] = trimmed.slice(S3_URI_PREFIX.length).split('/');
  if (!bucket) return null;

  return { bucket, key: keyParts.join('/') };
}

/**
 * Extracts the filename from a full S3 key or file path by stripping all
 * leading path segments. `getFileExtension` calls this internally.
 *
 * @example getFilename('results/sample/NA12878.bam') // → 'NA12878.bam'
 * @example getFilename('report.html')                // → 'report.html'
 */
export function getFilename(key: string): string {
  return key.includes('/') ? key.substring(key.lastIndexOf('/') + 1) : key;
}

/** Returns the uppercased file extension (e.g. `'BAM'`), or `'FILE'` if none.
 *  Returns `'PATH'` when the key is an S3 folder path (ends with `/` or has no
 *  filename segment), since there is no file — and therefore no extension — to inspect.
 */
export function getFileExtension(key: string): string {
  const filename = getFilename(key);
  if (!filename) return 'PATH';
  const dotIdx = filename.lastIndexOf('.');
  return dotIdx > 0 ? filename.substring(dotIdx + 1).toUpperCase() : 'FILE';
}

/**
 * Converts a raw byte count into a human-readable size string.
 *
 * @example formatBytes(0)          // → '0 B'
 * @example formatBytes(1536)        // → '1.50 KB'
 * @example formatBytes(1073741824)  // → '1.00 GB'
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * Tailwind class map and lookup helper for file-type badge colours.
 * `FILE_TYPE_BADGE_STYLES` is the colour table; `getFileTypeBadgeStyle` looks
 * up a type string and falls back to a neutral style for unknown extensions.
 */
const FILE_TYPE_BADGE_STYLES: Record<string, string> = {
  VCF: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  BAM: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  BAI: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  PDF: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  LOG: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  FASTQ: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  CSV: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  TSV: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  HTML: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
};

export function getFileTypeBadgeStyle(type: string): string {
  return (
    FILE_TYPE_BADGE_STYLES[type.toUpperCase()] ??
    'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
  );
}

/**
 * Canonical file-extension lists used by `FileViewer` to route each file to
 * the correct viewer component, and by the guard functions below to determine
 * viewability and downloadability.
 *
 * - IMAGE      → `ImageViewer`   (inline image render)
 * - IFRAME     → `IFrameViewer`  (sandboxed iframe)
 * - DSV        → `TableViewer`   (delimited-value grid)
 * - PLAIN/OTHER → `TextViewer`   (plain-text / code preview)
 * - IGV        → `IgvViewer`     (genomic browser)
 */
export const IMAGE_FILETYPE_LIST: string[] = ['png', 'jpg', 'jpeg'];
export const IFRAME_FILETYPE_LIST: string[] = ['html', 'pdf'];
export const DELIMITER_SEPARATED_VALUE_FILETYPE_LIST: string[] = ['csv', 'tsv'];
export const PLAIN_FILETYPE_LIST: string[] = ['txt', 'md5sum'];
export const OTHER_FILETYPE_LIST: string[] = ['json', 'yaml', 'yml'];
export const IGV_FILETYPE_LIST: string[] = ['bam', 'vcf', 'vcf.gz', 'cram'];

/** Returns `true` when the file extension is supported by any viewer component. */
export const isFileViewable = (s3Key: string): boolean => {
  const filetypeList = [
    ...IMAGE_FILETYPE_LIST,
    ...IFRAME_FILETYPE_LIST,
    ...PLAIN_FILETYPE_LIST,
    ...OTHER_FILETYPE_LIST,
    ...DELIMITER_SEPARATED_VALUE_FILETYPE_LIST,
    ...IGV_FILETYPE_LIST,
  ];
  return !!filetypeList.find((f) => s3Key.endsWith(f));
};

/** Returns `true` when the file is small enough to preview inline (< 50 MB). */
export const isFileSizeAcceptable = (objectSize: number): boolean => {
  // Only allow to view size less than 50MB
  if (objectSize < 50000000) {
    return true;
  }
  return false;
};

/**
 * Returns `true` when the file type supports direct download.
 * Strips `.gz` before checking so that compressed variants (e.g. `vcf.gz`)
 * are matched by their base extension.
 */
export const isFileDownloadable = (s3Key: string): boolean => {
  const filetypeList: string[] = [
    'vcf',
    'maf',
    ...IMAGE_FILETYPE_LIST,
    ...IFRAME_FILETYPE_LIST,
    ...DELIMITER_SEPARATED_VALUE_FILETYPE_LIST,
    ...PLAIN_FILETYPE_LIST,
    ...OTHER_FILETYPE_LIST,
  ];

  // Remove the compressed (`.gz`) extension
  const normalizedKey = s3Key.replace(/\.gz$/, '');

  return !!filetypeList.find((f) => normalizedKey.endsWith(f));
};

// ---------------------------------------------------------------------------
// getMimeType and related utilities for file viewers and presigned URL generation
// ---------------------------------------------------------------------------

/**
 * Minimal shape of a mime-db entry used for the reverse-lookup index.
 *
 * `mime-db` ships no bundled TypeScript declarations; `@types/mime-db` uses a
 * CJS-style `export =` that is unresolvable under `moduleResolution: bundler`.
 * Asserting only the fields we need avoids the "error typed" compiler diagnostic
 * without requiring changes to tsconfig.
 */
type MimeDbEntry = { readonly extensions?: readonly string[] };
const mimeDbTyped = mimeDb as Record<string, MimeDbEntry>;

/**
 * Reverse lookup map: lowercase file extension → MIME type string.
 *
 * Intentionally built once at module load rather than inside `getMimeType`:
 * mime-db contains hundreds of entries, so constructing the index on every call
 * would be O(n) per invocation. Module-level initialisation amortises the cost
 * to a single pass, making each subsequent lookup O(1).
 *
 * First registered entry wins, which corresponds to the most canonical MIME
 * type for each extension as ordered by mime-db.
 */
const extToMimeType: Record<string, string> = {};
for (const mimeType of Object.keys(mimeDbTyped)) {
  const extensions = mimeDbTyped[mimeType]?.extensions;
  if (extensions) {
    for (const ext of extensions) {
      if (!extToMimeType[ext]) extToMimeType[ext] = mimeType;
    }
  }
}

/**
 * Resolves a filename or S3 key to its MIME type string (e.g. `"image/png"`).
 * Falls back to `"application/octet-stream"` for unknown or extensionless filenames.
 *
 * Lookup is O(1) via `extToMimeType`, a reverse index over `mime-db` built once
 * at module load time.
 */
export function getMimeType(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const ext = dot !== -1 ? filename.substring(dot + 1).toLowerCase() : '';
  return extToMimeType[ext] ?? 'application/octet-stream';
}

// ---------------------------------------------------------------------------
// Utility for fetching presigned URL content, used by file viewers that need to display file content inline (e.g. TableViewer)
// ---------------------------------------------------------------------------

/**
 * Fetches raw text content from a presigned S3 URL.
 * Throws on non-2xx HTTP responses.
 */
export async function getPresignedUrlData(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch presigned URL data: ${response.status} ${response.statusText}`
    );
  }
  return response.text();
}
