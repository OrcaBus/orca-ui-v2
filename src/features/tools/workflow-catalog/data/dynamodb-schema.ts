/**
 * DynamoDB Single-Table Design for Workflow Diagram / Event Catalog
 *
 * Table: WorkflowCatalog
 * ──────────────────────────────────────────────────────────────────────
 * Partition Key (PK): String  — catalog version, e.g. "CATALOG_V1"
 * Sort Key      (SK): String  — entity type + id, e.g. "DIAGRAM#umccr-production"
 *
 * ──────────────────────────────────────────────────────────────────────
 * Access Patterns:
 *
 *  1. Load full catalog (all diagrams for a version):
 *     Query: PK = "CATALOG_V1"
 *
 *  2. Get a single diagram (contains nodes, groups, edges):
 *     GetItem: PK = "CATALOG_V1", SK = "DIAGRAM#umccr-production"
 *
 * ──────────────────────────────────────────────────────────────────────
 * Versioning: The PK includes a version suffix (CATALOG_V1, CATALOG_V2)
 * so you can publish a new catalog version without disrupting the
 * existing one — useful for blue/green deployments.
 */

// ─── Node Types ───────────────────────────────────────────────────────────

export type DiagramNodeType =
  | 'workflow'
  | 'aws_lambda'
  | 'aws_eks'
  | 'aws_step_function'
  | 'aws_event_bridge'
  | 'aws_batch'
  | 'aws_s3'
  | 'aws_sqs'
  | 'aws_sns'
  | 'external_service';

// ─── Edge Types ───────────────────────────────────────────────────────────

export type DiagramEdgeType = 'trigger' | 'trigger_input' | 'input_dependency';

// ─── Diagram Status ───────────────────────────────────────────────────────

export type DiagramStatus = 'active' | 'draft' | 'archived';

// ─── Global Config (shared across all diagrams) ──────────────────────────

export const ENGINE_COLORS: Record<string, string> = {
  ON_PREM: '#f97316',
  BASESPACE: '#38bdf8',
  ICA: '#06b6d4',
  AWS_BATCH: '#f59e0b',
  SEQERA: '#3b82f6',
  PIERIAN: '#a855f7',
  AWS: '#ff9900',
};

export const NODE_TYPE_ICONS: Record<DiagramNodeType, string> = {
  workflow: 'GitBranch',
  aws_lambda: 'Zap',
  aws_eks: 'Container',
  aws_step_function: 'Workflow',
  aws_event_bridge: 'Radio',
  aws_batch: 'Server',
  aws_s3: 'HardDrive',
  aws_sqs: 'Inbox',
  aws_sns: 'Bell',
  external_service: 'Globe',
};

// ─── Embedded Item Types (live inside a DynamoDBDiagramItem) ──────────────

export interface DiagramNode {
  nodeId: string;
  nodeType: DiagramNodeType;
  label: string;
  version: string;
  engine: string;
  description: string;
  groupIds: string[];
  inputEvents: {
    name: string;
    topic?: string;
    condition?: string;
    payload: Record<string, unknown>;
  }[];
  outputEvents: {
    name: string;
    topic?: string;
    condition?: string;
    payload: Record<string, unknown>;
  }[];
  tags: Record<string, string>;
  position: { x: number; y: number };
}

export interface DiagramGroup {
  groupId: string;
  name: string;
  type: string;
  count: number;
  color: string;
  nodeIds: string[];
}

export interface DiagramEdge {
  edgeId: string;
  source: string;
  target: string;
  edgeType: DiagramEdgeType;
  label?: string;
}

// ─── DynamoDB Item Types ──────────────────────────────────────────────────

