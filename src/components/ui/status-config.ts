import {
  CircleArrowUp,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  AlertTriangle,
  Archive,
  Circle,
  Ban,
  CheckCheck,
  Loader,
  CircleOff,
  Inbox,
  FlaskConical,
  Lock,
  LockOpen,
  type LucideIcon,
} from 'lucide-react';

/**
 * Canonical status-family palette — see DESIGN.md's Fixed Status Vocabulary Rule and Implementation Notes for the full rationale.
 * Every lifecycle status maps to exactly one family;
 * timeline.visuals.ts and statusIcons.tsx derive their colors from here instead of maintaining their own maps.
 */
export type StatusFamily = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/** Full badge chrome (fill + text + border, light/dark) per family. */
export const FAMILY_CLASSNAMES: Record<StatusFamily, string> = {
  success:
    'bg-green-100 text-green-800 border-green-300 shadow-sm dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:shadow-none',
  warning:
    'bg-amber-100 text-amber-800 border-amber-300 shadow-sm dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:shadow-none',
  error:
    'bg-red-100 text-red-800 border-red-300 shadow-sm dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:shadow-none',
  info: 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:shadow-none',
  neutral:
    'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-sm dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540] dark:shadow-none',
};

/** Icon/text-only accent per family, for consumers rendering a bare icon rather than full badge chrome (stat-tile icons, notification dots). */
export const FAMILY_ACCENT: Record<StatusFamily, string> = {
  success: 'text-green-500 dark:text-green-400',
  warning: 'text-amber-500 dark:text-amber-400',
  error: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
  neutral: 'text-neutral-500 dark:text-[#9dabb9]',
};

/** Solid background dot per family, for small unread/status indicators. */
export const FAMILY_DOT: Record<StatusFamily, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-neutral-400 dark:bg-neutral-500',
};

/** Icon-in-tinted-circle + top-border accent per family, for KPI/metric
 * tiles (e.g. OverviewStatsStrip) — the same families as everywhere else,
 * just a treatment shaped for a dashboard stat card instead of a badge. */
export const FAMILY_TILE_ACCENT: Record<
  StatusFamily,
  { iconColor: string; iconBg: string; topBorder: string }
> = {
  success: {
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-50 dark:bg-green-500/10',
    topBorder: 'border-t-green-500',
  },
  warning: {
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    topBorder: 'border-t-amber-500',
  },
  error: {
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-500/10',
    topBorder: 'border-t-red-500',
  },
  info: {
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    topBorder: 'border-t-blue-500',
  },
  neutral: {
    iconColor: 'text-neutral-600 dark:text-[#9dabb9]',
    iconBg: 'bg-neutral-100 dark:bg-[#1e252e]',
    topBorder: 'border-t-neutral-400 dark:border-t-[#2d3540]',
  },
};

