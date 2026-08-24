import type { LucideIcon } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { FAMILY_TILE_ACCENT, type StatusFamily } from '@/components/ui/status-config';

export interface OverviewStatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Which of the app's status families this metric reads as — same
   * source of truth as StatusBadge/StatusCard, rather than a one-off color
   * chosen per metric (this used to be 5 separate color props, one of
   * which put "Active Workflow Runs" in a dedicated qc-purple family —
   * since retired entirely, folded into "info"). */
  family: StatusFamily;
  summary?: string;
  detailRows?: Array<{
    label: string;
    value: string;
  }>;
}

interface OverviewStatsStripProps {
  stats: OverviewStatItem[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

export function OverviewStatsStrip({
  stats,
  isLoading = false,
  error,
  onRetry,
}: OverviewStatsStripProps) {
  if (error) {
    return <ApiErrorState error={error} onRetry={onRetry} className='mb-6' />;
  }

  if (isLoading) {
    return (
      <div className='mb-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className='flex min-h-49 flex-col rounded-lg border border-t-4 border-slate-200 border-t-slate-300 bg-white p-4 dark:border-[#2d3540] dark:border-t-[#3b4654] dark:bg-[#111418]'
          >
            <div className='mb-5 flex items-start justify-between'>
              <Skeleton width={36} height={36} borderRadius={8} />
            </div>
            <div className='mb-1.5'>
              <Skeleton width={56} height={28} borderRadius={4} />
            </div>
            <div className='mb-2'>
              <Skeleton width={132} height={14} borderRadius={4} />
            </div>
            <Skeleton width={156} height={12} borderRadius={4} />
            <div className='mt-auto space-y-2 border-t border-slate-100 pt-3 dark:border-[#2d3540]'>
              <Skeleton width='100%' height={14} borderRadius={4} />
              <Skeleton width='100%' height={14} borderRadius={4} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const accent = FAMILY_TILE_ACCENT[stat.family];
        return (
          <div
            key={index}
            className={`flex min-h-49 flex-col rounded-lg border border-t-4 border-slate-200 bg-white p-4 transition-colors dark:border-[#2d3540] dark:bg-[#111418] ${accent.topBorder}`}
          >
            <div className='mb-5 flex items-start justify-between'>
              <div className={`rounded-lg p-2.5 ${accent.iconBg}`}>
                <Icon className={`h-5 w-5 ${accent.iconColor}`} />
              </div>
            </div>
            <div className='mb-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white'>
              {stat.value}
            </div>
            <div className='text-[13px] font-medium text-slate-600 dark:text-[#9dabb9]'>
              {stat.label}
            </div>
            {stat.summary && (
              <div className='mt-2 text-xs text-slate-500 dark:text-[#8c9aac]'>{stat.summary}</div>
            )}
            {stat.detailRows && stat.detailRows.length > 0 && (
              <div className='mt-auto space-y-2 border-t border-slate-100 pt-3 dark:border-[#2d3540]'>
                {stat.detailRows.map((row) => (
                  <div key={row.label} className='flex items-center justify-between gap-3'>
                    <span className='text-caption font-semibold tracking-wide text-slate-400 uppercase dark:text-[#6b7a8d]'>
                      {row.label}
                    </span>
                    <span className='font-mono text-xs font-semibold text-slate-700 dark:text-slate-200'>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
