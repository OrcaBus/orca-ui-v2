// Mock data for the LIMS system

export interface Library {
  id: string;
  name: string; // Library ID (display name like L2400001)
  orcabusId: string; // Orcabus ID
  projectName: string; // Human-readable project name
  sampleId: string; // Sample ID
  externalSampleId: string; // External Sample ID
  subjectId: string; // Subject ID
  type: string; // Type (WGS, WTS, etc.)
  assay: string; // Assay type
  phenotype: string; // Phenotype (tumor, normal, etc.)
  workflow: string; // Workflow
  createdDate: string;
  status: 'ready' | 'processing' | 'qc-pending' | 'failed';
  quality: number; // Quality score
  coverage: number; // Coverage (e.g., 100x)
  overrideCycles: string; // Override cycles (e.g., "Y151;I8;I8;Y151")
  source: string; // Source (e.g., "tissue", "blood", "cell-line")
  projectId: string; // Project ID
  concentration: number; // For backwards compatibility
}

export interface SequenceRun {
  id: string;
  runId: string;
  instrumentRunId: string; // New field for instrument run ID
  instrument: string;
  flowcellId: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startDate: string;
  completedDate?: string;
  libraries: number;
  reads: number;
  yield: number;
  statusHistory?: StatusEvent[];
  lanes?: SequenceLane[];
  failureReason?: string;
}

export interface StatusEvent {
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  message?: string;
  type?: 'system' | 'comment' | 'manual';
  user?: string;
}

export interface SampleSheet {
  id: string;
  fileName: string;
  uploadedDate: string;
  uploadedBy: string;
  validationStatus: 'valid' | 'invalid' | 'pending';
  validationMessage?: string;
  sequenceRunId: string;
}

export interface SequenceLane {
  id: string;
  laneNumber: number;
  status: 'running' | 'completed' | 'failed' | 'pending';
  reads: number;
  yield: number;
  qualityScore: number;
  attempt: number;
}

export interface WorkflowRun {
  id: string;
  name: string;
  workflowId: string;
  portalRunId: string;
  executionId: string;
  workflowType: string;
  status: 'succeeded' | 'failed' | 'aborted' | 'resolved' | 'deprecated' | 'ongoing';
  startTime: string;
  endTime?: string;
  lastModified: string;
  duration?: string;
  progress?: number;
  libraryId: string;
  sequenceRunId?: string;
  relatedLibraryCount: number;
  outputFileCount: number;
}

// Detailed Workflow Run for detail page
export interface WorkflowRunDetail {
  id: string;
  name: string;
  orcabusId: string;
  portalRunId: string;
  executionId: string;
  workflowType: string;
  status: 'succeeded' | 'failed' | 'aborted' | 'resolved' | 'deprecated' | 'ongoing';
  comment?: string;

  // Workflow details
  workflow: {
    name: string;
    version: string;
    codeVersion: string;
    executionEngine: string;
    executionEnginePipelineId: string;
    validationState: 'valid' | 'invalid' | 'pending';
  };

  // Analysis details (linked context)
  analysis?: {
    analysisRunName: string;
    analysisName: string;
    analysisVersion: string;
    description?: string;
  };

  // Timeline
  timeline: TimelineEntry[];

  // Related data counts
  libraryCount: number;
  runContextCount: number;
  readsetCount: number;
}

export interface TimelineEntry {
  id: string;
  type: 'state' | 'comment' | 'custom';
  status?:
    | 'succeeded'
    | 'failed'
    | 'aborted'
    | 'resolved'
    | 'deprecated'
    | 'ongoing'
    | 'running'
    | 'queued';
  timestamp: string;
  comment?: string;
  user?: string;
  payload?: WorkflowPayload;
}

export interface WorkflowPayload {
  engineParameters?: Record<string, string | number | boolean>;
  inputs?: Array<{ name: string; value: string; link?: string }>;
  tags?: string[];
  rawJson?: Record<string, unknown>;
}

export interface WorkflowLibraryAssociation {
  id: string;
  libraryId: string;
  libraryName: string;
  type?: string;
  assay?: string;
  associationStatus: 'active' | 'archived';
  associationDate: string;
}

export interface WorkflowRunContext {
  id: string;
  name: string;
  useCase: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface WorkflowReadset {
  id: string;
  rgid: string;
  libraryId: string;
  readsetOrcabusId: string;
  status?: 'ready' | 'processing' | 'failed';
}

export interface AnalysisRun {
  id: string;
  analysisId: string;
  name: string;
  analysisName: string; // Analysis type name
  analysisVersion: string; // Analysis type version
  analysisType: string; // For backwards compatibility
  status: 'succeeded' | 'failed' | 'aborted' | 'resolved' | 'deprecated' | 'ongoing';
  startTime: string;
  endTime?: string;
  duration?: string;
  progress?: number;
  caseId?: string;
  inputFiles: number;
  outputFiles: number;
  computeHours?: number;
  owner: string;
  libraryCount: number;
  contextCount: number;
  readsetCount: number;
}

// Detailed Analysis Run for detail page
export interface AnalysisRunDetail {
  id: string;
  name: string;
  orcabusId: string;
  externalId?: string;
  status: 'succeeded' | 'failed' | 'aborted' | 'resolved' | 'deprecated' | 'ongoing';
  comment?: string;

  // Analysis type details
  analysisType: {
    name: string;
    version: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
  };

  // Relationships
  linkedContextIds: string[];
  linkedWorkflowIds: string[];
  linkedLibraryIds: string[];
  linkedReadsetIds: string[];

  // Counts for tabs
  workflowRunCount: number;
  libraryCount: number;
  contextCount: number;
  readsetCount: number;
}

// Analysis Workflow Run (workflow runs belonging to an analysis run)
export interface AnalysisWorkflowRun {
  id: string;
  name: string;
  portalRunId: string;
  executionId: string;
  status: 'succeeded' | 'failed' | 'aborted' | 'resolved' | 'deprecated' | 'ongoing';
  lastModified: string;
}

export interface WorkflowTypeDefinition {
  id: string;
  name: string;
  version: string;
  codeVersion: string;
  description: string;
  category: 'sequencing' | 'alignment' | 'variant-calling' | 'rna-analysis' | 'quality-control';
  status: 'active' | 'deprecated' | 'development';
  validationState: 'validated' | 'unvalidated' | 'deprecated' | 'failed';
  executionEngine: 'Unknown' | 'ICA' | 'SEQERA' | 'AWS_BATCH' | 'AWS_ECS' | 'AWS_EKS';
  executionEnginePipelineId: string;
  lastUsed?: string;
  totalRuns: number;
  successRate: number;
  avgDuration: string;
  computeCost: string;
  orcabusId?: string;
  history?: WorkflowTypeHistoryEntry[];
}

export interface WorkflowTypeHistoryEntry {
  id: string;
  orcabusId: string;
  name: string;
  version: string;
  codeVersion: string;
  executionEngine: 'Unknown' | 'ICA' | 'SEQERA' | 'AWS_BATCH' | 'AWS_ECS' | 'AWS_EKS';
  executionEnginePipelineId: string;
  validationState: 'validated' | 'unvalidated' | 'deprecated' | 'failed';
}

export interface AnalysisType {
  id: string;
  name: string;
  version: string;
  description: string;
  category:
    | 'variant-calling'
    | 'rna-analysis'
    | 'quality-control'
    | 'structural-variant'
    | 'methylation';
  status: 'ACTIVE' | 'INACTIVE';
  validationState: 'validated' | 'unvalidated' | 'deprecated' | 'failed';
  lastUsed?: string;
  totalRuns: number;
  successRate: number;
  avgDuration: string;
  inputRequirements: string;
  outputTypes: string;
  contexts: string[];
  linkedWorkflows: string[];
}

export interface AnalysisContext {
  id: string;
  orcabusId: string;
  name: string;
  usecase: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface WorkflowDetail {
  id: string;
  orcabusId: string;
  name: string;
  version: string;
  codeVersion: string;
  executionEngine: 'Unknown' | 'ICA' | 'SEQERA' | 'AWS_BATCH' | 'AWS_ECS' | 'AWS_EKS';
  executionEnginePipelineId: string;
  validationState: 'validated' | 'unvalidated' | 'deprecated' | 'failed';
}

export interface File {
  id: string;
  name: string;
  s3Key: string;
  bucket: string;
  type: string;
  reportType?: string;
  size: string;
  sizeBytes: number;
  dateCreated: string;
  dateModified: string;
  status: 'available' | 'archived' | 'processing';
  sourceWorkflowId?: string;
  relatedLibraryId?: string;
  workflowRunId?: string; // Link to the workflow run that generated this file
  portalRunId?: string; // Portal Run identifier
}

export interface Case {
  id: string;
  title: string;
  alias: string;
  description: string;
  type: 'clinical' | 'research' | 'validation' | 'qc';
  lastModified: string;
  createdDate: string;
  createdBy: string;
  linkedLibraries: string[]; // Library IDs
  linkedWorkflows: string[]; // Workflow IDs
  linkedFiles: string[]; // File IDs
  status: 'active' | 'archived' | 'pending';
}

export const mockLibraries: Library[] = [
  {
    id: 'LIB001',
    name: 'L2400001',
    orcabusId: 'wfr.01HQXZ9K3M5N6P7Q8R9S0T1U2V',
    projectName: 'Project PRJ240001',
    sampleId: 'PRJ240001_S001',
    externalSampleId: 'EXT_S001',
    subjectId: 'SUBJ001',
    type: 'WGS',
    assay: 'Whole Genome Sequencing',
    phenotype: 'tumor',
    workflow: 'bcl_convert',
    createdDate: '2026-02-01T10:30:00Z',
    status: 'ready',
    quality: 8.2,
    coverage: 100,
    overrideCycles: 'Y151;I8;I8;Y151',
    source: 'tissue',
    projectId: 'PRJ240001',
    concentration: 15.4,
  },
  {
    id: 'LIB002',
    name: 'L2400002',
    orcabusId: 'wfr.01HQXZ9K3M5N6P7Q8R9S0T1U3W',
    projectName: 'Project PRJ240001',
    sampleId: 'PRJ240001_S002',
    externalSampleId: 'EXT_S002',
    subjectId: 'SUBJ001',
    type: 'WGS',
    assay: 'Whole Genome Sequencing',
    phenotype: 'normal',
    workflow: 'bcl_convert',
    createdDate: '2026-02-01T10:30:00Z',
    status: 'ready',
    quality: 8.5,
    coverage: 100,
    overrideCycles: 'Y151;I8;I8;Y151',
    source: 'tissue',
    projectId: 'PRJ240001',
    concentration: 18.2,
  },
  {
    id: 'LIB003',
    name: 'L2400003',
    orcabusId: 'wfr.01HQXZ9K3M5N6P7Q8R9S0T1U4X',
    projectName: 'Project PRJ240002',
    sampleId: 'PRJ240002_S001',
    externalSampleId: 'EXT_S003',
    subjectId: 'SUBJ002',
    type: 'WTS',
    assay: 'Whole Transcriptome Sequencing',
    phenotype: 'tumor',
    workflow: 'oncoanalyser',
    createdDate: '2026-02-01T14:20:00Z',
    status: 'processing',
    quality: 7.9,
    coverage: 100,
    overrideCycles: 'Y151;I8;I8;Y151',
    source: 'tissue',
    projectId: 'PRJ240002',
    concentration: 12.8,
  },
  {
    id: 'LIB004',
    name: 'L2400004',
    orcabusId: 'wfr.01HQXZ9K3M5N6P7Q8R9S0T1U5Y',
    projectName: 'Project PRJ240003',
    sampleId: 'PRJ240003_S001',
    externalSampleId: 'EXT_S004',
    subjectId: 'SUBJ003',
    type: 'WGS',
    assay: 'Whole Genome Sequencing',
    phenotype: 'tumor',
    workflow: 'tumor_normal',
    createdDate: '2026-02-02T09:15:00Z',
    status: 'qc-pending',
    quality: 8.7,
    coverage: 100,
    overrideCycles: 'Y151;I8;I8;Y151',
    source: 'tissue',
    projectId: 'PRJ240003',
    concentration: 20.1,
  },
  {
    id: 'LIB005',
    name: 'L2400005',
    orcabusId: 'wfr.01HQXZ9K3M5N6P7Q8R9S0T1U6Z',
    projectName: 'Project PRJ240003',
    sampleId: 'PRJ240003_S002',
    externalSampleId: 'EXT_S005',
    subjectId: 'SUBJ003',
    type: 'WGS',
    assay: 'Whole Genome Sequencing',
    phenotype: 'normal',
    workflow: 'tumor_normal',
    createdDate: '2026-02-02T09:15:00Z',
    status: 'ready',
    quality: 8.3,
    coverage: 100,
    overrideCycles: 'Y151;I8;I8;Y151',
    source: 'tissue',
    projectId: 'PRJ240003',
    concentration: 16.7,
  },
  {
    id: 'LIB006',
    name: 'L2400006',
    orcabusId: 'wfr.01HQXZ9K3M5N6P7Q8R9S0T1U7A',
    projectName: 'Project PRJ240004',
    sampleId: 'PRJ240004_S001',
    externalSampleId: 'EXT_S006',
    subjectId: 'SUBJ004',
    type: 'TSO500',
    assay: 'Targeted Sequencing',
    phenotype: 'tumor',
    workflow: 'tso_ctdna',
    createdDate: '2026-02-02T11:45:00Z',
    status: 'failed',
    quality: 6.2,
    coverage: 100,
    overrideCycles: 'Y151;I8;I8;Y151',
    source: 'blood',
    projectId: 'PRJ240004',
    concentration: 8.9,
  },
];

export const mockSequenceRuns: SequenceRun[] = [
  {
    id: 'SEQ001',
    runId: 'r.240201_A01052_0089_01',
    instrumentRunId: '260130_A01052_0300_BHNVFKDSXF',
    instrument: 'NovaSeq X Plus',
    flowcellId: 'HWFK3DSX7',
    status: 'completed',
    startDate: '2026-02-01T18:00:00Z',
    completedDate: '2026-02-02T14:30:00Z',
    libraries: 8,
    reads: 1245680000,
    yield: 374.5,
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2026-02-01T17:00:00Z',
        message: 'Run scheduled and awaiting instrument availability',
        type: 'system',
      },
      {
        status: 'running',
        timestamp: '2026-02-01T18:00:00Z',
        message: 'Sequencing run started',
        type: 'system',
      },
      {
        status: 'running',
        timestamp: '2026-02-02T02:30:00Z',
        message: 'Checked instrument - all metrics looking good',
        type: 'comment',
        user: 'tech@orcabus.io',
      },
      {
        status: 'running',
        timestamp: '2026-02-02T10:15:00Z',
        message: 'Quality check milestone - Q scores above target',
        type: 'manual',
        user: 'admin@orcabus.io',
      },
      {
        status: 'completed',
        timestamp: '2026-02-02T14:30:00Z',
        message: 'Run completed successfully',
        type: 'system',
      },
    ],
    lanes: [
      {
        id: 'SEQ001_L1',
        laneNumber: 1,
        status: 'completed',
        reads: 311420000,
        yield: 93.6,
        qualityScore: 35.2,
        attempt: 1,
      },
      {
        id: 'SEQ001_L2',
        laneNumber: 2,
        status: 'completed',
        reads: 308150000,
        yield: 92.6,
        qualityScore: 35.4,
        attempt: 1,
      },
      {
        id: 'SEQ001_L3',
        laneNumber: 3,
        status: 'completed',
        reads: 314890000,
        yield: 94.7,
        qualityScore: 35.1,
        attempt: 1,
      },
      {
        id: 'SEQ001_L4',
        laneNumber: 4,
        status: 'completed',
        reads: 311220000,
        yield: 93.6,
        qualityScore: 35.3,
        attempt: 1,
      },
    ],
  },
  {
    id: 'SEQ002',
    runId: 'r.260203_A01052_0301_02',
    instrumentRunId: '260203_A01052_0301_BHWGM2DSX7',
    instrument: 'NovaSeq X Plus',
    flowcellId: 'HWGM2DSX7',
    status: 'running',
    startDate: '2026-02-03T07:00:00Z',
    libraries: 12,
    reads: 856430000,
    yield: 256.9,
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2026-02-02T19:00:00Z',
        message: 'Run queued for processing',
        type: 'system',
      },
      {
        status: 'running',
        timestamp: '2026-02-02T20:00:00Z',
        message: 'Sequencing in progress - 65% complete',
        type: 'system',
      },
    ],
    lanes: [
      {
        id: 'SEQ002_L1',
        laneNumber: 1,
        status: 'completed',
        reads: 214210000,
        yield: 64.3,
        qualityScore: 35.6,
        attempt: 1,
      },
      {
        id: 'SEQ002_L2',
        laneNumber: 2,
        status: 'completed',
        reads: 212450000,
        yield: 63.8,
        qualityScore: 35.5,
        attempt: 1,
      },
      {
        id: 'SEQ002_L3',
        laneNumber: 3,
        status: 'running',
        reads: 215890000,
        yield: 64.8,
        qualityScore: 35.4,
        attempt: 1,
      },
      {
        id: 'SEQ002_L4',
        laneNumber: 4,
        status: 'running',
        reads: 213880000,
        yield: 64.2,
        qualityScore: 35.3,
        attempt: 1,
      },
    ],
  },
  {
    id: 'SEQ003',
    runId: 'r.260131_A00987_0298_03',
    instrumentRunId: '260131_A00987_0298_BHVNK8DSXY',
    instrument: 'NovaSeq 6000',
    flowcellId: 'HVNK8DSXY',
    status: 'completed',
    startDate: '2026-01-31T21:00:00Z',
    completedDate: '2026-02-01T19:15:00Z',
    libraries: 6,
    reads: 984520000,
    yield: 295.4,
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2026-01-31T09:00:00Z',
        message: 'Run initialized',
        type: 'system',
      },
      {
        status: 'running',
        timestamp: '2026-01-31T10:00:00Z',
        message: 'Sequencing started',
        type: 'system',
      },
      {
        status: 'running',
        timestamp: '2026-01-31T18:30:00Z',
        message: 'Lane 3 showing lower quality scores - monitoring closely',
        type: 'comment',
        user: 'analyst@orcabus.io',
      },
      {
        status: 'completed',
        timestamp: '2026-02-01T08:15:00Z',
        message: 'Run completed with lane 3 requiring resequencing',
        type: 'system',
      },
    ],
    lanes: [
      {
        id: 'SEQ003_L1',
        laneNumber: 1,
        status: 'completed',
        reads: 246130000,
        yield: 73.9,
        qualityScore: 34.8,
        attempt: 1,
      },
      {
        id: 'SEQ003_L2',
        laneNumber: 2,
        status: 'completed',
        reads: 246130000,
        yield: 73.9,
        qualityScore: 34.9,
        attempt: 1,
      },
      {
        id: 'SEQ003_L3',
        laneNumber: 3,
        status: 'failed',
        reads: 98450000,
        yield: 29.5,
        qualityScore: 28.2,
        attempt: 1,
      },
      {
        id: 'SEQ003_L3_R',
        laneNumber: 3,
        status: 'completed',
        reads: 246980000,
        yield: 74.1,
        qualityScore: 34.7,
        attempt: 2,
      },
      {
        id: 'SEQ003_L4',
        laneNumber: 4,
        status: 'completed',
        reads: 246830000,
        yield: 74.0,
        qualityScore: 35.0,
        attempt: 1,
      },
    ],
  },
  {
    id: 'SEQ004',
    runId: 'r.260204_A01052_0302_04',
    instrumentRunId: '260204_A01052_0302_BHWJP4DSX7',
    instrument: 'NovaSeq X Plus',
    flowcellId: 'HWJP4DSX7',
    status: 'running',
    startDate: '2026-02-04T09:00:00Z',
    libraries: 10,
    reads: 0,
    yield: 0,
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2026-02-03T22:00:00Z',
        message: 'Run scheduled for tonight',
        type: 'system',
      },
    ],
    lanes: [
      {
        id: 'SEQ004_L1',
        laneNumber: 1,
        status: 'pending',
        reads: 0,
        yield: 0,
        qualityScore: 0,
        attempt: 1,
      },
      {
        id: 'SEQ004_L2',
        laneNumber: 2,
        status: 'pending',
        reads: 0,
        yield: 0,
        qualityScore: 0,
        attempt: 1,
      },
      {
        id: 'SEQ004_L3',
        laneNumber: 3,
        status: 'pending',
        reads: 0,
        yield: 0,
        qualityScore: 0,
        attempt: 1,
      },
      {
        id: 'SEQ004_L4',
        laneNumber: 4,
        status: 'pending',
        reads: 0,
        yield: 0,
        qualityScore: 0,
        attempt: 1,
      },
    ],
  },
  {
    id: 'SEQ005',
    runId: 'r.260130_A00987_0297_05',
    instrumentRunId: '260130_A00987_0297_BHGJK2DSXY',
    instrument: 'NovaSeq 6000',
    flowcellId: 'HGJK2DSXY',
    status: 'failed',
    startDate: '2026-01-30T01:00:00Z',
    completedDate: '2026-01-30T05:45:00Z',
    libraries: 8,
    reads: 125430000,
    yield: 37.6,
    failureReason:
      'Instrument error: Temperature control failure detected at cycle 45. Run aborted to prevent sample damage.',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2026-01-30T13:00:00Z',
        message: 'Run initialized',
        type: 'system',
      },
      {
        status: 'running',
        timestamp: '2026-01-30T14:00:00Z',
        message: 'Sequencing started',
        type: 'system',
      },
      {
        status: 'running',
        timestamp: '2026-01-30T17:30:00Z',
        message: 'Temperature warning detected - investigating',
        type: 'comment',
        user: 'tech@orcabus.io',
      },
      {
        status: 'failed',
        timestamp: '2026-01-30T18:45:00Z',
        message: 'Run failed - Temperature control error',
        type: 'system',
      },
      {
        status: 'failed',
        timestamp: '2026-01-30T19:15:00Z',
        message: 'Contacted manufacturer for instrument diagnostics. Rerun scheduled.',
        type: 'comment',
        user: 'admin@orcabus.io',
      },
    ],
    lanes: [
      {
        id: 'SEQ005_L1',
        laneNumber: 1,
        status: 'failed',
        reads: 31360000,
        yield: 9.4,
        qualityScore: 0,
        attempt: 1,
      },
      {
        id: 'SEQ005_L2',
        laneNumber: 2,
        status: 'failed',
        reads: 31360000,
        yield: 9.4,
        qualityScore: 0,
        attempt: 1,
      },
      {
        id: 'SEQ005_L3',
        laneNumber: 3,
        status: 'failed',
        reads: 31360000,
        yield: 9.4,
        qualityScore: 0,
        attempt: 1,
      },
      {
        id: 'SEQ005_L4',
        laneNumber: 4,
        status: 'failed',
        reads: 31350000,
        yield: 9.4,
        qualityScore: 0,
        attempt: 1,
      },
    ],
  },
];

