import { PillTag } from '@/components/ui/PillTag';
import { getDeploymentStatusVisual } from '../utils/deployment-status.visuals';

interface DeploymentStatusBadgeProps {
  status?: string | null;
}

export function DeploymentStatusBadge({ status }: DeploymentStatusBadgeProps) {
  const visual = getDeploymentStatusVisual(status);

  return (
    <PillTag variant={visual.variant}>
      <span className='font-mono text-[11px]'>{visual.label}</span>
    </PillTag>
  );
}
