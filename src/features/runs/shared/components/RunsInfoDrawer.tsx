import { useState } from 'react';
import { Activity, Database } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { InfoDrawerActionCard } from '@/components/modals/InfoDrawerActionCard';
import { ModelViewDialog } from '@/components/modals/ModelViewDialog';

interface RunsInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  modelSchema?: {
    url: string;
    title: string;
    description: string;
    previewSummary: string;
  };
}

export function RunsInfoDrawer({
  isOpen,
  onClose,
  title,
  description,
  modelSchema,
}: RunsInfoDrawerProps) {
  const [showModelViewModal, setShowModelViewModal] = useState(false);

  return (
    <>
      <DrawerFrame
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        icon={<Activity className='h-5 w-5' />}
        size='md'
      >
        <div className='space-y-6'>
          <section>
            <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Description</h3>
            <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
              {description}
            </p>
          </section>

          {modelSchema && (
            <section>
              <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Actions</h3>
              <div className='mt-3'>
                <InfoDrawerActionCard
                  title='Model Schema View'
                  description='Preview the backend entity relationship diagram for this runs domain.'
                  buttonLabel='Model Schema View'
                  onClick={() => setShowModelViewModal(true)}
                  icon={<Database className='h-4 w-4' />}
                  buttonIcon={<Database className='h-4 w-4' />}
                  variant='secondary'
                />
              </div>
            </section>
          )}
        </div>
      </DrawerFrame>

      {modelSchema && (
        <ModelViewDialog
          isOpen={showModelViewModal}
          onClose={() => setShowModelViewModal(false)}
          schemaUrl={modelSchema.url}
          title={modelSchema.title}
          description={modelSchema.description}
          icon={<Database className='h-5 w-5' />}
          previewSummary={modelSchema.previewSummary}
          backgroundNotice='This source is theme-aware, so dark mode can render a dark canvas background.'
        />
      )}
    </>
  );
}
