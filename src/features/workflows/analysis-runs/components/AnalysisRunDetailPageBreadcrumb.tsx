import { PageBreadcrumb } from '@/components/ui/PageBreadcrumb';
import { useAnalysisRunDetailContext } from '../context/AnalysisRunDetailContext';

export const AnalysisRunDetailPageBreadcrumb: React.FC = () => {
  const { analysisRunDetail, isLoadingAnalysisRunDetail } = useAnalysisRunDetailContext();

  return (
    <PageBreadcrumb
      items={[
        { label: 'Workflows', href: '/workflows' },
        { label: 'Analysis Runs', href: '/workflows/analysis-runs' },
        {
          label: analysisRunDetail?.analysisRunName || 'Loading...',
          isLoading: isLoadingAnalysisRunDetail,
        },
      ]}
    />
  );
};
export default AnalysisRunDetailPageBreadcrumb;
