import { useState, useCallback } from 'react';
import type { LoggingLevel, ValidationResult, ValidationStatus } from '../types';
import { LEVEL_ORDER, MOCK_RESULTS } from '../constants';

export function useSSChecker() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loggingLevel, setLoggingLevel] = useState<LoggingLevel>('info');
  const [isChecking, setIsChecking] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[] | null>(null);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setValidationResults(null);
    setValidationStatus(null);
  }, []);

  const handleFileClear = useCallback(() => {
    setSelectedFile(null);
    setValidationResults(null);
    setValidationStatus(null);
  }, []);

  const handleCheck = useCallback(async () => {
    if (!selectedFile) return;
    setIsChecking(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const selectedLevelIndex = LEVEL_ORDER.indexOf(loggingLevel);
    const filteredResults = MOCK_RESULTS.filter(
      (r) => LEVEL_ORDER.indexOf(r.severity) >= selectedLevelIndex
    );

    setValidationResults(filteredResults);

    const hasErrors = filteredResults.some(
      (r) => r.severity === 'error' || r.severity === 'critical'
    );
    const hasWarnings = filteredResults.some((r) => r.severity === 'warning');

    if (hasErrors) {
      setValidationStatus('failed');
    } else if (hasWarnings) {
      setValidationStatus('warnings');
    } else {
      setValidationStatus('passed');
    }

    setIsChecking(false);
  }, [selectedFile, loggingLevel]);

  const formatResultsAsText = useCallback((results: ValidationResult[]) => {
    return results
      .map(
        (r) =>
          `[${r.severity.toUpperCase()}]${r.line ? ` Line ${r.line}` : ''}${r.location ? ` (${r.location})` : ''}: ${r.message}`
      )
      .join('\n');
  }, []);

  const handleCopyLog = useCallback(() => {
    if (!validationResults) return;
    const text = formatResultsAsText(validationResults);
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [validationResults, formatResultsAsText]);

  const handleDownloadLog = useCallback(() => {
    if (!validationResults) return;
    const text = formatResultsAsText(validationResults);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sschecker-results.log';
    a.click();
    URL.revokeObjectURL(url);
  }, [validationResults, formatResultsAsText]);

  return {
    selectedFile,
    loggingLevel,
    isChecking,
    validationResults,
    validationStatus,
    copied,
    handleFileSelect,
    handleFileClear,
    setLoggingLevel,
    handleCheck,
    handleCopyLog,
    handleDownloadLog,
  };
}
