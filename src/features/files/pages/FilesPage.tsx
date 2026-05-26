import { PageHeader } from '@/components/layout/PageHeader';
import { FilesSearchPanel, FilesTable } from '../components';

export function FilesPage() {
  return (
    <div className='p-6'>
      <PageHeader
        title='Files'
        description='Search and manage stored outputs by Portal Run, bucket, and S3 key pattern.'
      />

      <FilesSearchPanel />

      <FilesTable />
    </div>
  );
}