export const mockSampleSheets: SampleSheet[] = [
  {
    id: 'SS001',
    fileName: 'SampleSheet_240201_HWFK3DSX7.csv',
    uploadedDate: '2026-02-01T16:30:00Z',
    uploadedBy: 'admin@orcabus.io',
    validationStatus: 'valid',
    sequenceRunId: 'SEQ001',
  },
  {
    id: 'SS002',
    fileName: 'SampleSheet_240202_HWGM2DSX7.csv',
    uploadedDate: '2026-02-02T18:45:00Z',
    uploadedBy: 'analyst@orcabus.io',
    validationStatus: 'valid',
    sequenceRunId: 'SEQ002',
  },
  {
    id: 'SS003',
    fileName: 'SampleSheet_240131_HVNK8DSXY.csv',
    uploadedDate: '2026-01-31T08:00:00Z',
    uploadedBy: 'admin@orcabus.io',
    validationStatus: 'valid',
    sequenceRunId: 'SEQ003',
  },
  {
    id: 'SS004',
    fileName: 'SampleSheet_240203_HWJP4DSX7.csv',
    uploadedDate: '2026-02-03T20:15:00Z',
    uploadedBy: 'tech@orcabus.io',
    validationStatus: 'pending',
    sequenceRunId: 'SEQ004',
  },
  {
    id: 'SS005',
    fileName: 'SampleSheet_240130_HGJK2DSXY.csv',
    uploadedDate: '2026-01-30T12:30:00Z',
    uploadedBy: 'admin@orcabus.io',
    validationStatus: 'valid',
    sequenceRunId: 'SEQ005',
  },
  {
    id: 'SS005_v2',
    fileName: 'SampleSheet_240130_HGJK2DSXY_v2.csv',
    uploadedDate: '2026-01-30T13:15:00Z',
    uploadedBy: 'admin@orcabus.io',
    validationStatus: 'invalid',
    validationMessage: 'Duplicate sample IDs detected in lanes 2 and 3',
    sequenceRunId: 'SEQ005',
  },
];

export const mockWorkflowRuns: WorkflowRun[] = [
  {
    id: 'WF001',
    name: 'BCL Convert - Run 240201',
    workflowId: 'wfr_7x9k2m5p',
    portalRunId: '20260201_wgs_batch12',
    executionId: 'exec_a1b2c3d4e5f6',
    workflowType: 'BCL Convert',
    status: 'succeeded',
    startTime: '2026-02-02T15:00:00Z',
    endTime: '2026-02-02T18:45:00Z',
    lastModified: '2026-02-02T18:45:00Z',
    duration: '3h 45m',
    progress: 100,
    libraryId: 'LIB001',
    sequenceRunId: 'SEQ001',
    relatedLibraryCount: 8,
    outputFileCount: 32,
  },
  {
    id: 'WF002',
    name: 'DRAGEN Germline - Sample NGS-001',
    workflowId: 'wfr_8a4n6r2t',
    portalRunId: '20260203_germline_ngs001',
    executionId: 'exec_g7h8i9j0k1l2',
    workflowType: 'DRAGEN Germline',
    status: 'ongoing',
    startTime: '2026-02-03T09:00:00Z',
    lastModified: '2026-02-04T11:30:00Z',
    duration: '5h 12m',
    progress: 65,
    libraryId: 'LIB001',
    sequenceRunId: 'SEQ001',
    relatedLibraryCount: 1,
    outputFileCount: 8,
  },
  {
    id: 'WF003',
    name: 'RNA-Seq Pipeline - Sample RNS-045',
    workflowId: 'wfr_3b8c1k7m',
    portalRunId: '20260201_rnaseq_rns045',
    executionId: 'exec_m3n4o5p6q7r8',
    workflowType: 'RNA-Seq',
    status: 'succeeded',
    startTime: '2026-02-01T10:30:00Z',
    endTime: '2026-02-01T16:20:00Z',
    lastModified: '2026-02-01T16:20:00Z',
    duration: '5h 50m',
    progress: 100,
    libraryId: 'LIB003',
    sequenceRunId: 'SEQ003',
    relatedLibraryCount: 1,
    outputFileCount: 15,
  },
  {
    id: 'WF004',
    name: 'Tumor-Normal Somatic - Pair TN-078',
    workflowId: 'wfr_9d2h5v8p',
    portalRunId: '20260202_somatic_tn078',
    executionId: 'exec_s9t0u1v2w3x4',
    workflowType: 'Tumor-Normal',
    status: 'failed',
    startTime: '2026-02-02T08:00:00Z',
    endTime: '2026-02-02T11:30:00Z',
    lastModified: '2026-02-02T11:30:00Z',
    duration: '3h 30m',
    progress: 45,
    libraryId: 'LIB002',
    relatedLibraryCount: 2,
    outputFileCount: 6,
  },
  {
    id: 'WF005',
    name: 'DRAGEN Germline - Sample NGS-002',
    workflowId: 'wfr_5k9m3n7r',
    portalRunId: '20260202_germline_ngs002',
    executionId: 'exec_y5z6a7b8c9d0',
    workflowType: 'DRAGEN Germline',
    status: 'succeeded',
    startTime: '2026-02-02T14:00:00Z',
    endTime: '2026-02-02T20:15:00Z',
    lastModified: '2026-02-02T20:15:00Z',
    duration: '6h 15m',
    progress: 100,
    libraryId: 'LIB002',
    sequenceRunId: 'SEQ001',
    relatedLibraryCount: 1,
    outputFileCount: 12,
  },
  {
    id: 'WF006',
    name: 'BCL Convert - Run 240202',
    workflowId: 'wfr_2p7r4t9k',
    portalRunId: '20260204_wgs_batch13',
    executionId: 'exec_e1f2g3h4i5j6',
    workflowType: 'BCL Convert',
    status: 'ongoing',
    startTime: '2026-02-04T06:30:00Z',
    lastModified: '2026-02-04T10:45:00Z',
    duration: '2h 15m',
    progress: 35,
    libraryId: 'LIB004',
    sequenceRunId: 'SEQ002',
    relatedLibraryCount: 12,
    outputFileCount: 18,
  },
  {
    id: 'WF007',
    name: 'ChIP-Seq Analysis - Sample CHP-023',
    workflowId: 'wfr_6n3k8m2v',
    portalRunId: '20260201_chipseq_chp023',
    executionId: 'exec_k7l8m9n0o1p2',
    workflowType: 'ChIP-Seq',
    status: 'succeeded',
    startTime: '2026-02-01T18:00:00Z',
    endTime: '2026-02-02T02:30:00Z',
    lastModified: '2026-02-02T02:30:00Z',
    duration: '8h 30m',
    progress: 100,
    libraryId: 'LIB005',
    sequenceRunId: 'SEQ003',
    relatedLibraryCount: 1,
    outputFileCount: 24,
  },
  {
    id: 'WF008',
    name: 'Variant Calling - Sample NGS-003',
    workflowId: 'wfr_4v8c2m5n',
    portalRunId: '20260204_variant_ngs003',
    executionId: 'exec_q3r4s5t6u7v8',
    workflowType: 'Variant Calling',
    status: 'aborted',
    startTime: '2026-02-04T10:00:00Z',
    lastModified: '2026-02-04T10:15:00Z',
    duration: '0m',
    progress: 0,
    libraryId: 'LIB003',
    relatedLibraryCount: 1,
    outputFileCount: 0,
  },
  {
    id: 'WF009',
    name: 'DRAGEN Germline - Sample NGS-004',
    workflowId: 'wfr_7m9p3k6r',
    portalRunId: '20260204_germline_ngs004',
    executionId: 'exec_w9x0y1z2a3b4',
    workflowType: 'DRAGEN Germline',
    status: 'resolved',
    startTime: '2026-02-04T11:00:00Z',
    endTime: '2026-02-04T11:45:00Z',
    lastModified: '2026-02-04T11:50:00Z',
    duration: '0m',
    progress: 0,
    libraryId: 'LIB004',
    relatedLibraryCount: 1,
    outputFileCount: 0,
  },
  {
    id: 'WF010',
    name: 'RNA-Seq Pipeline - Sample RNS-046',
    workflowId: 'wfr_1k5n7m9t',
    portalRunId: '20260203_rnaseq_rns046',
    executionId: 'exec_c5d6e7f8g9h0',
    workflowType: 'RNA-Seq',
    status: 'failed',
    startTime: '2026-02-03T12:00:00Z',
    endTime: '2026-02-03T14:45:00Z',
    lastModified: '2026-02-03T14:45:00Z',
    duration: '2h 45m',
    progress: 28,
    libraryId: 'LIB005',
    relatedLibraryCount: 1,
    outputFileCount: 3,
  },
  {
    id: 'WF011',
    name: 'Tumor-Normal Somatic - Pair TN-079',
    workflowId: 'wfr_8p2r5k9m',
    portalRunId: '20260204_somatic_tn079',
    executionId: 'exec_i1j2k3l4m5n6',
    workflowType: 'Tumor-Normal',
    status: 'ongoing',
    startTime: '2026-02-04T07:30:00Z',
    lastModified: '2026-02-04T11:15:00Z',
    duration: '1h 45m',
    progress: 22,
    libraryId: 'LIB001',
    relatedLibraryCount: 2,
    outputFileCount: 4,
  },
  {
    id: 'WF012',
    name: 'Variant Calling - Sample NGS-005',
    workflowId: 'wfr_3k7m9n2p',
    portalRunId: '20260203_variant_ngs005',
    executionId: 'exec_o7p8q9r0s1t2',
    workflowType: 'Variant Calling',
    status: 'deprecated',
    startTime: '2026-02-03T08:00:00Z',
    endTime: '2026-02-03T13:30:00Z',
    lastModified: '2026-02-04T09:00:00Z',
    duration: '5h 30m',
    progress: 100,
    libraryId: 'LIB002',
    relatedLibraryCount: 1,
    outputFileCount: 18,
  },
];

