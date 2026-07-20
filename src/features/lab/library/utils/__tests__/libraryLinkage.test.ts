import { describe, expect, it } from 'vitest';
import type { S3Record } from '@/features/files/api/files.api';
import {
  buildLatestWorkflowRunQueryParams,
  buildLinkageFileQueryParams,
  groupLibraryLinkageFiles,
  getLibraryLinkageWorkflowConfigs,
} from '../libraryLinkage';

describe('getLibraryLinkageWorkflowConfigs', () => {
  it('selects WGS linkage workflow groups', () => {
    const configs = getLibraryLinkageWorkflowConfigs({ type: 'WGS', assay: null });

    expect(configs.map((config) => config.key)).toEqual(['sash', 'tumor-normal']);
    expect(configs[1]?.workflowNames).toEqual(['tumor-normal', 'dragen-wgts-dna']);
  });

  it('selects WTS linkage workflow groups', () => {
    const configs = getLibraryLinkageWorkflowConfigs({ type: 'WTS', assay: null });

    expect(configs.map((config) => config.key)).toEqual(['wts', 'rnasum']);
    expect(configs[0]?.workflowNames).toEqual(['wts', 'dragen-wgts-rna']);
  });

  it('selects ctTSO linkage workflow groups for cttso assay variants', () => {
    const configs = getLibraryLinkageWorkflowConfigs({ type: 'ctDNA', assay: 'ctTSOv2' });

    expect(configs.map((config) => config.key)).toEqual(['cttsov2']);
    expect(configs[0]?.workflowNames).toEqual([
      'cttsov2',
      'dragen-tso500-ctdna',
      'dragen-tso500-ctDNA',
    ]);
  });

  it('returns no configs for unsupported library types', () => {
    expect(getLibraryLinkageWorkflowConfigs({ type: 'exome', assay: null })).toEqual([]);
  });
});

describe('buildLatestWorkflowRunQueryParams', () => {
  it('builds latest successful workflow run query params for a workflow group', () => {
    const params = buildLatestWorkflowRunQueryParams({
      libraryOrcabusId: 'lib.123',
      workflowNames: ['tumor-normal', 'dragen-wgts-dna'],
    });

    expect(params).toEqual({
      page: 1,
      rows_per_page: 1,
      libraries__orcabusId: 'lib.123',
      workflow__name: ['tumor-normal', 'dragen-wgts-dna'],
      status: 'SUCCEEDED',
      ordering: '-portal_run_id',
    });
  });
});

describe('buildLinkageFileQueryParams', () => {
  it('builds current-state file query params for a portal run and OR key patterns', () => {
    const params = buildLinkageFileQueryParams({
      portalRunId: '20260514abcd', // pragma: allowlist secrets
      keyPatterns: ['*.html', '*.vcf.gz'],
    });

    expect(params).toEqual({
      page: 1,
      rowsPerPage: 100,
      currentState: true,
      'attributes[portalRunId][]': ['20260514abcd'], //pragma: allowlist secrets
      'key[or][]': ['*.html', '*.vcf.gz'],
    });
  });
});

describe('groupLibraryLinkageFiles', () => {
  it('groups files by filename-derived category and preserves the source record', () => {
    const grouped = groupLibraryLinkageFiles([
      record('bucket-a', 'analysis/run-a/sequence/sample.bam'),
      record('bucket-a', 'analysis/run-a/variants/sample.pass.vcf.gz'),
      record('bucket-a', 'analysis/run-a/metrics/sample_metrics.csv'),
      record('bucket-a', 'analysis/run-a/reports/sample_report.html'),
      record('bucket-a', 'analysis/run-a/notes/readme.without-known-type'),
    ]);

    expect(grouped).toEqual([
      {
        key: 'sequence',
        label: 'Sequence Files',
        files: [
          {
            id: 'bucket-a:analysis/run-a/sequence/sample.bam',
            filename: 'sample.bam',
            record: record('bucket-a', 'analysis/run-a/sequence/sample.bam'),
          },
        ],
      },
      {
        key: 'analysis',
        label: 'Analysis Files',
        files: [
          {
            id: 'bucket-a:analysis/run-a/variants/sample.pass.vcf.gz',
            filename: 'sample.pass.vcf.gz',
            record: record('bucket-a', 'analysis/run-a/variants/sample.pass.vcf.gz'),
          },
        ],
      },
      {
        key: 'metrics',
        label: 'Metrics',
        files: [
          {
            id: 'bucket-a:analysis/run-a/metrics/sample_metrics.csv',
            filename: 'sample_metrics.csv',
            record: record('bucket-a', 'analysis/run-a/metrics/sample_metrics.csv'),
          },
        ],
      },
      {
        key: 'reports',
        label: 'Reports',
        files: [
          {
            id: 'bucket-a:analysis/run-a/reports/sample_report.html',
            filename: 'sample_report.html',
            record: record('bucket-a', 'analysis/run-a/reports/sample_report.html'),
          },
        ],
      },
      {
        key: 'other',
        label: 'Other Files',
        files: [
          {
            id: 'bucket-a:analysis/run-a/notes/readme.without-known-type',
            filename: 'readme.without-known-type',
            record: record('bucket-a', 'analysis/run-a/notes/readme.without-known-type'),
          },
        ],
      },
    ]);
  });

  it('dedupes repeated records by bucket and S3 key', () => {
    const grouped = groupLibraryLinkageFiles([
      record('bucket-a', 'analysis/run-a/sample.bam'),
      record('bucket-a', 'analysis/run-a/sample.bam'),
      record('bucket-b', 'analysis/run-a/sample.bam'),
    ]);

    expect(grouped).toHaveLength(1);
    expect(grouped[0]?.files).toEqual([
      {
        id: 'bucket-a:analysis/run-a/sample.bam',
        filename: 'sample.bam',
        record: record('bucket-a', 'analysis/run-a/sample.bam'),
      },
      {
        id: 'bucket-b:analysis/run-a/sample.bam',
        filename: 'sample.bam',
        record: record('bucket-b', 'analysis/run-a/sample.bam'),
      },
    ]);
  });
});

function record(bucket: string, key: string): S3Record {
  return { bucket, key } as unknown as S3Record;
}
