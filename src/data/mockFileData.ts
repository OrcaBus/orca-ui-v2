/**
 * Mock data matching the Files API response shape.
 * Use mapApiFileToFile() to convert to the app's File type for the Files List table.
 */

import type { File } from './mockData';

export interface FileApiAttributes {
  portalRunId?: string;
}

export interface FileApiItem {
  s3ObjectId: string;
  eventType: string;
  bucket: string;
  key: string;
  versionId: string | null;
  eventTime: string;
  size: number;
  sha256: string | null;
  lastModifiedDate: string;
  eTag: string | null;
  storageClass: string;
  sequencer: string;
  isDeleteMarker: boolean;
  numberDuplicateEvents: number;
  attributes: FileApiAttributes | null;
  deletedDate: string | null;
  deletedSequencer: string | null;
  numberReordered: number;
  ingestId: string;
  isCurrentState: boolean;
  reason: string;
  archiveStatus: string | null;
  isAccessible: boolean;
}

export interface FilesApiResponse {
  links: { previous: string | null; next: string | null };
  pagination: {
    count: number;
    page: number;
    rowsPerPage: number;
  };
  results: FileApiItem[];
}

/** Derive file type label from key/extension for display. */
function fileTypeFromKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith('.fastq.gz') || lower.endsWith('.fq.gz')) return 'FASTQ';
  if (lower.endsWith('.bam')) return 'BAM';
  if (lower.endsWith('.bam.bai')) return 'BAI';
  if (lower.endsWith('.vcf.gz')) return 'VCF';
  if (lower.endsWith('.csv')) return 'CSV';
  if (lower.endsWith('.tsv')) return 'TSV';
  if (lower.endsWith('.html')) return 'HTML';
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.png') || lower.endsWith('.jpg')) return 'PNG';
  return 'FILE';
}

/** Map API file item to app File type for the Files List table. */
export function mapApiFileToFile(item: FileApiItem): File {
  const name = item.key.split('/').pop() ?? item.key;
  const sizeBytes = item.size;
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = sizeBytes === 0 ? 0 : Math.floor(Math.log(sizeBytes) / Math.log(k));
  const sizeStr =
    (sizeBytes === 0 ? 0 : parseFloat((sizeBytes / Math.pow(k, i)).toFixed(1))) + ' ' + sizes[i];

  return {
    id: item.s3ObjectId,
    name,
    s3Key: item.key,
    bucket: item.bucket,
    type: fileTypeFromKey(item.key),
    size: sizeStr,
    sizeBytes,
    dateCreated: item.lastModifiedDate,
    dateModified: item.lastModifiedDate,
    status: item.isAccessible ? 'available' : 'archived',
    portalRunId: item.attributes?.portalRunId,
  };
}

