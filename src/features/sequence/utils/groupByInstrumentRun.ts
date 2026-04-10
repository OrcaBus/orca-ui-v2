import type { SequenceRun } from '../../../data/mockData';
import type { SequenceRunStatusEnum } from '../api/sequence.api';

export type InstrumentRunStatus = SequenceRunStatusEnum;

export interface InstrumentRun {
  instrumentRunId: string;
  status: InstrumentRunStatus;
  startTime: string;
  endTime: string | null;
  sequenceRuns: SequenceRun[];
}

export function groupByInstrumentRun(runs: SequenceRun[]): InstrumentRun[] {
  const groups = new Map<string, SequenceRun[]>();

  runs.forEach((run) => {
    const instrumentRunId = run.instrumentRunId;
    if (!groups.has(instrumentRunId)) {
      groups.set(instrumentRunId, []);
    }
    groups.get(instrumentRunId)!.push(run);
  });

  return Array.from(groups.entries()).map(([instrumentRunId, sequenceRuns]) => {
    const hasRunning = sequenceRuns.some((r) => r.status === 'running');
    const hasFailed = sequenceRuns.some((r) => r.status === 'failed');
    const allCompleted = sequenceRuns.every((r) => r.status === 'completed');

    let status: InstrumentRunStatus;
    if (hasRunning) {
      status = 'STARTED';
    } else if (hasFailed && allCompleted) {
      status = 'RESOLVED';
    } else if (hasFailed) {
      status = 'FAILED';
    } else if (allCompleted) {
      status = 'SUCCEEDED';
    } else {
      status = 'STARTED';
    }

    const startTime = sequenceRuns.reduce(
      (earliest, run) => (run.startDate < earliest ? run.startDate : earliest),
      sequenceRuns[0].startDate
    );

    const endTime = sequenceRuns.reduce(
      (latest, run) => {
        if (!run.completedDate) return latest;
        if (!latest) return run.completedDate;
        return run.completedDate > latest ? run.completedDate : latest;
      },
      null as string | null
    );

    return {
      instrumentRunId,
      status,
      startTime,
      endTime,
      sequenceRuns,
    };
  });
}
