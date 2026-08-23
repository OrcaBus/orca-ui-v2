import { StatusCard } from '@/components/ui/StatusCard';
import { getAnalysisTypeIcon } from '../../shared/utils/statusIcons';
import type { RunContextStatus } from '../hooks/useRunContextsListQueryParams';

interface RunContextsStatusCardsProps {
  status: RunContextStatus | 'all';
  onStatusCardClick: (status: RunContextStatus) => void;
}

const mockRunContextStatusCounts = {
  active: 4,
  inactive: 0,
};

const statusCards: Array<{
  label: string;
  status: RunContextStatus;
  countKey: keyof typeof mockRunContextStatusCounts;
  variant: 'success' | 'neutral';
}> = [
  { label: 'Active', status: 'ACTIVE', countKey: 'active', variant: 'success' },
  { label: 'Inactive', status: 'INACTIVE', countKey: 'inactive', variant: 'neutral' },
];

export function RunContextsStatusCards({ status, onStatusCardClick }: RunContextsStatusCardsProps) {
  const total = mockRunContextStatusCounts.active + mockRunContextStatusCounts.inactive;

  return (
    <div className='mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
      {statusCards.map((card) => {
        const count = mockRunContextStatusCounts[card.countKey];
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <StatusCard
            key={card.status}
            label={card.label}
            value={count}
            percentage={percentage}
            icon={getAnalysisTypeIcon(card.status)}
            variant={card.variant}
            selected={status === card.status}
            onClick={() => onStatusCardClick(card.status)}
          />
        );
      })}
    </div>
  );
}
