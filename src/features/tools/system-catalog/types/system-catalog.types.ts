import type {
  EventDef as MapEventDef,
  GroupType,
  MapEdgeType,
  MapGroup,
  MapNode,
  MapNodeType,
  ResourceType,
  WorkflowEngine,
} from '../data/dynamodb-schema';

export type EventDef = MapEventDef;
export interface EventFormData {
  name: string;
  topic: string;
  condition: string;
  payloadJson: string;
}

export type NodeConfig = Record<string, string>;

export interface NodeParentLink {
  nodeId: string;
  edgeType: MapEdgeType;
}

export interface NodeFormData {
  name: string;
  version: string;
  nodeType: MapNodeType;
  resourceType: ResourceType;
  workflowEngine: WorkflowEngine;
  groupIds: string[];
  parentLinks: NodeParentLink[];
  description: string;
  configJson: string;
}

export type EdgeType = MapEdgeType;

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

export interface CatalogNodeLookupItem {
  label: string;
  nodeType: MapNodeType;
  resourceType?: ResourceType;
  workflowEngine?: WorkflowEngine;
}

export type CatalogNodeViewData = MapNode & {
  dimmed?: boolean;
  highlighted?: boolean;
  accentColor?: string;
};

export interface GroupFilterItem {
  id: string;
  name: string;
  type: GroupType | 'all';
  count: number;
  color: string;
  nodeIds: string[];
  description?: string;
}

export interface GroupItem {
  id: string;
  name: string;
  type: string;
  count: number;
  color: string;
  nodeIds: string[];
  description?: string;
}

export type CatalogGroup = MapGroup;
