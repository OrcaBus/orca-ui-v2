// ─── Domain Types (used by both frontend and API) ─────────────────────────

export interface EventDef {
  name: string;
  topic?: string;
  condition?: string;
  payload: Record<string, unknown>;
}

/** Form shape for add/edit event modal in system catalog. */
export interface EventFormData {
  name: string;
  topic: string;
  condition: string;
  payloadJson: string;
}

export type NodeConfig = Record<string, string>;

export interface NodeParentLink {
  nodeId: string;
  edgeType: EdgeType;
}

export interface NodeFormData {
  name: string;
  version: string;
  engine: string;
  groupId: string;
  parentLinks: NodeParentLink[];
  description: string;
  configJson: string;
}

export interface CatalogNodeData {
  label: string;
  version: string;
  engine: string;
  description: string;
  groupIds: string[];
  inputEvents: EventDef[];
  outputEvents: EventDef[];
  tags: NodeConfig;
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
  nodeIds: string[];
}

export type EdgeType =
  | 'trigger'
  | 'trigger_input'
  | 'input_dependency'
  | 'event_publish'
  | 'event_subscribe'
  | 'state_change'
  | 'execution_request'
  | 'rest_call';

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
  nodes: Record<string, CatalogNodeData>;
  groups: GroupItem[];
  edges: EdgeDef[];
  layout: Record<string, NodePosition>;
  engineColors: Record<string, string>;
}
