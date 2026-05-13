import { useState, useCallback } from 'react';
import {
  useSSCheckPostMutation,
  type LoggingLevel,
  type SSCheckRequest,
} from '../api/sschecker.api';

function downloadTextFile({
  content,
  filename,
  type,
}: {
  content: string;
  filename: string;
  type: string;
}) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildSSCheckerFormData(file: File, loggingLevel: LoggingLevel): FormData {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('logLevel', loggingLevel);
  return formData;
}

export function useSSChecker() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loggingLevel, setLoggingLevel] = useState<LoggingLevel>('ERROR');
  const [copied, setCopied] = useState(false);

  const {
    data: validationResponse,
    error,
    isPending: isChecking,
    mutateAsync: validateSampleSheet,
    reset,
  } = useSSCheckPostMutation();

  const resetValidation = useCallback(() => {
    reset();
    setCopied(false);
  }, [reset]);

  const handleFileSelect = useCallback(
    (file: File) => {
      setSelectedFile(file);
      resetValidation();
    },
    [resetValidation]
  );

  const handleFileClear = useCallback(() => {
    setSelectedFile(null);
    resetValidation();
  }, [resetValidation]);

  const handleCheck = useCallback(async () => {
    if (!selectedFile) return;

    const formData = buildSSCheckerFormData(selectedFile, loggingLevel);

    try {
      await validateSampleSheet({ body: formData as unknown as SSCheckRequest });
    } catch {
      // React Query keeps the error state for inline rendering.
    }
  }, [loggingLevel, selectedFile, validateSampleSheet]);

  const handleCopyLog = useCallback(() => {
    const logFile = validationResponse?.log_file;
    if (!logFile) return;

    void navigator.clipboard.writeText(logFile).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [validationResponse?.log_file]);

  const handleDownloadLog = useCallback(() => {
    const logFile = validationResponse?.log_file;
    if (!logFile) return;

    downloadTextFile({
      content: logFile,
      filename: 'sschecker-results.log',
      type: 'text/plain;charset=utf-8',
    });
  }, [validationResponse?.log_file]);

  const handleDownloadV2SampleSheet = useCallback(() => {
    const sampleSheet = validationResponse?.v2_sample_sheet;
    if (!sampleSheet) return;

    downloadTextFile({
      content: sampleSheet,
      filename: 'sampleSheet_v2.csv',
      type: 'text/csv;charset=utf-8',
    });
  }, [validationResponse?.v2_sample_sheet]);

  return {
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
  };
}
