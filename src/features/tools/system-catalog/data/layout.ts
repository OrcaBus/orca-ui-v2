/**
 * Engine/platform colors matching the pipeline diagram legend.
 *
 * Node positions are no longer stored here — the diagram is auto-laid-out with dagre
 * (see `hooks/useAutoLayout.ts` and `utils/autoLayout.ts`).
 */
export const ENGINE_COLORS: Record<string, string> = {
  ICA: '#06b6d4',
  SEQERA: '#3b82f6',
  AWS_BATCH: '#f59e0b',
  AWS_ECS: '#fb7185',
  AWS_EKS: '#8b5cf6',
  BASESPACE: '#38bdf8',
  PIERIAN: '#a855f7',
  ON_PREM: '#f97316',
  OTHER: '#64748b',
};
