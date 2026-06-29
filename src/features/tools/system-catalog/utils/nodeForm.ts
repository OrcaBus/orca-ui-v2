import { tryPrettyJson } from '@/utils/json';
import type { MapEdge, MapNode } from '../data/dynamodb-schema';
import type { NodeConfig, NodeFormData, NodeParentLink } from '../types/system-catalog.types';
import { RESOURCE_TYPE_OPTIONS, WORKFLOW_ENGINE_OPTIONS } from './nodeDisplay';

export function parseNodeConfigJson(raw: string): NodeConfig | null {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    return null;
  }

  const entries = Object.entries(parsed);
  if (entries.some(([key, value]) => !key.trim() || typeof value !== 'string')) {
    return null;
  }

  return Object.fromEntries(entries.map(([key, value]) => [key.trim(), value]));
}

export function configToJson(config: NodeConfig): string {
  return tryPrettyJson(JSON.stringify(config));
}

export function getParentLinksForNode(nodeId: string, mapEdges: MapEdge[]): NodeParentLink[] {
  return mapEdges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => ({ nodeId: edge.source, edgeType: edge.edgeType }));
}

export function buildParentEdges(
  targetId: string,
  parentLinks: NodeParentLink[],
  existingEdges: MapEdge[] = []
): MapEdge[] {
  return parentLinks.map((parentLink) => {
    const existingEdge = existingEdges.find(
      (edge) =>
        edge.source === parentLink.nodeId &&
        edge.target === targetId &&
        edge.edgeType === parentLink.edgeType
    );

    return {
      edgeId: `e-${parentLink.nodeId}-${targetId}-${parentLink.edgeType}`,
      source: parentLink.nodeId,
      target: targetId,
      edgeType: parentLink.edgeType,
      ...(existingEdge?.label ? { label: existingEdge.label } : {}),
    };
  });
}

export function nodeToFormData(nodeId: string, node: MapNode, mapEdges: MapEdge[]): NodeFormData {
  return {
    name: node.label,
    version: node.version,
    nodeType: node.nodeType,
    resourceType:
      node.nodeType === 'resource'
        ? node.resourceType
        : (RESOURCE_TYPE_OPTIONS[0]?.value ?? 'aws_lambda'),
    workflowEngine:
      node.nodeType === 'workflow'
        ? node.workflowEngine
        : (WORKFLOW_ENGINE_OPTIONS[0]?.value ?? 'ICA'),
    groupIds: node.groupIds,
    parentLinks: getParentLinksForNode(nodeId, mapEdges),
    description: node.description,
    configJson: configToJson(node.tags),
  };
}
