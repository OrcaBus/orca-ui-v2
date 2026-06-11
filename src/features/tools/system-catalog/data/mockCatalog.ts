import type { MapEdge, MapFull, MapGroup, MapNode } from './dynamodb-schema';
import { ENGINE_COLORS } from './layout';
import { NODE_POSITIONS } from './layout';
import { CATALOG_EDGES } from './edges';
import { EVENT_FLOW_EDGES } from './event-flow-edges';
import { EVENT_FLOW_GROUPS } from './event-flow-groups';
import { EVENT_FLOW_POSITIONS } from './event-flow-layout';
import { EVENT_FLOW_NODES } from './event-flow-nodes';
import { GROUP_LIST } from './groups';
import { MAP_LIST } from './maps';
import { PIPELINE_NODES } from './pipeline-nodes';
import { inferNodeDetailsFromLegacyTags, normalizeMap, mapToSummary } from '../utils/mapModel';

export function createInitialMockCatalogMaps(): Record<string, MapFull> {
  const pipelineTemplate = buildTemplateMap({
    legacyNodes: PIPELINE_NODES,
    positions: NODE_POSITIONS,
    groups: GROUP_LIST,
    edges: CATALOG_EDGES,
  });

  const eventFlowTemplate = buildTemplateMap({
    legacyNodes: EVENT_FLOW_NODES,
    positions: EVENT_FLOW_POSITIONS,
    groups: EVENT_FLOW_GROUPS,
    edges: EVENT_FLOW_EDGES,
  });

  return Object.fromEntries(
    MAP_LIST.map((summary) => {
      const template =
        summary.mapId === 'orcabus-event-flow' ? eventFlowTemplate : pipelineTemplate;

      const map = normalizeMap({
        mapId: summary.mapId,
        name: summary.name,
        description: summary.description,
        status: summary.status,
        version: summary.version,
        isDeleted: summary.isDeleted,
        createdBy: summary.createdBy,
        createdAt: summary.createdAt,
        updatedBy: summary.updatedBy,
        updatedAt: summary.updatedAt,
        tags: summary.tags,
        nodes: structuredClone(template.nodes),
        groups: structuredClone(template.groups),
        edges: structuredClone(template.edges),
        engineColors: structuredClone(template.engineColors),
      });

      return [summary.mapId, map];
    })
  );
}

export function createInitialMockCatalogSummaries() {
  return Object.values(createInitialMockCatalogMaps()).map(mapToSummary);
}

function buildTemplateMap({
  legacyNodes,
  positions,
  groups,
  edges,
}: {
  legacyNodes: Record<
    string,
    {
      label: string;
      version: string;
      engine: string;
      description: string;
      groupIds: string[];
      inputEvents: MapNode['inputEvents'];
      outputEvents: MapNode['outputEvents'];
      tags: MapNode['tags'];
    }
  >;
  positions: Record<string, MapNode['position']>;
  groups: Array<{
    id: string;
    name: string;
    type: string;
    color: string;
    nodeIds: string[];
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    edgeType: MapEdge['edgeType'];
    label?: string;
  }>;
}): Pick<MapFull, 'nodes' | 'groups' | 'edges' | 'engineColors'> {
  return {
    nodes: Object.entries(legacyNodes).map(([nodeId, node]) => ({
      nodeId,
      ...inferNodeDetailsFromLegacyTags(node.tags, node.engine),
      label: node.label,
      version: node.version,
      description: node.description,
      groupIds: node.groupIds,
      inputEvents: structuredClone(node.inputEvents),
      outputEvents: structuredClone(node.outputEvents),
      tags: structuredClone(node.tags),
      position: positions[nodeId] ?? { x: 0, y: 0 },
    })),
    groups: groups
      .filter((group) => group.id !== 'ALL')
      .map(
        (group): MapGroup => ({
          groupId: group.id,
          name: group.name,
          type: group.type as MapGroup['type'],
          color: group.color,
          nodeIds: [...group.nodeIds],
        })
      ),
    edges: edges.map(
      (edge): MapEdge => ({
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        edgeType: edge.edgeType,
        ...(edge.label ? { label: edge.label } : {}),
      })
    ),
    engineColors: structuredClone(ENGINE_COLORS),
  };
}
