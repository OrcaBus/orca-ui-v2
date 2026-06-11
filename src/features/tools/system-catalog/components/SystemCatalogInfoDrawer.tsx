import { NotebookText, Plus } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { InfoDrawerActionCard } from '@/components/modals/InfoDrawerActionCard';

interface SystemCatalogInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onCreateMap: () => void;
}

export function SystemCatalogInfoDrawer({
  isOpen,
  onClose,
  title,
  description,
  onCreateMap,
}: SystemCatalogInfoDrawerProps) {
  return (
    <DrawerFrame
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<NotebookText className='h-5 w-5' />}
      size='md'
    >
      <div className='space-y-6'>
        <section>
          <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Description</h3>
          <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
            {description}
          </p>
        </section>

        <section>
          <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Actions</h3>
          <div className='mt-3'>
            <InfoDrawerActionCard
              title='Create a map'
              description='Start a new architecture map with metadata, status, and tags before adding nodes and groups.'
              buttonLabel='Create New Map'
              onClick={onCreateMap}
              icon={<NotebookText className='h-4 w-4' />}
              buttonIcon={<Plus className='h-4 w-4' />}
            />
          </div>
        </section>
      </div>
    </DrawerFrame>
  );
}
