// ─── Domain Types (used by both frontend and API) ─────────────────────────

export interface EventDef {
  name: string;
  topic?: string;
  condition?: string;
  payload: Record<string, unknown>;
}

/** Form shape for add/edit event modal in workflow catalog. */
export interface EventFormData {
  name: string;
  topic: string;
  condition: string;
  payloadJson: string;
}

export interface WorkflowConfig {
  maxRetries: number;
  timeout: string;
  computeQueue: string;
}

export interface WorkflowNodeData {
  label: string;
  version: string;
  engine: string;
  description: string;
  analysisIds: string[];
  inputEvents: EventDef[];
  outputEvents: EventDef[];
  config: WorkflowConfig;
  dimmed?: boolean;
  highlighted?: boolean;
  [key: string]: unknown;
}

export interface AnalysisItem {
  id: string;
  label: string;
  count: number;
  color: string;
  workflowIds: string[];
}

export type EdgeType = 'trigger' | 'trigger_input' | 'input_dependency';

export interface EdgeDef {
  id: string;
  source: string;
  target: string;
  edgeType: EdgeType;
  label?: string;
}

export interface NodePosition {
  x: number;
  y: number;
}

// ─── API Response Types ───────────────────────────────────────────────────

export interface CatalogApiResponse {
  workflows: Record<string, WorkflowNodeData>;
  analyses: AnalysisItem[];
  edges: EdgeDef[];
  layout: Record<string, NodePosition>;
  engineColors: Record<string, string>;
}
