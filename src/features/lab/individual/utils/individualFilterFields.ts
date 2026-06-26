import type { FilterFieldConfig } from '@/components/tables/AdvancedFilterBar';

export const INDIVIDUAL_FILTER_FIELDS: FilterFieldConfig[] = [
  {
    type: 'text',
    key: 'orcabusId',
    label: 'Orcabus ID',
    placeholder: 'Enter Orcabus IDs...',
  },
  {
    type: 'text',
    key: 'individualId',
    label: 'Individual ID',
    placeholder: 'Enter Individual IDs...',
  },
];
