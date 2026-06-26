import type { FilterFieldConfig } from '@/components/tables/AdvancedFilterBar';

export const SUBJECT_FILTER_FIELDS: FilterFieldConfig[] = [
  {
    type: 'text',
    key: 'orcabusId',
    label: 'Orcabus ID',
    placeholder: 'Enter Orcabus IDs...',
  },
  {
    type: 'text',
    key: 'subjectId',
    label: 'Subject ID',
    placeholder: 'Enter Subject IDs...',
  },
  {
    type: 'text',
    key: 'individualId',
    label: 'Individual ID (SBJ ID)',
    placeholder: 'Enter Individual IDs...',
  },
  {
    type: 'text',
    key: 'libraryId',
    label: 'Library ID',
    placeholder: 'Enter Library IDs...',
  },
];
