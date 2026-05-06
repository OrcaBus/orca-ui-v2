import { TrackLoad, TrackType } from 'igv';
import { fetchAuthSession } from 'aws-amplify/auth';

export type IgvTrackSourceType = 'file' | 'htsget';

/**
 * Extracts the filename from an S3 key to use as the IGV track display name.
 * Strips the full path prefix, keeping only the final path segment.
 *
 * @example
 * constructIgvNameParameter({ key: 'results/sample/NA12878.bam' })
 * // → 'NA12878.bam'
 */
export const constructIgvNameParameter = ({ key }: { key: string }): string => {
  const filename = key.split('/').pop() ?? key;
  return `${filename}`;
};

/**
 * Derives the expected S3 key for the index file of a given genomic data file.
 * IGV requires a co-located index file to enable random-access seeking without
 * downloading the entire file.
 *
 * Supported mappings:
 * - `.bam`    → `.bam.bai`  (BAM index)
 * - `.vcf`    → `.vcf.tbi`  (tabix index)
 * - `.vcf.gz` → `.vcf.gz.tbi` (tabix index for bgzip-compressed VCF)
 * - `.cram`   → `.cram.crai` (CRAM index)
 *
 * @throws {Error} If the file extension does not have a known index format.
 */
export const createIdxFileKey = (key: string): string => {
  if (key.endsWith('.bam')) {
    return key + '.bai';
  } else if (key.endsWith('.vcf') || key.endsWith('.vcf.gz')) {
    return key + '.tbi';
  } else if (key.endsWith('.cram')) {
    return key + '.crai';
  } else {
    throw new Error('No index file for this file');
  }
};

/**
 * Returns whether a file can be streamed via htsget rather than fetched as a
 * raw presigned S3 URL. htsget is a GA4GH streaming protocol that supports
 * efficient range queries over BAM and VCF files.
 *
 * CRAM is currently excluded because htsget CRAM support requires the
 * reference genome to be available server-side.
 */
export const canUseHtsGet = (key: string): boolean => {
  return key.endsWith('.bam') || key.endsWith('.vcf') || key.endsWith('.vcf.gz');
};

/**
 * Builds the htsget endpoint URL for a given S3 file.
 *
 * htsget URLs follow the GA4GH spec path structure:
 * - VCF / VCF.GZ → `<base>/variants/<bucket>/<key-without-ext>`
 * - BAM          → `<base>/reads/<bucket>/<key-without-ext>`
 *
 * Both the bucket name and each path segment of the S3 key are
 * percent-encoded independently to handle special characters safely.
 *
 * @throws {Error} If the file type is not supported by htsget (e.g. CRAM).
 */
export const constructHtsGetUrl = ({
  htsGetBaseUrl,
  bucket,
  s3Key,
}: {
  htsGetBaseUrl: string;
  bucket: string;
  s3Key: string;
}) => {
  const htsGetBaseUrlWithoutTrailingSlash = htsGetBaseUrl.replace(/\/+$/, '');
  const encodedBucket = encodeURIComponent(bucket);
  const s3KeyNoExt = s3Key.replace(/\.vcf\.gz|\.vcf|\.bam|\.cram$/, '');
  const encodedS3KeyNoExt = s3KeyNoExt.split('/').map(encodeURIComponent).join('/');

  if (s3Key.endsWith('.vcf') || s3Key.endsWith('.vcf.gz')) {
    return `${htsGetBaseUrlWithoutTrailingSlash}/variants/${encodedBucket}/${encodedS3KeyNoExt}`;
  } else if (s3Key.endsWith('.bam')) {
    return `${htsGetBaseUrlWithoutTrailingSlash}/reads/${encodedBucket}/${encodedS3KeyNoExt}`;
  } else {
    throw new Error('Unsupported file type for htsget IGV url');
  }
};

/**
 * Retrieves the current user's Cognito ID token from the active AWS Amplify
 * session and returns it as an HTTP `Authorization` header object.
 *
 * Used by htsget tracks, which require bearer-token auth on every range
 * request IGV sends to the htsget endpoint.
 */
export const constructIgvAuthToken = async () => {
  const accessToken = (await fetchAuthSession()).tokens?.idToken?.toString();
  return { Authorization: `Bearer ${accessToken}` };
};

/**
 * Builds an IGV.js `TrackLoad` configuration object for a genomic file.
 *
 * Handles two source types:
 * - `'file'`   — direct presigned S3 URLs; requires both the data file URL
 *               and the index file URL (`idxFilePresignedUrl`).
 * - `'htsget'` — GA4GH htsget streaming; uses the htsget endpoint URL and
 *               attaches a Cognito bearer token header (fetched at call time).
 *
 * Track `type` and `format` are inferred from the file extension:
 * - `.vcf` / `.vcf.gz` → `variant` track, `vcf` format
 * - `.bam`             → `alignment` track, `bam` format
 * - `.cram`            → `alignment` track, `cram` format
 *
 * @throws {Error} If the file extension is not a supported IGV track format.
 */
export const createIgvFileTrack = async ({
  igvName,
  baseFileUrl,
  idxFilePresignedUrl,
  sourceType,
}: {
  igvName: string;
  baseFileUrl: string;
  idxFilePresignedUrl?: string;
  sourceType: IgvTrackSourceType;
}): Promise<TrackLoad<TrackType>> => {
  const baseTrack = {
    sourceType,
    url: baseFileUrl,
    indexURL: sourceType === 'file' ? idxFilePresignedUrl : undefined,
    name: igvName,
    headers: sourceType === 'htsget' ? await constructIgvAuthToken() : undefined,
  };

  if (igvName.endsWith('vcf') || igvName.endsWith('vcf.gz')) {
    return {
      ...baseTrack,
      type: 'variant',
      format: 'vcf',
    };
  } else if (igvName.endsWith('bam')) {
    return {
      ...baseTrack,
      type: 'alignment',
      format: 'bam',
    };
  } else if (igvName.endsWith('cram')) {
    return {
      ...baseTrack,
      type: 'alignment',
      format: 'cram',
    };
  } else {
    throw new Error('Unsupported file type for IGV track creation');
  }
};
