import { PageBreadcrumb } from '@/components/ui/PageBreadcrumb';
import { useLibraryDetails } from '../context/LibraryDetailsContext';

export const LibraryDetailsPageBreadcrumb = () => {
  const { libraryDetail, isLoadingLibraryDetail } = useLibraryDetails();

  return (
    <PageBreadcrumb
      items={[
        { label: 'Lab', href: '/lab' },
        { label: 'Libraries', href: '/lab/libraries' },
        {
          label: libraryDetail?.libraryId || 'Loading...',
          isLoading: isLoadingLibraryDetail,
        },
      ]}
    />
  );
};
