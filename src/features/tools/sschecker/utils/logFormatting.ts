import type { LoggingLevel } from '../api/sschecker.api';

export interface FormattedLogLine {
  lineNumber: number;
  text: string;
  severity: LoggingLevel | null;
}

const LOG_SEVERITY_PREFIX = /^\[?(DEBUG|INFO|WARNING|ERROR|CRITICAL)\]?(?=$|[\s:])/;

export function getLogSeverity(line: string): LoggingLevel | null {
  const match = LOG_SEVERITY_PREFIX.exec(line);
  return match ? (match[1] as LoggingLevel) : null;
}

export function formatLogLines(log: string | undefined): FormattedLogLine[] {
  if (!log) return [];

  return log.split(/\r?\n/).map((line, index) => ({
    lineNumber: index + 1,
    text: line,
    severity: getLogSeverity(line),
  }));
}