export const statusConfig = {
  draft: {
    family: 'neutral',
    label: 'Draft',
    icon: CircleOff,
    tooltip: 'Workflow run is in draft and not yet finalized',
  },
  submitted: {
    family: 'neutral',
    label: 'Submitted',
    icon: CircleArrowUp,
    tooltip: 'Workflow has been submitted to the orchestration system',
  },
  runnable: {
    family: 'neutral',
    label: 'Runnable',
    icon: PlayCircle,
    tooltip: 'Workflow is eligible to start when execution capacity is available',
  },
  starting: {
    family: 'neutral',
    label: 'Starting',
    icon: Clock,
    tooltip: 'Workflow is preparing to start execution',
  },
  started: {
    family: 'info',
    label: 'Started',
    icon: Loader,
    tooltip: 'Workflow execution has started',
    animate: true,
  },
  succeeded: {
    family: 'success',
    label: 'Succeeded',
    icon: CheckCircle,
    tooltip: 'Workflow completed successfully without errors',
  },
  completed: {
    family: 'success',
    label: 'Completed',
    icon: CheckCircle,
    tooltip: 'Process completed successfully',
  },
  ready: {
    family: 'success',
    label: 'Ready',
    icon: CheckCircle,
    tooltip: 'Ready for processing or sequencing',
  },
  active: {
    family: 'success',
    label: 'Active',
    icon: Circle,
    tooltip: 'Currently active and available',
  },
  failed: {
    family: 'error',
    label: 'Failed',
    icon: XCircle,
    tooltip: 'Workflow failed with errors - check logs for details',
  },
  running: {
    family: 'info',
    label: 'Running',
    icon: PlayCircle,
    tooltip: 'Workflow is currently executing',
    animate: true,
  },
  ongoing: {
    family: 'info',
    label: 'Ongoing',
    icon: Loader,
    tooltip: 'Workflow is currently in progress',
    animate: true,
  },
  processing: {
    family: 'info',
    label: 'Processing',
    icon: PlayCircle,
    tooltip: 'File or data is being processed',
    animate: true,
  },
  queued: {
    family: 'warning',
    label: 'Queued',
    icon: Clock,
    tooltip: 'Workflow is queued and waiting for available resources',
  },
  pending: {
    family: 'warning',
    label: 'Pending',
    icon: Clock,
    tooltip: 'Waiting for action or prerequisites',
  },
  'qc-pending': {
    family: 'info',
    label: 'QC Pending',
    icon: AlertTriangle,
    tooltip: 'Awaiting quality control review',
  },
  aborted: {
    family: 'neutral',
    label: 'Aborted',
    icon: Ban,
    tooltip: 'Workflow was manually aborted or cancelled',
  },
  cancelled: {
    family: 'neutral',
    label: 'Cancelled',
    icon: Ban,
    tooltip: 'Workflow execution was cancelled',
  },
  resolved: {
    family: 'info',
    label: 'Resolved',
    icon: CheckCheck,
    tooltip: 'Issue was resolved or workflow was corrected',
  },
  deprecated: {
    family: 'neutral',
    label: 'Deprecated',
    icon: Archive,
    tooltip: 'Workflow is deprecated and no longer recommended',
  },
  archived: {
    family: 'neutral',
    label: 'Archived',
    icon: Archive,
    tooltip: 'Archived and not actively in use',
  },
  validating: {
    family: 'info',
    label: 'Validating',
    icon: PlayCircle,
    tooltip: 'Data is being validated',
    animate: true,
  },
  inactive: {
    family: 'neutral',
    label: 'Inactive',
    icon: CircleOff,
    tooltip: 'Inactive and not actively in use',
  },
  'not-started': {
    family: 'neutral',
    label: 'Not Started',
    icon: CircleOff,
    tooltip: 'Not started and not actively in use',
  },
  validated: {
    family: 'success',
    label: 'Validated',
    icon: CheckCheck,
    tooltip: 'Validated and ready for use',
  },
  unvalidated: {
    family: 'neutral',
    label: 'Unvalidated',
    icon: CircleOff,
    tooltip: 'Unvalidated and not ready for use',
  },
  unknown: {
    family: 'neutral',
    label: 'Unknown',
    icon: CircleOff,
    tooltip: 'Unknown status',
  },

  // Case lifecycle states (CaseStatusEnum) — same status vocabulary as
  // everything else. Labels are re-checked exhaustively against
  // src/features/cases/utils/caseStatus.visuals.ts; keep the two in sync.
  'request-received': {
    family: 'info',
    label: 'Request Received',
    icon: Inbox,
    tooltip: 'Case request has been received',
  },
  'wgts-tumour-sample-received': {
    family: 'info',
    label: 'WGTS Tumour Sample Received',
    icon: FlaskConical,
    tooltip: 'WGTS tumour sample has been received',
  },
  'wgts-germline-sample-received': {
    family: 'info',
    label: 'WGTS Germline Sample Received',
    icon: FlaskConical,
    tooltip: 'WGTS germline sample has been received',
  },
  'cttso-sample-received': {
    family: 'info',
    label: 'CTTSO Sample Received',
    icon: FlaskConical,
    tooltip: 'ctTSO sample has been received',
  },
  'all-sample-received': {
    family: 'info',
    label: 'All Sample Received',
    icon: FlaskConical,
    tooltip: 'All expected samples for this case have been received',
  },
  'library-partially-failed': {
    family: 'warning',
    label: 'Library Partially Failed',
    icon: AlertTriangle,
    tooltip: 'One or more libraries failed - case continues with the remaining libraries',
  },
  'sequencing-started': {
    family: 'info',
    label: 'Sequencing Started',
    icon: PlayCircle,
    tooltip: 'Sequencing has started for this case',
  },
  'sequencing-completed': {
    family: 'info',
    label: 'Sequencing Completed',
    icon: CheckCircle,
    tooltip: 'Sequencing has completed for this case',
  },
  'bioinformatics-started': {
    family: 'info',
    label: 'Bioinformatics Started',
    icon: PlayCircle,
    tooltip: 'Bioinformatics analysis has started for this case',
  },
  'bioinformatics-completed': {
    family: 'info',
    label: 'Bioinformatics Completed',
    icon: CheckCircle,
    tooltip: 'Bioinformatics analysis has completed for this case',
  },
  'curation-started': {
    family: 'info',
    label: 'Curation Started',
    icon: PlayCircle,
    tooltip: 'Curation has started for this case',
  },
  'curation-completed': {
    family: 'info',
    label: 'Curation Completed',
    icon: CheckCircle,
    tooltip: 'Curation has completed for this case',
  },
  locked: {
    family: 'neutral',
    label: 'Locked',
    icon: Lock,
    tooltip: 'Case is locked and cannot be edited',
  },
  unlocked: {
    family: 'neutral',
    label: 'Unlocked',
    icon: LockOpen,
    tooltip: 'Case is unlocked and can be edited',
  },
} as const satisfies Record<
  string,
  {
    family: StatusFamily;
    label: string;
    icon: LucideIcon;
    tooltip: string;
    /** Pulses the icon (motion-safe only) — only for states meaning
     * "actively executing now", not the broader 'info' family generally. */
    animate?: boolean;
  }
>;

export type StatusBadgeStatus = keyof typeof statusConfig;

const STATUS_ALIASES = {
  canceled: 'cancelled',
  complete: 'succeeded',
  success: 'succeeded',
  error: 'failed',
  initializing: 'started',
} as const satisfies Record<string, StatusBadgeStatus>;

export function normalizeStatusBadgeKey(raw: string | null | undefined): StatusBadgeStatus {
  if (raw == null || String(raw).trim() === '') {
    return 'unknown';
  }
  const normalized = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-');
  const aliased = STATUS_ALIASES[normalized as keyof typeof STATUS_ALIASES] ?? normalized;
  if (Object.prototype.hasOwnProperty.call(statusConfig, aliased)) {
    return aliased;
  }
  if (normalized === 'unkown') {
    return 'unknown';
  }
  return 'unknown';
}

/** The status family a raw status string resolves to, for consumers that
 * need to derive their own visual treatment (icon color, dot, gradient
 * card) rather than rendering the badge itself. Accepts the same raw forms
 * StatusBadge does (case/underscore-insensitive; unmatched → 'neutral'). */
export function getStatusFamily(status: string | null | undefined): StatusFamily {
  return statusConfig[normalizeStatusBadgeKey(status)].family;
}
