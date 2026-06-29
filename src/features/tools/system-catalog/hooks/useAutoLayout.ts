/**
 * React Flow binding for the pure dagre layout in `utils/autoLayout.ts`.
 *
 * Reads the live nodes/edges from the React Flow store (so dagre sees each node's
 * *measured* size), computes positions, hands them to the caller's setter, and fits
 * the viewport on the next frame — mirroring the official React Flow dagre example.
 *
 * Must be used inside a `<ReactFlowProvider>`.
 */
import { useCallback } from 'react';
import { useNodesInitialized, useReactFlow, type Node } from '@xyflow/react';
import { getLayoutedElements, type AutoLayoutOptions } from '../utils/autoLayout';

const FIT_VIEW_OPTIONS = { padding: 0.15, duration: 400 } as const;

export interface UseAutoLayoutResult {
  /** True once React Flow has measured every node, so layout can use real DOM sizes. */
  nodesInitialized: boolean;
  /**
   * Recompute node positions with dagre and apply them via `apply` (the caller's
   * `setNodes`), then fit the viewport. Returns the laid-out nodes so the caller can
   * persist the resulting positions.
   */
  runLayout: (apply: (nodes: Node[]) => void, options?: AutoLayoutOptions) => Node[];
}

export function useAutoLayout(): UseAutoLayoutResult {
  const { getNodes, getEdges, fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  const runLayout = useCallback(
    (apply: (nodes: Node[]) => void, options?: AutoLayoutOptions): Node[] => {
      const { nodes } = getLayoutedElements(getNodes(), getEdges(), options);
      apply(nodes);

      // Defer until React has committed the new positions, then frame the graph.
      window.requestAnimationFrame(() => {
        void fitView(FIT_VIEW_OPTIONS);
      });

      return nodes;
    },
    [getNodes, getEdges, fitView]
  );

  return { nodesInitialized, runLayout };
}
