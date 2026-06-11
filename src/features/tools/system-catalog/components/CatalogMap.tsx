import { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  type Edge,
  type Node,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  type NodeProps,
  useReactFlow,
  Handle,
  Position,
} from '@xyflow/react';
import { Cpu } from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import type { MapEdge, MapEdgeType, MapGroup, MapNode } from '../data/dynamodb-schema';
import type { CatalogNodeViewData } from '../types/system-catalog.types';
import { ALL_GROUP_ID } from '../utils/mapModel';
import { getNodeAccentColor, getNodeDetailLabel, getNodeKindLabel } from '../utils/nodeDisplay';
import {
  IcaPipelineNode,
  EventBridgeNode,
  SqsNode,
  S3Node,
  RestApiServiceNode,
  ExecutionServiceNode,
} from './EventFlowNodes';

const EDGE_TYPE_STYLES: Record<
  MapEdgeType,
  { strokeDasharray?: string; strokeWidth: number; color?: string }
> = {
  trigger: { strokeWidth: 2 },
  trigger_input: { strokeDasharray: '8 4', strokeWidth: 1.5 },
  input_dependency: { strokeDasharray: '4 3', strokeWidth: 1 },
  event_publish: { strokeWidth: 2, color: '#22c55e' },
  event_subscribe: { strokeWidth: 2, color: '#22c55e' },
  state_change: { strokeWidth: 2, color: '#d97706' },
  execution_request: { strokeWidth: 2.5, color: '#ef4444' },
  rest_call: { strokeDasharray: '6 4', strokeWidth: 1.5, color: '#6b7280' },
};

