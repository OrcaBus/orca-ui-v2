import type { GroupItem } from '../types/system-catalog.types';

/**
 * OrcaBus Event Flow — Group definitions.
 */
export const EVENT_FLOW_GROUPS: GroupItem[] = [
  {
    id: 'ALL',
    name: 'All Components',
    type: 'analysis',
    count: 13,
    color: '#6366f1',
    nodeIds: [
      'ica-platform',
      's3-pipeline-output',
      'aws-default-eventbus',
      'sqs-queue',
      'orcabus-eventbus',
      'workflow-manager',
      'metadata-manager',
      'fastq-manager',
      'file-manager',
      'execution-service-1',
      'execution-service-2',
      'execution-service-3',
    ],
  },
  {
    id: 'EXTERNAL',
    name: 'External Platform',
    type: 'service',
    count: 2,
    color: '#06b6d4',
    nodeIds: ['ica-platform', 's3-pipeline-output'],
  },
  {
    id: 'EVENT_ROUTING',
    name: 'Event Routing',
    type: 'flows',
    count: 3,
    color: '#e7157b',
    nodeIds: ['aws-default-eventbus', 'sqs-queue', 'orcabus-eventbus'],
  },
  {
    id: 'DATA_SERVICES',
    name: 'Data Services',
    type: 'service',
    count: 4,
    color: '#ff9900',
    nodeIds: ['workflow-manager', 'metadata-manager', 'fastq-manager', 'file-manager'],
  },
  {
    id: 'EXECUTION',
    name: 'Execution Services',
    type: 'service',
    count: 3,
    color: '#ff4f8b',
    nodeIds: ['execution-service-1', 'execution-service-2', 'execution-service-3'],
  },
];
