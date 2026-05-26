import { Tabs, type Tab } from '@/components/ui/Tabs';
import { useCaseDetailsTab, CaseDetailsTabValues } from '../hooks/useCaseDetailsTab';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';

export const CaseDetailsTabs = () => {
  const { activeTab, setActiveTab } = useCaseDetailsTab();
  const { caseDetail, isLoadingCaseDetail, caseStatesData, isLoadingCaseStates } =
    useCaseDetailsContext();

  const isLoadingDetail = isLoadingCaseDetail || !caseDetail;
  const isLoadingStates = isLoadingCaseStates || !caseStatesData;

  const tabs: Tab[] = [
    {
      id: CaseDetailsTabValues.TIMELINES,
      label: 'Timeline',
      count: isLoadingStates ? undefined : caseStatesData.pagination.count,
    },
    {
      id: CaseDetailsTabValues.LIBRARIES,
      label: 'Libraries',
    },
    {
      id: CaseDetailsTabValues.WORKFLOWS,
      label: 'Workflow Runs',
    },
    {
      id: CaseDetailsTabValues.USERS,
      label: 'Users',
      count: isLoadingDetail ? undefined : caseDetail.userSet.length,
    },
  ];

  return (
    <div className='mb-6'>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
