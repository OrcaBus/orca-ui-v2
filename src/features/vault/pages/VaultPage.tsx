import { useMemo } from 'react';
import { Warehouse } from 'lucide-react';
import { useAppShellHeader } from '@/context/app-shell-context';
import { Tabs } from '@/components/ui/Tabs';
import { LimsPage } from '../lims/pages/LimsPage';
import { BamsPage } from '../bams/pages/BamsPage';
import { FastqsPage } from '../fastqs/pages/FastqsPage';
import { VaultWorkflowsPage } from '../workflows/pages/VaultWorkflowsPage';
import { VaultInfoDrawer } from '../components/VaultInfoDrawer';
import { useVaultPageQueryParams } from '../hooks/useVaultPageQueryParams';

const TABS = [
  { id: 'lims', label: 'LIMS' },
  { id: 'bams', label: 'BAMs' },
  { id: 'fastqs', label: 'FASTQs' },
  { id: 'workflows', label: 'Workflows' },
];

export function VaultPage() {
  const { activeTab, setActiveTab, isInfoDrawerOpen, openInfoDrawer, closeInfoDrawer } =
    useVaultPageQueryParams();
  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title: 'Vault',
      icon: <Warehouse className='h-6 w-6' />,
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

        {activeTab === 'lims' && <LimsPage />}
        {activeTab === 'bams' && <BamsPage />}
        {activeTab === 'fastqs' && <FastqsPage />}
        {activeTab === 'workflows' && <VaultWorkflowsPage />}
      </div>

      <VaultInfoDrawer isOpen={isInfoDrawerOpen} onClose={closeInfoDrawer} />
    </>
  );
}
