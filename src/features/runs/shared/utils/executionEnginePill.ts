import type { PillTagVariant } from '@/components/ui/PillTag';
import type { ExecutionEngineEnum } from '../../api/workflows.api';

/**
 * Maps workflow execution engine to PillTag variant (single source of truth).
 */
export function getExecutionEnginePillVariant(engine: ExecutionEngineEnum): PillTagVariant {
  switch (engine) {
    case 'ICA':
      return 'blue';
    case 'SEQERA':
      return 'purple';
    case 'AWS_BATCH':
    case 'AWS_EKS':
      return 'green';
    case 'AWS_ECS':
      return 'amber';
    default:
      return 'neutral';
  }
}
