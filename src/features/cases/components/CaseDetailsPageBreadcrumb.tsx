import { PageBreadcrumb } from '@/components/ui/PageBreadcrumb';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';

export const CaseDetailsPageBreadcrumb: React.FC = () => {
  const { caseDetail, isLoadingCaseDetail } = useCaseDetailsContext();

  return (
    <PageBreadcrumb
      items={[
        { label: 'Cases', href: '/cases' },
        {
          label: caseDetail?.requestFormId ?? 'Loading...',
          isLoading: isLoadingCaseDetail,
        },
      ]}
    />
  );
};

export default CaseDetailsPageBreadcrumb;
