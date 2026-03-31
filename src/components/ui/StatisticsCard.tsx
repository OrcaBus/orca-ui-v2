import { CheckCircle2, XCircle, AlertCircle, MinusCircle, Clock, Archive } from 'lucide-react';

type StatusType =
  | 'succeeded'
  | 'failed'
  | 'started'
  | 'aborted'
  | 'resolved'
  | 'deprecated'
  | 'ongoing';

interface StatisticsCardProps {
  status: StatusType;
  label: string;
  count: number;
  percentage?: number;
  selected?: boolean;
  onClick?: () => void;
}

export function StatisticsCard({
  status,
  label,
  count,
  percentage = 0,
  selected = false,
  onClick,
}: StatisticsCardProps) {
  // Define status configurations
  const statusConfig = {
    succeeded: {
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: selected ? 'border-green-600' : 'border-green-200',
      ringColor: selected ? 'ring-2 ring-green-200' : '',
      hoverBorder: 'hover:border-green-300',
      dotColor: 'bg-green-500',
      textColor: 'text-green-700',
    },
    failed: {
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: selected ? 'border-red-600' : 'border-red-200',
      ringColor: selected ? 'ring-2 ring-red-200' : '',
      hoverBorder: 'hover:border-red-300',
      dotColor: 'bg-red-500',
      textColor: 'text-red-700',
    },
    started: {
      icon: Clock,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: selected ? 'border-blue-600' : 'border-blue-200',
      ringColor: selected ? 'ring-2 ring-blue-200' : '',
      hoverBorder: 'hover:border-blue-300',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    aborted: {
      icon: MinusCircle,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: selected ? 'border-orange-600' : 'border-orange-200',
      ringColor: selected ? 'ring-2 ring-orange-200' : '',
      hoverBorder: 'hover:border-orange-300',
      dotColor: 'bg-orange-500',
      textColor: 'text-orange-700',
    },
    resolved: {
      icon: CheckCircle2,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: selected ? 'border-cyan-600' : 'border-cyan-200',
      ringColor: selected ? 'ring-2 ring-cyan-200' : '',
      hoverBorder: 'hover:border-cyan-300',
      dotColor: 'bg-cyan-500',
      textColor: 'text-cyan-700',
    },
    deprecated: {
      icon: Archive,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: selected ? 'border-amber-600' : 'border-amber-200',
      ringColor: selected ? 'ring-2 ring-amber-200' : '',
      hoverBorder: 'hover:border-amber-300',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-700',
    },
    ongoing: {
      icon: AlertCircle,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: selected ? 'border-purple-600' : 'border-purple-200',
      ringColor: selected ? 'ring-2 ring-purple-200' : '',
      hoverBorder: 'hover:border-purple-300',
      dotColor: 'bg-purple-500',
      textColor: 'text-purple-700',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-lg border-2 bg-white p-4 text-left transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : 'cursor-default'} ${config.borderColor} ${config.ringColor} ${!selected && onClick ? config.hoverBorder : ''} `}
    >
      {/* Header with label and icon */}
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
          <span className='text-xs font-semibold tracking-wide text-neutral-600 uppercase'>
            {label}
          </span>
        </div>
        <Icon className={`h-4 w-4 ${config.iconColor}`} />
      </div>

      {/* Count */}
      <div className='mb-2 text-3xl font-bold text-neutral-900'>{count.toLocaleString()}</div>

      {/* Percentage of total */}
      <div className='flex items-center gap-1'>
        <span className='text-sm font-medium text-neutral-600'>{percentage.toFixed(1)}%</span>
        <span className='text-xs text-neutral-500'>of all runs</span>
      </div>
    </button>
  );
}