interface DynamoDBBaseItem {
  PK: string;
  SK: string;
  entityType: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamoDBDiagramItem extends DynamoDBBaseItem {
  entityType: 'DIAGRAM';
  diagramId: string;
  name: string;
  description: string;
  status: DiagramStatus;
  tags: Record<string, string>;
  createdBy: string; // user email
  createdAt: string;
  updatedBy: string; // user email
  updatedAt: string;
  nodes: DiagramNode[];
  groups: DiagramGroup[];
  edges: DiagramEdge[];
}

// ─── Sample DynamoDB Items (for seeding / reference) ──────────────────────

export const SAMPLE_DIAGRAM: DynamoDBDiagramItem = {
  PK: 'CATALOG_V1',
  SK: 'DIAGRAM#umccr-production',
  entityType: 'DIAGRAM',
  diagramId: 'umccr-production',
  name: 'UMCCR Production Pipeline',
  description: 'Primary production workflow diagram for UMCCR genomics processing.',
  status: 'active',
  tags: { environment: 'production', team: 'umccr' },
  createdBy: 'admin@umccr.org',
  createdAt: '2025-01-15T08:00:00Z',
  updatedBy: 'admin@umccr.org',
  updatedAt: '2025-06-20T14:30:00Z',
  nodes: [
    {
      nodeId: 'bcl-convert',
      nodeType: 'workflow',
      label: 'BCL Convert',
      version: 'v4.2.7',
      engine: 'ICA',
      description: 'Illumina BCL to FASTQ conversion pipeline on ICA (DRAGEN Cloud).',
      groupIds: ['SEQUENCING', 'WGS', 'WTS', 'CTDNA'],
      inputEvents: [
        {
          name: 'orcabus.bssh.fastqlistrows_event_showered',
          topic: 'orcabus.bssh',
          payload: {
            instrumentRunId: '231116_A01052_0172_BHVLM5DSX7',
            bsshProjectId: 'prj-12345',
          },
        },
      ],
      outputEvents: [
        {
          name: 'orcabus.workflowmanager.bclconvert.succeeded',
          topic: 'orcabus.workflowmanager',
          payload: {
            portalRunId: '20231116abcdef01', // pragma: allowlist secret
            instrumentRunId: '231116_A01052_0172_BHVLM5DSX7',
            fastqListRowsIds: ['fqlr-001', 'fqlr-002'],
          },
        },
      ],
      tags: { maxRetries: '2', timeout: '8h', computeQueue: 'ica-prod-bcl-convert' },
      position: { x: 280, y: 330 },
    },
    {
      nodeId: 'event-router',
      nodeType: 'aws_event_bridge',
      label: 'OrcaBus Event Router',
      version: '',
      engine: 'AWS',
      description: 'Central EventBridge bus that routes workflow events between services.',
      groupIds: [],
      inputEvents: [],
      outputEvents: [],
      tags: { busName: 'orcabus-main', region: 'ap-southeast-2' },
      position: { x: 50, y: 330 },
    },
    {
      nodeId: 'wfm-lambda',
      nodeType: 'aws_lambda',
      label: 'Workflow Manager',
      version: 'v1.3.0',
      engine: 'AWS',
      description: 'Lambda function that receives events and dispatches workflow executions.',
      groupIds: [],
      inputEvents: [],
      outputEvents: [],
      tags: { runtime: 'python3.12', memoryMB: '512' },
      position: { x: 160, y: 200 },
    },
    {
      nodeId: 'batch-processor',
      nodeType: 'aws_step_function',
      label: 'Batch Orchestrator',
      version: 'v2.0.0',
      engine: 'AWS',
      description: 'Step Function that orchestrates multi-step batch processing across services.',
      groupIds: ['WGS'],
      inputEvents: [],
      outputEvents: [],
      tags: {
        stateMachineArn:
          'arn:aws:states:ap-southeast-2:123456789012:stateMachine:batch-orchestrator',
      },
      position: { x: 420, y: 200 },
    },
  ],
  groups: [
    {
      groupId: 'WGS',
      name: 'WGS Somatic',
      type: 'analysis',
      count: 10,
      color: '#f59e0b',
      nodeIds: [
        'bssh',
        'bcl-convert',
        'wgs-alignment-qc',
        'holmes',
        'wgs-tumor-normal',
        'umccrise',
        'oncoanalyser-wgs',
        'sash',
        'pancan',
        'gpl',
      ],
    },
  ],
  edges: [
    {
      edgeId: 'e-bssh-bcl',
      source: 'bssh',
      target: 'bcl-convert',
      edgeType: 'trigger',
    },
    {
      edgeId: 'e-bcl-tn-fastq',
      source: 'bcl-convert',
      target: 'wgs-tumor-normal',
      edgeType: 'input_dependency',
      label: 'use FASTQs as input',
    },
    {
      edgeId: 'e-router-wfm',
      source: 'event-router',
      target: 'wfm-lambda',
      edgeType: 'trigger',
      label: 'event rule match',
    },
    {
      edgeId: 'e-wfm-bcl',
      source: 'wfm-lambda',
      target: 'bcl-convert',
      edgeType: 'trigger_input',
      label: 'dispatch workflow',
    },
  ],
};
