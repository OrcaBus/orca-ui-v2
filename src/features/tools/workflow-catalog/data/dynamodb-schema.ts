/**
 * DynamoDB Single-Table Design for Workflow Catalog
 *
 * Table: WorkflowCatalog
 * ──────────────────────────────────────────────────────────────────────
 * Partition Key (PK): String  — catalog version, e.g. "CATALOG_V1"
 * Sort Key      (SK): String  — entity type + id, e.g. "WORKFLOW#bcl-convert"
 *
 * GSI1 (optional, for cross-entity queries):
 *   GSI1PK: entityType   (e.g. "WORKFLOW", "ANALYSIS")
 *   GSI1SK: id            (e.g. "bcl-convert", "GERMLINE")
 *
 * ──────────────────────────────────────────────────────────────────────
 * Access Patterns:
 *
 *  1. Load full catalog (all entities for a version):
 *     Query: PK = "CATALOG_V1"
 *
 *  2. Load only workflows:
 *     Query: PK = "CATALOG_V1", SK begins_with "WORKFLOW#"
 *
 *  3. Load only analyses:
 *     Query: PK = "CATALOG_V1", SK begins_with "ANALYSIS#"
 *
 *  4. Load only edges:
 *     Query: PK = "CATALOG_V1", SK begins_with "EDGE#"
 *
 *  5. Get a single workflow:
 *     GetItem: PK = "CATALOG_V1", SK = "WORKFLOW#bcl-convert"
 *
 *  6. Load config (engine colors, etc.):
 *     Query: PK = "CATALOG_V1", SK begins_with "CONFIG#"
 *
 * ──────────────────────────────────────────────────────────────────────
 * Versioning: The PK includes a version suffix (CATALOG_V1, CATALOG_V2)
 * so you can publish a new catalog version without disrupting the
 * existing one — useful for blue/green deployments.
 */

// ─── DynamoDB Item Types ──────────────────────────────────────────────────

interface DynamoDBBaseItem {
  PK: string;
  SK: string;
  entityType: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamoDBWorkflowItem extends DynamoDBBaseItem {
  entityType: 'WORKFLOW';
  workflowId: string;
  label: string;
  version: string;
  engine: string;
  description: string;
  analysisIds: string[];
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
  config: {
    maxRetries: number;
    timeout: string;
    computeQueue: string;
  };
  position: { x: number; y: number };
}

export interface DynamoDBAnalysisItem extends DynamoDBBaseItem {
  entityType: 'ANALYSIS';
  analysisId: string;
  label: string;
  count: number;
  color: string;
  workflowIds: string[];
}

export interface DynamoDBEdgeItem extends DynamoDBBaseItem {
  entityType: 'EDGE';
  edgeId: string;
  source: string;
  target: string;
  edgeType: 'trigger' | 'trigger_input' | 'input_dependency';
  label?: string;
}

export interface DynamoDBConfigItem extends DynamoDBBaseItem {
  entityType: 'CONFIG';
  configKey: string;
  value: Record<string, unknown>;
}

export type DynamoDBCatalogItem =
  | DynamoDBWorkflowItem
  | DynamoDBAnalysisItem
  | DynamoDBEdgeItem
  | DynamoDBConfigItem;

// ─── Sample DynamoDB Items (for seeding / reference) ──────────────────────

export const SAMPLE_DYNAMODB_ITEMS: Record<string, DynamoDBCatalogItem[]> = {
  workflows: [
    {
      PK: 'CATALOG_V1',
      SK: 'WORKFLOW#bcl-convert',
      entityType: 'WORKFLOW',
      workflowId: 'bcl-convert',
      label: 'BCL Convert',
      version: 'v4.2.7',
      engine: 'ICA',
      description: 'Illumina BCL to FASTQ conversion pipeline on ICA (DRAGEN Cloud).',
      analysisIds: ['SEQUENCING', 'WGS', 'WTS', 'CTDNA'],
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
      config: { maxRetries: 2, timeout: '8h', computeQueue: 'ica-prod-bcl-convert' },
      position: { x: 280, y: 330 },
    },
  ],
  analyses: [
    {
      PK: 'CATALOG_V1',
      SK: 'ANALYSIS#WGS',
      entityType: 'ANALYSIS',
      analysisId: 'WGS',
      label: 'WGS Somatic',
      count: 10,
      color: '#f59e0b',
      workflowIds: [
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
      PK: 'CATALOG_V1',
      SK: 'EDGE#e-bssh-bcl',
      entityType: 'EDGE',
      edgeId: 'e-bssh-bcl',
      source: 'bssh',
      target: 'bcl-convert',
      edgeType: 'trigger',
    },
    {
      PK: 'CATALOG_V1',
      SK: 'EDGE#e-bcl-tn-fastq',
      entityType: 'EDGE',
      edgeId: 'e-bcl-tn-fastq',
      source: 'bcl-convert',
      target: 'wgs-tumor-normal',
      edgeType: 'input_dependency',
      label: 'use FASTQs as input',
    },
  ],
  config: [
    {
      PK: 'CATALOG_V1',
      SK: 'CONFIG#ENGINE_COLORS',
      entityType: 'CONFIG',
      configKey: 'ENGINE_COLORS',
      value: {
        ON_PREM: '#f97316',
        BASESPACE: '#38bdf8',
        ICA: '#06b6d4',
        AWS_BATCH: '#f59e0b',
        SEQERA: '#3b82f6',
        PIERIAN: '#a855f7',
      },
    },
  ],
};
