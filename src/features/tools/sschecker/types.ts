export interface ValidationResult {
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  location?: string;
  line?: number;
}

export type ValidationStatus = 'passed' | 'failed' | 'warnings';

export type LoggingLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';