export const mockFiles: File[] = [
  {
    id: 'FILE001',
    name: 'sample_NGS-001_R1.fastq.gz',
    s3Key: 'orcabus-seq-data/240201_A01052_0089/FASTQ/sample_NGS-001_R1.fastq.gz',
    bucket: 'orcabus-seq-data',
    type: 'FASTQ',
    reportType: 'Raw Reads',
    size: '12.3 GB',
    sizeBytes: 13200000000,
    dateCreated: '2026-02-02T15:30:00Z',
    dateModified: '2026-02-02T15:30:00Z',
    status: 'available',
    sourceWorkflowId: 'WF001',
    relatedLibraryId: 'LIB001',
    workflowRunId: 'WF001',
    portalRunId: '20260202abcdef',
  },
  {
    id: 'FILE002',
    name: 'sample_NGS-001_R2.fastq.gz',
    s3Key: 'orcabus-seq-data/240201_A01052_0089/FASTQ/sample_NGS-001_R2.fastq.gz',
    bucket: 'orcabus-seq-data',
    type: 'FASTQ',
    reportType: 'Raw Reads',
    size: '12.5 GB',
    sizeBytes: 13400000000,
    dateCreated: '2026-02-02T15:30:00Z',
    dateModified: '2026-02-02T15:30:00Z',
    status: 'available',
    sourceWorkflowId: 'WF001',
    relatedLibraryId: 'LIB001',
    workflowRunId: 'WF001',
    portalRunId: '20260202abcdef',
  },
  {
    id: 'FILE003',
    name: 'NGS-001.bam',
    s3Key: 'orcabus-analysis/dragen/wfr_8a4n6r2t/NGS-001.bam',
    bucket: 'orcabus-analysis',
    type: 'BAM',
    reportType: 'Alignment',
    size: '45.2 GB',
    sizeBytes: 48500000000,
    dateCreated: '2026-02-03T14:20:00Z',
    dateModified: '2026-02-03T14:20:00Z',
    status: 'available',
    sourceWorkflowId: 'WF002',
    relatedLibraryId: 'LIB001',
    workflowRunId: 'WF002',
    portalRunId: '20260203xyz789',
  },
  {
    id: 'FILE004',
    name: 'NGS-001.bam.bai',
    s3Key: 'orcabus-analysis/dragen/wfr_8a4n6r2t/NGS-001.bam.bai',
    bucket: 'orcabus-analysis',
    type: 'BAI',
    reportType: 'Index',
    size: '2.1 MB',
    sizeBytes: 2200000,
    dateCreated: '2026-02-03T14:25:00Z',
    dateModified: '2026-02-03T14:25:00Z',
    status: 'available',
    sourceWorkflowId: 'WF002',
    relatedLibraryId: 'LIB001',
    workflowRunId: 'WF002',
    portalRunId: '20260203xyz789',
  },
  {
    id: 'FILE005',
    name: 'NGS-001.vcf.gz',
    s3Key: 'orcabus-analysis/dragen/wfr_8a4n6r2t/NGS-001.vcf.gz',
    bucket: 'orcabus-analysis',
    type: 'VCF',
    reportType: 'Variants',
    size: '156 MB',
    sizeBytes: 163000000,
    dateCreated: '2026-02-03T14:30:00Z',
    dateModified: '2026-02-03T14:30:00Z',
    status: 'available',
    sourceWorkflowId: 'WF002',
    relatedLibraryId: 'LIB001',
    workflowRunId: 'WF002',
    portalRunId: '20260203xyz789',
  },
  {
    id: 'FILE006',
    name: 'NGS-001_coverage_metrics.csv',
    s3Key: 'orcabus-analysis/dragen/wfr_8a4n6r2t/reports/NGS-001_coverage_metrics.csv',
    bucket: 'orcabus-analysis',
    type: 'CSV',
    reportType: 'QC Report',
    size: '45 KB',
    sizeBytes: 46000,
    dateCreated: '2026-02-03T14:32:00Z',
    dateModified: '2026-02-03T14:32:00Z',
    status: 'available',
    sourceWorkflowId: 'WF002',
    relatedLibraryId: 'LIB001',
    workflowRunId: 'WF002',
    portalRunId: '20260203xyz789',
  },
  {
    id: 'FILE007',
    name: 'RNS-045_gene_counts.tsv',
    s3Key: 'orcabus-analysis/rnaseq/wfr_3b8c1k7m/RNS-045_gene_counts.tsv',
    bucket: 'orcabus-analysis',
    type: 'TSV',
    reportType: 'Expression',
    size: '3.2 MB',
    sizeBytes: 3350000,
    dateCreated: '2026-02-01T16:20:00Z',
    dateModified: '2026-02-01T16:20:00Z',
    status: 'available',
    sourceWorkflowId: 'WF003',
    relatedLibraryId: 'LIB003',
    workflowRunId: 'WF003',
    portalRunId: '20260201pqr456',
  },
  {
    id: 'FILE008',
    name: 'RNS-045.bam',
    s3Key: 'orcabus-analysis/rnaseq/wfr_3b8c1k7m/RNS-045.bam',
    bucket: 'orcabus-analysis',
    type: 'BAM',
    reportType: 'Alignment',
    size: '28.4 GB',
    sizeBytes: 30500000000,
    dateCreated: '2026-02-01T15:00:00Z',
    dateModified: '2026-02-01T15:00:00Z',
    status: 'available',
    sourceWorkflowId: 'WF003',
    relatedLibraryId: 'LIB003',
    workflowRunId: 'WF003',
    portalRunId: '20260201pqr456',
  },
  {
    id: 'FILE009',
    name: 'RNS-045_multiqc_report.html',
    s3Key: 'orcabus-analysis/rnaseq/wfr_3b8c1k7m/reports/RNS-045_multiqc_report.html',
    bucket: 'orcabus-analysis',
    type: 'HTML',
    reportType: 'QC Report',
    size: '4.8 MB',
    sizeBytes: 5030000,
    dateCreated: '2026-02-01T16:22:00Z',
    dateModified: '2026-02-01T16:22:00Z',
    status: 'available',
    sourceWorkflowId: 'WF003',
    relatedLibraryId: 'LIB003',
    workflowRunId: 'WF003',
    portalRunId: '20260201pqr456',
  },
  {
    id: 'FILE010',
    name: 'TN-078_somatic_variants.vcf.gz',
    s3Key: 'orcabus-analysis/tumor-normal/wfr_9d2h5v8p/TN-078_somatic_variants.vcf.gz',
    bucket: 'orcabus-analysis',
    type: 'VCF',
    reportType: 'Variants',
    size: '89 MB',
    sizeBytes: 93300000,
    dateCreated: '2026-02-02T10:45:00Z',
    dateModified: '2026-02-02T10:45:00Z',
    status: 'available',
    sourceWorkflowId: 'WF004',
    relatedLibraryId: 'LIB002',
    workflowRunId: 'WF004',
    portalRunId: '20260202mno123',
  },
  {
    id: 'FILE011',
    name: 'NGS-002.hard-filtered.vcf.gz',
    s3Key: 'orcabus-analysis/dragen/wfr_5k9m3n7r/NGS-002.hard-filtered.vcf.gz',
    bucket: 'orcabus-analysis',
    type: 'VCF',
    reportType: 'Variants',
    size: '142 MB',
    sizeBytes: 148900000,
    dateCreated: '2026-02-02T20:15:00Z',
    dateModified: '2026-02-02T20:15:00Z',
    status: 'available',
    sourceWorkflowId: 'WF005',
    relatedLibraryId: 'LIB002',
    workflowRunId: 'WF005',
    portalRunId: '20260202mno123',
  },
  {
    id: 'FILE012',
    name: 'NGS-002_wgs_metrics.csv',
    s3Key: 'orcabus-analysis/dragen/wfr_5k9m3n7r/reports/NGS-002_wgs_metrics.csv',
    bucket: 'orcabus-analysis',
    type: 'CSV',
    reportType: 'QC Report',
    size: '52 KB',
    sizeBytes: 53200,
    dateCreated: '2026-02-02T20:18:00Z',
    dateModified: '2026-02-02T20:18:00Z',
    status: 'available',
    sourceWorkflowId: 'WF005',
    relatedLibraryId: 'LIB002',
    workflowRunId: 'WF005',
    portalRunId: '20260202mno123',
  },
  {
    id: 'FILE013',
    name: 'sample_archive_2025.tar.gz',
    s3Key: 'orcabus-archive/2025/sample_archive_2025.tar.gz',
    bucket: 'orcabus-archive',
    type: 'TAR.GZ',
    reportType: 'Archive',
    size: '256 GB',
    sizeBytes: 274900000000,
    dateCreated: '2025-12-31T23:00:00Z',
    dateModified: '2025-12-31T23:00:00Z',
    status: 'archived',
    relatedLibraryId: 'LIB001',
  },
  {
    id: 'FILE014',
    name: 'processing_temp_data.bam',
    s3Key: 'orcabus-temp/processing/processing_temp_data.bam',
    bucket: 'orcabus-temp',
    type: 'BAM',
    reportType: 'Alignment',
    size: '15.2 GB',
    sizeBytes: 16300000000,
    dateCreated: '2026-02-04T08:30:00Z',
    dateModified: '2026-02-04T09:15:00Z',
    status: 'processing',
    sourceWorkflowId: 'WF006',
    portalRunId: '20260204stu012',
  },
  {
    id: 'FILE015',
    name: 'QC_Summary_Report.html',
    s3Key: 'orcabus-analysis/bclconvert-interop-qc/wfr_q7t2m8k1/reports/QC_Summary_Report.html',
    bucket: 'orcabus-analysis',
    type: 'HTML',
    reportType: 'QC Report',
    size: '2.3 MB',
    sizeBytes: 2400000,
    dateCreated: '2026-02-05T10:00:00Z',
    dateModified: '2026-02-05T10:00:00Z',
    status: 'available',
    sourceWorkflowId: 'WF007',
    relatedLibraryId: 'LIB001',
    workflowRunId: 'WF007',
    portalRunId: '20260205qwe789',
  },
  {
    id: 'FILE016',
    name: 'ctTSO_results.vcf.gz',
    s3Key: 'orcabus-analysis/cttsov2/wfr_h3p9n6t4/ctTSO_results.vcf.gz',
    bucket: 'orcabus-analysis',
    type: 'VCF',
    reportType: 'Variants',
    size: '78 MB',
    sizeBytes: 81800000,
    dateCreated: '2026-02-05T11:30:00Z',
    dateModified: '2026-02-05T11:30:00Z',
    status: 'available',
    sourceWorkflowId: 'WF008',
    relatedLibraryId: 'LIB002',
    workflowRunId: 'WF008',
    portalRunId: '20260205asd123',
  },
  {
    id: 'FILE017',
    name: 'oncoanalyser_wgts_report.pdf',
    s3Key:
      'orcabus-analysis/oncoanalyser-wgts-dna-rna/wfr_m8t5k2p1/reports/oncoanalyser_wgts_report.pdf',
    bucket: 'orcabus-analysis',
    type: 'PDF',
    reportType: 'QC Report',
    size: '8.5 MB',
    sizeBytes: 8900000,
    dateCreated: '2026-02-05T13:00:00Z',
    dateModified: '2026-02-05T13:00:00Z',
    status: 'available',
    sourceWorkflowId: 'WF009',
    relatedLibraryId: 'LIB003',
    workflowRunId: 'WF009',
    portalRunId: '20260205zxc456',
  },
  {
    id: 'FILE018',
    name: 'purple_somatic.vcf.gz',
    s3Key: 'orcabus-analysis/oncoanalyser-wgts-dna/wfr_r4k9m2n7/purple/purple_somatic.vcf.gz',
    bucket: 'orcabus-analysis',
    type: 'VCF',
    reportType: 'Variants',
    size: '125 MB',
    sizeBytes: 131000000,
    dateCreated: '2026-02-05T14:20:00Z',
    dateModified: '2026-02-05T14:20:00Z',
    status: 'available',
    sourceWorkflowId: 'WF010',
    relatedLibraryId: 'LIB002',
    workflowRunId: 'WF010',
    portalRunId: '20260205fgh789',
  },
  {
    id: 'FILE019',
    name: 'RNAsum_report.html',
    s3Key: 'orcabus-analysis/rnasum/wfr_p2t8k5m3/reports/RNAsum_report.html',
    bucket: 'orcabus-analysis',
    type: 'HTML',
    reportType: 'QC Report',
    size: '12.8 MB',
    sizeBytes: 13400000,
    dateCreated: '2026-02-05T15:45:00Z',
    dateModified: '2026-02-05T15:45:00Z',
    status: 'available',
    sourceWorkflowId: 'WF011',
    relatedLibraryId: 'LIB003',
    workflowRunId: 'WF011',
    portalRunId: '20260205vbn012',
  },
  {
    id: 'FILE020',
    name: 'umccrise_summary.html',
    s3Key: 'orcabus-analysis/umccrise/wfr_k9m3p7t2/reports/umccrise_summary.html',
    bucket: 'orcabus-analysis',
    type: 'HTML',
    reportType: 'QC Report',
    size: '6.2 MB',
    sizeBytes: 6500000,
    dateCreated: '2026-02-05T16:30:00Z',
    dateModified: '2026-02-05T16:30:00Z',
    status: 'available',
    sourceWorkflowId: 'WF012',
    relatedLibraryId: 'LIB002',
    workflowRunId: 'WF012',
    portalRunId: '20260205yui345',
  },
  {
    id: 'FILE021',
    name: 'tumor_normal_comparison.png',
    s3Key: 'orcabus-analysis/tumor-normal/wfr_t5p9k2m8/plots/tumor_normal_comparison.png',
    bucket: 'orcabus-analysis',
    type: 'PNG',
    reportType: 'QC Report',
    size: '1.8 MB',
    sizeBytes: 1900000,
    dateCreated: '2026-02-05T17:15:00Z',
    dateModified: '2026-02-05T17:15:00Z',
    status: 'available',
    sourceWorkflowId: 'WF013',
    relatedLibraryId: 'LIB001',
    workflowRunId: 'WF013',
    portalRunId: '20260205jkl678',
  },
  {
    id: 'FILE022',
    name: 'wgts_qc_metrics.csv',
    s3Key: 'orcabus-analysis/wgts-qc/wfr_n7k4p2t9/metrics/wgts_qc_metrics.csv',
    bucket: 'orcabus-analysis',
    type: 'CSV',
    reportType: 'QC Report',
    size: '128 KB',
    sizeBytes: 131000,
    dateCreated: '2026-02-05T18:00:00Z',
    dateModified: '2026-02-05T18:00:00Z',
    status: 'available',
    sourceWorkflowId: 'WF014',
    relatedLibraryId: 'LIB003',
    workflowRunId: 'WF014',
    portalRunId: '20260205poi901',
  },
  {
    id: 'FILE023',
    name: 'sample_R1.fastq.gz',
    s3Key: 'orcabus-seq-data/wts/240210_A01052_0095/FASTQ/sample_R1.fastq.gz',
    bucket: 'orcabus-seq-data',
    type: 'FASTQ',
    reportType: 'Raw Reads',
    size: '18.4 GB',
    sizeBytes: 19700000000,
    dateCreated: '2026-02-06T09:00:00Z',
    dateModified: '2026-02-06T09:00:00Z',
    status: 'available',
    sourceWorkflowId: 'WF015',
    relatedLibraryId: 'LIB003',
    workflowRunId: 'WF015',
    portalRunId: '20260206lkj234',
  },
  {
    id: 'FILE024',
    name: 'alignment_stats.bam',
    s3Key: 'orcabus-analysis/sash/wfr_m2k8p5t3/alignments/alignment_stats.bam',
    bucket: 'orcabus-analysis',
    type: 'BAM',
    reportType: 'Alignment',
    size: '32.1 GB',
    sizeBytes: 34500000000,
    dateCreated: '2026-02-06T11:30:00Z',
    dateModified: '2026-02-06T11:30:00Z',
    status: 'available',
    sourceWorkflowId: 'WF016',
    relatedLibraryId: 'LIB002',
    workflowRunId: 'WF016',
    portalRunId: '20260206mnb567',
  },
];

