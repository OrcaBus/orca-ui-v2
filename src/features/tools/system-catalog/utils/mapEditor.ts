import type { MapFull, MapGroup, MapNode } from '../data/dynamodb-schema';
import type { EventDef, NodeParentLink } from '../types/system-catalog.types';
import { buildParentEdges } from './nodeForm';
import { normalizeMap } from './mapModel';

type MetadataPatch = Pick<MapFull, 'name' | 'description' | 'status' | 'tags'> &
  Partial<Pick<MapFull, 'version' | 'updatedAt' | 'updatedBy'>>;

export type MapEditorAction =
  | { type: 'hydrate'; map: MapFull }
  | {
      type: 'upsertNode';
      nodeId: string;
      node: MapNode;
      groupIds: string[];
      parentLinks: NodeParentLink[];
    }
  | {
      type: 'updateNodeEvents';
      nodeId: string;
      patch: { inputEvents?: EventDef[]; outputEvents?: EventDef[] };
    }
  | { type: 'deleteNode'; nodeId: string }
  | { type: 'upsertGroup'; group: MapGroup }
  | { type: 'deleteGroup'; groupId: string }
  | { type: 'updateNodePosition'; nodeId: string; position: MapNode['position'] }
  | { type: 'setNodePositions'; positions: Record<string, MapNode['position']> }
  | { type: 'updateMetadata'; patch: MetadataPatch };

export function mapEditorReducer(state: MapFull | null, action: MapEditorAction): MapFull | null {
  if (action.type === 'hydrate') {
    return normalizeMap(action.map);
  }

  if (!state) {
    return state;
  }

  switch (action.type) {
    case 'upsertNode': {
      const nodes = upsertById(state.nodes, action.node, 'nodeId');
      const groups = state.groups.map((group) => {
        const isSelected = action.groupIds.includes(group.groupId);
        const nodeIds = isSelected
          ? [...group.nodeIds, action.nodeId]
          : group.nodeIds.filter((nodeId) => nodeId !== action.nodeId);

        return {
          ...group,
          nodeIds: [...new Set(nodeIds)],
        };
      });

      const edges = [
        ...state.edges.filter((edge) => edge.target !== action.nodeId),
        ...buildParentEdges(action.nodeId, action.parentLinks, state.edges),
      ];

      return normalizeMap({
        ...state,
        nodes,
        groups,
        edges,
      });
    }

    case 'updateNodeEvents': {
      return normalizeMap({
        ...state,
        nodes: state.nodes.map((node) =>
          node.nodeId === action.nodeId
            ? {
                ...node,
                ...(action.patch.inputEvents !== undefined && {
                  inputEvents: action.patch.inputEvents,
                }),
                ...(action.patch.outputEvents !== undefined && {
                  outputEvents: action.patch.outputEvents,
                }),
              }
            : node
        ),
      });
    }

    case 'deleteNode': {
      return normalizeMap({
        ...state,
        nodes: state.nodes.filter((node) => node.nodeId !== action.nodeId),
        groups: state.groups.map((group) => ({
          ...group,
          nodeIds: group.nodeIds.filter((nodeId) => nodeId !== action.nodeId),
        })),
        edges: state.edges.filter(
          (edge) => edge.source !== action.nodeId && edge.target !== action.nodeId
        ),
      });
    }

    case 'upsertGroup': {
      return normalizeMap({
        ...state,
        groups: upsertById(state.groups, action.group, 'groupId'),
      });
    }

    case 'deleteGroup': {
      return normalizeMap({
        ...state,
        groups: state.groups.filter((group) => group.groupId !== action.groupId),
      });
    }

    case 'updateNodePosition': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.nodeId === action.nodeId
            ? {
                ...node,
                position: action.position,
              }
            : node
        ),
      };
    }

    case 'setNodePositions': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          action.positions[node.nodeId]
            ? {
                ...node,
                position: action.positions[node.nodeId],
              }
            : node
        ),
      };
    }

    case 'updateMetadata': {
      return {
        ...state,
        ...action.patch,
      };
    }
  }
}

function upsertById<T, Key extends keyof T & string>(items: T[], nextItem: T, key: Key): T[] {
  const index = items.findIndex((item) => item[key] === nextItem[key]);

  if (index === -1) {
    return [...items, nextItem];
  }

  return items.map((item, itemIndex) => (itemIndex === index ? nextItem : item));
}
