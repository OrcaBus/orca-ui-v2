import type { FilterFieldConfig } from '@/components/tables/AdvancedFilterBar';

export const SUBJECT_FILTER_FIELDS: FilterFieldConfig[] = [
  {
    key: 'orcabusId',
    label: 'Orcabus ID',
    placeholder: 'Enter Orcabus IDs...',
  },
  {
    key: 'subjectId',
    label: 'Subject ID',
    placeholder: 'Enter Subject IDs...',
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
