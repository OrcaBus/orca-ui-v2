import { useMemo } from 'react';
import { FileCheck } from 'lucide-react';
import { useAppShellHeader } from '@/context/app-shell-context';
import { useToolsPageQueryParams } from '../../root/hooks/useToolsPageQueryParams';
import { SSCheckerInfoDrawer } from '../components/SSCheckerInfoDrawer';
import { SSCheckerInputsPanel } from '../components/SSCheckerInputsPanel';
import { SSCheckerResultsLogPanel } from '../components/SSCheckerResultsLogPanel';
import { useSSChecker } from '../hooks/useSSChecker';

export function SSCheckerPage() {
  const title = 'SSChecker';
  const description = 'Upload a sample sheet to validate formatting and metadata.';
  const { isInfoDrawerOpen, openInfoDrawer, closeInfoDrawer } = useToolsPageQueryParams();
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

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title,
      icon: <FileCheck className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer, title]
  );

  useAppShellHeader(headerConfig);

  return (
    <>
      <div className='p-6'>
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

      <SSCheckerInfoDrawer
        isOpen={isInfoDrawerOpen}
        onClose={closeInfoDrawer}
        title={title}
        description={description}
      />
    </>
  );
}
