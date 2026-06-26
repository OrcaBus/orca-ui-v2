import type { FilterFieldConfig } from '@/components/tables/AdvancedFilterBar';

export const PROJECT_FILTER_FIELDS: FilterFieldConfig[] = [
  {
    key: 'orcabusId',
    label: 'Orcabus ID',
    placeholder: 'Enter Orcabus IDs...',
  },
  {
    key: 'projectId',
    label: 'Project ID',
    placeholder: 'Enter Project IDs...',
  },
  {
    key: 'name',
    label: 'Name',
    placeholder: 'Enter Project Names...',
  },
];
