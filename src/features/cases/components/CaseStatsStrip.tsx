import { StatusCard } from '@/components/ui/StatusCard';
import { EMPTY_CASE_VALUE } from '../utils/caseDisplay';
import { useCaseStats, type CaseStatMetric } from '../hooks/useCaseStats';

/** Tabs a Case_Stats_Strip tile can navigate to when clicked. */
export type CaseStatsStripTab = 'metadata' | 'runs' | 'files';

interface CaseStatsStripProps {
  /**
   * Sets the active Case_Tabs entry when a tile with a corresponding tab is
   * clicked (Libraries/Samples → metadata, Sequence/Workflow runs → runs).
   * Wiring to the real tab hook happens in `CaseDetailsPage`; the strip stays
   * decoupled from `useCaseDetailsTab`.
   */
  onSelectTab?: (tab: CaseStatsStripTab) => void;
}

/**
 * Renders a single count tile from a {@link CaseStatMetric}, showing the empty
 * placeholder on error and the skeleton while loading.
 */
function StatMetricCard({
  label,
  metric,
  onClick,
}: {
  label: string;
  metric: CaseStatMetric;
  onClick?: () => void;
}) {
  return (
    <StatusCard
      label={label}
      value={metric.error || metric.value === null ? EMPTY_CASE_VALUE : metric.value}
      variant='info'
      isLoading={metric.loading}
      onClick={onClick}
    />
  );
}

/**
 * Case_Stats_Strip — four count tiles (Sequence Runs, Workflow Runs, Libraries,
 * Samples) for the case in `CaseDetailsContext`. All counts come from
 * {@link useCaseStats}, the single backend-swappable seam; the sequence-run
 * count additionally needs the per-library fan-out mounted here.
 */
export function CaseStatsStrip({ onSelectTab }: CaseStatsStripProps) {
  const { stats } = useCaseStats();

  return (
    <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
      <StatMetricCard
        label='Sequence Runs'
        metric={stats.sequenceRuns}
        onClick={onSelectTab ? () => onSelectTab('runs') : undefined}
      />

      <StatMetricCard
        label='Workflow Runs'
        metric={stats.workflowRuns}
        onClick={onSelectTab ? () => onSelectTab('runs') : undefined}
      />

      <StatMetricCard
        label='Libraries'
        metric={stats.libraries}
        onClick={onSelectTab ? () => onSelectTab('metadata') : undefined}
      />

      <StatMetricCard
        label='Samples'
        metric={stats.samples}
        onClick={onSelectTab ? () => onSelectTab('metadata') : undefined}
      />
    </div>
  );
}
