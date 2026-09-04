import { Tabs, type Tab } from '@/components/ui/Tabs';
import { useCaseDetailsTab, CaseDetailsTabValues } from '../hooks/useCaseDetailsTab';

export const CaseDetailsTabs = () => {
  const { activeTab, setActiveTab } = useCaseDetailsTab();

  const tabs: Tab[] = [
    {
      id: CaseDetailsTabValues.METADATA,
      label: 'Metadata',
    },
    {
      id: CaseDetailsTabValues.RUNS,
      label: 'Runs',
    },
    {
      id: CaseDetailsTabValues.STATES,
      label: 'States',
    },
    {
      id: CaseDetailsTabValues.PENDING,
      label: 'Pending',
    },
    // {
    //   id: CaseDetailsTabValues.USERS,
    //   label: 'Users',
    //   count: isLoadingDetail ? undefined : caseDetail.userSet.length,
    // },
  ];

  return (
    <div className='mt-4 mb-6'>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
