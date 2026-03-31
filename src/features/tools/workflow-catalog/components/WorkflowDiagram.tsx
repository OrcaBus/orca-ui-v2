import { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  NodeProps,
  useReactFlow,
  Handle,
  Position,
} from '@xyflow/react';
import { Cpu } from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import type { WorkflowNodeData, EdgeDef, EdgeType } from '../types/workflow-catalog.types';
import { ANALYSIS_LIST, ENGINE_COLORS } from '../data';

const EDGE_TYPE_STYLES: Record<EdgeType, { strokeDasharray?: string; strokeWidth: number }> = {
  trigger: { strokeWidth: 2 },
  trigger_input: { strokeDasharray: '8 4', strokeWidth: 1.5 },
  input_dependency: { strokeDasharray: '4 3', strokeWidth: 1 },
};

function WorkflowNode({ data, selected }: NodeProps) {
  const d = data as WorkflowNodeData;
  const engineColor = ENGINE_COLORS[d.engine] ?? '#6b7280';
  const isDimmed = d.dimmed === true;
  const isHighlighted = d.highlighted === true;

  return (
    <div
      className='relative max-w-[200px] min-w-[180px] cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 dark:border-[#2d3540] dark:bg-[#111418]'
      style={{
        borderColor: isHighlighted ? engineColor : selected ? engineColor : undefined,
        borderWidth: isHighlighted || selected ? 2 : 1,
        opacity: isDimmed ? 0.3 : 1,
        boxShadow: isHighlighted
          ? `0 0 0 3px ${engineColor}22, 0 4px 12px rgba(0,0,0,0.1)`
          : selected
            ? `0 0 0 2px ${engineColor}44, 0 4px 12px rgba(0,0,0,0.1)`
            : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div
        className='absolute top-0 bottom-0 left-0 w-[3px] rounded-l-xl'
        style={{ background: engineColor }}
      />

      <div className='pt-3 pr-3 pb-3 pl-4'>
        <div
          className='mb-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold'
          style={{ background: `${engineColor}18`, color: engineColor }}
        >
          <Cpu className='h-2.5 w-2.5' />
          {d.engine}
        </div>
        <div className='text-[13px] leading-tight font-semibold text-slate-900 dark:text-white'>
          {d.label}
        </div>
        <div className='mt-0.5 text-[11px] text-slate-400 dark:text-[#9dabb9]'>{d.version}</div>
      </div>

      <Handle type='target' position={Position.Left} style={{ opacity: 0 }} />
      <Handle type='source' position={Position.Right} style={{ opacity: 0 }} />
      <Handle type='target' position={Position.Top} id='top' style={{ opacity: 0 }} />
      <Handle type='source' position={Position.Bottom} id='bottom' style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { workflow: WorkflowNode };

export interface DiagramInnerProps {
  selectedAnalysis: string;
  onNodeClick: (id: string) => void;
  searchQuery: string;
  workflows: Record<string, WorkflowNodeData>;
  positions: Record<string, { x: number; y: number }>;
  catalogEdges: EdgeDef[];
}

export function DiagramInner({
  selectedAnalysis,
  onNodeClick,
  searchQuery,
  workflows,
  positions,
  catalogEdges,
}: DiagramInnerProps) {
  const { fitView } = useReactFlow();
  const { resolvedTheme } = useTheme();

  const edgeMeta = useMemo(
    () => new Map(catalogEdges.map((e) => [e.id, { edgeType: e.edgeType, label: e.label }])),
    [catalogEdges]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      catalogEdges.map((e) => {
        const typeStyle = EDGE_TYPE_STYLES[e.edgeType];
        const baseColor = e.edgeType === 'input_dependency' ? '#cbd5e1' : '#94a3b8';
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          label: e.label,
          labelStyle: { fontSize: 9, fill: '#94a3b8', fontStyle: 'italic' as const },
          labelBgStyle: { fill: 'transparent' },
          markerEnd: { type: MarkerType.ArrowClosed, color: baseColor },
          style: { stroke: baseColor, ...typeStyle },
        };
      }),
    [catalogEdges]
  );

  const buildNodes = useCallback((): Node[] => {
    const activeAnalysis =
      selectedAnalysis !== 'ALL' ? ANALYSIS_LIST.find((a) => a.id === selectedAnalysis) : null;
    const focusedIds = activeAnalysis ? new Set(activeAnalysis.workflowIds) : null;

    return Object.entries(workflows)
      .filter(([, data]) => {
        if (!searchQuery) return true;
        return (
          data.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          data.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .map(([id, data]) => {
        const highlighted = focusedIds ? focusedIds.has(id) : false;
        const dimmed = focusedIds ? !focusedIds.has(id) : false;
        return {
          id,
          type: 'workflow',
          position: positions[id] ?? { x: 0, y: 0 },
          data: { ...data, highlighted, dimmed },
        };
      });
  }, [selectedAnalysis, searchQuery, workflows, positions]);

  const dimmedColor = resolvedTheme === 'dark' ? '#2d3540' : '#e2e8f0';
  const defaultEdgeColor = resolvedTheme === 'dark' ? '#64748b' : '#94a3b8';

  const buildEdges = useCallback((): Edge[] => {
    const activeAnalysis =
      selectedAnalysis !== 'ALL' ? ANALYSIS_LIST.find((a) => a.id === selectedAnalysis) : null;
    const focusedIds = activeAnalysis ? new Set(activeAnalysis.workflowIds) : null;
    const analysisColor = ANALYSIS_LIST.find((a) => a.id === selectedAnalysis)?.color;

    return initialEdges.map((edge) => {
      const meta = edgeMeta.get(edge.id);
      const typeStyle = meta ? EDGE_TYPE_STYLES[meta.edgeType] : EDGE_TYPE_STYLES.trigger;
      const isActive = focusedIds
        ? focusedIds.has(edge.source) && focusedIds.has(edge.target)
        : true;
      const strokeColor = isActive
        ? focusedIds
          ? (analysisColor ?? defaultEdgeColor)
          : meta?.edgeType === 'input_dependency'
            ? resolvedTheme === 'dark'
              ? '#475569'
              : '#cbd5e1'
            : defaultEdgeColor
        : dimmedColor;
      return {
        ...edge,
        style: {
          stroke: strokeColor,
          strokeWidth: isActive && focusedIds ? typeStyle.strokeWidth + 0.5 : typeStyle.strokeWidth,
          strokeDasharray: typeStyle.strokeDasharray,
          opacity: isActive ? 1 : 0.15,
        },
        labelStyle: {
          fontSize: 9,
          fill: isActive ? strokeColor : dimmedColor,
          fontStyle: 'italic' as const,
          opacity: isActive ? 0.8 : 0.2,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
      };
    });
  }, [selectedAnalysis, dimmedColor, defaultEdgeColor, resolvedTheme, initialEdges, edgeMeta]);

  const computedNodes = useMemo(() => buildNodes(), [buildNodes]);
  const computedEdges = useMemo(() => buildEdges(), [buildEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges);

  useEffect(() => {
    setNodes(computedNodes);
    setEdges(computedEdges);
  }, [computedNodes, computedEdges, setNodes, setEdges]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeAnalysis =
        selectedAnalysis !== 'ALL' ? ANALYSIS_LIST.find((a) => a.id === selectedAnalysis) : null;
      if (activeAnalysis) {
        void fitView({
          nodes: activeAnalysis.workflowIds.map((id) => ({ id })),
          duration: 600,
          padding: 0.3,
        });
      } else {
        void fitView({ duration: 600, padding: 0.15 });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedAnalysis, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onNodeClick(node.id)}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      attributionPosition='bottom-left'
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color={resolvedTheme === 'dark' ? '#2d3540' : '#e2e8f0'}
      />
      <Controls
        showInteractive={false}
        className='rounded-lg! border-slate-200! shadow-sm! dark:border-[#2d3540]! dark:bg-[#1e252e]!'
      />
    </ReactFlow>
  );
}
