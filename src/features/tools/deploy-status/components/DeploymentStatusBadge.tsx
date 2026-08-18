import { PillTag } from '@/components/ui/PillTag';
import { getDeploymentStatusVisual } from '../utils/deployment-status.visuals';

interface DeploymentStatusBadgeProps {
  status?: string | null;
}

export function DeploymentStatusBadge({ status }: DeploymentStatusBadgeProps) {
  const visual = getDeploymentStatusVisual(status);

  return (
    <PillTag variant={visual.variant}>
      <span className='text-caption font-mono'>{visual.label}</span>
    </PillTag>
  );
}
