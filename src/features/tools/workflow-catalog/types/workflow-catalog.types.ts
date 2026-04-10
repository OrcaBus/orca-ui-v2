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

export type WorkflowConfig = Record<string, string>;

export interface WorkflowParentLink {
  workflowId: string;
  edgeType: EdgeType;
}

export interface WorkflowFormData {
  name: string;
  version: string;
  engine: string;
  groupId: string;
  parentLinks: WorkflowParentLink[];
  description: string;
  configJson: string;
}

export interface WorkflowNodeData {
  label: string;
  version: string;
  engine: string;
  description: string;
  groupIds: string[];
  inputEvents: EventDef[];
  outputEvents: EventDef[];
  tags: WorkflowConfig;
  dimmed?: boolean;
  highlighted?: boolean;
  [key: string]: unknown;
}

export interface GroupItem {
  id: string;
  name: string;
  type: string;
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
  groups: GroupItem[];
  edges: EdgeDef[];
  layout: Record<string, NodePosition>;
  engineColors: Record<string, string>;
}
