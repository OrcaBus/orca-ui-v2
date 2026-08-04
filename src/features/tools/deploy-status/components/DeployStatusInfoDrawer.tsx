import { Activity } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';

interface DeployStatusInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeployStatusInfoDrawer({ isOpen, onClose }: DeployStatusInfoDrawerProps) {
  return (
    <DrawerFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Deployment Pulse'
      icon={<Activity className='h-5 w-5' aria-hidden='true' />}
      size='md'
      closeLabel='Close Deployment Pulse information'
    >
      <div className='space-y-6'>
        <section>
          <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Description</h3>
          <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
            Deployment Pulse tracks deployed OrcaBus services, their versions, and their current
            CloudFormation status.
          </p>
        </section>

        <section>
          <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>How it works</h3>
          <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
            CloudFormation lifecycle events flow through EventBridge so the deployment inventory and
            event history stay current.
          </p>
        </section>

        <section>
          <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Using this tool</h3>
          <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
            Review status, version, and modification time in the table, then select a stack to
            inspect its deployment events.
          </p>
        </section>
      </div>
    </DrawerFrame>
  );
}
