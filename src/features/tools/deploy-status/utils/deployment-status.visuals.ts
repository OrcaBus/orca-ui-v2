import type { PillTagVariant } from '@/components/ui/PillTag';

export type DeploymentStatusCategory =
  'stable' | 'in-progress' | 'rollback' | 'failed' | 'removed' | 'unknown';

export type DeploymentStatusVisual = {
  label: string;
  category: DeploymentStatusCategory;
  variant: PillTagVariant;
};

const STABLE = ['CREATE_COMPLETE', 'UPDATE_COMPLETE', 'IMPORT_COMPLETE'];
const IN_PROGRESS = [
  'CREATE_IN_PROGRESS',
  'DELETE_IN_PROGRESS',
  'REVIEW_IN_PROGRESS',
  'ROLLBACK_IN_PROGRESS',
  'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
  'UPDATE_IN_PROGRESS',
  'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
  'UPDATE_ROLLBACK_IN_PROGRESS',
  'IMPORT_IN_PROGRESS',
  'IMPORT_ROLLBACK_IN_PROGRESS',
];
const ROLLBACK = ['ROLLBACK_COMPLETE', 'UPDATE_ROLLBACK_COMPLETE', 'IMPORT_ROLLBACK_COMPLETE'];
const FAILED = [
  'CREATE_FAILED',
  'DELETE_FAILED',
  'ROLLBACK_FAILED',
  'UPDATE_FAILED',
  'UPDATE_ROLLBACK_FAILED',
  'IMPORT_ROLLBACK_FAILED',
];

const visuals = new Map<string, Omit<DeploymentStatusVisual, 'label'>>([
  ...STABLE.map((status) => [status, { category: 'stable', variant: 'green' }] as const),
  ...IN_PROGRESS.map((status) => [status, { category: 'in-progress', variant: 'blue' }] as const),
  ...ROLLBACK.map((status) => [status, { category: 'rollback', variant: 'amber' }] as const),
  ...FAILED.map((status) => [status, { category: 'failed', variant: 'red' }] as const),
  ['DELETE_COMPLETE', { category: 'removed', variant: 'neutral' }],
]);

export function getDeploymentStatusVisual(status?: string | null): DeploymentStatusVisual {
  if (!status) {
    return { label: 'Unknown', category: 'unknown', variant: 'neutral' };
  }

  const visual = visuals.get(status);
  return visual
    ? { label: status, ...visual }
    : { label: status, category: 'unknown', variant: 'neutral' };
}