export const mockCases: Case[] = [
  {
    id: 'CASE001',
    title: 'Breast Cancer Tumor-Normal Study PRJ240001',
    alias: 'BCR-2024-001',
    description:
      'Comprehensive genomic profiling of matched tumor-normal breast cancer samples using WGS for somatic variant detection and structural analysis',
    type: 'research',
    lastModified: '2026-02-04T10:30:00Z',
    createdDate: '2026-02-01T09:00:00Z',
    createdBy: 'admin@orcabus.io',
    linkedLibraries: ['LIB001', 'LIB002'],
    linkedWorkflows: ['WF001', 'WF002', 'WF005'],
    linkedFiles: ['FILE001', 'FILE002', 'FILE003', 'FILE004', 'FILE005'],
    status: 'active',
  },
  {
    id: 'CASE002',
    title: 'RNA-Seq Differential Expression Analysis',
    alias: 'RDE-2024-045',
    description:
      'Transcriptome analysis for identifying differentially expressed genes in tumor tissue samples',
    type: 'research',
    lastModified: '2026-02-03T14:20:00Z',
    createdDate: '2026-02-01T14:30:00Z',
    createdBy: 'analyst@orcabus.io',
    linkedLibraries: ['LIB003'],
    linkedWorkflows: ['WF003'],
    linkedFiles: ['FILE007', 'FILE008', 'FILE009'],
    status: 'active',
  },
  {
    id: 'CASE003',
    title: 'TSO500 ctDNA Clinical Validation',
    alias: 'TSO-VAL-078',
    description:
      'Validation study for TSO500 circulating tumor DNA detection workflow using clinical plasma samples',
    type: 'validation',
    lastModified: '2026-02-02T11:45:00Z',
    createdDate: '2026-02-02T08:00:00Z',
    createdBy: 'tech@orcabus.io',
    linkedLibraries: ['LIB006'],
    linkedWorkflows: ['WF004'],
    linkedFiles: ['FILE010'],
    status: 'pending',
  },
  {
    id: 'CASE004',
    title: 'Colon Cancer Sample QC Batch 02',
    alias: 'CCQ-QC-003',
    description:
      'Quality control assessment for batch 02 of colon cancer WGS samples before downstream analysis',
    type: 'qc',
    lastModified: '2026-02-02T16:15:00Z',
    createdDate: '2026-02-02T15:00:00Z',
    createdBy: 'analyst@orcabus.io',
    linkedLibraries: ['LIB005'],
    linkedWorkflows: ['WF007'],
    linkedFiles: ['FILE011', 'FILE012'],
    status: 'active',
  },
  {
    id: 'CASE005',
    title: 'Lung Adenocarcinoma Clinical Trial LCTR-2024',
    alias: 'LCTR-2024-089',
    description:
      'Multi-center clinical trial analyzing genomic markers in lung adenocarcinoma patient cohort for targeted therapy selection',
    type: 'clinical',
    lastModified: '2026-02-04T09:15:00Z',
    createdDate: '2026-01-28T10:00:00Z',
    createdBy: 'admin@orcabus.io',
    linkedLibraries: ['LIB001', 'LIB002', 'LIB003', 'LIB004'],
    linkedWorkflows: ['WF001', 'WF002', 'WF003', 'WF011'],
    linkedFiles: ['FILE001', 'FILE002', 'FILE003', 'FILE005', 'FILE007'],
    status: 'active',
  },
  {
    id: 'CASE006',
    title: 'Germline Variant Calling Pipeline Validation',
    alias: 'GVC-VAL-2024',
    description:
      'Technical validation of DRAGEN germline variant calling pipeline using reference samples with known variants',
    type: 'validation',
    lastModified: '2026-02-03T13:30:00Z',
    createdDate: '2026-02-03T08:00:00Z',
    createdBy: 'tech@orcabus.io',
    linkedLibraries: ['LIB002', 'LIB005'],
    linkedWorkflows: ['WF005', 'WF012'],
    linkedFiles: ['FILE011', 'FILE012'],
    status: 'active',
  },
  {
    id: 'CASE007',
    title: 'Pancreatic Cancer Methylation Study',
    alias: 'PCM-2024-012',
    description:
      'Epigenomic profiling of pancreatic ductal adenocarcinoma samples for methylation pattern analysis',
    type: 'research',
    lastModified: '2026-01-30T18:00:00Z',
    createdDate: '2026-01-25T11:00:00Z',
    createdBy: 'analyst@orcabus.io',
    linkedLibraries: ['LIB001', 'LIB003'],
    linkedWorkflows: ['WF003'],
    linkedFiles: ['FILE007', 'FILE008', 'FILE009'],
    status: 'archived',
  },
  {
    id: 'CASE008',
    title: 'Batch QC November 2025 Sequence Runs',
    alias: 'QC-NOV-2025',
    description:
      'Retrospective quality control analysis for all November 2025 sequencing runs to ensure data integrity',
    type: 'qc',
    lastModified: '2026-01-15T14:00:00Z',
    createdDate: '2026-01-10T09:00:00Z',
    createdBy: 'admin@orcabus.io',
    linkedLibraries: ['LIB001', 'LIB002', 'LIB003', 'LIB004', 'LIB005', 'LIB006'],
    linkedWorkflows: ['WF001', 'WF006'],
    linkedFiles: ['FILE001', 'FILE002', 'FILE013'],
    status: 'archived',
  },
  {
    id: 'CASE009',
    title: 'Prostate Cancer Precision Medicine Cohort',
    alias: 'PCPM-2024-156',
    description:
      'Genomic characterization of prostate cancer samples for precision medicine treatment recommendations',
    type: 'clinical',
    lastModified: '2026-02-04T11:00:00Z',
    createdDate: '2026-02-03T12:00:00Z',
    createdBy: 'admin@orcabus.io',
    linkedLibraries: ['LIB004', 'LIB005'],
    linkedWorkflows: ['WF009', 'WF011'],
    linkedFiles: [],
    status: 'pending',
  },
  {
    id: 'CASE010',
    title: 'Ovarian Cancer Tumor Heterogeneity Study',
    alias: 'OCT-2024-067',
    description:
      'Multi-region tumor sequencing to characterize intratumoral heterogeneity in high-grade serous ovarian carcinoma',
    type: 'research',
    lastModified: '2026-02-03T16:30:00Z',
    createdDate: '2026-02-01T10:00:00Z',
    createdBy: 'analyst@orcabus.io',
    linkedLibraries: ['LIB001', 'LIB004', 'LIB005'],
    linkedWorkflows: ['WF002', 'WF011'],
    linkedFiles: ['FILE003', 'FILE004', 'FILE005', 'FILE006'],
    status: 'active',
  },
  {
    id: 'CASE011',
    title: 'ChIP-Seq Histone Modification Profiling',
    alias: 'CSH-2024-023',
    description:
      'Chromatin immunoprecipitation sequencing for mapping histone modifications in cancer cell lines',
    type: 'research',
    lastModified: '2026-02-02T03:00:00Z',
    createdDate: '2026-02-01T18:00:00Z',
    createdBy: 'analyst@orcabus.io',
    linkedLibraries: ['LIB005'],
    linkedWorkflows: ['WF007'],
    linkedFiles: [],
    status: 'active',
  },
  {
    id: 'CASE012',
    title: 'BCL Convert Validation December 2025',
    alias: 'BCV-DEC-2025',
    description:
      'Validation of BCL Convert v4.0.3 upgrade for production deployment using test samples',
    type: 'validation',
    lastModified: '2025-12-20T17:00:00Z',
    createdDate: '2025-12-15T09:00:00Z',
    createdBy: 'tech@orcabus.io',
    linkedLibraries: ['LIB001', 'LIB002'],
    linkedWorkflows: ['WF001'],
    linkedFiles: ['FILE001', 'FILE002'],
    status: 'archived',
  },
];

export const mockAnalysisRuns: AnalysisRun[] = [
  {
    id: 'AR001',
    analysisId: 'ana_k7m9p2r4t',
    name: 'Tumor-Normal Somatic Analysis - CASE001',
    analysisName: 'Somatic Variant Calling',
    analysisVersion: 'v4.3.6',
    analysisType: 'Somatic Variant Calling',
    status: 'succeeded',
    startTime: '2026-02-02T10:00:00Z',
    endTime: '2026-02-02T18:30:00Z',
    duration: '8h 30m',
    progress: 100,
    caseId: 'CASE001',
    inputFiles: 12,
    outputFiles: 24,
    computeHours: 45.2,
    owner: 'admin@orcabus.io',
    libraryCount: 4,
    contextCount: 2,
    readsetCount: 8,
  },
  {
    id: 'AR002',
    analysisId: 'ana_3n8p5r7k',
    name: 'Germline Variant Analysis - CASE006',
    analysisName: 'Germline Variant Calling',
    analysisVersion: 'v4.3.6',
    analysisType: 'Germline Variant Calling',
    status: 'ongoing',
    startTime: '2026-02-04T08:00:00Z',
    duration: '2h 15m',
    progress: 35,
    caseId: 'CASE006',
    inputFiles: 8,
    outputFiles: 6,
    computeHours: 12.5,
    owner: 'tech@orcabus.io',
    libraryCount: 2,
    contextCount: 1,
    readsetCount: 4,
  },
  {
    id: 'AR003',
    analysisId: 'ana_9r2k5m7n',
    name: 'RNA Expression Analysis - CASE002',
    analysisName: 'Differential Expression',
    analysisVersion: 'v2.1.0',
    analysisType: 'Differential Expression',
    status: 'succeeded',
    startTime: '2026-02-01T14:00:00Z',
    endTime: '2026-02-01T20:45:00Z',
    duration: '6h 45m',
    progress: 100,
    caseId: 'CASE002',
    inputFiles: 6,
    outputFiles: 18,
    computeHours: 28.3,
    owner: 'analyst@orcabus.io',
    libraryCount: 3,
    contextCount: 1,
    readsetCount: 6,
  },
  {
    id: 'AR004',
    analysisId: 'ana_5k8m3n6p',
    name: 'Structural Variant Detection - CASE005',
    analysisName: 'Structural Variants',
    analysisVersion: 'v1.6.0',
    analysisType: 'Structural Variants',
    status: 'failed',
    startTime: '2026-02-03T09:00:00Z',
    endTime: '2026-02-03T12:30:00Z',
    duration: '3h 30m',
    progress: 48,
    caseId: 'CASE005',
    inputFiles: 10,
    outputFiles: 4,
    computeHours: 15.8,
    owner: 'analyst@orcabus.io',
    libraryCount: 2,
    contextCount: 1,
    readsetCount: 4,
  },
  {
    id: 'AR005',
    analysisId: 'ana_7m4p9k2r',
    name: 'Copy Number Analysis - CASE010',
    analysisName: 'Copy Number Variation',
    analysisVersion: 'v0.9.10',
    analysisType: 'Copy Number Variation',
    status: 'ongoing',
    startTime: '2026-02-04T06:30:00Z',
    duration: '4h 10m',
    progress: 72,
    caseId: 'CASE010',
    inputFiles: 16,
    outputFiles: 12,
    computeHours: 22.4,
    owner: 'admin@orcabus.io',
    libraryCount: 5,
    contextCount: 2,
    readsetCount: 10,
  },
  {
    id: 'AR006',
    analysisId: 'ana_2p7k5n9m',
    name: 'Methylation Analysis - CASE007',
    analysisName: 'Epigenomic Profiling',
    analysisVersion: 'v3.2.1',
    analysisType: 'Epigenomic Profiling',
    status: 'succeeded',
    startTime: '2026-01-28T10:00:00Z',
    endTime: '2026-01-29T02:30:00Z',
    duration: '16h 30m',
    progress: 100,
    caseId: 'CASE007',
    inputFiles: 20,
    outputFiles: 32,
    computeHours: 68.5,
    owner: 'analyst@orcabus.io',
    libraryCount: 6,
    contextCount: 2,
    readsetCount: 12,
  },
  {
    id: 'AR007',
    analysisId: 'ana_8n3k6m2p',
    name: 'Fusion Detection - CASE002',
    analysisName: 'Gene Fusion',
    analysisVersion: 'v2.5.0',
    analysisType: 'Gene Fusion',
    status: 'succeeded',
    startTime: '2026-02-01T16:00:00Z',
    endTime: '2026-02-01T22:15:00Z',
    duration: '6h 15m',
    progress: 100,
    caseId: 'CASE002',
    inputFiles: 4,
    outputFiles: 8,
    computeHours: 18.7,
    owner: 'analyst@orcabus.io',
    libraryCount: 2,
    contextCount: 1,
    readsetCount: 4,
  },
  {
    id: 'AR008',
    analysisId: 'ana_6r9k2m5n',
    name: 'Quality Control Analysis - CASE004',
    analysisName: 'Quality Metrics',
    analysisVersion: 'v1.19.0',
    analysisType: 'Quality Metrics',
    status: 'succeeded',
    startTime: '2026-02-02T15:00:00Z',
    endTime: '2026-02-02T16:45:00Z',
    duration: '1h 45m',
    progress: 100,
    caseId: 'CASE004',
    inputFiles: 12,
    outputFiles: 6,
    computeHours: 4.2,
    owner: 'tech@orcabus.io',
    libraryCount: 3,
    contextCount: 1,
    readsetCount: 6,
  },
  {
    id: 'AR009',
    analysisId: 'ana_4k7m9n2p',
    name: 'Pharmacogenomics Report - CASE009',
    analysisName: 'Clinical Reporting',
    analysisVersion: 'v2.8.0',
    analysisType: 'Clinical Reporting',
    status: 'aborted',
    startTime: '2026-02-04T12:00:00Z',
    duration: '0m',
    progress: 0,
    caseId: 'CASE009',
    inputFiles: 8,
    outputFiles: 0,
    owner: 'admin@orcabus.io',
    libraryCount: 1,
    contextCount: 1,
    readsetCount: 2,
  },
  {
    id: 'AR010',
    analysisId: 'ana_1p5k8m3r',
    name: 'ChIP-Seq Peak Calling - CASE011',
    analysisName: 'ChIP-Seq Analysis',
    analysisVersion: 'v2.1.1',
    analysisType: 'ChIP-Seq Analysis',
    status: 'ongoing',
    startTime: '2026-02-02T02:00:00Z',
    duration: '8h 45m',
    progress: 88,
    caseId: 'CASE011',
    inputFiles: 6,
    outputFiles: 14,
    computeHours: 32.1,
    owner: 'analyst@orcabus.io',
    libraryCount: 2,
    contextCount: 1,
    readsetCount: 4,
  },
  {
    id: 'AR011',
    analysisId: 'ana_9m2p7k5n',
    name: 'TSO500 ctDNA Analysis - CASE012',
    analysisName: 'TSO500 ctDNA',
    analysisVersion: 'v2.2.0',
    analysisType: 'Clinical Oncology',
    status: 'resolved',
    startTime: '2026-02-01T09:00:00Z',
    endTime: '2026-02-01T13:15:00Z',
    duration: '4h 15m',
    progress: 100,
    caseId: 'CASE012',
    inputFiles: 10,
    outputFiles: 15,
    computeHours: 18.5,
    owner: 'admin@orcabus.io',
    libraryCount: 3,
    contextCount: 1,
    readsetCount: 6,
  },
  {
    id: 'AR012',
    analysisId: 'ana_6k3n8p2m',
    name: 'Legacy WGS Pipeline - CASE003',
    analysisName: 'WGS Legacy',
    analysisVersion: 'v3.1.0',
    analysisType: 'Whole Genome Sequencing',
    status: 'deprecated',
    startTime: '2026-01-15T10:00:00Z',
    endTime: '2026-01-15T20:30:00Z',
    duration: '10h 30m',
    progress: 100,
    caseId: 'CASE003',
    inputFiles: 8,
    outputFiles: 16,
    computeHours: 42.3,
    owner: 'tech@orcabus.io',
    libraryCount: 4,
    contextCount: 1,
    readsetCount: 8,
  },
];

