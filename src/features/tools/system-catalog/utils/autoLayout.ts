/**
 * Pure dagre-based auto-layout for the system-catalog diagram.
 *
 * Kept free of React/React Flow runtime concerns so it can be unit-tested in
 * isolation (see `__tests__/autoLayout.test.ts`). The `useAutoLayout` hook wraps
 * this and wires it to the live React Flow store.
 */
import dagre, { type EdgeLabel, type GraphLabel, type NodeLabel } from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';

export type LayoutDirection = 'LR' | 'TB' | 'RL' | 'BT';

export interface AutoLayoutOptions {
  /** dagre rankdir. Defaults to 'LR' (left-to-right) to match the pipeline diagram. */
  direction?: LayoutDirection;
  /** Gap between nodes within the same rank, in px. */
  nodeSep?: number;
  /** Gap between ranks, in px. */
  rankSep?: number;
}

export interface NodeSize {
  width: number;
  height: number;
}

const DEFAULT_NODE_SIZE: NodeSize = { width: 200, height: 90 };
const DEFAULT_NODE_SEP = 70;
const DEFAULT_RANK_SEP = 120;

/**
 * Fallback dimensions keyed by the React Flow node `type` (the keys registered in
 * `nodeTypes` in CatalogMap). Used only until React Flow has measured the real DOM
 * size of each node — `getNodeSize` prefers the measured value when available.
 */
export const NODE_DIMENSIONS: Record<string, NodeSize> = {
  pipeline: { width: 200, height: 90 },
  ica_pipeline: { width: 220, height: 120 },
  aws_event_bridge: { width: 240, height: 90 },
  aws_sqs: { width: 160, height: 90 },
  aws_s3: { width: 160, height: 90 },
  rest_api_service: { width: 220, height: 130 },
  execution_service: { width: 220, height: 130 },
};

/** Resolve a node's size, preferring React Flow's measured dimensions. */
export function getNodeSize(node: Node): NodeSize {
  const measuredWidth = node.measured?.width;
  const measuredHeight = node.measured?.height;
  if (measuredWidth && measuredHeight) {
    return { width: measuredWidth, height: measuredHeight };
  }

  return (node.type ? NODE_DIMENSIONS[node.type] : undefined) ?? DEFAULT_NODE_SIZE;
}

/**
 * Compute positions for `nodes` from the graph `edges` using dagre.
 *
 * Returns new node objects with updated `position` (top-left, as React Flow expects).
 * Input arrays are not mutated.
 */
export function getLayoutedElements<NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  nodes: NodeType[],
  edges: EdgeType[],
  options: AutoLayoutOptions = {}
): { nodes: NodeType[]; edges: EdgeType[] } {
  const { direction = 'LR', nodeSep = DEFAULT_NODE_SEP, rankSep = DEFAULT_RANK_SEP } = options;

  if (nodes.length === 0) {
    return { nodes, edges };
  }

  const graph = new dagre.graphlib.Graph<GraphLabel, NodeLabel, EdgeLabel>();
  graph.setGraph({ rankdir: direction, nodesep: nodeSep, ranksep: rankSep });
  graph.setDefaultEdgeLabel(() => ({}));

  const sizeById = new Map<string, NodeSize>();
  for (const node of nodes) {
    const size = getNodeSize(node);
    sizeById.set(node.id, size);
    graph.setNode(node.id, { width: size.width, height: size.height });
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const edge of edges) {
    // Skip edges whose endpoints aren't part of this layout (e.g. filtered out),
    // otherwise dagre creates zero-sized phantom nodes and emits NaN positions.
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = graph.node(node.id);
    const size = sizeById.get(node.id) ?? DEFAULT_NODE_SIZE;
    // dagre reports the node centre; React Flow positions from the top-left corner.
    const centerX = dagreNode.x ?? 0;
    const centerY = dagreNode.y ?? 0;

    return {
      ...node,
      position: {
        x: centerX - size.width / 2,
        y: centerY - size.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
