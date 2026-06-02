import { Tabs, type Tab } from '@/components/ui/Tabs';
import { useCaseDetailsTab, CaseDetailsTabValues } from '../hooks/useCaseDetailsTab';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';

export const CaseDetailsTabs = () => {
  const { activeTab, setActiveTab } = useCaseDetailsTab();
  const { caseDetail, isLoadingCaseDetail, caseStatesData, isLoadingCaseStates } =
    useCaseDetailsContext();

  const isLoadingDetail = isLoadingCaseDetail || !caseDetail;
  const isLoadingStates = isLoadingCaseStates || !caseStatesData;
  const isLoadingTimeline = isLoadingDetail || isLoadingStates;
  const visibleTimelineEventCount =
    (caseStatesData?.results ?? []).filter((state) => !state.isArchived).length +
    (caseDetail?.commentSet ?? []).filter((comment) => !comment.isArchived).length;

  const tabs: Tab[] = [
    {
      id: CaseDetailsTabValues.TIMELINES,
      label: 'Timeline',
      count: isLoadingTimeline ? undefined : visibleTimelineEventCount,
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
    <div className='mt-4 mb-6'>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