export const mockWorkflowTypes: WorkflowTypeDefinition[] = [
  {
    id: 'WFT001',
    name: 'BCL Convert',
    version: 'v4.2.7',
    codeVersion: '4.2.7-ica1.21.0',
    description:
      'Illumina BCL to FASTQ conversion workflow for primary data processing from sequencing runs',
    category: 'sequencing',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'ICA',
    executionEnginePipelineId: 'wfr.2cf8ab9312a84c56b72bc84d38d92345',
    lastUsed: '2026-02-04T06:30:00Z',
    totalRuns: 156,
    successRate: 98.7,
    avgDuration: '3h 15m',
    computeCost: '$2.50/run',
    orcabusId: 'wfl.01j8g3h5k7m9n2p4q6r8s0t2v4',
    history: [
      {
        id: 'WFT001-H3',
        orcabusId: 'wfl.01j8g3h5k7m9n2p4q6r8s0t2v3',
        name: 'BCL Convert',
        version: 'v4.2.6',
        codeVersion: '4.2.6-ica1.20.0',
        executionEngine: 'ICA',
        executionEnginePipelineId: 'wfr.1be7ab8201a73b45c61ad73c27d81234',
        validationState: 'validated',
      },
      {
        id: 'WFT001-H2',
        orcabusId: 'wfl.01j8g3h5k7m9n2p4q6r8s0t2v2',
        name: 'BCL Convert',
        version: 'v4.2.5',
        codeVersion: '4.2.5-ica1.19.0',
        executionEngine: 'ICA',
        executionEnginePipelineId: 'wfr.0ad6ab7100a62a34b50bc62b16c70123',
        validationState: 'deprecated',
      },
      {
        id: 'WFT001-H1',
        orcabusId: 'wfl.01j8g3h5k7m9n2p4q6r8s0t2v1',
        name: 'BCL Convert',
        version: 'v4.2.4',
        codeVersion: '4.2.4-ica1.18.0',
        executionEngine: 'ICA',
        executionEnginePipelineId: 'wfr.09c5ab6009a51a23a49ab51a05b69012',
        validationState: 'deprecated',
      },
    ],
  },
  {
    id: 'WFT002',
    name: 'DRAGEN Germline',
    version: 'v4.3.6',
    codeVersion: '4.3.6-gh2.12.1',
    description:
      'Illumina DRAGEN accelerated germline variant calling pipeline for whole genome sequencing data',
    category: 'variant-calling',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'SEQERA',
    executionEnginePipelineId: 'nf-core/sarek:3.4.0',
    lastUsed: '2026-02-04T11:00:00Z',
    totalRuns: 243,
    successRate: 96.3,
    avgDuration: '6h 30m',
    computeCost: '$12.80/run',
    orcabusId: 'wfl.02k9h4j6l8n0p3q5r7s9t1u3v5',
    history: [
      {
        id: 'WFT002-H2',
        orcabusId: 'wfl.02k9h4j6l8n0p3q5r7s9t1u3v4',
        name: 'DRAGEN Germline',
        version: 'v4.3.5',
        codeVersion: '4.3.5-gh2.11.0',
        executionEngine: 'SEQERA',
        executionEnginePipelineId: 'nf-core/sarek:3.3.0',
        validationState: 'validated',
      },
      {
        id: 'WFT002-H1',
        orcabusId: 'wfl.02k9h4j6l8n0p3q5r7s9t1u3v3',
        name: 'DRAGEN Germline',
        version: 'v4.3.4',
        codeVersion: '4.3.4-gh2.10.0',
        executionEngine: 'ICA',
        executionEnginePipelineId: 'wfr.3df9bc0423b95d67e83df84e49e03456',
        validationState: 'deprecated',
      },
    ],
  },
  {
    id: 'WFT003',
    name: 'DRAGEN Somatic',
    version: 'v4.3.6',
    codeVersion: '4.3.6-gh2.12.1',
    description:
      'Tumor-normal somatic variant calling using DRAGEN for paired cancer genomics analysis',
    category: 'variant-calling',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'SEQERA',
    executionEnginePipelineId: 'nf-core/sarek:3.4.0',
    lastUsed: '2026-02-03T08:00:00Z',
    totalRuns: 128,
    successRate: 94.5,
    avgDuration: '8h 45m',
    computeCost: '$18.60/run',
  },
  {
    id: 'WFT004',
    name: 'RNA-Seq (STAR + RSEM)',
    version: 'v2.7.10a',
    codeVersion: '2.7.10a-wdl1.3.0',
    description:
      'Complete RNA sequencing analysis pipeline with STAR alignment and RSEM quantification',
    category: 'rna-analysis',
    status: 'active',
    validationState: 'unvalidated',
    executionEngine: 'AWS_BATCH',
    executionEnginePipelineId: 'arn:aws:batch:us-east-1:123456:pipeline/rnaseq-star',
    lastUsed: '2026-02-03T12:00:00Z',
    totalRuns: 89,
    successRate: 92.1,
    avgDuration: '5h 50m',
    computeCost: '$8.40/run',
  },
  {
    id: 'WFT005',
    name: 'Tumor-Normal',
    version: 'v3.1.2',
    codeVersion: '3.1.2-umccr',
    description:
      'Comprehensive tumor-normal analysis including somatic variants, copy number, and structural variants',
    category: 'variant-calling',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'ICA',
    executionEnginePipelineId: 'wfr.4a9c2f1d83b94e67a1bd39fc482e1234',
    lastUsed: '2026-02-04T07:30:00Z',
    totalRuns: 67,
    successRate: 89.6,
    avgDuration: '12h 15m',
    computeCost: '$24.30/run',
  },
  {
    id: 'WFT006',
    name: 'OncoAnalyser',
    version: 'v1.3.0',
    codeVersion: '1.3.0-nf22.10.7',
    description:
      'Integrated cancer genomics pipeline for comprehensive somatic analysis including driver mutations',
    category: 'variant-calling',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'SEQERA',
    executionEnginePipelineId: 'nf-core/oncoanalyser:1.3.0',
    lastUsed: '2026-02-02T14:00:00Z',
    totalRuns: 45,
    successRate: 91.1,
    avgDuration: '10h 20m',
    computeCost: '$19.50/run',
  },
  {
    id: 'WFT007',
    name: 'Variant Calling (GATK)',
    version: 'v4.5.0.0',
    codeVersion: '4.5.0.0-wdl2.3.1',
    description:
      'GATK best practices germline variant calling workflow for short-read sequencing data',
    category: 'variant-calling',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'AWS_ECS',
    executionEnginePipelineId: 'arn:aws:ecs:us-east-1:123456:task-def/gatk-hc:14',
    lastUsed: '2026-02-03T08:00:00Z',
    totalRuns: 198,
    successRate: 95.5,
    avgDuration: '5h 30m',
    computeCost: '$7.20/run',
  },
  {
    id: 'WFT008',
    name: 'ChIP-Seq',
    version: 'v2.1.1',
    codeVersion: '2.1.1-nf22.04.3',
    description: 'ChIP-seq analysis pipeline for peak calling and chromatin state identification',
    category: 'rna-analysis',
    status: 'active',
    validationState: 'unvalidated',
    executionEngine: 'SEQERA',
    executionEnginePipelineId: 'nf-core/chipseq:2.1.1',
    lastUsed: '2026-02-01T18:00:00Z',
    totalRuns: 34,
    successRate: 88.2,
    avgDuration: '8h 30m',
    computeCost: '$11.40/run',
  },
  {
    id: 'WFT009',
    name: 'TSO500 ctDNA',
    version: 'v2.2.0',
    codeVersion: '2.2.0-ica1.19.0',
    description: 'TruSight Oncology 500 circulating tumor DNA analysis for liquid biopsy samples',
    category: 'variant-calling',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'ICA',
    executionEnginePipelineId: 'wfr.8b7d43e29f1a4d92a63cf7e518a34567',
    lastUsed: '2026-02-02T11:45:00Z',
    totalRuns: 52,
    successRate: 90.4,
    avgDuration: '4h 15m',
    computeCost: '$9.80/run',
  },
  {
    id: 'WFT010',
    name: 'MultiQC',
    version: 'v1.19',
    codeVersion: '1.19-py3.11',
    description:
      'Quality control aggregation and reporting tool for multiple bioinformatics analyses',
    category: 'quality-control',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'AWS_BATCH',
    executionEnginePipelineId: 'arn:aws:batch:us-east-1:123456:pipeline/multiqc',
    lastUsed: '2026-02-04T09:00:00Z',
    totalRuns: 412,
    successRate: 99.3,
    avgDuration: '0h 15m',
    computeCost: '$0.80/run',
  },
  {
    id: 'WFT011',
    name: 'FastQC',
    version: 'v0.12.1',
    codeVersion: '0.12.1-java17',
    description: 'Quality control tool for high throughput sequence data',
    category: 'quality-control',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'AWS_BATCH',
    executionEnginePipelineId: 'arn:aws:batch:us-east-1:123456:pipeline/fastqc',
    lastUsed: '2026-02-04T10:30:00Z',
    totalRuns: 587,
    successRate: 99.7,
    avgDuration: '0h 8m',
    computeCost: '$0.40/run',
  },
  {
    id: 'WFT012',
    name: 'Structural Variant Calling (Manta)',
    version: 'v1.6.0',
    codeVersion: '1.6.0-cpp17',
    description: 'Structural variant and indel caller for mapped sequencing data',
    category: 'variant-calling',
    status: 'active',
    validationState: 'failed',
    executionEngine: 'AWS_EKS',
    executionEnginePipelineId: 'arn:aws:eks:us-east-1:123456:cluster/manta-sv',
    lastUsed: '2026-02-03T09:00:00Z',
    totalRuns: 76,
    successRate: 87.8,
    avgDuration: '7h 20m',
    computeCost: '$14.20/run',
  },
  {
    id: 'WFT013',
    name: 'Copy Number Variation (CNVkit)',
    version: 'v0.9.10',
    codeVersion: '0.9.10-py3.10',
    description: 'Copy number variation detection from high-throughput sequencing data',
    category: 'variant-calling',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'AWS_BATCH',
    executionEnginePipelineId: 'arn:aws:batch:us-east-1:123456:pipeline/cnvkit',
    lastUsed: '2026-02-04T06:30:00Z',
    totalRuns: 91,
    successRate: 93.4,
    avgDuration: '4h 45m',
    computeCost: '$6.90/run',
  },
  {
    id: 'WFT014',
    name: 'DRAGEN RNA',
    version: 'v4.3.6',
    codeVersion: '4.3.6-gh2.12.1',
    description: 'Illumina DRAGEN accelerated RNA-seq alignment and quantification pipeline',
    category: 'rna-analysis',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'SEQERA',
    executionEnginePipelineId: 'nf-core/rnaseq:3.14.0',
    lastUsed: '2026-02-02T10:00:00Z',
    totalRuns: 62,
    successRate: 95.2,
    avgDuration: '4h 30m',
    computeCost: '$9.60/run',
  },
  {
    id: 'WFT015',
    name: 'Alignment (BWA-MEM2)',
    version: 'v2.2.1',
    codeVersion: '2.2.1-avx2',
    description: 'Fast and accurate alignment using BWA-MEM2 algorithm for short-read sequencing',
    category: 'alignment',
    status: 'active',
    validationState: 'validated',
    executionEngine: 'AWS_ECS',
    executionEnginePipelineId: 'arn:aws:ecs:us-east-1:123456:task-def/bwa-mem2:8',
    lastUsed: '2026-02-03T14:00:00Z',
    totalRuns: 215,
    successRate: 97.7,
    avgDuration: '3h 40m',
    computeCost: '$5.60/run',
  },
  {
    id: 'WFT016',
    name: 'Pharmacogenomics (PharmCAT)',
    version: 'v2.8.0',
    codeVersion: '2.8.0-java11',
    description: 'Pharmacogenomics clinical annotation tool for variant interpretation',
    category: 'variant-calling',
    status: 'active',
    validationState: 'unvalidated',
    executionEngine: 'AWS_BATCH',
    executionEnginePipelineId: 'arn:aws:batch:us-east-1:123456:pipeline/pharmcat',
    lastUsed: '2026-02-02T16:00:00Z',
    totalRuns: 38,
    successRate: 92.1,
    avgDuration: '1h 20m',
    computeCost: '$3.40/run',
  },
  {
    id: 'WFT017',
    name: 'BCL Convert v3',
    version: 'v3.10.5',
    codeVersion: '3.10.5-ica1.18.0',
    description: 'Legacy BCL to FASTQ conversion for older sequencing runs',
    category: 'sequencing',
    status: 'deprecated',
    validationState: 'deprecated',
    executionEngine: 'ICA',
    executionEnginePipelineId: 'wfr.1ab2cd3ef4g56h78i90jk12l34m56n78',
    lastUsed: '2025-12-15T14:00:00Z',
    totalRuns: 892,
    successRate: 97.2,
    avgDuration: '4h 10m',
    computeCost: '$2.80/run',
  },
  {
    id: 'WFT018',
    name: 'GATK v3 Pipeline',
    version: 'v3.8.1',
    codeVersion: '3.8.1-wdl1.0.0',
    description: 'Older GATK variant calling pipeline - superseded by v4',
    category: 'variant-calling',
    status: 'deprecated',
    validationState: 'deprecated',
    executionEngine: 'AWS_BATCH',
    executionEnginePipelineId: 'arn:aws:batch:us-east-1:123456:pipeline/gatk-v3',
    lastUsed: '2025-11-20T09:00:00Z',
    totalRuns: 456,
    successRate: 94.1,
    avgDuration: '6h 45m',
    computeCost: '$8.90/run',
  },
  {
    id: 'WFT019',
    name: 'Long-Read Assembly (Flye)',
    version: 'v2.9.3-beta',
    codeVersion: '2.9.3b1-py3.11',
    description: 'De novo assembly of long-read sequencing data using Flye assembler',
    category: 'alignment',
    status: 'development',
    validationState: 'unvalidated',
    executionEngine: 'Unknown',
    executionEnginePipelineId: 'dev-flye-assembly-beta',
    lastUsed: '2026-01-28T10:00:00Z',
    totalRuns: 12,
    successRate: 75.0,
    avgDuration: '18h 30m',
    computeCost: '$35.20/run',
  },
  {
    id: 'WFT020',
    name: 'Single-Cell RNA-seq (Seurat)',
    version: 'v5.0.1-beta',
    codeVersion: '5.0.1b2-r4.3.2',
    description: 'Single-cell RNA sequencing analysis pipeline using Seurat R package',
    category: 'rna-analysis',
    status: 'development',
    validationState: 'failed',
    executionEngine: 'Unknown',
    executionEnginePipelineId: 'dev-seurat-scrna-beta',
    lastUsed: '2026-02-01T12:00:00Z',
    totalRuns: 8,
    successRate: 62.5,
    avgDuration: '12h 15m',
    computeCost: '$28.60/run',
  },
];

