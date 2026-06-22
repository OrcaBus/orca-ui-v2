import type { LibraryDetailType } from '../../shared/api/lab.api';
import type { S3Record } from '@/features/files/api/files.api';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constants';
import { getFilename } from '@/utils/files';

type LibraryLinkageInput = Pick<LibraryDetailType, 'type' | 'assay'>;
type LinkageFileInput = Pick<S3Record, 'bucket' | 'key'>;

export type LibraryLinkageWorkflowGroupKey = 'sash' | 'tumor-normal' | 'wts' | 'rnasum' | 'cttsov2';

export type LibraryLinkageFileGroupKey = 'sequence' | 'analysis' | 'metrics' | 'reports' | 'other';

export type LibraryLinkageWorkflowConfig = {
  key: LibraryLinkageWorkflowGroupKey;
  label: string;
  workflowNames: string[];
  keyPatterns: string[];
};

export type LibraryLinkageFileSummary = {
  id: string;
  filename: string;
};

export type LibraryLinkageFileGroup = {
  key: LibraryLinkageFileGroupKey;
  label: string;
  files: LibraryLinkageFileSummary[];
};

type LatestWorkflowRunQueryParamsArgs = {
  libraryOrcabusId: string;
  workflowNames: string[];
};

type LinkageFileQueryParamsArgs = {
  portalRunId: string;
  keyPatterns: string[];
};

export const LIBRARY_LINKAGE_FILE_GROUPS: ReadonlyArray<{
  key: LibraryLinkageFileGroupKey;
  label: string;
}> = [
  { key: 'sequence', label: 'Sequence Files' },
  { key: 'analysis', label: 'Analysis Files' },
  { key: 'metrics', label: 'Metrics' },
  { key: 'reports', label: 'Reports' },
  { key: 'other', label: 'Other Files' },
];

const WORKFLOW_LINKAGE_CONFIGS = {
  sash: {
    key: 'sash',
    label: 'SASH',
    workflowNames: ['sash'],
    keyPatterns: [
      '*.html',
      '*circos*.png',
      '*/smlv_somatic/filter/*.pass.vcf.gz',
      '*/smlv_germline/report/*annotations.vcf.gz',
    ],
  },
  'tumor-normal': {
    key: 'tumor-normal',
    label: 'Tumor Normal',
    workflowNames: ['tumor-normal', 'dragen-wgts-dna'],
    keyPatterns: ['*.bam'],
  },
  wts: {
    key: 'wts',
    label: 'WTS',
    workflowNames: ['wts', 'dragen-wgts-rna'],
    keyPatterns: ['*multiqc*.html', '*fusions*.pdf', '*.bam'],
  },
  rnasum: {
    key: 'rnasum',
    label: 'RNAsum',
    workflowNames: ['rnasum'],
    keyPatterns: ['*RNAseq_report.html', '*/genes.expr.perc.html', '*/genes.expr.z.html'],
  },
  cttsov2: {
    key: 'cttsov2',
    label: 'ctTSO',
    workflowNames: ['cttsov2', 'dragen-tso500-ctdna', 'dragen-tso500-ctDNA'],
    keyPatterns: [
      '*.bam',
      '*.tmb.msaf.csv',
      '*/Results/*/*.csv',
      '*/Results/*/*.tsv',
      '*/Results/*.vcf.gz',
      '*/Results/*.gvcf.gz',
      '*/Results/*microsat_output.json',
    ],
  },
} satisfies Record<LibraryLinkageWorkflowGroupKey, LibraryLinkageWorkflowConfig>;

export function getLibraryLinkageWorkflowConfigs(
  library: LibraryLinkageInput | null | undefined
): LibraryLinkageWorkflowConfig[] {
  const libraryType = String(library?.type ?? '').toLowerCase();
  const assay = String(library?.assay ?? '').toLowerCase();

  if (libraryType === 'wgs') {
    return [WORKFLOW_LINKAGE_CONFIGS.sash, WORKFLOW_LINKAGE_CONFIGS['tumor-normal']];
  }

  if (libraryType === 'wts') {
    return [WORKFLOW_LINKAGE_CONFIGS.wts, WORKFLOW_LINKAGE_CONFIGS.rnasum];
  }

  if (libraryType === 'ctdna' && (assay === 'cttso' || assay === 'cttsov2')) {
    return [WORKFLOW_LINKAGE_CONFIGS.cttsov2];
  }

  return [];
}

export function buildLatestWorkflowRunQueryParams({
  libraryOrcabusId,
  workflowNames,
}: LatestWorkflowRunQueryParamsArgs): Record<string, string | string[] | number> {
  return {
    page: 1,
    rows_per_page: 1,
    libraries__orcabusId: libraryOrcabusId,
    workflow__name: workflowNames,
    status: 'SUCCEEDED',
    ordering: '-portal_run_id',
  };
}

export function buildLinkageFileQueryParams({
  portalRunId,
  keyPatterns,
}: LinkageFileQueryParamsArgs): Record<string, string[] | number | boolean> {
  return {
    page: 1,
    rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
    currentState: true,
    'attributes[portalRunId][]': [portalRunId],
    'key[or][]': keyPatterns,
  };
}

export function groupLibraryLinkageFiles(files: LinkageFileInput[]): LibraryLinkageFileGroup[] {
  const seenFileIds = new Set<string>();
  const grouped = new Map<LibraryLinkageFileGroupKey, LibraryLinkageFileSummary[]>(
    LIBRARY_LINKAGE_FILE_GROUPS.map(({ key }) => [key, []])
  );

  for (const file of files) {
    const id = `${file.bucket}:${file.key}`;
    if (seenFileIds.has(id)) continue;
    seenFileIds.add(id);

    const filename = getFilename(file.key);
    const groupKey = getLibraryLinkageFileGroupKey(filename);
    grouped.get(groupKey)?.push({ id, filename });
  }

  return LIBRARY_LINKAGE_FILE_GROUPS.map(({ key, label }) => ({
    key,
    label,
    files: grouped.get(key) ?? [],
  })).filter((group) => group.files.length > 0);
}

function getLibraryLinkageFileGroupKey(filename: string): LibraryLinkageFileGroupKey {
  const normalized = filename.toLowerCase();

  if (isSequenceFilename(normalized)) {
    return 'sequence';
  }

  if (isAnalysisFilename(normalized)) {
    return 'analysis';
  }

  if (isMetricFilename(normalized)) {
    return 'metrics';
  }

  if (isReportFilename(normalized)) {
    return 'reports';
  }

  return 'other';
}

function isSequenceFilename(filename: string): boolean {
  return /\.(bam|bai|cram|crai)$/.test(filename) || /\.(fastq|fq)(\.gz)?$/.test(filename);
}

function isAnalysisFilename(filename: string): boolean {
  return /\.(vcf|gvcf|maf)(\.gz)?$/.test(filename);
}

function isMetricFilename(filename: string): boolean {
  return (
    /\.(csv|tsv|json)$/.test(filename) ||
    /(^|[._-])(metric|metrics|stat|stats|count|counts)([._-]|$)/.test(filename)
  );
}

function isReportFilename(filename: string): boolean {
  return (
    /\.(html|pdf)$/.test(filename) ||
    /\.(png|jpe?g)$/.test(filename) ||
    /(^|[._-])report([._-]|$)/.test(filename)
  );
}
