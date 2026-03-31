import type { FilterFieldConfig } from '@/components/tables/AdvancedFilterBar';
import type {
  PhenotypeEnum,
  QualityEnum,
  TypeEnum,
  WorkflowEnum,
} from '@/features/lab/api/lab.api';

const toSelectOptions = <T extends string>(values: readonly T[]) =>
  values.map((value) => ({
    label: value,
    value,
  }));

const phenotypeOptions: readonly PhenotypeEnum[] = ['normal', 'tumor', 'negative-control'];
const qualityOptions: readonly QualityEnum[] = ['very-poor', 'poor', 'good', 'borderline'];
const typeOptions: readonly TypeEnum[] = [
  '10X',
  'BiModal',
  'ctDNA',
  'ctTSO',
  'exome',
  'MeDIP',
  'Metagenm',
  'MethylSeq',
  'TSO-DNA',
  'TSO-RNA',
  'WGS',
  'WTS',
  'iMethyl5B',
  'iMthyl5BCap',
  'other',
];
const workflowOptions: readonly WorkflowEnum[] = [
  'clinical',
  'research',
  'qc',
  'control',
  'bcl',
  'manual',
  'germline',
];

export const LAB_FILTER_FIELDS: FilterFieldConfig[] = [
  { key: 'orcabusId', label: 'Orcabus ID', placeholder: 'All' },
  { key: 'libraryId', label: 'Library ID', placeholder: 'All' },
  { key: 'assay', label: 'Assay', placeholder: 'All Assays' },
  { key: 'individualId', label: 'Individual ID', placeholder: 'All' },
  { key: 'projectId', label: 'Project ID', placeholder: 'All Projects' },
  {
    type: 'range',
    label: 'Coverage',
    minKey: 'coverageMin',
    maxKey: 'coverageMax',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Max',
    formatBadge: (min, max) => `Coverage: ${min ? `${min}x` : '0x'} – ${max ? `${max}x` : '∞'}`,
  },
  {
    type: 'multi-select',
    key: 'phenotype',
    label: 'Phenotype',
    options: toSelectOptions(phenotypeOptions),
  },
  {
    type: 'multi-select',
    key: 'quality',
    label: 'Quality',
    options: toSelectOptions(qualityOptions),
  },
  {
    type: 'multi-select',
    key: 'type',
    label: 'Type',
    options: toSelectOptions(typeOptions),
  },
  {
    type: 'multi-select',
    key: 'workflow',
    label: 'Workflow',
    options: toSelectOptions(workflowOptions),
  },
];
