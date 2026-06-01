import { PageHeader } from '@/components/layout/PageHeader';
import { FilesSearchPanel, FilesTable } from '../components';
import { FileText } from 'lucide-react';

export function FilesPage() {
  return (
    <div className='p-6'>
      <PageHeader
        title='Files'
        description='Search and manage stored outputs by Portal Run, bucket, and S3 key pattern.'
        icon={<FileText className='h-6 w-6' />}
      />

      <FilesSearchPanel />

      <FilesTable />
    </div>
  );
}
