import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SSCheckerBreadcrumb } from '../components/SSCheckerBreadcrumb';
import { SSCheckerInputsPanel } from '../components/SSCheckerInputsPanel';
import { SSCheckerResultsLogPanel } from '../components/SSCheckerResultsLogPanel';
import { useSSChecker } from '../hooks/useSSChecker';

export function SSCheckerPage() {
  const {
    selectedFile,
    loggingLevel,
    isChecking,
    validationResponse,
    error,
    copied,
    handleFileSelect,
    handleFileClear,
    setLoggingLevel,
    handleCheck,
    handleCopyLog,
    handleDownloadLog,
    handleDownloadV2SampleSheet,
  } = useSSChecker();

  return (
    <div className='p-6'>
      <SSCheckerBreadcrumb />

      <PageHeader
        title='SSChecker'
        description='Upload a sample sheet to validate formatting and metadata.'
        icon={<FileText className='h-6 w-6' />}
      />

      <div className='flex items-start gap-4'>
        <SSCheckerInputsPanel
          selectedFile={selectedFile}
          loggingLevel={loggingLevel}
          isChecking={isChecking}
          onFileSelect={handleFileSelect}
          onFileClear={handleFileClear}
          onLoggingLevelChange={setLoggingLevel}
          onCheck={() => void handleCheck()}
        />

        <SSCheckerResultsLogPanel
          isChecking={isChecking}
          selectedFileName={selectedFile?.name}
          validationResponse={validationResponse}
          error={error}
          loggingLevel={loggingLevel}
          copied={copied}
          onCopyLog={handleCopyLog}
          onDownloadLog={handleDownloadLog}
          onDownloadV2SampleSheet={handleDownloadV2SampleSheet}
          onRetry={() => void handleCheck()}
        />
      </div>
    </div>
  );
}
