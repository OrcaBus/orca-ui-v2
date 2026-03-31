// Mock timeline data for Sequence Runs and Workflow Runs
import type { TimelineEvent } from '../components/timeline/timeline.type';

// Timeline events for Sequence Run: 240201_A01052_0280_AHTV35DSX7
export const sequenceRunTimelineEvents: TimelineEvent[] = [
  {
    id: 'evt_seq_001',
    eventType: 'status_updated',
    stateName: 'pending',
    timestamp: '2026-02-01T08:00:00Z',
    source: { type: 'system' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
  },
  {
    id: 'evt_seq_002',
    eventType: 'samplesheet_added',
    timestamp: '2026-02-01T08:15:00Z',
    comment: 'Sample sheet uploaded and validated successfully. 96 samples across 4 lanes.',
    source: { type: 'user', userName: 'admin@orcabus.io' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
    payload: {
      fileName: 'SampleSheet_240201_HTV35DSX7.csv',
      sampleCount: 96,
      laneCount: 4,
      validationStatus: 'valid',
    },
  },
  {
    id: 'evt_seq_003',
    eventType: 'status_updated',
    stateName: 'running',
    timestamp: '2026-02-01T09:00:00Z',
    comment: 'Sequencing run started on NovaSeq A01052',
    source: { type: 'system' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
    payload: {
      instrumentId: 'A01052',
      flowcellId: 'HTV35DSX7',
      runMode: 'SP',
      readConfiguration: '151-8-8-151',
    },
  },
  {
    id: 'evt_seq_004',
    eventType: 'lane_completed',
    timestamp: '2026-02-02T03:30:00Z',
    comment: 'Lane 1 completed successfully. Quality metrics passed.',
    source: { type: 'system' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
    payload: {
      laneNumber: 1,
      totalReads: 875000000,
      passingFilterReads: 850000000,
      qualityScore: 36.2,
      yieldGb: 127.5,
    },
  },
  {
    id: 'evt_seq_005',
    eventType: 'comment',
    timestamp: '2026-02-02T08:00:00Z',
    comment: 'Lane 1 shows excellent cluster density. Proceeding with standard analysis pipeline.',
    source: { type: 'user', userName: 'tech@orcabus.io' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
  },
  {
    id: 'evt_seq_006',
    eventType: 'lane_completed',
    timestamp: '2026-02-02T16:45:00Z',
    comment: 'Lane 2 completed successfully.',
    source: { type: 'system' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
    payload: {
      laneNumber: 2,
      totalReads: 890000000,
      passingFilterReads: 865000000,
      qualityScore: 35.8,
      yieldGb: 129.2,
    },
  },
  {
    id: 'evt_seq_007',
    eventType: 'lane_completed',
    timestamp: '2026-02-03T02:15:00Z',
    comment: 'Lane 3 completed successfully.',
    source: { type: 'system' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
    payload: {
      laneNumber: 3,
      totalReads: 882000000,
      passingFilterReads: 858000000,
      qualityScore: 36.0,
      yieldGb: 128.1,
    },
  },
  {
    id: 'evt_seq_008',
    eventType: 'lane_completed',
    timestamp: '2026-02-03T11:30:00Z',
    comment: 'Lane 4 completed successfully.',
    source: { type: 'system' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
    payload: {
      laneNumber: 4,
      totalReads: 878000000,
      passingFilterReads: 852000000,
      qualityScore: 35.9,
      yieldGb: 127.8,
    },
  },
  {
    id: 'evt_seq_009',
    eventType: 'status_updated',
    stateName: 'completed',
    timestamp: '2026-02-03T12:00:00Z',
    comment: 'Sequencing run completed. All lanes passed QC thresholds.',
    source: { type: 'system' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
    payload: {
      totalDuration: '75h 0m',
      totalReads: 3525000000,
      totalYieldGb: 512.6,
      averageQualityScore: 36.0,
    },
  },
  {
    id: 'evt_seq_010',
    eventType: 'workflow_started',
    timestamp: '2026-02-03T12:30:00Z',
    comment: 'BCL Convert workflow initiated for demultiplexing',
    source: { type: 'system' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
    payload: {
      workflowId: 'WF001',
      workflowType: 'BCL Convert',
      expectedOutputs: 96,
    },
  },
  {
    id: 'evt_seq_011',
    eventType: 'qc_passed',
    timestamp: '2026-02-03T14:00:00Z',
    comment: 'Final QC review completed. Run approved for downstream analysis.',
    source: { type: 'user', userName: 'qc-lead@orcabus.io' },
    runId: 'SEQ001',
    runDisplayName: 'SEQ.240201.A01052',
  },
];

// Timeline events for Workflow Run: BCL Convert - Run 240201
export const workflowRunTimelineEvents: TimelineEvent[] = [
  {
    id: 'evt_wf_001',
    eventType: 'status_updated',
    stateName: 'queued',
    timestamp: '2026-02-02T15:00:00Z',
    comment: 'Workflow queued in execution engine',
    source: { type: 'system' },
    runId: 'WF001',
    runDisplayName: 'WFR.7x9k2m5p',
    payload: {
      executionEngine: 'Nextflow Tower',
      queuePosition: 3,
      estimatedStartTime: '2026-02-02T15:30:00Z',
    },
  },
  {
    id: 'evt_wf_002',
    eventType: 'status_updated',
    stateName: 'initializing',
    timestamp: '2026-02-02T15:20:00Z',
    comment: 'Initializing workflow resources and staging input data',
    source: { type: 'system' },
    runId: 'WF001',
    runDisplayName: 'WFR.7x9k2m5p',
    payload: {
      inputDataSize: '512.6 GB',
      computeResources: {
        instanceType: 'c5.9xlarge',
        cpuCores: 36,
        memoryGb: 72,
      },
    },
  },
  {
    id: 'evt_wf_003',
    eventType: 'status_updated',
    stateName: 'ongoing',
    timestamp: '2026-02-02T15:35:00Z',
    comment: 'BCL Convert workflow started processing',
    source: { type: 'system' },
    runId: 'WF001',
    runDisplayName: 'WFR.7x9k2m5p',
    payload: {
      stages: ['demultiplexing', 'quality_filtering', 'fastq_generation'],
      totalTasks: 384,
      completedTasks: 0,
    },
  },
  {
    id: 'evt_wf_004',
    eventType: 'comment',
    timestamp: '2026-02-02T16:00:00Z',
    comment: 'Lane 1 demultiplexing completed ahead of schedule. Excellent performance.',
    source: { type: 'user', userName: 'pipeline-ops@orcabus.io' },
    runId: 'WF001',
    runDisplayName: 'WFR.7x9k2m5p',
  },
  {
    id: 'evt_wf_005',
    eventType: 'metadata_updated',
    timestamp: '2026-02-02T16:45:00Z',
    comment: 'Updated sample metadata with corrected phenotype classifications',
    source: { type: 'user', userName: 'data-curator@orcabus.io' },
    runId: 'WF001',
    runDisplayName: 'WFR.7x9k2m5p',
    payload: {
      updatedFields: ['phenotype', 'tissue_type'],
      affectedSamples: 12,
      reason: 'Clinical annotation review',
    },
  },
  {
    id: 'evt_wf_006',
    eventType: 'file_uploaded',
    timestamp: '2026-02-02T17:30:00Z',
    comment: 'Additional reference genome files uploaded for variant calling',
    source: { type: 'user', userName: 'bioinformatics@orcabus.io' },
    runId: 'WF001',
    runDisplayName: 'WFR.7x9k2m5p',
    payload: {
      fileCount: 3,
      totalSize: '8.2 GB',
      fileTypes: ['fasta', 'vcf', 'bed'],
    },
  },
  {
    id: 'evt_wf_007',
    eventType: 'qc_passed',
    timestamp: '2026-02-02T18:00:00Z',
    comment: 'Intermediate QC check passed for all lanes',
    source: { type: 'system' },
    runId: 'WF001',
    runDisplayName: 'WFR.7x9k2m5p',
    payload: {
      qcMetrics: {
        averageQualityScore: 35.8,
        demultiplexingRate: 98.5,
        undeterminedRate: 1.5,
      },
    },
  },
  {
    id: 'evt_wf_008',
    eventType: 'status_updated',
    stateName: 'succeeded',
    timestamp: '2026-02-02T18:45:00Z',
    comment: 'Workflow completed successfully. All outputs validated.',
    source: { type: 'system' },
    runId: 'WF001',
    runDisplayName: 'WFR.7x9k2m5p',
    payload: {
      totalDuration: '3h 25m',
      outputFiles: 96,
      totalOutputSize: '487.3 GB',
      finalStatus: 'All samples passed QC',
    },
  },
  {
    id: 'evt_wf_009',
    eventType: 'comment',
    timestamp: '2026-02-02T19:00:00Z',
    comment: 'Excellent run. Results delivered to analysis team for downstream processing.',
    source: { type: 'user', userName: 'pipeline-ops@orcabus.io' },
    runId: 'WF001',
    runDisplayName: 'WFR.7x9k2m5p',
  },
];

// Timeline events for a failed workflow (for testing failure states)
export const failedWorkflowTimelineEvents: TimelineEvent[] = [
  {
    id: 'evt_wf_fail_001',
    eventType: 'status_updated',
    stateName: 'queued',
    timestamp: '2026-02-02T14:00:00Z',
    source: { type: 'system' },
    runId: 'WF004',
    runDisplayName: 'WFR.9d2h5v8p',
  },
  {
    id: 'evt_wf_fail_002',
    eventType: 'status_updated',
    stateName: 'ongoing',
    timestamp: '2026-02-02T14:15:00Z',
    comment: 'Tumor-Normal workflow started',
    source: { type: 'system' },
    runId: 'WF004',
    runDisplayName: 'WFR.9d2h5v8p',
  },
  {
    id: 'evt_wf_fail_003',
    eventType: 'comment',
    timestamp: '2026-02-02T15:30:00Z',
    comment: 'Normal sample processing completed successfully',
    source: { type: 'system' },
    runId: 'WF004',
    runDisplayName: 'WFR.9d2h5v8p',
  },
  {
    id: 'evt_wf_fail_004',
    eventType: 'status_updated',
    stateName: 'failed',
    timestamp: '2026-02-02T16:45:00Z',
    comment: 'Workflow failed: Insufficient coverage in tumor sample (12x vs required 30x)',
    source: { type: 'system' },
    runId: 'WF004',
    runDisplayName: 'WFR.9d2h5v8p',
    payload: {
      errorCode: 'INSUFFICIENT_COVERAGE',
      tumorCoverage: 12.3,
      requiredCoverage: 30.0,
      affectedStage: 'variant_calling',
    },
  },
  {
    id: 'evt_wf_fail_005',
    eventType: 'comment',
    timestamp: '2026-02-02T17:00:00Z',
    comment: 'Investigating root cause. May need to re-sequence tumor sample or adjust thresholds.',
    source: { type: 'user', userName: 'pipeline-ops@orcabus.io' },
    runId: 'WF004',
    runDisplayName: 'WFR.9d2h5v8p',
  },
  {
    id: 'evt_wf_fail_006',
    eventType: 'custom_state',
    stateName: 'under_review',
    timestamp: '2026-02-02T17:30:00Z',
    comment: 'Escalated to lab team for sample quality assessment',
    source: { type: 'custom' },
    runId: 'WF004',
    runDisplayName: 'WFR.9d2h5v8p',
  },
];

// Combined export for easy access
export const allTimelineEvents: TimelineEvent[] = [
  ...sequenceRunTimelineEvents,
  ...workflowRunTimelineEvents,
  ...failedWorkflowTimelineEvents,
];

// Helper function to get events for a specific run
export function getTimelineEventsForRun(runId: string): TimelineEvent[] {
  return allTimelineEvents.filter((event) => event.runId === runId);
}

// Helper function to get all unique run IDs
export function getAllRunIds(): Array<{ value: string; label: string }> {
  const runIds = new Set(
    allTimelineEvents
      .filter((event) => event.runId && event.runDisplayName)
      .map((event) => JSON.stringify({ value: event.runId!, label: event.runDisplayName! }))
  );

  return Array.from(runIds).map((json) => JSON.parse(json) as { value: string; label: string });
}

// Available states for workflow runs
export const workflowRunStates = [
  { value: 'queued', label: 'Queued' },
  { value: 'initializing', label: 'Initializing' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'failed', label: 'Failed' },
  { value: 'aborted', label: 'Aborted' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'under_review', label: 'Under Review' },
];

// Available states for sequence runs
export const sequenceRunStates = [
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'aborted', label: 'Aborted' },
  { value: 'on_hold', label: 'On Hold' },
];
