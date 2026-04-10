import type { DiagramStatus } from './dynamodb-schema';

/**
 * Lightweight diagram summary for the list page.
 * The full DynamoDBDiagramItem (with nodes/edges/groups) is only loaded
 * when the user opens a specific diagram.
 */
export interface DiagramSummary {
  diagramId: string;
  name: string;
  description: string;
  status: DiagramStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
  tags: Record<string, string>;
}

export const DIAGRAM_LIST: DiagramSummary[] = [
  {
    diagramId: 'umccr-production',
    name: 'Primary Sequencing Pipeline',
    description:
      'Standard operating procedure for Illumina HiSeq raw data processing and downstream bioinformatics analysis workflows.',
    status: 'active',
    createdBy: 'Dr. Aris Thorne',
    createdAt: '2024-01-15T09:00:00Z',
    updatedBy: 'Dr. Aris Thorne',
    updatedAt: '2026-04-10T06:30:00Z',
    nodeCount: 18,
    edgeCount: 24,
    tags: { environment: 'production', team: 'umccr' },
  },
  {
    diagramId: 'emergency-reroute',
    name: 'Emergency Reroute Protocol',
    description:
      'Contingency workflow for instrument downtime, mapping automated failover paths between sequencing centres.',
    status: 'draft',
    createdBy: 'Sarah Jenkins',
    createdAt: '2023-08-20T14:30:00Z',
    updatedBy: 'Sarah Jenkins',
    updatedAt: '2023-10-12T09:15:00Z',
    nodeCount: 8,
    edgeCount: 10,
    tags: { environment: 'staging', team: 'operations' },
  },
  {
    diagramId: 'sample-intake-v3',
    name: 'Sample Intake V3',
    description:
      'Legacy intake diagram for clinical trials cohort B. Kept for historical compliance and audit trail purposes.',
    status: 'archived',
    createdBy: 'Marcus Vane',
    createdAt: '2022-11-01T10:00:00Z',
    updatedBy: 'Marcus Vane',
    updatedAt: '2023-05-30T14:00:00Z',
    nodeCount: 12,
    edgeCount: 15,
    tags: { environment: 'production', team: 'clinical' },
  },
  {
    diagramId: 'qc-automator-beta',
    name: 'QC Automator Beta',
    description:
      'New automated quality gate workflow utilising machine learning models for real-time sample QC assessment.',
    status: 'active',
    createdBy: 'Admin User',
    createdAt: '2025-06-01T08:00:00Z',
    updatedBy: 'Admin User',
    updatedAt: '2026-04-10T10:00:00Z',
    nodeCount: 6,
    edgeCount: 7,
    tags: { environment: 'dev', team: 'ml-ops' },
  },
  {
    diagramId: 'wts-pipeline',
    name: 'Whole Transcriptome Pipeline',
    description:
      'RNA sequencing analysis pipeline for gene expression profiling and fusion detection across tumour samples.',
    status: 'active',
    createdBy: 'Dr. Aris Thorne',
    createdAt: '2024-09-12T11:00:00Z',
    updatedBy: 'Sarah Jenkins',
    updatedAt: '2026-03-28T11:45:00Z',
    nodeCount: 14,
    edgeCount: 19,
    tags: { environment: 'production', team: 'umccr' },
  },
];
