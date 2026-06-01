import { PageBreadcrumb } from '@/components/ui/PageBreadcrumb';
import { useAnalysisRunDetailsContext } from '../context/AnalysisRunDetailsContext';

export const AnalysisRunDetailsPageBreadcrumb: React.FC = () => {
  const { analysisRunDetail, isLoadingAnalysisRunDetail } = useAnalysisRunDetailsContext();

  return (
    <PageBreadcrumb
      items={[
        { label: 'Runs', href: '/runs' },
        { label: 'Analysis Runs', href: '/runs/analysis-runs' },
        {
          label: analysisRunDetail?.analysisRunName || 'Loading...',
          isLoading: isLoadingAnalysisRunDetail,
        },
      ]}
    />
  );
};
export default AnalysisRunDetailsPageBreadcrumb;
