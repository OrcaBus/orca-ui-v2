import type { CatalogNodeData } from '../types/system-catalog.types';

/**
 * OrcaBus Event Flow Architecture — Node definitions.
 *
 * Based on the OrcaBus system architecture diagram showing:
 * - ICA (Illumina Connected Analytics) as external execution platform
 * - AWS EventBridge buses for event routing
 * - SQS queue for ICA → EventBridge bridging
 * - REST API microservices (Lambda + RDS PostgreSQL)
 * - Execution services (StepFunction + DynamoDB)
 * - S3 for pipeline output data storage
 */
export const EVENT_FLOW_NODES: Record<string, CatalogNodeData> = {
  // ── External Platform ──────────────────────────────────────────────────
  'ica-platform': {
    label: 'Illumina Connected Analytics',
    version: '',
    engine: 'ICA',
    description:
      'Primary workflow execution platform. Runs bioinformatics pipelines (BCL Convert, DRAGEN, TSO) on Illumina cloud infrastructure.',
    groupIds: ['EXTERNAL'],
    inputEvents: [
      {
        name: 'Workflow Execution Request',
        topic: 'orcabus.workflowmanager',
        payload: {
          workflowName: 'bcl_convert',
          workflowVersion: '4.2.7',
          inputs: { instrumentRunId: '231116_A01052_0172_BHVLM5DSX7' },
        },
      },
    ],
    outputEvents: [
      {
        name: 'Workflow State Change',
        topic: 'orcabus.workflowmanager',
        payload: {
          status: 'Succeeded',
          workflowRunId: 'wfr.abc123',
          outputUri: 's3://pipeline-output/run-001/',
        },
      },
      {
        name: 'Pipeline Output Data',
        payload: {
          s3Bucket: 'pipeline-output-dev',
          s3Key: 'analysis/run-001/results/',
        },
      },
    ],
    tags: { type: 'external_platform', provider: 'illumina' },
  },

  // ── S3 Bucket ──────────────────────────────────────────────────────────
  's3-pipeline-output': {
    label: 'Pipeline Output Bucket',
    version: '',
    engine: 'AWS',
    description:
      'S3 bucket storing pipeline output data. Emits S3 object events to the AWS default EventBus on object creation.',
    groupIds: ['EXTERNAL'],
    inputEvents: [
      {
        name: 'Pipeline Output Data',
        payload: {
          s3Bucket: 'pipeline-output-dev',
          s3Key: 'analysis/run-001/results/',
        },
      },
    ],
    outputEvents: [
      {
        name: 'S3 Object Created',
        topic: 'aws.s3',
        payload: {
          detail_type: 'Object Created',
          source: 'aws.s3',
          bucket: 'pipeline-output-dev',
          key: 'analysis/run-001/results/output.bam',
        },
      },
    ],
    tags: { type: 'storage', service: 's3' },
  },

  // ── Event Buses ────────────────────────────────────────────────────────
  'aws-default-eventbus': {
    label: 'AWS Default EventBus',
    version: '',
    engine: 'AWS',
    description:
      'Default AWS EventBridge bus. Receives S3 object events and routes Object State Change events to the File Manager.',
    groupIds: ['EVENT_ROUTING'],
    inputEvents: [
      {
        name: 'S3 Object Created',
        topic: 'aws.s3',
        payload: {
          detail_type: 'Object Created',
          source: 'aws.s3',
          bucket: 'pipeline-output-dev',
          key: 'analysis/run-001/results/output.bam',
        },
      },
    ],
    outputEvents: [
      {
        name: 'Object State Change',
        topic: 'aws.s3',
        condition: "$.source == 'aws.s3'",
        payload: {
          detail_type: 'Object Created',
          bucket: 'pipeline-output-dev',
          key: 'analysis/run-001/results/output.bam',
        },
      },
    ],
    tags: { type: 'event_bus', scope: 'aws_default' },
  },

  'sqs-queue': {
    label: 'SQS Queue',
    version: '',
    engine: 'AWS',
    description:
      'SQS queue bridging ICA workflow state change events to the OrcaBus Custom EventBus via EventBridge.',
    groupIds: ['EVENT_ROUTING'],
    inputEvents: [
      {
        name: 'Workflow State Change',
        topic: 'orcabus.workflowmanager',
        payload: {
          status: 'Succeeded',
          workflowRunId: 'wfr.abc123',
        },
      },
    ],
    outputEvents: [
      {
        name: 'Workflow State Change (forwarded)',
        topic: 'orcabus.workflowmanager',
        payload: {
          status: 'Succeeded',
          workflowRunId: 'wfr.abc123',
        },
      },
    ],
    tags: { type: 'queue', service: 'sqs' },
  },

  'orcabus-eventbus': {
    label: 'OrcaBus Custom EventBus',
    version: '',
    engine: 'AWS',
    description:
      'Central OrcaBus EventBridge custom bus. Routes workflow state changes, metadata updates, and execution requests between all microservices.',
    groupIds: ['EVENT_ROUTING'],
    inputEvents: [
      {
        name: 'Workflow State Change',
        topic: 'orcabus.workflowmanager',
        payload: { status: 'Succeeded', workflowRunId: 'wfr.abc123' },
      },
    ],
    outputEvents: [
      {
        name: 'State Change Events',
        topic: 'orcabus.*',
        payload: { detail_type: 'StateChange', service: '<any>' },
      },
      {
        name: 'Workflow Execution Request',
        topic: 'orcabus.workflowmanager',
        payload: {
          workflowName: 'bcl_convert',
          workflowVersion: '4.2.7',
          inputs: {},
        },
      },
    ],
    tags: { type: 'event_bus', scope: 'orcabus_custom' },
  },

  // ── REST API Services (Lambda + RDS) ───────────────────────────────────
  'workflow-manager': {
    label: 'Workflow Manager',
    version: '',
    engine: 'AWS',
    description:
      'Manages workflow run state, tracks execution history. Backed by AWS Lambda + RDS PostgreSQL with REST API.',
    groupIds: ['DATA_SERVICES'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.state_change',
        topic: 'orcabus.workflowmanager',
        payload: { status: 'Succeeded', workflowRunId: 'wfr.abc123' },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.run_updated',
        topic: 'orcabus.workflowmanager',
        payload: { workflowRunId: 'wfr.abc123', newStatus: 'Complete' },
      },
    ],
    tags: { infra: 'lambda+rds', type: 'rest_api_service' },
  },

  'metadata-manager': {
    label: 'Metadata Manager',
    version: '',
    engine: 'AWS',
    description:
      'Stores and manages sample, library, and subject metadata. Backed by AWS Lambda + RDS PostgreSQL with REST API.',
    groupIds: ['DATA_SERVICES'],
    inputEvents: [
      {
        name: 'orcabus.metadata.updated',
        topic: 'orcabus.metadata',
        payload: { subjectId: 'SBJ00001', libraryId: 'L2301001' },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.metadata.state_change',
        topic: 'orcabus.metadata',
        payload: { subjectId: 'SBJ00001', action: 'library_linked' },
      },
    ],
    tags: { infra: 'lambda+rds', type: 'rest_api_service' },
  },

  'fastq-manager': {
    label: 'Fastq Manager',
    version: '',
    engine: 'AWS',
    description:
      'Manages FASTQ file registration and metadata lookup. REST API backed by AWS Lambda.',
    groupIds: ['DATA_SERVICES'],
    inputEvents: [
      {
        name: 'orcabus.fastqmanager.state_change',
        topic: 'orcabus.fastqmanager',
        payload: { fastqListRowId: 'fqlr.001' },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.fastqmanager.registered',
        topic: 'orcabus.fastqmanager',
        payload: { fastqListRowId: 'fqlr.001', s3Uri: 's3://fastq-bucket/...' },
      },
    ],
    tags: { infra: 'lambda', type: 'rest_api_service' },
  },

  'file-manager': {
    label: 'File Manager',
    version: '',
    engine: 'AWS',
    description:
      'Tracks all file objects across S3 buckets. Receives Object State Change events from the default EventBus. Backed by Lambda + RDS PostgreSQL.',
    groupIds: ['DATA_SERVICES'],
    inputEvents: [
      {
        name: 'Object State Change',
        topic: 'aws.s3',
        payload: {
          detail_type: 'Object Created',
          bucket: 'pipeline-output-dev',
          key: 'analysis/run-001/results/output.bam',
        },
      },
      {
        name: 'orcabus.filemanager.state_change',
        topic: 'orcabus.filemanager',
        payload: { s3Key: 'analysis/run-001/results/' },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.filemanager.object_registered',
        topic: 'orcabus.filemanager',
        payload: { objectId: 'obj.001', s3Uri: 's3://...' },
      },
    ],
    tags: { infra: 'lambda+rds', type: 'rest_api_service' },
  },

  // ── Execution Services (StepFunction + DynamoDB) ───────────────────────
  'execution-service-1': {
    label: 'Execution Service',
    version: '',
    engine: 'AWS',
    description:
      'Orchestrates workflow execution via AWS Step Functions. State persisted in DynamoDB. Sends execution requests to ICA.',
    groupIds: ['EXECUTION'],
    inputEvents: [
      {
        name: 'State Change',
        topic: 'orcabus.workflowmanager',
        payload: { executionId: 'exec.001', event: 'trigger' },
      },
    ],
    outputEvents: [
      {
        name: 'State Change',
        topic: 'orcabus.workflowmanager',
        payload: { executionId: 'exec.001', status: 'running' },
      },
      {
        name: 'Workflow Execution Request',
        topic: 'orcabus.workflowmanager',
        payload: { workflowName: 'bcl_convert', inputs: {} },
      },
    ],
    tags: { infra: 'stepfunction+dynamodb', type: 'execution_service', instance: '1' },
  },

  'execution-service-2': {
    label: 'Execution Service',
    version: '',
    engine: 'AWS',
    description:
      'Orchestrates workflow execution via AWS Step Functions. State persisted in DynamoDB. Sends execution requests to ICA.',
    groupIds: ['EXECUTION'],
    inputEvents: [
      {
        name: 'State Change',
        topic: 'orcabus.workflowmanager',
        payload: { executionId: 'exec.002', event: 'trigger' },
      },
    ],
    outputEvents: [
      {
        name: 'State Change',
        topic: 'orcabus.workflowmanager',
        payload: { executionId: 'exec.002', status: 'running' },
      },
      {
        name: 'Workflow Execution Request',
        topic: 'orcabus.workflowmanager',
        payload: { workflowName: 'wgs_alignment_qc', inputs: {} },
      },
    ],
    tags: { infra: 'stepfunction+dynamodb', type: 'execution_service', instance: '2' },
  },

  'execution-service-3': {
    label: 'Execution Service',
    version: '',
    engine: 'AWS',
    description:
      'Orchestrates workflow execution via AWS Step Functions. State persisted in DynamoDB. Sends execution requests to ICA.',
    groupIds: ['EXECUTION'],
    inputEvents: [
      {
        name: 'State Change',
        topic: 'orcabus.workflowmanager',
        payload: { executionId: 'exec.003', event: 'trigger' },
      },
    ],
    outputEvents: [
      {
        name: 'State Change',
        topic: 'orcabus.workflowmanager',
        payload: { executionId: 'exec.003', status: 'running' },
      },
      {
        name: 'Workflow Execution Request',
        topic: 'orcabus.workflowmanager',
        payload: { workflowName: 'wts_tumor_only', inputs: {} },
      },
    ],
    tags: { infra: 'stepfunction+dynamodb', type: 'execution_service', instance: '3' },
  },
};
