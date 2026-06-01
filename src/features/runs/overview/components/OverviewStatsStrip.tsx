import type { LucideIcon } from 'lucide-react';

export interface OverviewStatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  darkColor: string;
  darkBgColor: string;
}

interface OverviewStatsStripProps {
  stats: OverviewStatItem[];
}

export function OverviewStatsStrip({ stats }: OverviewStatsStripProps) {
  return (
    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className='rounded-lg border border-slate-200 bg-white p-4 dark:border-[#2d3540] dark:bg-[#111418]'
          >
            <div className='mb-3 flex items-start justify-between'>
              <div className={`rounded-lg p-2 ${stat.bgColor} ${stat.darkBgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color} ${stat.darkColor}`} />
              </div>
            </div>
            <div className='mb-1 text-2xl font-bold text-slate-900 dark:text-white'>
              {stat.value}
            </div>
            <div className='text-[13px] text-slate-500 dark:text-[#9dabb9]'>{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
