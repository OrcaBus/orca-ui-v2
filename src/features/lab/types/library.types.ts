export interface Library {
  id: string;
  name: string;
  orcabusId: string;
  projectName: string;
  sampleId: string;
  externalSampleId: string;
  subjectId: string;
  type: string;
  assay: string;
  phenotype: string;
  workflow: string;
  createdDate: string;
  status: 'ready' | 'processing' | 'qc-pending' | 'failed';
  quality: number;
  coverage: number;
  overrideCycles: string;
  source: string;
  projectId: string;
  concentration: number;
}
