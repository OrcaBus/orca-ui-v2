import type { MapNodeType, ResourceType, WorkflowEngine } from '../data/dynamodb-schema';

export const RESOURCE_TYPE_OPTIONS: Array<{ value: ResourceType; label: string }> = [
  { value: 'aws_lambda', label: 'AWS Lambda' },
  { value: 'aws_api_gateway', label: 'AWS API Gateway' },
  { value: 'aws_sqs', label: 'AWS SQS' },
  { value: 'aws_event_bridge', label: 'AWS EventBridge' },
  { value: 'aws_s3', label: 'AWS S3' },
  { value: 'aws_sns', label: 'AWS SNS' },
  { value: 'aws_step_function', label: 'AWS Step Functions' },
  { value: 'aws_batch', label: 'AWS Batch' },
  { value: 'aws_ecs', label: 'AWS ECS' },
  { value: 'aws_eks', label: 'AWS EKS' },
  { value: 'aws_dynamodb', label: 'AWS DynamoDB' },
  { value: 'aws_rds', label: 'AWS RDS' },
  { value: 'rest_api_service', label: 'REST API Service' },
  { value: 'execution_service', label: 'Execution Service' },
  { value: 'external_service', label: 'External Service' },
  { value: 'other', label: 'Other Resource' },
];

export const WORKFLOW_ENGINE_OPTIONS: Array<{ value: WorkflowEngine; label: string }> = [
  { value: 'ICA', label: 'ICA' },
  { value: 'SEQERA', label: 'Seqera' },
  { value: 'AWS_BATCH', label: 'AWS Batch' },
  { value: 'AWS_ECS', label: 'AWS ECS' },
  { value: 'AWS_EKS', label: 'AWS EKS' },
  { value: 'BASESPACE', label: 'BaseSpace' },
  { value: 'PIERIAN', label: 'Pierian' },
  { value: 'ON_PREM', label: 'On Prem' },
  { value: 'OTHER', label: 'Other Engine' },
];

export const NODE_TYPE_OPTIONS: Array<{ value: MapNodeType; label: string }> = [
  { value: 'resource', label: 'Resource' },
  { value: 'workflow', label: 'Workflow' },
];

export const WORKFLOW_ENGINE_COLORS: Record<WorkflowEngine, string> = {
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

export const RESOURCE_TYPE_COLORS: Record<ResourceType, string> = {
  aws_lambda: '#ff9900',
  aws_api_gateway: '#8b5cf6',
  aws_sqs: '#ec4899',
  aws_event_bridge: '#e7157b',
  aws_s3: '#3f8624',
  aws_sns: '#c026d3',
  aws_step_function: '#ff4f8b',
  aws_batch: '#f59e0b',
  aws_ecs: '#0ea5e9',
  aws_eks: '#6366f1',
  aws_dynamodb: '#527fff',
  aws_rds: '#2563eb',
  rest_api_service: '#14b8a6',
  execution_service: '#ef4444',
  external_service: '#64748b',
  other: '#6b7280',
};

const RESOURCE_TYPE_LABELS = Object.fromEntries(
  RESOURCE_TYPE_OPTIONS.map((option) => [option.value, option.label])
) as Record<ResourceType, string>;

const WORKFLOW_ENGINE_LABELS = Object.fromEntries(
  WORKFLOW_ENGINE_OPTIONS.map((option) => [option.value, option.label])
) as Record<WorkflowEngine, string>;

export type NodeDisplayFields = {
  nodeType: MapNodeType;
  resourceType?: ResourceType;
  workflowEngine?: WorkflowEngine;
};

export function getNodeAccentColor(
  node: NodeDisplayFields,
  engineColors: Record<string, string> = {}
): string {
  if (node.nodeType === 'workflow') {
    const engine = node.workflowEngine ?? 'OTHER';
    return engineColors[engine] ?? WORKFLOW_ENGINE_COLORS[engine];
  }

  return RESOURCE_TYPE_COLORS[node.resourceType ?? 'other'];
}

export function getNodeDetailLabel(node: NodeDisplayFields): string {
  if (node.nodeType === 'workflow') {
    return WORKFLOW_ENGINE_LABELS[node.workflowEngine ?? 'OTHER'];
  }

  return RESOURCE_TYPE_LABELS[node.resourceType ?? 'other'];
}

export function getNodeKindLabel(node: NodeDisplayFields): string {
  return node.nodeType === 'workflow' ? 'Workflow' : 'Resource';
}
