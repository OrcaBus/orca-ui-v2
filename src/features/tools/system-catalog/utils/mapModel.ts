import type {
  MapFull,
  MapGroup,
  MapNode,
  MapSummary,
  ResourceType,
  WorkflowEngine,
} from '../data/dynamodb-schema';
import type { CatalogNodeLookupItem, GroupFilterItem } from '../types/system-catalog.types';

export const ALL_GROUP_ID = 'ALL';

const WORKFLOW_ENGINES = new Set<WorkflowEngine>([
  'ICA',
  'SEQERA',
  'AWS_BATCH',
  'AWS_ECS',
  'AWS_EKS',
  'BASESPACE',
  'PIERIAN',
  'ON_PREM',
  'OTHER',
]);

const LEGACY_WORKFLOW_NODE_TYPES = new Set(['pipeline', 'ica_pipeline']);

const LEGACY_RESOURCE_TYPE_MAP: Record<string, ResourceType> = {
  aws_lambda: 'aws_lambda',
  aws_eks: 'aws_eks',
  aws_step_function: 'aws_step_function',
  aws_event_bridge: 'aws_event_bridge',
  aws_batch: 'aws_batch',
  aws_s3: 'aws_s3',
  aws_sqs: 'aws_sqs',
  aws_sns: 'aws_sns',
  external_service: 'external_service',
  rest_api_service: 'rest_api_service',
  execution_service: 'execution_service',
};

export function inferResourceTypeFromLegacyTags(tags: Record<string, string>): ResourceType {
  const tagType = tags.type;

  switch (tagType) {
    case 'event_bus':
      return 'aws_event_bridge';
    case 'queue':
      return 'aws_sqs';
    case 'storage':
      return 'aws_s3';
    case 'rest_api_service':
      return 'rest_api_service';
    case 'execution_service':
      return 'execution_service';
    default:
      return 'other';
  }
}

export function inferNodeDetailsFromLegacyTags(
  tags: Record<string, string>,
  engine: string
):
  | { nodeType: 'resource'; resourceType: ResourceType }
  | { nodeType: 'workflow'; workflowEngine: WorkflowEngine } {
  if (tags.type === 'external_platform') {
    return {
      nodeType: 'workflow',
      workflowEngine: normalizeWorkflowEngine(engine),
    };
  }

  const resourceType = inferResourceTypeFromLegacyTags(tags);
  if (resourceType !== 'other') {
    return {
      nodeType: 'resource',
      resourceType,
    };
  }

  return {
    nodeType: 'workflow',
    workflowEngine: normalizeWorkflowEngine(engine),
  };
}

type LegacyMapNode = Omit<MapNode, 'nodeType'> & {
  nodeType: MapNode['nodeType'];
  engine?: string;
  resourceType?: ResourceType;
  workflowEngine?: WorkflowEngine;
};

export function buildNodeLookup(nodes: MapNode[]): Record<string, CatalogNodeLookupItem> {
  return Object.fromEntries(
    nodes.map((node) => [
      node.nodeId,
      {
        label: node.label,
        nodeType: node.nodeType,
        ...(node.nodeType === 'resource'
          ? { resourceType: node.resourceType }
          : { workflowEngine: node.workflowEngine }),
      },
    ])
  );
}

export function buildGroupFilters(groups: MapGroup[], nodeCount: number): GroupFilterItem[] {
  return [
    {
      id: ALL_GROUP_ID,
      name: 'All Groups',
      type: 'all',
      count: nodeCount,
      color: '#6366f1',
      nodeIds: [],
    },
    ...groups.map((group) => ({
      id: group.groupId,
      name: group.name,
      type: group.type,
      count: group.nodeIds.length,
      color: group.color,
      nodeIds: group.nodeIds,
      description: group.description,
    })),
  ];
}

export function normalizeMap(map: MapFull): MapFull {
  const dedupedNodes = dedupeBy(
    (map.nodes as LegacyMapNode[]).map(normalizeNode),
    (node) => node.nodeId
  );
  const nodeIds = new Set(dedupedNodes.map((node) => node.nodeId));

  const groups = dedupeBy(map.groups, (group) => group.groupId).map((group) => ({
    ...group,
    nodeIds: unique(group.nodeIds).filter((nodeId) => nodeIds.has(nodeId)),
  }));

  const memberships = new Map<string, string[]>();
  groups.forEach((group) => {
    group.nodeIds.forEach((nodeId) => {
      memberships.set(nodeId, [...(memberships.get(nodeId) ?? []), group.groupId]);
    });
  });

  const nodes = dedupedNodes.map((node) => ({
    ...node,
    groupIds: memberships.get(node.nodeId) ?? [],
  }));

  const validNodeIds = new Set(nodes.map((node) => node.nodeId));
  const edges = dedupeBy(map.edges, (edge) => edge.edgeId).filter(
    (edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
  );

  return {
    ...map,
    nodes,
    groups,
    edges,
    engineColors: map.engineColors ?? {},
  };
}

export function mapToSummary(map: MapFull): MapSummary {
  return {
    mapId: map.mapId,
    name: map.name,
    description: map.description,
    status: map.status,
    version: map.version,
    isDeleted: map.isDeleted,
    createdBy: map.createdBy,
    createdAt: map.createdAt,
    updatedBy: map.updatedBy,
    updatedAt: map.updatedAt,
    nodeCount: map.nodes.length,
    edgeCount: map.edges.length,
    tags: map.tags,
  };
}

function dedupeBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function normalizeNode(node: LegacyMapNode): MapNode {
  const { engine, resourceType, workflowEngine, ...baseNode } = node;

  if (baseNode.nodeType === 'resource') {
    return {
      ...baseNode,
      nodeType: 'resource',
      resourceType: normalizeResourceType(resourceType ?? engine ?? node.nodeType),
    };
  }

  if (baseNode.nodeType === 'workflow') {
    return {
      ...baseNode,
      nodeType: 'workflow',
      workflowEngine: normalizeWorkflowEngine(workflowEngine ?? engine),
    };
  }

  if (LEGACY_WORKFLOW_NODE_TYPES.has(baseNode.nodeType)) {
    return {
      ...baseNode,
      nodeType: 'workflow',
      workflowEngine: normalizeWorkflowEngine(workflowEngine ?? engine),
    };
  }

  return {
    ...baseNode,
    nodeType: 'resource',
    resourceType: normalizeResourceType(resourceType ?? baseNode.nodeType),
  };
}

function normalizeResourceType(value: unknown): ResourceType {
  if (typeof value === 'string') {
    const mapped = LEGACY_RESOURCE_TYPE_MAP[value] ?? value;
    const validValues = new Set<ResourceType>([
      'aws_lambda',
      'aws_api_gateway',
      'aws_sqs',
      'aws_event_bridge',
      'aws_s3',
      'aws_sns',
      'aws_step_function',
      'aws_batch',
      'aws_ecs',
      'aws_eks',
      'aws_dynamodb',
      'aws_rds',
      'rest_api_service',
      'execution_service',
      'external_service',
      'other',
    ]);

    if (validValues.has(mapped)) {
      return mapped;
    }
  }

  return 'other';
}

function normalizeWorkflowEngine(value: unknown): WorkflowEngine {
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase().replace(/[- ]+/g, '_');
    if (WORKFLOW_ENGINES.has(normalized as WorkflowEngine)) {
      return normalized as WorkflowEngine;
    }
  }

  return 'OTHER';
}
