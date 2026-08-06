import type { DeployStatusStack, DeployStatusStackSummary } from '../api/deploy-status.api';

export type DeploymentPulseRow = DeployStatusStack & {
  summary: DeployStatusStackSummary | null;
};

export function mergeDeployStatusStacks(
  stacks: DeployStatusStack[],
  summaries: DeployStatusStackSummary[]
): DeploymentPulseRow[] {
  const summaryByStackId = new Map(summaries.map((summary) => [summary.stackId, summary]));

  return stacks.map((stack) => ({
    ...stack,
    summary: summaryByStackId.get(stack.stackId) ?? null,
  }));
}