export const mockFileData: FilesApiResponse = {
  links: {
    previous: null,
    next: null,
  },
  pagination: {
    count: 4,
    page: 1,
    rowsPerPage: 20,
  },
  results: [
    // FASTQ-style entries matching Files List design (type badge, path, size, last modified)
    {
      s3ObjectId: '019cc5d2-5e64-7f01-a7be-e33527c75a25',
      eventType: 'Created',
      bucket: 'orcabus-seq-data',
      key: 'orcabus-seq-data/240201_A01052_0089/FASTQ/sample_NGS-001_R1.fastq.gz',
      versionId: 'vDb3VIdgZoirJMA6zQoTTnErd3Q3lfF.',
      eventTime: '2026-02-03T02:30:00Z',
      size: 13200000000, // 12.3 GB
      sha256: null,
      lastModifiedDate: '2026-02-03T02:30:00Z',
      eTag: '"4e68dbb7b0db5d7db1b7f52d1fd12229"', // pragma: allowlist secret
      storageClass: 'Standard',
      sequencer: '0069AB796EBA7B4488', // pragma: allowlist secret
      isDeleteMarker: false,
      numberDuplicateEvents: 0,
      attributes: { portalRunId: '20260202abcdef' },
      deletedDate: null,
      deletedSequencer: null,
      numberReordered: 0,
      ingestId: '019cc5d2-5ee5-79a3-a5fc-54a224cf0d32',
      isCurrentState: true,
      reason: 'CreatedPut',
      archiveStatus: null,
      isAccessible: true,
    },
    {
      s3ObjectId: '019ccf02-cdcf-7690-a49f-a87d544421ac',
      eventType: 'Created',
      bucket: 'orcabus-seq-data',
      key: 'orcabus-seq-data/240201_A01052_0089/FASTQ/sample_NGS-001_R2.fastq.gz',
      versionId: 'aLf5ejYkOvpTAdbALsWyIH2Hqks6.Y_X',
      eventTime: '2026-02-03T02:35:00Z',
      size: 13400000000, // 12.5 GB
      sha256: null,
      lastModifiedDate: '2026-02-03T02:35:00Z',
      eTag: '"f88631a88b09f6fd12384bdce06fa69c-2"', // pragma: allowlist secret
      storageClass: 'Standard',
      sequencer: '0000000ABCDEFG', // pragma: allowlist secret
      isDeleteMarker: false,
      numberDuplicateEvents: 0,
      attributes: { portalRunId: '20260202abcdef' },
      deletedDate: null,
      deletedSequencer: null,
      numberReordered: 0,
      ingestId: '019cc5d2-5ea2-7980-b5c2-1dbe969db69d',
      isCurrentState: true,
      reason: 'CreatedPut',
      archiveStatus: null,
      isAccessible: true,
    },
    // Original API-style entries (different bucket)
    {
      s3ObjectId: '019cc5d2-5e64-7f01-a7be-e33527c75a26',
      eventType: 'Created',
      bucket: 'pipeline-prod-cache-503977275616-ap-southeast-2',
      key: 'byob-icav2/production/analysis/bclconvert-interop-qc/202603052278db3e/260305_A00000_0000_BHTTFCDSXF_multiqc_bclconvert_summary_qlims.csv',
      versionId: 'vDb3VIdgZoirJMA6zQoTTnErd3Q3lfF.',
      eventTime: '2026-03-07T01:03:42Z',
      size: 769,
      sha256: null,
      lastModifiedDate: '2026-03-07T01:03:43Z',
      eTag: '"4e68dbb7b0db5d7dbabcdfefhsks"', // pragma: allowlist secret
      storageClass: 'Standard',
      sequencer: '0000000ABCDEFG', // pragma: allowlist secret
      isDeleteMarker: false,
      numberDuplicateEvents: 0,
      attributes: { portalRunId: '20260305227abcdf' }, // pragma: allowlist secret
      deletedDate: null,
      deletedSequencer: null,
      numberReordered: 0,
      ingestId: '019cc5d2-5ee5-79a3-a5fc-54a224cf0d32',
      isCurrentState: true,
      reason: 'CreatedPut',
      archiveStatus: null,
      isAccessible: true,
    },
    {
      s3ObjectId: '019ccf02-cdcf-7690-a49f-a87d544421ad',
      eventType: 'Created',
      bucket: 'pipeline-prod-cache-503977275616-ap-southeast-2',
      key: 'byob-icav2/production/analysis/bclconvert-interop-qc/202603052278db3e/multiqc/260305_A00000_0000_BHTTFCDSXF_multiqc_report.html',
      versionId: 'aLf5ejYkOvpTAdbALsWyIH2Hqks6.Y_X',
      eventTime: '2026-03-08T19:53:08Z',
      size: 6181650,
      sha256: null,
      lastModifiedDate: '2026-03-07T01:03:43Z',
      eTag: '"f88631a88b09fasdcvdbjklkdfgddce06fa69c-2"', // pragma: allowlist secret
      storageClass: 'IntelligentTiering',
      sequencer: '0000000ABCDEFG', // pragma: allowlist secret
      isDeleteMarker: false,
      numberDuplicateEvents: 0,
      attributes: { portalRunId: '20260305227abcdf' }, // pragma: allowlist secret
      deletedDate: null,
      deletedSequencer: null,
      numberReordered: 0,
      ingestId: '019cc5d2-5ea2-7980-b5c2-1dbe969db69d',
      isCurrentState: true,
      reason: 'StorageClassChanged',
      archiveStatus: null,
      isAccessible: true,
    },
  ],
};

/** Files List table-ready list from API mock. Use in FilesPage for testing. */
export const mockFilesFromApi = mockFileData.results.map(mapApiFileToFile);
