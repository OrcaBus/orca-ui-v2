import { useMemo } from 'react';
import { useSequenceRunListModel } from '@/features/runs/shared/api/sequence.api';
import {
  useAnalysisRunListQueryModel,
  useWorkflowRunListModel,
} from '@/features/runs/shared/api/workflows.api';
import { formatBackendDate } from '@/utils/timeFormat';

/** How far back the alert feed looks for failures. */
export const NOTIFICATION_LOOKBACK_DAYS = 30;

/** Rows rendered before the "more" button reveals the rest of the feed. */
export const NOTIFICATION_PREVIEW_COUNT = 10;

/**
 * Rows fetched per source, which caps the merged feed at three times this.
 * Failures beyond the cap are reported through `totalCount` rather than listed —
 * the bell is an alert summary, not a replacement for the runs list pages.
 */
export const NOTIFICATION_SOURCE_FETCH_LIMIT = 25;

/** Alerts may lag by up to this long before a window refocus refetches them. */
const NOTIFICATION_STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Status filter per source. The sequence API takes the uppercase `StatusEnum`
 * while the workflow API takes lowercase state names (same convention the runs
 * list filters already use). Only failures are surfaced for now; aborted /
 * cancelled runs would slot in here.
 */
const SEQUENCE_RUN_ALERT_STATUS = 'FAILED';
const WORKFLOW_ALERT_STATUS = 'failed';

export type RunNotificationKind = 'sequence-run' | 'analysis-run' | 'workflow-run';

export interface RunNotification {
  id: string;
  kind: RunNotificationKind;
  title: string;
  /** Secondary line: source-specific identifiers, already joined for display. */
  description: string;
  status: string;
  /** ISO timestamp the run reached its failed state. */
  occurredAt: string;
  /** Details page for the run behind this alert. */
  href: string;
}

export interface RunNotificationsResult {
  /** Failed runs across all three sources, newest first. */
  notifications: RunNotification[];
  /** Total failures the APIs report, which can exceed `notifications.length`. */
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
}

function buildDescription(...parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(' · ');
}

function byNewestFirst(a: RunNotification, b: RunNotification): number {
  return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
}

/**
 * Failed sequence, analysis, and workflow runs from the last
 * `NOTIFICATION_LOOKBACK_DAYS`, merged into one newest-first feed for the
 * header alert bell.
 *
 * One request per source, each capped at `NOTIFICATION_SOURCE_FETCH_LIMIT` and
 * pre-sorted server-side, so the merge only has to interleave three short
 * lists. Paginated `count`s are kept so the menu can say how many failures the
 * window actually holds.
 */
export function useRunNotifications(): RunNotificationsResult {
  // Anchored once per mount: recomputing the window on every render would
  // rebuild the query keys each time and refetch in a loop.
  const startTime = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - NOTIFICATION_LOOKBACK_DAYS);
    return formatBackendDate(since);
  }, []);

  const reactQuery = {
    staleTime: NOTIFICATION_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  };

  const sequenceRunsResult = useSequenceRunListModel({
    params: {
      query: {
        page: 1,
        rowsPerPage: NOTIFICATION_SOURCE_FETCH_LIMIT,
        status: SEQUENCE_RUN_ALERT_STATUS,
        startTime,
        ordering: '-start_time',
      },
    },
    reactQuery,
  });

  const analysisRunsResult = useAnalysisRunListQueryModel({
    params: {
      query: {
        page: 1,
        rowsPerPage: NOTIFICATION_SOURCE_FETCH_LIMIT,
        status: WORKFLOW_ALERT_STATUS,
        startTime,
        ordering: '-timestamp',
      },
    },
    reactQuery,
  });

  const workflowRunsResult = useWorkflowRunListModel({
    params: {
      query: {
        page: 1,
        rowsPerPage: NOTIFICATION_SOURCE_FETCH_LIMIT,
        status: WORKFLOW_ALERT_STATUS,
        startTime,
        ordering: '-timestamp',
      },
    },
    reactQuery,
  });

  const sequenceRuns = sequenceRunsResult.data;
  const analysisRuns = analysisRunsResult.data;
  const workflowRuns = workflowRunsResult.data;

  const notifications = useMemo(() => {
    const items: RunNotification[] = [];

    for (const run of sequenceRuns?.results ?? []) {
      // Sequence runs carry no state timestamp; the run's own end time is the
      // closest thing to "when it failed".
      const occurredAt = run.endTime ?? run.startTime;
      if (!occurredAt || !run.instrumentRunId) continue;

      items.push({
        id: `sequence-run:${run.orcabusId}`,
        kind: 'sequence-run',
        title: run.instrumentRunId,
        description: buildDescription(run.sequenceRunId, run.experimentName),
        status: run.status ?? SEQUENCE_RUN_ALERT_STATUS,
        occurredAt,
        // Sequence run details are keyed by instrument run id, not orcabus id.
        href: `/runs/sequence-runs/${run.instrumentRunId}`,
      });
    }

    for (const run of analysisRuns?.results ?? []) {
      const occurredAt = run.currentState?.timestamp;
      if (!occurredAt) continue;

      items.push({
        id: `analysis-run:${run.orcabusId}`,
        kind: 'analysis-run',
        title: run.analysisRunName,
        description: buildDescription(run.analysis?.analysisName, run.analysis?.analysisVersion),
        status: run.currentState?.status ?? WORKFLOW_ALERT_STATUS,
        occurredAt,
        href: `/runs/analysis-runs/${run.orcabusId}`,
      });
    }

    for (const run of workflowRuns?.results ?? []) {
      const occurredAt = run.currentState?.timestamp;
      if (!occurredAt) continue;

      items.push({
        id: `workflow-run:${run.orcabusId}`,
        kind: 'workflow-run',
        title: run.workflowRunName ?? run.portalRunId,
        description: buildDescription(run.workflow?.name, run.portalRunId),
        status: run.currentState?.status ?? WORKFLOW_ALERT_STATUS,
        occurredAt,
        href: `/runs/workflow-runs/${run.orcabusId}`,
      });
    }

    return items.sort(byNewestFirst);
  }, [sequenceRuns, analysisRuns, workflowRuns]);

  const totalCount =
    (sequenceRuns?.pagination?.count ?? sequenceRuns?.results?.length ?? 0) +
    (analysisRuns?.pagination?.count ?? analysisRuns?.results?.length ?? 0) +
    (workflowRuns?.pagination?.count ?? workflowRuns?.results?.length ?? 0);

  return {
    notifications,
    totalCount,
    isLoading:
      sequenceRunsResult.isLoading || analysisRunsResult.isLoading || workflowRunsResult.isLoading,
    isError: sequenceRunsResult.isError || analysisRunsResult.isError || workflowRunsResult.isError,
  };
}
