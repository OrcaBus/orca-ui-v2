import type { NodePosition } from '../types/system-catalog.types';

/**
 * OrcaBus Event Flow — Layout positions.
 *
 * Arranged to match the architecture diagram:
 *
 *  ┌─────────┐   ┌───────────────┐
 *  │ S3      │──▶│ Default EB    │─────────────────────────────────────▶┌──────────┐
 *  └─────────┘   └───────────────┘                                     │ File Mgr │
 *                                                                      └──────────┘
 *  ┌─────────┐   ┌─────┐   ┌───────────────────┐   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
 *  │ ICA     │──▶│ SQS │──▶│ OrcaBus EventBus  │◀──│ WF Mgr   │ │ Meta Mgr │ │ FASTQ Mgr│ │ File Mgr │
 *  │ Cloud   │   └─────┘   └───────────────────┘──▶│          │ │          │ │          │ │          │
 *  └─────────┘              │                       └──────────┘ └──────────┘ └──────────┘ └──────────┘
 *       ▲                   │
 *       │                   ▼
 *       │         ┌──────────┐ ┌──────────┐ ┌──────────┐
 *       └─────────│ Exec 1   │ │ Exec 2   │ │ Exec 3   │
 *                 └──────────┘ └──────────┘ └──────────┘
 */
export const EVENT_FLOW_POSITIONS: Record<string, NodePosition> = {
  // Left column — External
  'ica-platform': { x: 0, y: 380 },
  's3-pipeline-output': { x: 0, y: 0 },

  // Bridge layer
  'sqs-queue': { x: 280, y: 400 },
  'aws-default-eventbus': { x: 340, y: 30 },

  // Central event bus
  'orcabus-eventbus': { x: 500, y: 400 },

  // Data services row (right of event bus)
  'workflow-manager': { x: 500, y: 180 },
  'metadata-manager': { x: 760, y: 180 },
  'fastq-manager': { x: 1020, y: 180 },
  'file-manager': { x: 1280, y: 80 },

  // Execution services row (below event bus)
  'execution-service-1': { x: 700, y: 580 },
  'execution-service-2': { x: 960, y: 580 },
  'execution-service-3': { x: 1220, y: 580 },
};