export const mockAnalysisTypes: AnalysisType[] = [
  {
    id: 'AT001',
    name: 'Somatic Variant Calling',
    version: 'v4.3.6',
    description:
      'Comprehensive somatic variant calling for tumor-normal paired samples using DRAGEN pipeline',
    category: 'variant-calling',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-04T10:00:00Z',
    totalRuns: 156,
    successRate: 96.2,
    avgDuration: '8h 30m',
    inputRequirements: 'Tumor BAM, Normal BAM, Reference Genome',
    outputTypes: 'VCF, CNV, SV, MAF',
    contexts: ['Tumor-Normal', 'Cancer Genomics', 'Clinical'],
    linkedWorkflows: ['DRAGEN Somatic', 'Tumor-Normal', 'OncoAnalyser'],
  },
  {
    id: 'AT002',
    name: 'Germline Variant Calling',
    version: 'v4.3.6',
    description:
      'Germline variant detection for whole genome sequencing data with GATK best practices',
    category: 'variant-calling',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-04T09:30:00Z',
    totalRuns: 243,
    successRate: 97.8,
    avgDuration: '6h 15m',
    inputRequirements: 'Aligned BAM/CRAM, Reference Genome',
    outputTypes: 'VCF, gVCF',
    contexts: ['Germline', 'Research', 'Population Studies'],
    linkedWorkflows: ['DRAGEN Germline', 'Variant Calling (GATK)'],
  },
  {
    id: 'AT003',
    name: 'Differential Expression',
    version: 'v2.1.0',
    description:
      'RNA-seq differential expression analysis using DESeq2 and edgeR statistical methods',
    category: 'rna-analysis',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-03T14:00:00Z',
    totalRuns: 89,
    successRate: 94.4,
    avgDuration: '3h 45m',
    inputRequirements: 'Gene Counts Matrix, Sample Metadata',
    outputTypes: 'DE Results, Plots, Normalized Counts',
    contexts: ['RNA-seq', 'Transcriptomics'],
    linkedWorkflows: ['RNA-Seq (STAR + RSEM)', 'DRAGEN RNA'],
  },
  {
    id: 'AT004',
    name: 'Copy Number Variation',
    version: 'v3.2.1',
    description:
      'CNV detection and analysis from WGS data using multiple callers and segmentation algorithms',
    category: 'structural-variant',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-04T08:00:00Z',
    totalRuns: 128,
    successRate: 92.2,
    avgDuration: '4h 50m',
    inputRequirements: 'Tumor BAM, Normal BAM (optional)',
    outputTypes: 'Segments, Plots, Gene-level CNV',
    contexts: ['Cancer Genomics', 'Structural Variation'],
    linkedWorkflows: ['Copy Number Variation (CNVkit)', 'OncoAnalyser'],
  },
  {
    id: 'AT005',
    name: 'Structural Variant Calling',
    version: 'v1.8.2',
    description:
      'Detection of large structural variants including deletions, duplications, inversions, and translocations',
    category: 'structural-variant',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-03T11:00:00Z',
    totalRuns: 76,
    successRate: 88.2,
    avgDuration: '7h 20m',
    inputRequirements: 'Aligned BAM, Reference Genome',
    outputTypes: 'VCF, BED, Circos Plots',
    contexts: ['Structural Variation', 'Cancer Genomics'],
    linkedWorkflows: ['Structural Variant Calling (Manta)', 'OncoAnalyser'],
  },
  {
    id: 'AT006',
    name: 'RNA Fusion Detection',
    version: 'v2.3.0',
    description: 'Identification of gene fusions from RNA-seq data using STAR-Fusion and Arriba',
    category: 'rna-analysis',
    status: 'ACTIVE',
    validationState: 'unvalidated',
    lastUsed: '2026-02-02T16:00:00Z',
    totalRuns: 52,
    successRate: 91.3,
    avgDuration: '5h 15m',
    inputRequirements: 'RNA-seq FASTQ or BAM',
    outputTypes: 'Fusion Calls, Supporting Reads',
    contexts: ['RNA-seq', 'Cancer Genomics'],
    linkedWorkflows: ['RNA-Seq (STAR + RSEM)', 'DRAGEN RNA'],
  },
  {
    id: 'AT007',
    name: 'Methylation Analysis',
    version: 'v1.5.4',
    description: 'DNA methylation analysis from whole-genome bisulfite sequencing data',
    category: 'methylation',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-01T10:00:00Z',
    totalRuns: 34,
    successRate: 89.7,
    avgDuration: '9h 30m',
    inputRequirements: 'WGBS FASTQ',
    outputTypes: 'Methylation Calls, DMR, Bedgraph',
    contexts: ['Epigenetics', 'Methylation'],
    linkedWorkflows: [],
  },
  {
    id: 'AT008',
    name: 'Variant Annotation',
    version: 'v4.1.0',
    description: 'Comprehensive variant annotation using VEP, SnpEff, and clinical databases',
    category: 'variant-calling',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-04T12:00:00Z',
    totalRuns: 412,
    successRate: 99.0,
    avgDuration: '1h 20m',
    inputRequirements: 'VCF',
    outputTypes: 'Annotated VCF, TSV Report',
    contexts: ['Clinical', 'Research', 'Reporting'],
    linkedWorkflows: ['DRAGEN Germline', 'DRAGEN Somatic', 'Variant Calling (GATK)'],
  },
  {
    id: 'AT009',
    name: 'Quality Control Suite',
    version: 'v3.0.2',
    description: 'Comprehensive QC analysis including FastQC, MultiQC, and custom metrics',
    category: 'quality-control',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-04T11:30:00Z',
    totalRuns: 587,
    successRate: 99.5,
    avgDuration: '0h 25m',
    inputRequirements: 'FASTQ or BAM',
    outputTypes: 'QC Reports, Metrics JSON',
    contexts: ['Quality Control', 'Pre-processing'],
    linkedWorkflows: ['MultiQC', 'FastQC'],
  },
  {
    id: 'AT010',
    name: 'HLA Typing',
    version: 'v2.7.3',
    description: 'High-resolution HLA typing from WGS or targeted sequencing data',
    category: 'variant-calling',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-03T09:00:00Z',
    totalRuns: 91,
    successRate: 93.4,
    avgDuration: '2h 10m',
    inputRequirements: 'FASTQ or BAM',
    outputTypes: 'HLA Types, Confidence Scores',
    contexts: ['Immunogenomics', 'Clinical'],
    linkedWorkflows: [],
  },
  {
    id: 'AT011',
    name: 'Tumor Mutational Burden',
    version: 'v1.4.0',
    description: 'Calculate tumor mutational burden (TMB) from somatic variant calls',
    category: 'variant-calling',
    status: 'ACTIVE',
    validationState: 'unvalidated',
    lastUsed: '2026-02-02T14:00:00Z',
    totalRuns: 67,
    successRate: 95.5,
    avgDuration: '0h 45m',
    inputRequirements: 'Somatic VCF',
    outputTypes: 'TMB Score, Variant Counts',
    contexts: ['Cancer Genomics', 'Immunotherapy'],
    linkedWorkflows: ['DRAGEN Somatic', 'OncoAnalyser'],
  },
  {
    id: 'AT012',
    name: 'RNA-seq Quantification',
    version: 'v3.1.5',
    description: 'Gene and transcript-level quantification using Salmon and RSEM',
    category: 'rna-analysis',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-04T07:00:00Z',
    totalRuns: 198,
    successRate: 97.0,
    avgDuration: '2h 30m',
    inputRequirements: 'RNA-seq FASTQ',
    outputTypes: 'Gene Counts, TPM, FPKM',
    contexts: ['RNA-seq', 'Transcriptomics', 'Gene Expression'],
    linkedWorkflows: ['RNA-Seq (STAR + RSEM)', 'DRAGEN RNA'],
  },
  {
    id: 'AT013',
    name: 'Microsatellite Instability',
    version: 'v2.0.1',
    description: 'MSI detection for cancer samples using MSIsensor and MANTIS',
    category: 'quality-control',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-03T08:00:00Z',
    totalRuns: 45,
    successRate: 91.1,
    avgDuration: '3h 15m',
    inputRequirements: 'Tumor BAM, Normal BAM',
    outputTypes: 'MSI Status, MSI Score',
    contexts: ['Cancer Genomics', 'Clinical'],
    linkedWorkflows: ['OncoAnalyser'],
  },
  {
    id: 'AT014',
    name: 'Neoantigen Prediction',
    version: 'v1.2.0',
    description: 'Predict tumor neoantigens from somatic mutations and HLA typing',
    category: 'variant-calling',
    status: 'INACTIVE',
    validationState: 'unvalidated',
    lastUsed: '2026-02-01T13:00:00Z',
    totalRuns: 28,
    successRate: 85.7,
    avgDuration: '4h 40m',
    inputRequirements: 'Somatic VCF, HLA Types, RNA Expression',
    outputTypes: 'Neoantigen Candidates, Binding Affinity',
    contexts: ['Immunotherapy', 'Cancer Genomics'],
    linkedWorkflows: [],
  },
  {
    id: 'AT015',
    name: 'Pharmacogenomics',
    version: 'v2.8.0',
    description: 'Pharmacogenomic variant interpretation for drug response prediction',
    category: 'variant-calling',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-02T11:00:00Z',
    totalRuns: 62,
    successRate: 96.8,
    avgDuration: '1h 15m',
    inputRequirements: 'Germline VCF',
    outputTypes: 'Drug Response Predictions, PGx Report',
    contexts: ['Pharmacogenomics', 'Clinical'],
    linkedWorkflows: ['Pharmacogenomics (PharmCAT)'],
  },
  {
    id: 'AT016',
    name: 'Mitochondrial Variant Calling',
    version: 'v1.9.0',
    description: 'Specialized variant calling for mitochondrial DNA sequences',
    category: 'variant-calling',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-01-31T10:00:00Z',
    totalRuns: 38,
    successRate: 94.7,
    avgDuration: '1h 50m',
    inputRequirements: 'Aligned BAM',
    outputTypes: 'mtDNA VCF, Haplogroup',
    contexts: ['Mitochondrial', 'Specialized'],
    linkedWorkflows: [],
  },
  {
    id: 'AT017',
    name: 'Legacy Somatic Pipeline',
    version: 'v3.1.2',
    description: 'Older somatic variant calling pipeline - superseded by v4.3.6',
    category: 'variant-calling',
    status: 'INACTIVE',
    validationState: 'deprecated',
    lastUsed: '2025-12-10T14:00:00Z',
    totalRuns: 456,
    successRate: 93.2,
    avgDuration: '10h 15m',
    inputRequirements: 'Tumor BAM, Normal BAM',
    outputTypes: 'VCF, CNV',
    contexts: ['Deprecated', 'Legacy'],
    linkedWorkflows: [],
  },
  {
    id: 'AT018',
    name: 'Single-Cell RNA-seq',
    version: 'v1.0.0-beta',
    description: 'Single-cell RNA sequencing analysis pipeline - in development',
    category: 'rna-analysis',
    status: 'INACTIVE',
    validationState: 'unvalidated',
    lastUsed: '2026-02-01T09:00:00Z',
    totalRuns: 12,
    successRate: 75.0,
    avgDuration: '6h 45m',
    inputRequirements: 'scRNA-seq FASTQ',
    outputTypes: 'Cell Clusters, Markers, UMAP',
    contexts: ['Single-Cell', 'Development'],
    linkedWorkflows: ['Single-Cell RNA-seq (Seurat)'],
  },
  {
    id: 'AT019',
    name: 'Spatial Transcriptomics',
    version: 'v0.8.0-beta',
    description: 'Spatial transcriptomics analysis - experimental',
    category: 'rna-analysis',
    status: 'INACTIVE',
    validationState: 'failed',
    lastUsed: '2026-01-28T15:00:00Z',
    totalRuns: 5,
    successRate: 60.0,
    avgDuration: '8h 20m',
    inputRequirements: 'Spatial FASTQ, Tissue Images',
    outputTypes: 'Spatial Clusters, Expression Maps',
    contexts: ['Spatial', 'Experimental'],
    linkedWorkflows: [],
  },
  {
    id: 'AT020',
    name: 'ChIP-seq Peak Calling',
    version: 'v2.5.1',
    description: 'ChIP-seq peak calling and chromatin state analysis',
    category: 'quality-control',
    status: 'ACTIVE',
    validationState: 'validated',
    lastUsed: '2026-02-03T16:00:00Z',
    totalRuns: 71,
    successRate: 92.9,
    avgDuration: '3h 35m',
    inputRequirements: 'ChIP-seq BAM, Input Control',
    outputTypes: 'Peaks BED, BigWig, Motifs',
    contexts: ['Epigenetics', 'ChIP-seq'],
    linkedWorkflows: ['ChIP-Seq'],
  },
];

// Mock Analysis Contexts
export const mockAnalysisContexts: AnalysisContext[] = [
  {
    id: 'CTX001',
    orcabusId: 'orcabus.ctx.a1b2c3d4',
    name: 'Tumor-Normal',
    usecase: 'Somatic variant calling for paired tumor-normal samples',
    description:
      'Context for analyzing matched tumor and normal samples from the same patient to identify somatic mutations',
    status: 'ACTIVE',
  },
  {
    id: 'CTX002',
    orcabusId: 'orcabus.ctx.e5f6g7h8',
    name: 'Cancer Genomics',
    usecase: 'Comprehensive cancer genomics analysis',
    description:
      'Multi-faceted genomic analysis for cancer research including SNVs, CNVs, SVs, and gene fusions',
    status: 'ACTIVE',
  },
  {
    id: 'CTX003',
    orcabusId: 'orcabus.ctx.i9j0k1l2',
    name: 'Clinical',
    usecase: 'Clinical diagnostic workflows',
    description:
      'Analysis workflows validated for clinical diagnostic use with stringent quality controls',
    status: 'ACTIVE',
  },
  {
    id: 'CTX004',
    orcabusId: 'orcabus.ctx.m3n4o5p6',
    name: 'Germline',
    usecase: 'Germline variant detection',
    description: 'Analysis of inherited genetic variants from blood or normal tissue samples',
    status: 'ACTIVE',
  },
  {
    id: 'CTX005',
    orcabusId: 'orcabus.ctx.q7r8s9t0',
    name: 'Research',
    usecase: 'Research-grade analysis workflows',
    description: 'Flexible workflows for research use without clinical validation requirements',
    status: 'ACTIVE',
  },
  {
    id: 'CTX006',
    orcabusId: 'orcabus.ctx.u1v2w3x4',
    name: 'Population Studies',
    usecase: 'Large-scale population genomics',
    description:
      'Optimized for high-throughput analysis of large cohorts and population-scale studies',
    status: 'ACTIVE',
  },
  {
    id: 'CTX007',
    orcabusId: 'orcabus.ctx.y5z6a7b8',
    name: 'RNA-seq',
    usecase: 'RNA sequencing analysis',
    description:
      'Transcriptome analysis including gene expression quantification and differential expression',
    status: 'ACTIVE',
  },
  {
    id: 'CTX008',
    orcabusId: 'orcabus.ctx.c9d0e1f2',
    name: 'Transcriptomics',
    usecase: 'Comprehensive transcriptomics workflows',
    description:
      'Advanced RNA analysis including isoform detection, fusion calling, and pathway analysis',
    status: 'ACTIVE',
  },
  {
    id: 'CTX009',
    orcabusId: 'orcabus.ctx.g3h4i5j6',
    name: 'Structural Variation',
    usecase: 'Detection of structural variants',
    description:
      'Analysis of large genomic rearrangements including deletions, duplications, inversions, and translocations',
    status: 'ACTIVE',
  },
  {
    id: 'CTX010',
    orcabusId: 'orcabus.ctx.k7l8m9n0',
    name: 'Epigenetics',
    usecase: 'Epigenomic analysis',
    description: 'DNA methylation and chromatin modification analysis workflows',
    status: 'ACTIVE',
  },
  {
    id: 'CTX011',
    orcabusId: 'orcabus.ctx.o1p2q3r4',
    name: 'Methylation',
    usecase: 'DNA methylation profiling',
    description: 'Bisulfite sequencing and methylation array analysis',
    status: 'ACTIVE',
  },
  {
    id: 'CTX012',
    orcabusId: 'orcabus.ctx.s5t6u7v8',
    name: 'Reporting',
    usecase: 'Report generation and annotation',
    description:
      'Workflows focused on generating clinical or research reports from analysis results',
    status: 'ACTIVE',
  },
  {
    id: 'CTX013',
    orcabusId: 'orcabus.ctx.w9x0y1z2',
    name: 'Quality Control',
    usecase: 'QC metrics and validation',
    description:
      'Quality control workflows for assessing sequencing data quality and library metrics',
    status: 'ACTIVE',
  },
  {
    id: 'CTX014',
    orcabusId: 'orcabus.ctx.a3b4c5d6',
    name: 'Pre-processing',
    usecase: 'Data preprocessing pipelines',
    description:
      'Initial processing steps including alignment, duplicate marking, and base quality recalibration',
    status: 'ACTIVE',
  },
  {
    id: 'CTX015',
    orcabusId: 'orcabus.ctx.e7f8g9h0',
    name: 'Immunogenomics',
    usecase: 'Immune repertoire analysis',
    description:
      'Analysis of immune-related genomic features including HLA typing and neoantigen prediction',
    status: 'ACTIVE',
  },
  {
    id: 'CTX016',
    orcabusId: 'orcabus.ctx.i1j2k3l4',
    name: 'Immunotherapy',
    usecase: 'Immunotherapy biomarker analysis',
    description: 'Workflows for identifying predictive biomarkers for immunotherapy response',
    status: 'ACTIVE',
  },
  {
    id: 'CTX017',
    orcabusId: 'orcabus.ctx.m5n6o7p8',
    name: 'Pharmacogenomics',
    usecase: 'Drug response prediction',
    description: 'Analysis of genetic variants affecting drug metabolism and response',
    status: 'ACTIVE',
  },
  {
    id: 'CTX018',
    orcabusId: 'orcabus.ctx.q9r0s1t2',
    name: 'Gene Expression',
    usecase: 'Gene expression analysis',
    description: 'Quantification and analysis of gene expression levels from RNA-seq data',
    status: 'ACTIVE',
  },
  {
    id: 'CTX019',
    orcabusId: 'orcabus.ctx.u3v4w5x6',
    name: 'Single-Cell',
    usecase: 'Single-cell genomics',
    description: 'Analysis workflows for single-cell RNA-seq and other single-cell assays',
    status: 'INACTIVE',
  },
  {
    id: 'CTX020',
    orcabusId: 'orcabus.ctx.y7z8a9b0',
    name: 'Spatial',
    usecase: 'Spatial transcriptomics',
    description: 'Analysis of spatially-resolved transcriptomic data',
    status: 'INACTIVE',
  },
];

