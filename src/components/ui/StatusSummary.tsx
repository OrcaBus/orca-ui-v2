interface StatusSummaryProps {
  stats: Array<{
    label: string;
    value: number | string;
    trend?: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
  }>;
}

export function StatusSummary({ stats }: StatusSummaryProps) {
  const variantStyles = {
    default: 'bg-white',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    error: 'bg-red-50 border-red-200',
  };

  return (
    <div className='mb-6 grid grid-cols-4 gap-4'>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`rounded-lg border p-4 ${
            variantStyles[stat.variant || 'default']
          } border-neutral-200`}
        >
          <div className='mb-1 text-xs text-neutral-600'>{stat.label}</div>
          <div className='flex items-baseline gap-2'>
            <div className='font-semibold text-neutral-900'>{stat.value}</div>
            {stat.trend && <div className='text-xs text-neutral-500'>{stat.trend}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
