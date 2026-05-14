import { describe, expect, it } from 'vitest';
import { createFileListQueryParams, createFilesFilters } from '../useFilesQueryParams';

describe('createFilesFilters', () => {
  it('defaults S3 key pattern filters to AND when keyOp is absent', () => {
    const filters = createFilesFilters({ key: ['*.bam', '*.cram'] });

    expect(filters.keyOp).toBe('and');
  });
});

describe('createFileListQueryParams', () => {
  it('uses AND for S3 key pattern params by default', () => {
    const filters = createFilesFilters({
      key: ['*.html', '*/bclconvert-interop-qc/*', '*/oncoanalyser-wgts-dna-rna/*'],
      bucket: 'test-data-503977275616-ap-southeast-2',
      portalRunId: '20260514b6560a0d',
    });

    const params = createFileListQueryParams({
      filters,
      search: '',
      pagination: { page: 1, rowsPerPage: 10 },
      orderBy: '',
    });

    expect(params['key[and][]']).toEqual([
      '*.html',
      '*/bclconvert-interop-qc/*',
      '*/oncoanalyser-wgts-dna-rna/*',
    ]);
    expect(params['key[or][]']).toBeUndefined();
    expect(params['bucket[or][]']).toEqual(['test-data-503977275616-ap-southeast-2']);
    expect(params['attributes[portalRunId][]']).toEqual(['20260514b6560a0d']);
  });

  it('always uses OR for bucket params even when legacy bucketOp is present', () => {
    const filters = createFilesFilters({ bucket: ['bucket-a', 'bucket-b'], bucketOp: 'and' });

    const params = createFileListQueryParams({
      filters,
      search: '',
      pagination: { page: 1, rowsPerPage: 10 },
      orderBy: '',
    });

    expect(params['bucket[or][]']).toEqual(['bucket-a', 'bucket-b']);
    expect(params['bucket[and][]']).toBeUndefined();
  });
});