// Mock Workflow Details
export const mockWorkflowDetails: WorkflowDetail[] = [
  {
    id: 'WFD001',
    orcabusId: 'orcabus.wfd.1a2b3c4d',
    name: 'DRAGEN Somatic',
    version: '4.3.6',
    codeVersion: 'dragen-4.3.6-20241015',
    executionEngine: 'ICA',
    executionEnginePipelineId: 'wfl.abc123def456',
    validationState: 'validated',
  },
  {
    id: 'WFD002',
    orcabusId: 'orcabus.wfd.5e6f7g8h',
    name: 'Tumor-Normal',
    version: '2.1.0',
    codeVersion: 'tn-pipeline-v2.1.0',
    executionEngine: 'SEQERA',
    executionEnginePipelineId: 'nf-tumor-normal-main',
    validationState: 'validated',
  },
  {
    id: 'WFD003',
    orcabusId: 'orcabus.wfd.9i0j1k2l',
    name: 'OncoAnalyser',
    version: '3.5.2',
    codeVersion: 'oncoanalyser-v3.5.2',
    executionEngine: 'SEQERA',
    executionEnginePipelineId: 'nf-oncoanalyser-main',
    validationState: 'validated',
  },
  {
    id: 'WFD004',
    orcabusId: 'orcabus.wfd.3m4n5o6p',
    name: 'DRAGEN Germline',
    version: '4.3.6',
    codeVersion: 'dragen-4.3.6-20241015',
    executionEngine: 'ICA',
    executionEnginePipelineId: 'wfl.ghi789jkl012',
    validationState: 'validated',
  },
  {
    id: 'WFD005',
    orcabusId: 'orcabus.wfd.7q8r9s0t',
    name: 'Variant Calling (GATK)',
    version: '1.8.3',
    codeVersion: 'gatk-4.5.0.0',
    executionEngine: 'AWS_BATCH',
    executionEnginePipelineId: 'arn:aws:batch:us-east-1:123456789:job-definition/gatk-hc',
    validationState: 'validated',
  },
  {
    id: 'WFD006',
    orcabusId: 'orcabus.wfd.1u2v3w4x',
    name: 'RNA-Seq (STAR + RSEM)',
    version: '2.3.1',
    codeVersion: 'star-rsem-v2.3.1',
    executionEngine: 'SEQERA',
    executionEnginePipelineId: 'nf-rnaseq-main',
    validationState: 'validated',
  },
  {
    id: 'WFD007',
    orcabusId: 'orcabus.wfd.5y6z7a8b',
    name: 'DRAGEN RNA',
    version: '4.3.6',
    codeVersion: 'dragen-4.3.6-20241015',
    executionEngine: 'ICA',
    executionEnginePipelineId: 'wfl.mno345pqr678',
    validationState: 'validated',
  },
  {
    id: 'WFD008',
    orcabusId: 'orcabus.wfd.9c0d1e2f',
    name: 'Copy Number Variation (CNVkit)',
    version: '1.2.4',
    codeVersion: 'cnvkit-0.9.10',
    executionEngine: 'AWS_ECS',
    executionEnginePipelineId: 'arn:aws:ecs:us-east-1:123456789:task-definition/cnvkit',
    validationState: 'validated',
  },
  {
    id: 'WFD009',
    orcabusId: 'orcabus.wfd.3g4h5i6j',
    name: 'Structural Variant Calling (Manta)',
    version: '1.6.0',
    codeVersion: 'manta-1.6.0',
    executionEngine: 'AWS_BATCH',
    executionEnginePipelineId: 'arn:aws:batch:us-east-1:123456789:job-definition/manta-sv',
    validationState: 'validated',
  },
  {
    id: 'WFD010',
    orcabusId: 'orcabus.wfd.7k8l9m0n',
    name: 'MultiQC',
    version: '1.15.0',
    codeVersion: 'multiqc-1.15',
    executionEngine: 'AWS_BATCH',
    executionEnginePipelineId: 'arn:aws:batch:us-east-1:123456789:job-definition/multiqc',
    validationState: 'validated',
  },
  {
    id: 'WFD011',
    orcabusId: 'orcabus.wfd.1o2p3q4r',
    name: 'FastQC',
    version: '0.12.1',
    codeVersion: 'fastqc-0.12.1',
    executionEngine: 'AWS_BATCH',
    executionEnginePipelineId: 'arn:aws:batch:us-east-1:123456789:job-definition/fastqc',
    validationState: 'validated',
  },
  {
    id: 'WFD012',
    orcabusId: 'orcabus.wfd.5s6t7u8v',
    name: 'Pharmacogenomics (PharmCAT)',
    version: '2.8.0',
    codeVersion: 'pharmcat-2.8.0',
    executionEngine: 'SEQERA',
    executionEnginePipelineId: 'nf-pharmcat-main',
    validationState: 'validated',
  },
  {
    id: 'WFD013',
    orcabusId: 'orcabus.wfd.9w0x1y2z',
    name: 'Single-Cell RNA-seq (Seurat)',
    version: '1.0.0-beta',
    codeVersion: 'seurat-5.0.0',
    executionEngine: 'AWS_EKS',
    executionEnginePipelineId: 'k8s-scrna-seurat',
    validationState: 'unvalidated',
  },
  {
    id: 'WFD014',
    orcabusId: 'orcabus.wfd.3a4b5c6d',
    name: 'ChIP-Seq',
    version: '2.5.1',
    codeVersion: 'chipseq-v2.5.1',
    executionEngine: 'SEQERA',
    executionEnginePipelineId: 'nf-chipseq-main',
    validationState: 'validated',
  },
];

// Detailed mock data for workflow run detail page
export const mockWorkflowRunDetails: Record<string, WorkflowRunDetail> = {
  WF001: {
    id: 'WF001',
    name: 'BCL Convert - Run 240201',
    orcabusId: 'orcabus.wfr.7x9k2m5p',
    portalRunId: '20260201_wgs_batch12',
    executionId: 'exec_a1b2c3d4e5f6',
    workflowType: 'BCL Convert',
    status: 'succeeded',
    comment: 'Standard WGS batch processing for project PRJ240001',

    workflow: {
      name: 'BCL Convert',
      version: 'v4.2.7',
      codeVersion: '1.3.0',
      executionEngine: 'Nextflow',
      executionEnginePipelineId: 'nf-core/bclconvert',
      validationState: 'valid',
    },

    analysis: {
      analysisRunName: 'WGS_Batch12_QC',
      analysisName: 'Quality Control Pipeline',
      analysisVersion: 'v2.1.0',
      description: 'Automated quality control for WGS batch 12 processing',
    },

    timeline: [
      {
        id: 't1',
        type: 'state',
        status: 'queued',
        timestamp: '2026-02-02T15:00:00Z',
        comment: 'Workflow queued for execution',
        user: 'system',
        payload: {
          engineParameters: {
            memory: '64GB',
            cpus: 16,
            diskSpace: '500GB',
            priority: 'normal',
          },
          inputs: [
            { name: 'sequencing_run', value: '240201_HGJK2DSXY', link: '/sequence/SEQ001' },
            { name: 'sample_sheet', value: 'SampleSheet_240201_v1.csv' },
          ],
          tags: ['wgs', 'batch12', 'production'],
          rawJson: {
            workflow_id: 'wfr_7x9k2m5p',
            submission_time: '2026-02-02T15:00:00Z',
            priority: 'normal',
          },
        },
      },
      {
        id: 't2',
        type: 'state',
        status: 'ongoing',
        timestamp: '2026-02-02T15:10:00Z',
        comment: 'BCL conversion started for 8 libraries',
        user: 'system',
      },
      {
        id: 't3',
        type: 'comment',
        timestamp: '2026-02-02T16:30:00Z',
        comment: 'All libraries passed initial QC checks',
        user: 'operator@orcabus.io',
      },
      {
        id: 't4',
        type: 'state',
        status: 'succeeded',
        timestamp: '2026-02-02T18:45:00Z',
        comment: 'Workflow completed successfully - 32 output files generated',
        user: 'system',
        payload: {
          engineParameters: {
            totalRuntime: '3h 35m',
            exitCode: 0,
            finalMemoryUsage: '58.2GB',
          },
          tags: ['completed', 'success'],
          rawJson: {
            completion_time: '2026-02-02T18:45:00Z',
            output_files: 32,
            status: 'succeeded',
          },
        },
      },
    ],

    libraryCount: 8,
    runContextCount: 2,
    readsetCount: 16,
  },
};

export const mockWorkflowLibraries: Record<string, WorkflowLibraryAssociation[]> = {
  WF001: [
    {
      id: 'wl1',
      libraryId: 'LIB001',
      libraryName: 'L2400001',
      type: 'WGS',
      assay: 'TruSeq DNA PCR-Free',
      associationStatus: 'active',
      associationDate: '2026-02-02T15:00:00Z',
    },
    {
      id: 'wl2',
      libraryId: 'LIB002',
      libraryName: 'L2400002',
      type: 'WGS',
      assay: 'TruSeq DNA PCR-Free',
      associationStatus: 'active',
      associationDate: '2026-02-02T15:00:00Z',
    },
    {
      id: 'wl3',
      libraryId: 'LIB003',
      libraryName: 'L2400003',
      type: 'WGS',
      assay: 'TruSeq DNA PCR-Free',
      associationStatus: 'active',
      associationDate: '2026-02-02T15:00:00Z',
    },
    {
      id: 'wl4',
      libraryId: 'LIB004',
      libraryName: 'L2400004',
      type: 'WGS',
      assay: 'TruSeq DNA PCR-Free',
      associationStatus: 'active',
      associationDate: '2026-02-02T15:00:00Z',
    },
    {
      id: 'wl5',
      libraryId: 'LIB005',
      libraryName: 'L2400005',
      type: 'WTS',
      assay: 'TruSeq Stranded mRNA',
      associationStatus: 'active',
      associationDate: '2026-02-02T15:00:00Z',
    },
    {
      id: 'wl6',
      libraryId: 'LIB006',
      libraryName: 'L2400006',
      type: 'WGS',
      assay: 'TruSeq DNA PCR-Free',
      associationStatus: 'active',
      associationDate: '2026-02-02T15:00:00Z',
    },
    {
      id: 'wl7',
      libraryId: 'LIB007',
      libraryName: 'L2400007',
      type: 'WGS',
      assay: 'TruSeq DNA PCR-Free',
      associationStatus: 'active',
      associationDate: '2026-02-02T15:00:00Z',
    },
    {
      id: 'wl8',
      libraryId: 'LIB008',
      libraryName: 'L2400008',
      type: 'WGS',
      assay: 'TruSeq DNA PCR-Free',
      associationStatus: 'archived',
      associationDate: '2026-02-02T15:00:00Z',
    },
  ],
};

export const mockWorkflowRunContexts: Record<string, WorkflowRunContext[]> = {
  WF001: [
    {
      id: 'wrc1',
      name: 'Production WGS Pipeline',
      useCase: 'clinical_wgs',
      description: 'Production-grade whole genome sequencing pipeline for clinical samples',
      status: 'active',
    },
    {
      id: 'wrc2',
      name: 'Batch Processing Context',
      useCase: 'batch_processing',
      description: 'High-throughput batch processing configuration for multiple libraries',
      status: 'active',
    },
  ],
};

export const mockWorkflowReadsets: Record<string, WorkflowReadset[]> = {
  WF001: [
    {
      id: 'wr1',
      rgid: 'HGJK2DSXY.1.L2400001',
      libraryId: 'LIB001',
      readsetOrcabusId: 'orcabus.rds.a1b2c3d4',
      status: 'ready',
    },
    {
      id: 'wr2',
      rgid: 'HGJK2DSXY.1.L2400002',
      libraryId: 'LIB002',
      readsetOrcabusId: 'orcabus.rds.e5f6g7h8',
      status: 'ready',
    },
    {
      id: 'wr3',
      rgid: 'HGJK2DSXY.2.L2400001',
      libraryId: 'LIB001',
      readsetOrcabusId: 'orcabus.rds.i9j0k1l2',
      status: 'ready',
    },
    {
      id: 'wr4',
      rgid: 'HGJK2DSXY.2.L2400002',
      libraryId: 'LIB002',
      readsetOrcabusId: 'orcabus.rds.m3n4o5p6',
      status: 'ready',
    },
    {
      id: 'wr5',
      rgid: 'HGJK2DSXY.1.L2400003',
      libraryId: 'LIB003',
      readsetOrcabusId: 'orcabus.rds.q7r8s9t0',
      status: 'ready',
    },
    {
      id: 'wr6',
      rgid: 'HGJK2DSXY.2.L2400003',
      libraryId: 'LIB003',
      readsetOrcabusId: 'orcabus.rds.u1v2w3x4',
      status: 'ready',
    },
    {
      id: 'wr7',
      rgid: 'HGJK2DSXY.1.L2400004',
      libraryId: 'LIB004',
      readsetOrcabusId: 'orcabus.rds.y5z6a7b8',
      status: 'ready',
    },
    {
      id: 'wr8',
      rgid: 'HGJK2DSXY.2.L2400004',
      libraryId: 'LIB004',
      readsetOrcabusId: 'orcabus.rds.c9d0e1f2',
      status: 'ready',
    },
    {
      id: 'wr9',
      rgid: 'HGJK2DSXY.1.L2400005',
      libraryId: 'LIB005',
      readsetOrcabusId: 'orcabus.rds.g3h4i5j6',
      status: 'ready',
    },
    {
      id: 'wr10',
      rgid: 'HGJK2DSXY.2.L2400005',
      libraryId: 'LIB005',
      readsetOrcabusId: 'orcabus.rds.k7l8m9n0',
      status: 'ready',
    },
    {
      id: 'wr11',
      rgid: 'HGJK2DSXY.1.L2400006',
      libraryId: 'LIB006',
      readsetOrcabusId: 'orcabus.rds.o1p2q3r4',
      status: 'ready',
    },
    {
      id: 'wr12',
      rgid: 'HGJK2DSXY.2.L2400006',
      libraryId: 'LIB006',
      readsetOrcabusId: 'orcabus.rds.s5t6u7v8',
      status: 'ready',
    },
    {
      id: 'wr13',
      rgid: 'HGJK2DSXY.1.L2400007',
      libraryId: 'LIB007',
      readsetOrcabusId: 'orcabus.rds.w9x0y1z2',
      status: 'ready',
    },
    {
      id: 'wr14',
      rgid: 'HGJK2DSXY.2.L2400007',
      libraryId: 'LIB007',
      readsetOrcabusId: 'orcabus.rds.a3b4c5d6',
      status: 'ready',
    },
    {
      id: 'wr15',
      rgid: 'HGJK2DSXY.1.L2400008',
      libraryId: 'LIB008',
      readsetOrcabusId: 'orcabus.rds.e7f8g9h0',
      status: 'processing',
    },
    {
      id: 'wr16',
      rgid: 'HGJK2DSXY.2.L2400008',
      libraryId: 'LIB008',
      readsetOrcabusId: 'orcabus.rds.i1j2k3l4',
      status: 'ready',
    },
  ],
};

