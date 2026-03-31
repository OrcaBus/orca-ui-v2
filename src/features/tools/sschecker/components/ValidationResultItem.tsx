import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { ValidationResult } from '../types';
import { getSeverityStyles, SEVERITY_ICON_CLASSES } from '../utils/severityStyles';

function SeverityIcon({ severity }: { severity: ValidationResult['severity'] }) {
  const className = SEVERITY_ICON_CLASSES[severity];
  switch (severity) {
    case 'debug':
    case 'info':
      return <CheckCircle className={className} />;
    case 'warning':
      return <AlertTriangle className={className} />;
    case 'error':
    case 'critical':
      return <XCircle className={className} />;
  }
}

interface ValidationResultItemProps {
  result: ValidationResult;
}

export function ValidationResultItem({ result }: ValidationResultItemProps) {
  const styles = getSeverityStyles(result.severity);

  return (
    <div className={`flex items-start gap-3 border-l-2 px-5 py-3 ${styles.border}`}>
      <div className='mt-0.5'>
        <SeverityIcon severity={result.severity} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='mb-0.5 flex flex-wrap items-center gap-2'>
          <span
            className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold uppercase ${styles.badge}`}
          >
            {result.severity}
          </span>
          {(result.line || result.location) && (
            <span className='text-xs text-neutral-400 dark:text-neutral-500'>
              {result.line && `Line ${result.line}`}
              {result.line && result.location && ' · '}
              {result.location}
            </span>
          )}
        </div>
        <p className={`text-sm ${styles.text}`}>{result.message}</p>
      </div>
    </div>
  );
}
