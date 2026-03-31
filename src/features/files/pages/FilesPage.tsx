import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { DetailsDrawer } from '@/components/modals/DetailsDrawer';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { FileSearch } from 'lucide-react';
import { mockWorkflowRuns, mockLibraries } from '@/data/mockData';
import type { File } from '@/data/mockData';
import { useFilesSearch } from '../hooks/useFilesSearch';
import { FilesSearchPanel } from '../components/FilesSearchPanel';
import { FilesResultsTable } from '../components/FilesResultsTable';
import { FileDetailsDrawer } from '../components/FileDetailsDrawer';
import { copyToClipboard } from '../utils/copyToClipboard';

const COPY_FEEDBACK_MS = 2000;

export function FilesPage() {
  const search = useFilesSearch();
  const { hasSearched, searchResults } = search;

  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [copiedPresignUrl, setCopiedPresignUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filesPagination = useTablePagination(1, 20, searchResults.length);

  const handleCopyPath = useCallback((file: File) => {
    const s3Path = `s3://${file.bucket}/${file.s3Key}`;
    copyToClipboard(s3Path, () => {
      setCopiedPath(file.id);
      setTimeout(() => setCopiedPath(null), COPY_FEEDBACK_MS);
    });
  }, []);

  const handleCopyPresignUrl = useCallback((file: File) => {
    const presignUrl = `https://example.com/presign/${file.bucket}/${file.s3Key}`;
    copyToClipboard(presignUrl, () => {
      setCopiedPresignUrl(file.id);
      setTimeout(() => setCopiedPresignUrl(null), COPY_FEEDBACK_MS);
    });
  }, []);

  const handleOpenDrawer = useCallback((file: File) => {
    setSelectedFile(file);
    setIsDrawerOpen(true);
  }, []);

  const selectedWorkflowRun = selectedFile?.sourceWorkflowId
    ? mockWorkflowRuns.find((w) => w.id === selectedFile.sourceWorkflowId)
    : null;
  const selectedLibrary = selectedFile?.relatedLibraryId
    ? mockLibraries.find((l) => l.id === selectedFile.relatedLibraryId)
    : null;

  return (
    <div className='p-6'>
      <PageHeader
        title='Files'
        description='Search and manage stored outputs by Portal Run, bucket, and S3 key pattern.'
      />

      <FilesSearchPanel search={search} />

      {!hasSearched ? (
        <div className='rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'>
          <EmptyState
            icon={FileSearch}
            title='No Search Performed'
            description='Use the filters above to search for files. Provide at least one of: Portal Run ID, Bucket Name, or S3 Key Pattern.'
          />
        </div>
      ) : searchResults.length === 0 ? (
        <div className='rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'>
          <EmptyState
            icon={FileSearch}
            title='No Files Found'
            description='No files found matching your search criteria. Try adjusting your filters.'
          />
        </div>
      ) : (
        <div>
          <div className='mb-4 text-sm text-neutral-600 dark:text-neutral-400'>
            Found {searchResults.length} file{searchResults.length !== 1 ? 's' : ''}
          </div>
          <FilesResultsTable
            files={searchResults}
            paginationProps={filesPagination}
            onCopyPath={handleCopyPath}
            onOpenDetails={handleOpenDrawer}
            copiedPathId={copiedPath}
          />
        </div>
      )}

      <DetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title='File Details'
      >
        {selectedFile && (
          <FileDetailsDrawer
            file={selectedFile}
            onCopyPath={handleCopyPath}
            onCopyPresignUrl={handleCopyPresignUrl}
            copiedPathId={copiedPath}
            copiedPresignId={copiedPresignUrl}
            workflowRun={selectedWorkflowRun ?? null}
            library={selectedLibrary ?? null}
          />
        )}
      </DetailsDrawer>
    </div>
  );
}