// Analysis Run Details (extended data for detail page)
export const mockAnalysisRunDetails: Record<string, AnalysisRunDetail> = {
  AR001: {
    id: 'AR001',
    name: 'Tumor-Normal Somatic Analysis - CASE001',
    orcabusId: 'ana.01HQXZ9K3M5N6P7Q8R9S0T1A1B',
    externalId: 'EXT_ANA_001',
    status: 'succeeded',
    comment: 'Primary somatic variant calling for tumor-normal pair',
    analysisType: {
      name: 'Somatic Variant Calling',
      version: 'v4.3.6',
      description:
        'Identifies somatic mutations in tumor samples by comparing against matched normal samples using multiple variant callers',
      status: 'ACTIVE',
    },
    linkedContextIds: ['CTX001', 'CTX002'],
    linkedWorkflowIds: ['WF001', 'WF002'],
    linkedLibraryIds: ['LIB001', 'LIB002', 'LIB004', 'LIB005'],
    linkedReadsetIds: ['RS001', 'RS002', 'RS003', 'RS004', 'RS005', 'RS006', 'RS007', 'RS008'],
    workflowRunCount: 2,
    libraryCount: 4,
    contextCount: 2,
    readsetCount: 8,
  },
  AR002: {
    id: 'AR002',
    name: 'Germline Variant Analysis - CASE006',
    orcabusId: 'ana.01HQXZ9K3M5N6P7Q8R9S0T2C2D',
    status: 'ongoing',
    comment: 'Germline variant discovery for hereditary cancer screening',
    analysisType: {
      name: 'Germline Variant Calling',
      version: 'v4.3.6',
      description: 'Identifies germline variants across the genome for inherited disease analysis',
      status: 'ACTIVE',
    },
    linkedContextIds: ['CTX003'],
    linkedWorkflowIds: ['WF003'],
    linkedLibraryIds: ['LIB002', 'LIB003'],
    linkedReadsetIds: ['RS009', 'RS010', 'RS011', 'RS012'],
    workflowRunCount: 1,
    libraryCount: 2,
    contextCount: 1,
    readsetCount: 4,
  },
  AR003: {
    id: 'AR003',
    name: 'RNA Expression Analysis - CASE002',
    orcabusId: 'ana.01HQXZ9K3M5N6P7Q8R9S0T3E3F',
    externalId: 'EXT_RNA_003',
    status: 'succeeded',
    comment: 'Differential gene expression analysis comparing tumor and normal samples',
    analysisType: {
      name: 'Differential Expression',
      version: 'v2.1.0',
      description: 'Quantifies and compares gene expression levels across sample groups',
      status: 'ACTIVE',
    },
    linkedContextIds: ['CTX004'],
    linkedWorkflowIds: ['WF004', 'WF005'],
    linkedLibraryIds: ['LIB003', 'LIB004', 'LIB006'],
    linkedReadsetIds: ['RS013', 'RS014', 'RS015', 'RS016', 'RS017', 'RS018'],
    workflowRunCount: 2,
    libraryCount: 3,
    contextCount: 1,
    readsetCount: 6,
  },
  AR004: {
    id: 'AR004',
    name: 'Structural Variant Detection - CASE005',
    orcabusId: 'ana.01HQXZ9K3M5N6P7Q8R9S0T4G4H',
    status: 'failed',
    comment: 'Large-scale genomic rearrangement detection - failed due to low coverage',
    analysisType: {
      name: 'Structural Variants',
      version: 'v1.6.0',
      description:
        'Detects large genomic alterations including deletions, duplications, inversions, and translocations',
      status: 'ACTIVE',
    },
    linkedContextIds: ['CTX005'],
    linkedWorkflowIds: ['WF006'],
    linkedLibraryIds: ['LIB001', 'LIB005'],
    linkedReadsetIds: ['RS019', 'RS020', 'RS021', 'RS022'],
    workflowRunCount: 1,
    libraryCount: 2,
    contextCount: 1,
    readsetCount: 4,
  },
};

// Analysis Workflow Runs (workflow runs per analysis)
export const mockAnalysisWorkflowRuns: Record<string, AnalysisWorkflowRun[]> = {
  AR001: [
    {
      id: 'WF001',
      name: 'Somatic_Variant_Calling_CASE001_Tumor_Run1',
      portalRunId: 'wfr.20260202_SomaticVC_001',
      executionId: 'exec-a1b2c3d4e5f6',
      status: 'succeeded',
      lastModified: '2026-02-02T18:30:00Z',
    },
    {
      id: 'WF002',
      name: 'Somatic_Annotation_CASE001_Run1',
      portalRunId: 'wfr.20260202_SomaticAnn_001',
      executionId: 'exec-g7h8i9j0k1l2',
      status: 'succeeded',
      lastModified: '2026-02-02T20:45:00Z',
    },
  ],
  AR002: [
    {
      id: 'WF003',
      name: 'Germline_Variant_Calling_CASE006_Run1',
      portalRunId: 'wfr.20260204_GermlineVC_006',
      executionId: 'exec-m3n4o5p6q7r8',
      status: 'ongoing',
      lastModified: '2026-02-04T10:15:00Z',
    },
  ],
  AR003: [
    {
      id: 'WF004',
      name: 'RNA_Alignment_CASE002_Run1',
      portalRunId: 'wfr.20260201_RNAAlign_002',
      executionId: 'exec-s9t0u1v2w3x4',
      status: 'succeeded',
      lastModified: '2026-02-01T18:20:00Z',
    },
    {
      id: 'WF005',
      name: 'RNA_DiffExp_CASE002_Run1',
      portalRunId: 'wfr.20260201_RNADiffExp_002',
      executionId: 'exec-y5z6a7b8c9d0',
      status: 'succeeded',
      lastModified: '2026-02-01T20:45:00Z',
    },
  ],
  AR004: [
    {
      id: 'WF006',
      name: 'Structural_Variant_Detection_CASE005_Run1',
      portalRunId: 'wfr.20260203_StructVar_005',
      executionId: 'exec-e1f2g3h4i5j6',
      status: 'failed',
      lastModified: '2026-02-03T12:30:00Z',
    },
  ],
};

// Analysis Libraries (libraries per analysis)
export const mockAnalysisLibraries: Record<string, WorkflowLibraryAssociation[]> = {
  AR001: [
    {
      id: 'al1',
      libraryId: 'LIB001',
      libraryName: 'L2400001',
      type: 'WGS',
      assay: 'Whole Genome Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-02T10:00:00Z',
    },
    {
      id: 'al2',
      libraryId: 'LIB002',
      libraryName: 'L2400002',
      type: 'WGS',
      assay: 'Whole Genome Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-02T10:00:00Z',
    },
    {
      id: 'al3',
      libraryId: 'LIB004',
      libraryName: 'L2400004',
      type: 'WGS',
      assay: 'Whole Genome Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-02T10:00:00Z',
    },
    {
      id: 'al4',
      libraryId: 'LIB005',
      libraryName: 'L2400005',
      type: 'WGS',
      assay: 'Whole Genome Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-02T10:00:00Z',
    },
  ],
  AR002: [
    {
      id: 'al5',
      libraryId: 'LIB002',
      libraryName: 'L2400002',
      type: 'WGS',
      assay: 'Whole Genome Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-04T08:00:00Z',
    },
    {
      id: 'al6',
      libraryId: 'LIB003',
      libraryName: 'L2400003',
      type: 'WTS',
      assay: 'Whole Transcriptome Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-04T08:00:00Z',
    },
  ],
  AR003: [
    {
      id: 'al7',
      libraryId: 'LIB003',
      libraryName: 'L2400003',
      type: 'WTS',
      assay: 'Whole Transcriptome Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-01T14:00:00Z',
    },
    {
      id: 'al8',
      libraryId: 'LIB004',
      libraryName: 'L2400004',
      type: 'WGS',
      assay: 'Whole Genome Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-01T14:00:00Z',
    },
    {
      id: 'al9',
      libraryId: 'LIB006',
      libraryName: 'L2400006',
      type: 'TSO500',
      assay: 'Targeted Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-01T14:00:00Z',
    },
  ],
  AR004: [
    {
      id: 'al10',
      libraryId: 'LIB001',
      libraryName: 'L2400001',
      type: 'WGS',
      assay: 'Whole Genome Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-03T09:00:00Z',
    },
    {
      id: 'al11',
      libraryId: 'LIB005',
      libraryName: 'L2400005',
      type: 'WGS',
      assay: 'Whole Genome Sequencing',
      associationStatus: 'active',
      associationDate: '2026-02-03T09:00:00Z',
    },
  ],
};

// Analysis Run Contexts
export const mockAnalysisRunContexts: Record<string, WorkflowRunContext[]> = {
  AR001: [
    {
      id: 'CTX001',
      name: 'Tumor_Normal_Context_CASE001',
      useCase: 'clinical_oncology',
      description: 'Clinical tumor-normal pair analysis context for somatic variant detection',
      status: 'active',
    },
    {
      id: 'CTX002',
      name: 'Variant_Annotation_Context_CASE001',
      useCase: 'annotation',
      description: 'Variant annotation and clinical interpretation context',
      status: 'active',
    },
  ],
  AR002: [
    {
      id: 'CTX003',
      name: 'Germline_Context_CASE006',
      useCase: 'hereditary_screening',
      description: 'Hereditary cancer risk assessment context',
      status: 'active',
    },
  ],
  AR003: [
    {
      id: 'CTX004',
      name: 'RNA_Expression_Context_CASE002',
      useCase: 'transcriptomics',
      description: 'RNA-seq differential expression analysis context',
      status: 'active',
    },
  ],
  AR004: [
    {
      id: 'CTX005',
      name: 'Structural_Variant_Context_CASE005',
      useCase: 'structural_genomics',
      description: 'Large-scale genomic rearrangement detection context',
      status: 'active',
    },
  ],
};

// Analysis Readsets
export const mockAnalysisReadsets: Record<string, WorkflowReadset[]> = {
  AR001: [
    {
      id: 'RS001',
      rgid: 'HGJK2DSXY.1.L2400001',
      libraryId: 'LIB001',
      readsetOrcabusId: 'orcabus.rds.a1b2c3d4e5f6',
      status: 'ready',
    },
    {
      id: 'RS002',
      rgid: 'HGJK2DSXY.2.L2400001',
      libraryId: 'LIB001',
      readsetOrcabusId: 'orcabus.rds.g7h8i9j0k1l2',
      status: 'ready',
    },
    {
      id: 'RS003',
      rgid: 'HGJK2DSXY.1.L2400002',
      libraryId: 'LIB002',
      readsetOrcabusId: 'orcabus.rds.m3n4o5p6q7r8',
      status: 'ready',
    },
    {
      id: 'RS004',
      rgid: 'HGJK2DSXY.2.L2400002',
      libraryId: 'LIB002',
      readsetOrcabusId: 'orcabus.rds.s9t0u1v2w3x4',
      status: 'ready',
    },
    {
      id: 'RS005',
      rgid: 'HGJK2DSXY.1.L2400004',
      libraryId: 'LIB004',
      readsetOrcabusId: 'orcabus.rds.y5z6a7b8c9d0',
      status: 'ready',
    },
    {
      id: 'RS006',
      rgid: 'HGJK2DSXY.2.L2400004',
      libraryId: 'LIB004',
      readsetOrcabusId: 'orcabus.rds.e1f2g3h4i5j6',
      status: 'ready',
    },
    {
      id: 'RS007',
      rgid: 'HGJK2DSXY.1.L2400005',
      libraryId: 'LIB005',
      readsetOrcabusId: 'orcabus.rds.k7l8m9n0o1p2',
      status: 'ready',
    },
    {
      id: 'RS008',
      rgid: 'HGJK2DSXY.2.L2400005',
      libraryId: 'LIB005',
      readsetOrcabusId: 'orcabus.rds.q3r4s5t6u7v8',
      status: 'ready',
    },
  ],
  AR002: [
    {
      id: 'RS009',
      rgid: 'HGJK2DSXY.1.L2400002',
      libraryId: 'LIB002',
      readsetOrcabusId: 'orcabus.rds.w9x0y1z2a3b4',
      status: 'processing',
    },
    {
      id: 'RS010',
      rgid: 'HGJK2DSXY.2.L2400002',
      libraryId: 'LIB002',
      readsetOrcabusId: 'orcabus.rds.c5d6e7f8g9h0',
      status: 'processing',
    },
    {
      id: 'RS011',
      rgid: 'HGJK2DSXY.1.L2400003',
      libraryId: 'LIB003',
      readsetOrcabusId: 'orcabus.rds.i1j2k3l4m5n6',
      status: 'processing',
    },
    {
      id: 'RS012',
      rgid: 'HGJK2DSXY.2.L2400003',
      libraryId: 'LIB003',
      readsetOrcabusId: 'orcabus.rds.o7p8q9r0s1t2',
      status: 'processing',
    },
  ],
  AR003: [
    {
      id: 'RS013',
      rgid: 'HGJK2DSXY.1.L2400003',
      libraryId: 'LIB003',
      readsetOrcabusId: 'orcabus.rds.u3v4w5x6y7z8',
      status: 'ready',
    },
    {
      id: 'RS014',
      rgid: 'HGJK2DSXY.2.L2400003',
      libraryId: 'LIB003',
      readsetOrcabusId: 'orcabus.rds.a9b0c1d2e3f4',
      status: 'ready',
    },
    {
      id: 'RS015',
      rgid: 'HGJK2DSXY.1.L2400004',
      libraryId: 'LIB004',
      readsetOrcabusId: 'orcabus.rds.g5h6i7j8k9l0',
      status: 'ready',
    },
    {
      id: 'RS016',
      rgid: 'HGJK2DSXY.2.L2400004',
      libraryId: 'LIB004',
      readsetOrcabusId: 'orcabus.rds.m1n2o3p4q5r6',
      status: 'ready',
    },
    {
      id: 'RS017',
      rgid: 'HGJK2DSXY.1.L2400006',
      libraryId: 'LIB006',
      readsetOrcabusId: 'orcabus.rds.s7t8u9v0w1x2',
      status: 'ready',
    },
    {
      id: 'RS018',
      rgid: 'HGJK2DSXY.2.L2400006',
      libraryId: 'LIB006',
      readsetOrcabusId: 'orcabus.rds.y3z4a5b6c7d8',
      status: 'ready',
    },
  ],
  AR004: [
    {
      id: 'RS019',
      rgid: 'HGJK2DSXY.1.L2400001',
      libraryId: 'LIB001',
      readsetOrcabusId: 'orcabus.rds.e9f0g1h2i3j4',
      status: 'failed',
    },
    {
      id: 'RS020',
      rgid: 'HGJK2DSXY.2.L2400001',
      libraryId: 'LIB001',
      readsetOrcabusId: 'orcabus.rds.k5l6m7n8o9p0',
      status: 'failed',
    },
    {
      id: 'RS021',
      rgid: 'HGJK2DSXY.1.L2400005',
      libraryId: 'LIB005',
      readsetOrcabusId: 'orcabus.rds.q1r2s3t4u5v6',
      status: 'failed',
    },
    {
      id: 'RS022',
      rgid: 'HGJK2DSXY.2.L2400005',
      libraryId: 'LIB005',
      readsetOrcabusId: 'orcabus.rds.w7x8y9z0a1b2',
      status: 'failed',
    },
  ],
};
