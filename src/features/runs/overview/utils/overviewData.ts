export interface OverviewSequenceRun {
  id: string;
  sequenceRunId: string;
  instrumentRunId: string | null;
  status: string | null;
  startTime: string | null;
}

export interface OverviewWorkflowRun {
  id: string;
  runName: string;
  status: string | null;
  startTime: string | null;
}

interface SequenceRunStatusCountsLike {
  all?: number | null;
  started?: number | null;
  succeeded?: number | null;
  failed?: number | null;
}

interface WorkflowRunStatusCountsLike {
  all?: number | null;
  ongoing?: number | null;
  succeeded?: number | null;
  failed?: number | null;
}

interface SequenceRunLike {
  orcabusId: string;
  sequenceRunId: string;
  instrumentRunId?: string | null;
  status?: string | null;
  startTime?: string | null;
}

interface WorkflowRunLike {
  orcabusId: string;
  portalRunId?: string | null;
  workflowRunName?: string | null;
  currentState?: {
    status?: string | null;
    timestamp?: string | null;
  } | null;
}

function count(value: number | null | undefined): number {
  return value ?? 0;
}

function rate(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export function calculateOverviewStats({
  sequenceCounts,
  workflowCounts,
}: {
  sequenceCounts?: SequenceRunStatusCountsLike;
  workflowCounts?: WorkflowRunStatusCountsLike;
}) {
  const sequenceTotal = count(sequenceCounts?.all);
  const workflowTotal = count(workflowCounts?.all);
  const totalRuns = sequenceTotal + workflowTotal;
  const sequenceSucceeded = count(sequenceCounts?.succeeded);
  const workflowSucceeded = count(workflowCounts?.succeeded);
  const totalSucceeded = sequenceSucceeded + workflowSucceeded;
  const sequenceFailed = count(sequenceCounts?.failed);
  const workflowFailed = count(workflowCounts?.failed);
  const totalFailed = sequenceFailed + workflowFailed;

  return {
    activeSequenceRuns: count(sequenceCounts?.started),
    activeWorkflowRuns: count(workflowCounts?.ongoing),
    sequenceTotal,
    workflowTotal,
    totalRuns,
    sequenceSucceeded,
    workflowSucceeded,
    totalSucceeded,
    sequenceFailed,
    workflowFailed,
    totalFailed,
    successRate: rate(totalSucceeded, totalRuns),
    failedRate: rate(totalFailed, totalRuns),
  };
}

export function mapOverviewSequenceRuns(
  runs: readonly SequenceRunLike[] | undefined
): OverviewSequenceRun[] {
  return (runs ?? []).map((run) => ({
    id: run.orcabusId,
    sequenceRunId: run.sequenceRunId,
    instrumentRunId: run.instrumentRunId ?? null,
    status: run.status ?? null,
    startTime: run.startTime ?? null,
  }));
}

export function mapOverviewWorkflowRuns(
  runs: readonly WorkflowRunLike[] | undefined
): OverviewWorkflowRun[] {
  return (runs ?? []).map((run) => ({
    id: run.orcabusId,
    runName: run.workflowRunName || run.portalRunId || run.orcabusId,
    status: run.currentState?.status ?? null,
    startTime: run.currentState?.timestamp ?? null,
  }));
}