function PipelineNode({ data, selected }: NodeProps) {
  const node = data as unknown as CatalogNodeViewData;
  const nodeColor =
    typeof node.accentColor === 'string' ? node.accentColor : getNodeAccentColor(node);
  const isDimmed = node.dimmed === true;
  const isHighlighted = node.highlighted === true;

  return (
    <div
      className='relative max-w-50 min-w-45 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 dark:border-[#2d3540] dark:bg-[#111418]'
      style={{
        borderColor: isHighlighted ? nodeColor : selected ? nodeColor : undefined,
        borderWidth: isHighlighted || selected ? 2 : 1,
        opacity: isDimmed ? 0.3 : 1,
        boxShadow: isHighlighted
          ? `0 0 0 3px ${nodeColor}22, 0 4px 12px rgba(0,0,0,0.1)`
          : selected
            ? `0 0 0 2px ${nodeColor}44, 0 4px 12px rgba(0,0,0,0.1)`
            : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div
        className='absolute top-0 bottom-0 left-0 w-0.75 rounded-l-xl'
        style={{ background: nodeColor }}
      />

      <div className='pt-3 pr-3 pb-3 pl-4'>
        <div
          className='mb-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold'
          style={{ background: `${nodeColor}18`, color: nodeColor }}
        >
          <Cpu className='h-2.5 w-2.5' />
          {getNodeKindLabel(node)} · {getNodeDetailLabel(node)}
        </div>
        <div className='text-[13px] leading-tight font-semibold text-slate-900 dark:text-white'>
          {node.label}
        </div>
        <div className='mt-0.5 text-[11px] text-slate-400 dark:text-[#9dabb9]'>{node.version}</div>
      </div>

      <Handle type='target' position={Position.Left} style={{ opacity: 0 }} />
      <Handle type='source' position={Position.Right} style={{ opacity: 0 }} />
      <Handle type='target' position={Position.Top} id='top' style={{ opacity: 0 }} />
      <Handle type='source' position={Position.Bottom} id='bottom' style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = {
  pipeline: PipelineNode,
  ica_pipeline: IcaPipelineNode,
  aws_event_bridge: EventBridgeNode,
  aws_sqs: SqsNode,
  aws_s3: S3Node,
  rest_api_service: RestApiServiceNode,
  execution_service: ExecutionServiceNode,
};

function resolveReactFlowNodeType(node: MapNode) {
  if (node.nodeType === 'workflow') {
    if (node.workflowEngine === 'ICA') {
      return 'ica_pipeline';
    }

    return 'pipeline';
  }

  switch (node.resourceType) {
    case 'aws_event_bridge':
      return 'aws_event_bridge';
    case 'aws_sqs':
      return 'aws_sqs';
    case 'aws_s3':
      return 'aws_s3';
    case 'rest_api_service':
      return 'rest_api_service';
    case 'execution_service':
      return 'execution_service';
    default:
      return 'pipeline';
  }
}

export interface MapInnerProps {
  selectedGroup: string;
  onNodeClick: (id: string) => void;
  onNodePositionChange: (id: string, position: MapNode['position']) => void;
  searchQuery: string;
  nodes: MapNode[];
  edges: MapEdge[];
  groups: MapGroup[];
  engineColors: Record<string, string>;
}

export function MapInner({
  selectedGroup,
  onNodeClick,
  onNodePositionChange,
  searchQuery,
  nodes: mapNodes,
  edges: mapEdges,
  groups,
  engineColors,
}: MapInnerProps) {
  const { fitView } = useReactFlow();
  const { resolvedTheme } = useTheme();

  const edgeMeta = useMemo(
    () =>
      new Map(
        mapEdges.map((edge) => [edge.edgeId, { edgeType: edge.edgeType, label: edge.label }])
      ),
    [mapEdges]
  );

  const initialEdges = useMemo<Edge[]>(
    () =>
      mapEdges.map((edge) => {
        const typeStyle = EDGE_TYPE_STYLES[edge.edgeType];
        const baseColor =
          typeStyle.color ?? (edge.edgeType === 'input_dependency' ? '#cbd5e1' : '#94a3b8');

        return {
          id: edge.edgeId,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          label: edge.label,
          labelStyle: { fontSize: 9, fill: baseColor, fontStyle: 'italic' as const },
          labelBgStyle: { fill: 'transparent' },
          markerEnd: { type: MarkerType.ArrowClosed, color: baseColor },
          style: {
            stroke: baseColor,
            strokeWidth: typeStyle.strokeWidth,
            strokeDasharray: typeStyle.strokeDasharray,
          },
        };
      }),
    [mapEdges]
  );

  const buildNodes = useCallback((): Node[] => {
    const activeGroup =
      selectedGroup !== ALL_GROUP_ID
        ? (groups.find((group) => group.groupId === selectedGroup) ?? null)
        : null;
    const focusedIds = activeGroup ? new Set(activeGroup.nodeIds) : null;

    return mapNodes
      .filter((node) => {
        if (!searchQuery) {
          return true;
        }

        const loweredQuery = searchQuery.toLowerCase();
        return (
          node.label.toLowerCase().includes(loweredQuery) ||
          node.description.toLowerCase().includes(loweredQuery)
        );
      })
      .map((node) => ({
        id: node.nodeId,
        type: resolveReactFlowNodeType(node),
        position: node.position,
        data: {
          ...node,
          accentColor: getNodeAccentColor(node, engineColors),
          highlighted: focusedIds ? focusedIds.has(node.nodeId) : false,
          dimmed: focusedIds ? !focusedIds.has(node.nodeId) : false,
        },
      }));
  }, [selectedGroup, searchQuery, mapNodes, groups, engineColors]);

  const dimmedColor = resolvedTheme === 'dark' ? '#2d3540' : '#e2e8f0';
  const defaultEdgeColor = resolvedTheme === 'dark' ? '#64748b' : '#94a3b8';

  const buildEdges = useCallback((): Edge[] => {
    const activeGroup =
      selectedGroup !== ALL_GROUP_ID
        ? (groups.find((group) => group.groupId === selectedGroup) ?? null)
        : null;
    const focusedIds = activeGroup ? new Set(activeGroup.nodeIds) : null;
    const groupColor = activeGroup?.color;

    return initialEdges.map((edge) => {
      const meta = edgeMeta.get(edge.id);
      const typeStyle = meta ? EDGE_TYPE_STYLES[meta.edgeType] : EDGE_TYPE_STYLES.trigger;
      const isActive = focusedIds
        ? focusedIds.has(edge.source) && focusedIds.has(edge.target)
        : true;

      const intrinsicColor = typeStyle.color;
      const strokeColor = isActive
        ? focusedIds
          ? (groupColor ?? intrinsicColor ?? defaultEdgeColor)
          : (intrinsicColor ??
            (meta?.edgeType === 'input_dependency'
              ? resolvedTheme === 'dark'
                ? '#475569'
                : '#cbd5e1'
              : defaultEdgeColor))
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
  }, [selectedGroup, dimmedColor, defaultEdgeColor, resolvedTheme, initialEdges, edgeMeta, groups]);

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
      const activeGroup =
        selectedGroup !== ALL_GROUP_ID
          ? (groups.find((group) => group.groupId === selectedGroup) ?? null)
          : null;

      if (activeGroup) {
        void fitView({
          nodes: activeGroup.nodeIds.map((nodeId) => ({ id: nodeId })),
          duration: 600,
          padding: 0.3,
        });
        return;
      }

      void fitView({ duration: 600, padding: 0.15 });
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedGroup, fitView, groups]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onNodeClick(node.id)}
      onNodeDragStop={(_, node) => onNodePositionChange(node.id, node.position)}
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
