import { Database } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { useVaultTab } from '../shared/hooks/useVaultTab';
import { LimsPage } from '../lims/pages/LimsPage';
import { BamsPage } from '../bams/pages/BamsPage';
import { FastqsPage } from '../fastqs/pages/FastqsPage';
import { VaultWorkflowsPage } from '../workflows/pages/VaultWorkflowsPage';

const TABS = [
  { id: 'lims', label: 'LIMS' },
  { id: 'bams', label: 'BAMs' },
  { id: 'fastqs', label: 'FASTQs' },
  { id: 'workflows', label: 'Workflows' },
];

export function VaultPage() {
  const { activeTab, setActiveTab } = useVaultTab();

  return (
    <div className='p-6'>
      <PageHeader
        title='Vault'
        description='Trace relationships across sequencing, workflows, and stored outputs.'
        icon={<Database className='h-6 w-6' />}
      />

      <div className='mb-6'>
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === 'lims' && <LimsPage />}
      {activeTab === 'bams' && <BamsPage />}
      {activeTab === 'fastqs' && <FastqsPage />}
      {activeTab === 'workflows' && <VaultWorkflowsPage />}
    </div>
  );
}
