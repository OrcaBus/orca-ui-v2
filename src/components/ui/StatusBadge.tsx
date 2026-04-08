import { useState } from 'react';
import {
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
} from 'lucide-react';

const statusConfig = {
  draft: {
    label: 'Draft',
    className:
      'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-sm dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540] dark:shadow-none',
    icon: CircleOff,
    tooltip: 'Workflow run is in draft and not yet finalized',
  },
  succeeded: {
    label: 'Succeeded',
    className:
      'bg-green-100 text-green-800 border-green-300 shadow-sm dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:shadow-none',
    icon: CheckCircle,
    tooltip: 'Workflow completed successfully without errors',
  },
  completed: {
    label: 'Completed',
    className:
      'bg-green-100 text-green-800 border-green-300 shadow-sm dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:shadow-none',
    icon: CheckCircle,
    tooltip: 'Process completed successfully',
  },
  ready: {
    label: 'Ready',
    className:
      'bg-green-100 text-green-800 border-green-300 shadow-sm dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:shadow-none',
    icon: CheckCircle,
    tooltip: 'Ready for processing or sequencing',
  },
  active: {
    label: 'Active',
    className:
      'bg-green-100 text-green-800 border-green-300 shadow-sm dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:shadow-none',
    icon: Circle,
    tooltip: 'Currently active and available',
  },
  failed: {
    label: 'Failed',
    className:
      'bg-red-100 text-red-800 border-red-300 shadow-sm dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:shadow-none',
    icon: XCircle,
    tooltip: 'Workflow failed with errors - check logs for details',
  },
  running: {
    label: 'Running',
    className:
      'bg-blue-100 text-blue-800 border-blue-300 shadow-sm dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:shadow-none',
    icon: PlayCircle,
    tooltip: 'Workflow is currently executing',
  },
  ongoing: {
    label: 'Ongoing',
    className:
      'bg-blue-100 text-blue-800 border-blue-300 shadow-sm dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:shadow-none',
    icon: Loader,
    tooltip: 'Workflow is currently in progress',
  },
  processing: {
    label: 'Processing',
    className:
      'bg-blue-100 text-blue-800 border-blue-300 shadow-sm dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:shadow-none',
    icon: PlayCircle,
    tooltip: 'File or data is being processed',
  },
  queued: {
    label: 'Queued',
    className:
      'bg-amber-100 text-amber-800 border-amber-300 shadow-sm dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:shadow-none',
    icon: Clock,
    tooltip: 'Workflow is queued and waiting for available resources',
  },
  pending: {
    label: 'Pending',
    className:
      'bg-amber-100 text-amber-800 border-amber-300 shadow-sm dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:shadow-none',
    icon: Clock,
    tooltip: 'Waiting for action or prerequisites',
  },
  'qc-pending': {
    label: 'QC Pending',
    className:
      'bg-purple-100 text-purple-800 border-purple-300 shadow-sm dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 dark:shadow-none',
    icon: AlertTriangle,
    tooltip: 'Awaiting quality control review',
  },
  aborted: {
    label: 'Aborted',
    className:
      'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-sm dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540] dark:shadow-none',
    icon: Ban,
    tooltip: 'Workflow was manually aborted or cancelled',
  },
  resolved: {
    label: 'Resolved',
    className:
      'bg-blue-100 text-blue-800 border-blue-300 shadow-sm dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:shadow-none',
    icon: CheckCheck,
    tooltip: 'Issue was resolved or workflow was corrected',
  },
  deprecated: {
    label: 'Deprecated',
    className:
      'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-sm dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540] dark:shadow-none',
    icon: Archive,
    tooltip: 'Workflow is deprecated and no longer recommended',
  },
  archived: {
    label: 'Archived',
    className:
      'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-sm dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540] dark:shadow-none',
    icon: Archive,
    tooltip: 'Archived and not actively in use',
  },
  validating: {
    label: 'Validating',
    className:
      'bg-blue-100 text-blue-800 border-blue-300 shadow-sm dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:shadow-none',
    icon: PlayCircle,
    tooltip: 'Data is being validated',
  },
  inactive: {
    label: 'Inactive',
    className:
      'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-sm dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540] dark:shadow-none',
    icon: CircleOff,
    tooltip: 'Inactive and not actively in use',
  },
  'not-started': {
    label: 'Not Started',
    className:
      'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-sm dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540] dark:shadow-none',
    icon: CircleOff,
    tooltip: 'Not started and not actively in use',
  },
  validated: {
    label: 'Validated',
    className:
      'bg-green-100 text-green-800 border-green-300 shadow-sm dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:shadow-none',
    icon: CheckCheck,
    tooltip: 'Validated and ready for use',
  },
  unvalidated: {
    label: 'Unvalidated',
    className:
      'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-sm dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540] dark:shadow-none',
    icon: CircleOff,
    tooltip: 'Unvalidated and not ready for use',
  },
  unknown: {
    label: 'Unknown',
    className:
      'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-sm dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540] dark:shadow-none',
    icon: CircleOff,
    tooltip: 'Unknown status',
  },
} as const;

export type StatusBadgeStatus = keyof typeof statusConfig;

function normalizeStatusBadgeKey(raw: string | null | undefined): StatusBadgeStatus {
  if (raw == null || String(raw).trim() === '') {
    return 'unknown';
  }
  const normalized = String(raw).trim().toLowerCase().replace(/_/g, '-');
  if (normalized in statusConfig) {
    return normalized as StatusBadgeStatus;
  }
  // Common typo for "unknown" (e.g. UNKOWN, Unkown)
  if (normalized === 'unkown') {
    return 'unknown';
  }
  return 'unknown';
}

interface StatusBadgeProps {
  /** Matched case-insensitively; underscores become hyphens. Unknown / empty → unknown. */
  status?: string | null;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

export function StatusBadge({ status, size = 'sm', showTooltip = true }: StatusBadgeProps) {
  const [showTooltipState, setShowTooltipState] = useState(false);

  const canonicalStatus = normalizeStatusBadgeKey(status);
  const config = statusConfig[canonicalStatus];
  const Icon = config.icon;

  const sizes = {
    sm: {
      badge: 'px-2 py-0.5 text-xs gap-1',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'px-2.5 py-1 text-sm gap-1.5',
      icon: 'w-3.5 h-3.5',
    },
  };

  return (
    <div className='relative inline-block'>
      <span
        className={`inline-flex items-center rounded border font-medium ${config.className} ${sizes[size].badge}`}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        <Icon className={sizes[size].icon} />
        {config.label}
      </span>

      {showTooltip && showTooltipState && (
        <div className='pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-neutral-900 px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg dark:border dark:border-[#2d3540] dark:bg-[#1e252e] dark:shadow-black/40'>
          {config.tooltip}
          <div className='absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-[#1e252e]' />
        </div>
      )}
    </div>
  );
}
