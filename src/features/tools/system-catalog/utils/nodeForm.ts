import { tryPrettyJson } from '@/utils/json';
import type {
  EdgeDef,
  NodeConfig,
  NodeFormData,
  CatalogNodeData,
  NodeParentLink,
} from '../types/system-catalog.types';

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

export function getParentLinksForNode(nodeId: string, catalogEdges: EdgeDef[]): NodeParentLink[] {
  return catalogEdges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => ({ nodeId: edge.source, edgeType: edge.edgeType }));
}

export function buildParentEdges(
  targetId: string,
  parentLinks: NodeParentLink[],
  existingEdges: EdgeDef[] = []
): EdgeDef[] {
  return parentLinks.map((parentLink) => {
    const existingEdge = existingEdges.find(
      (edge) =>
        edge.source === parentLink.nodeId &&
        edge.target === targetId &&
        edge.edgeType === parentLink.edgeType
    );

    return {
      id: `e-${parentLink.nodeId}-${targetId}`,
      source: parentLink.nodeId,
      target: targetId,
      edgeType: parentLink.edgeType,
      ...(existingEdge?.label ? { label: existingEdge.label } : {}),
    };
  });
}

export function nodeToFormData(
  nodeId: string,
  node: CatalogNodeData,
  catalogEdges: EdgeDef[]
): NodeFormData {
  return {
    name: node.label,
    version: node.version,
    engine: node.engine,
    groupId: node.groupIds[0] ?? '',
    parentLinks: getParentLinksForNode(nodeId, catalogEdges),
    description: node.description,
    configJson: configToJson(node.tags),
  };
}
