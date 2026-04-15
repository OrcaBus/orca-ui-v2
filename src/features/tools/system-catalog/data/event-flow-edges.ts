import type { EdgeDef } from '../types/system-catalog.types';

/**
 * OrcaBus Event Flow Architecture — Edge definitions.
 *
 * Edge types:
 *  - event_publish:      Green solid →  Service publishes events to EventBus
 *  - event_subscribe:    Green solid ←  Service subscribes to events from EventBus
 *  - state_change:       Olive/amber →  Object or workflow state change routing
 *  - execution_request:  Red solid →    Workflow execution request to ICA
 *  - rest_call:          Dashed gray →  Service-to-service REST API call
 */
export const EVENT_FLOW_EDGES: EdgeDef[] = [
  // ── ICA → SQS (Workflow State Change) ──────────────────────────────────
  {
    id: 'ef-ica-sqs',
    source: 'ica-platform',
    target: 'sqs-queue',
    edgeType: 'state_change',
    label: 'Workflow State Change',
  },

  // ── ICA → S3 (Pipeline Output Data) ────────────────────────────────────
  {
    id: 'ef-ica-s3',
    source: 'ica-platform',
    target: 's3-pipeline-output',
    edgeType: 'execution_request',
    label: 'pipeline output data',
  },

  // ── S3 → AWS Default EventBus ──────────────────────────────────────────
  {
    id: 'ef-s3-default-eb',
    source: 's3-pipeline-output',
    target: 'aws-default-eventbus',
    edgeType: 'state_change',
    label: 'S3 object events',
  },

  // ── AWS Default EventBus → File Manager (Object State Change) ──────────
  {
    id: 'ef-default-eb-fm',
    source: 'aws-default-eventbus',
    target: 'file-manager',
    edgeType: 'state_change',
    label: 'Object State Change',
  },

  // ── SQS → OrcaBus EventBus ────────────────────────────────────────────
  {
    id: 'ef-sqs-orcabus-eb',
    source: 'sqs-queue',
    target: 'orcabus-eventbus',
    edgeType: 'state_change',
    label: 'Workflow State Change',
  },

  // ── OrcaBus EventBus ↔ Workflow Manager (publish + subscribe) ──────────
  {
    id: 'ef-eb-wfm-subscribe',
    source: 'orcabus-eventbus',
    target: 'workflow-manager',
    edgeType: 'event_subscribe',
  },
  {
    id: 'ef-wfm-eb-publish',
    source: 'workflow-manager',
    target: 'orcabus-eventbus',
    edgeType: 'event_publish',
  },

  // ── OrcaBus EventBus ↔ Metadata Manager ────────────────────────────────
  {
    id: 'ef-eb-mm-subscribe',
    source: 'orcabus-eventbus',
    target: 'metadata-manager',
    edgeType: 'event_subscribe',
  },
  {
    id: 'ef-mm-eb-publish',
    source: 'metadata-manager',
    target: 'orcabus-eventbus',
    edgeType: 'event_publish',
  },

  // ── OrcaBus EventBus ↔ Fastq Manager ──────────────────────────────────
  {
    id: 'ef-eb-fqm-subscribe',
    source: 'orcabus-eventbus',
    target: 'fastq-manager',
    edgeType: 'event_subscribe',
  },
  {
    id: 'ef-fqm-eb-publish',
    source: 'fastq-manager',
    target: 'orcabus-eventbus',
    edgeType: 'event_publish',
  },

  // ── OrcaBus EventBus ↔ File Manager ────────────────────────────────────
  {
    id: 'ef-eb-fm-subscribe',
    source: 'orcabus-eventbus',
    target: 'file-manager',
    edgeType: 'event_subscribe',
  },
  {
    id: 'ef-fm-eb-publish',
    source: 'file-manager',
    target: 'orcabus-eventbus',
    edgeType: 'event_publish',
  },

  // ── OrcaBus EventBus ↔ Execution Service 1 ────────────────────────────
  {
    id: 'ef-eb-exec1-subscribe',
    source: 'orcabus-eventbus',
    target: 'execution-service-1',
    edgeType: 'event_subscribe',
    label: 'State Change',
  },
  {
    id: 'ef-exec1-eb-publish',
    source: 'execution-service-1',
    target: 'orcabus-eventbus',
    edgeType: 'event_publish',
    label: 'State Change',
  },

  // ── OrcaBus EventBus ↔ Execution Service 2 ────────────────────────────
  {
    id: 'ef-eb-exec2-subscribe',
    source: 'orcabus-eventbus',
    target: 'execution-service-2',
    edgeType: 'event_subscribe',
    label: 'State Change',
  },
  {
    id: 'ef-exec2-eb-publish',
    source: 'execution-service-2',
    target: 'orcabus-eventbus',
    edgeType: 'event_publish',
    label: 'State Change',
  },

  // ── OrcaBus EventBus ↔ Execution Service 3 ────────────────────────────
  {
    id: 'ef-eb-exec3-subscribe',
    source: 'orcabus-eventbus',
    target: 'execution-service-3',
    edgeType: 'event_subscribe',
    label: 'State Change',
  },
  {
    id: 'ef-exec3-eb-publish',
    source: 'execution-service-3',
    target: 'orcabus-eventbus',
    edgeType: 'event_publish',
    label: 'State Change',
  },

  // ── Execution Services → ICA (Workflow Execution Request) ──────────────
  {
    id: 'ef-exec1-ica',
    source: 'execution-service-1',
    target: 'ica-platform',
    edgeType: 'execution_request',
    label: 'Workflow Execution Request',
  },
  {
    id: 'ef-exec2-ica',
    source: 'execution-service-2',
    target: 'ica-platform',
    edgeType: 'execution_request',
    label: 'Workflow Execution Request',
  },
  {
    id: 'ef-exec3-ica',
    source: 'execution-service-3',
    target: 'ica-platform',
    edgeType: 'execution_request',
    label: 'Workflow Execution Request',
  },

  // ── Service-to-Service REST calls (dashed) ─────────────────────────────
  {
    id: 'ef-mm-fqm-rest',
    source: 'metadata-manager',
    target: 'fastq-manager',
    edgeType: 'rest_call',
  },
  {
    id: 'ef-fqm-fm-rest',
    source: 'fastq-manager',
    target: 'file-manager',
    edgeType: 'rest_call',
  },
];
