import { Edit, Trash2 } from 'lucide-react';
import { PageBreadcrumb } from '../../../components/ui/PageBreadcrumb';
import type { Case } from '../types/case.types';

interface CaseDetailPageHeaderProps {
  case_: Case;
  onEdit: () => void;
  onDelete: () => void;
}

export function CaseDetailPageHeader({ case_, onEdit, onDelete }: CaseDetailPageHeaderProps) {
  return (
    <>
      <PageBreadcrumb items={[{ label: 'Cases', href: '/cases' }, { label: case_.title }]} />
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
            {case_.title}
            {case_.alias && (
              <span className='ml-3 font-mono text-lg font-normal text-neutral-500 dark:text-neutral-400'>
                {case_.alias}
              </span>
            )}
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={onEdit}
            className='flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-[#1e252e] dark:text-neutral-200 dark:hover:bg-neutral-700/50'
          >
            <Edit className='h-4 w-4' />
            Edit Case
          </button>
          <button
            onClick={onDelete}
            className='flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/50 dark:bg-[#1e252e] dark:text-red-400 dark:hover:bg-red-500/10'
          >
            <Trash2 className='h-4 w-4' />
            Delete Case
          </button>
        </div>
      </div>
    </>
  );
}
