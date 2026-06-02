// default page size and size options for pagination
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_NON_PAGINATE_PAGE_SIZE = 100; // Mainly for component that do not have pagination implementation (e.g. dropdowns)
export const DEFAULT_ITEMS_PER_PAGE_OPTIONS = [3, 10, 20, 50, 100]; // list table: items per page options for larger datasets

// query params constants
export const PARAM_PAGE = 'page';
export const PARAM_ROWS_PER_PAGE = 'rowsPerPage';
export const PARAM_ORDER_BY = 'ordering';
export const PARAM_SEARCH = 'search';
export const PARAM_INFO = 'info';

export type ValidationStatus = 'passed' | 'failed';

export const WORKFLOW_PATTERNS = [
  '*/bclconvert-interop-qc/*',
  '*/cttsov2/*',
  '*/oncoanalyser-wgts-dna-rna/*',
  '*/oncoanalyser-wgts-dna/*',
  '*/oncoanalyser-wgts-rna/*',
  '*/rnasum/*',
  '*/sash/*',
  '*/tumor_normal/*',
  '*/tumor-normal/*',
  '*/umccrise/*',
  '*/wgts-qc/*',
  '*/wgtsQc/*',
  '*/wts/*',
];

export const FILE_EXTENSIONS = [
  '*.vcf.gz',
  '*.fastq.gz',
  '*.fastq.ora',
  '*.bam',
  '*.pdf',
  '*.png',
  '*.html',
];
