import { StatusCard } from '@/components/ui/StatusCard';
import { getAnalysisTypeIcon } from '../../shared/utils/statusIcons';
import type { AnalysisContextStatus } from '../hooks/useAnalysisContextsListQueryParams';

interface AnalysisContextsStatusCardsProps {
  status: AnalysisContextStatus | 'all';
  onStatusCardClick: (status: AnalysisContextStatus) => void;
}

const mockAnalysisContextStatusCounts = {
  active: 5,
  inactive: 0,
};

const statusCards: Array<{
  label: string;
  status: AnalysisContextStatus;
  countKey: keyof typeof mockAnalysisContextStatusCounts;
  variant: 'success' | 'neutral';
}> = [
  { label: 'Active', status: 'ACTIVE', countKey: 'active', variant: 'success' },
  { label: 'Inactive', status: 'INACTIVE', countKey: 'inactive', variant: 'neutral' },
];

export function AnalysisContextsStatusCards({
  status,
  onStatusCardClick,
}: AnalysisContextsStatusCardsProps) {
  const total = mockAnalysisContextStatusCounts.active + mockAnalysisContextStatusCounts.inactive;

  return (
    <div className='mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
      {statusCards.map((card) => {
        const count = mockAnalysisContextStatusCounts[card.countKey];
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
