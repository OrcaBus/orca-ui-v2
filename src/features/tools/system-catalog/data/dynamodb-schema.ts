import type { components } from '@/api/types/system-catalog.openapi.d.ts';

export type MapStatus = components['schemas']['MapStatus'];
export type MapNodeType = components['schemas']['MapNodeType'];
export type ResourceType = components['schemas']['ResourceType'];
export type WorkflowEngine = components['schemas']['WorkflowEngine'];
export type MapEdgeType = components['schemas']['MapEdgeType'];
export type GroupType = components['schemas']['GroupType'];
export type EventDef = components['schemas']['EventDef'];
export type MapNode = components['schemas']['MapNode'];
export type MapGroup = components['schemas']['MapGroup'];
export type MapEdge = components['schemas']['MapEdge'];
export type MapSummary = components['schemas']['MapSummary'];
export type MapFull = components['schemas']['MapFull'];

export interface DynamoDBMapItem extends MapFull {
  PK: string;
  SK: string;
  entityType: 'MAP';
  schemaVersion?: number;
  nodeCount: number;
  edgeCount: number;
}
