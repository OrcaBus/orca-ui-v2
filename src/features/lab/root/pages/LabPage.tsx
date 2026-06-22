import { useMemo } from 'react';
import { LibraryBig } from 'lucide-react';
import { useAppShellHeader } from '@/context/app-shell-context';
import { Tabs } from '@/components/ui/Tabs';
import { LibraryPage } from '../../library/pages/LibraryPage';
import { useLabPageQueryParams } from '../hooks/useLabPageQueryParams';
import { LabInfoDrawer } from '../components/LabInfoDrawer';

const TABS = [
  { id: 'library', label: 'LIBRARY' },
  { id: 'subject', label: 'SUBJECT' },
  { id: 'individual', label: 'INDIVIDUAL' },
  { id: 'sample', label: 'SAMPLE' },
  { id: 'project', label: 'PROJECT' },
];

export function LabPage() {
  const { activeTab, setActiveTab, isInfoDrawerOpen, openInfoDrawer, closeInfoDrawer } =
    useLabPageQueryParams();
  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title: 'Lab Metadata',
      icon: <LibraryBig className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer]
  );

  useAppShellHeader(headerConfig);

  return (
    <>
      <div className='p-6'>
        <div className='mb-6'>
          <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === 'library' && <LibraryPage />}
        {activeTab === 'subject' && <div>Subject Content</div>}
        {activeTab === 'individual' && <div>Individual Content</div>}
        {activeTab === 'sample' && <div>Sample Content</div>}
        {activeTab === 'project' && <div>Project Content</div>}
      </div>

      <LabInfoDrawer isOpen={isInfoDrawerOpen} onClose={closeInfoDrawer} />
    </>
  );
}
