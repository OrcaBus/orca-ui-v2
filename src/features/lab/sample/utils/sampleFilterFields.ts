import type { FilterFieldConfig } from '@/components/tables/AdvancedFilterBar';

export const SAMPLE_FILTER_FIELDS: FilterFieldConfig[] = [
  {
    key: 'orcabusId',
    label: 'Orcabus ID',
    placeholder: 'Enter Orcabus IDs...',
  },
  {
    key: 'sampleId',
    label: 'Sample ID',
    placeholder: 'Enter Sample IDs...',
  },
  {
    key: 'individualId',
    label: 'Individual ID (SBJ ID)',
    placeholder: 'Enter Individual IDs...',
  },
  {
    key: 'libraryId',
    label: 'Library ID',
    placeholder: 'Enter Library IDs...',
  },
];
