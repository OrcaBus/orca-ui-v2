/**
 * Custom ReactFlow node components for the OrcaBus Event Flow diagram.
 *
 * Each component renders a distinct visual shape representing an AWS service
 * or infrastructure component.
 */
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Cloud, Radio, Inbox, HardDrive, Database, Zap, Play, Workflow } from 'lucide-react';
import type { CatalogNodeData } from '../types/system-catalog.types';

// ── Shared Helpers ────────────────────────────────────────────────────────

const SERVICE_COLORS: Record<string, string> = {
  EVENTBRIDGE: '#e7157b',
  SQS: '#ff4f8b',
  S3: '#3f8624',
  LAMBDA: '#ff9900',
  RDS: '#527fff',
  STEPFUNCTION: '#ff4f8b',
  DYNAMODB: '#527fff',
  ICA: '#06b6d4',
  AWS: '#ff9900',
};

function NodeHandles() {
  return (
    <>
      <Handle type='target' position={Position.Left} style={{ opacity: 0 }} />
      <Handle type='source' position={Position.Right} style={{ opacity: 0 }} />
      <Handle type='target' position={Position.Top} id='top' style={{ opacity: 0 }} />
      <Handle type='source' position={Position.Bottom} id='bottom' style={{ opacity: 0 }} />
    </>
  );
}

function dimStyle(isDimmed: boolean, isHighlighted: boolean, accentColor: string) {
  return {
    opacity: isDimmed ? 0.3 : 1,
    borderColor: isHighlighted ? accentColor : undefined,
    borderWidth: isHighlighted ? 2 : 1,
    boxShadow: isHighlighted
      ? `0 0 0 3px ${accentColor}22, 0 4px 12px rgba(0,0,0,0.1)`
      : '0 1px 4px rgba(0,0,0,0.06)',
  };
}

// ── ICA Pipeline Node (Cloud Shape) ──────────────────────────────────────

export function IcaPipelineNode({ data }: NodeProps) {
  const d = data as CatalogNodeData;
  const isDimmed = d.dimmed === true;
  const isHighlighted = d.highlighted === true;
  const color = SERVICE_COLORS.ICA;

  return (
    <div
      className='relative min-w-[200px] cursor-pointer'
      style={{ ...dimStyle(isDimmed, isHighlighted, color) }}
    >
      {/* Cloud shape via CSS */}
      <div
        className='relative rounded-[40px] border-2 border-dashed px-6 pt-5 pb-4'
        style={{ borderColor: color, background: `${color}08` }}
      >
        <div className='mb-2 flex items-center gap-2'>
          <div
            className='flex h-8 w-8 items-center justify-center rounded-lg'
            style={{ background: `${color}18` }}
          >
            <Cloud className='h-5 w-5' style={{ color }} />
          </div>
          <div>
            <div className='text-[11px] font-bold tracking-wide' style={{ color }}>
              ICA
            </div>
          </div>
        </div>
        <div className='text-[13px] leading-tight font-semibold text-slate-900 dark:text-white'>
          {d.label}
        </div>
        <div className='mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-400'>
          {d.description.length > 60 ? `${d.description.slice(0, 60)}…` : d.description}
        </div>
        {d.version && (
          <div className='mt-1 text-[10px] text-slate-400 dark:text-slate-500'>{d.version}</div>
        )}
      </div>
      <NodeHandles />
    </div>
  );
}

// ── EventBridge Node (Hexagonal/Tunnel Shape) ────────────────────────────

export function EventBridgeNode({ data }: NodeProps) {
  const d = data as CatalogNodeData;
  const isDimmed = d.dimmed === true;
  const isHighlighted = d.highlighted === true;
  const color = SERVICE_COLORS.EVENTBRIDGE;

  return (
    <div
      className='relative min-w-[220px] cursor-pointer'
      style={{ ...dimStyle(isDimmed, isHighlighted, color) }}
    >
      {/* Hexagonal shape via clip-path */}
      <div
        className='relative overflow-hidden px-6 pt-5 pb-4'
        style={{
          clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
          background:
            'linear-gradient(135deg, rgba(231,21,123,0.06) 0%, rgba(231,21,123,0.12) 100%)',
          minHeight: 80,
        }}
      >
        <div className='flex items-center justify-center gap-2'>
          <div
            className='flex h-9 w-9 items-center justify-center rounded-full'
            style={{ background: `${color}20` }}
          >
            <Radio className='h-5 w-5' style={{ color }} />
          </div>
          <div className='text-center'>
            <div className='text-[10px] font-bold tracking-wider uppercase' style={{ color }}>
              EventBridge
            </div>
            <div className='text-[13px] leading-tight font-semibold text-slate-900 dark:text-white'>
              {d.label}
            </div>
          </div>
        </div>
      </div>
      <NodeHandles />
    </div>
  );
}

// ── SQS Queue Node ───────────────────────────────────────────────────────

export function SqsNode({ data }: NodeProps) {
  const d = data as CatalogNodeData;
  const isDimmed = d.dimmed === true;
  const isHighlighted = d.highlighted === true;
  const color = SERVICE_COLORS.SQS;

  return (
    <div
      className='relative min-w-[140px] cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm dark:border-[#2d3540] dark:bg-[#111418]'
      style={{ ...dimStyle(isDimmed, isHighlighted, color) }}
    >
      <div className='absolute top-0 right-0 left-0 h-[3px]' style={{ background: color }} />
      <div className='px-4 pt-4 pb-3'>
        <div className='mb-2 flex items-center gap-2'>
          <div
            className='flex h-7 w-7 items-center justify-center rounded-md'
            style={{ background: `${color}15` }}
          >
            <Inbox className='h-4 w-4' style={{ color }} />
          </div>
          <div className='text-[10px] font-bold tracking-wider uppercase' style={{ color }}>
            SQS
          </div>
        </div>
        <div className='text-[13px] leading-tight font-semibold text-slate-900 dark:text-white'>
          {d.label}
        </div>
      </div>
      <NodeHandles />
    </div>
  );
}

// ── S3 Bucket Node ───────────────────────────────────────────────────────

export function S3Node({ data }: NodeProps) {
  const d = data as CatalogNodeData;
  const isDimmed = d.dimmed === true;
  const isHighlighted = d.highlighted === true;
  const color = SERVICE_COLORS.S3;

  return (
    <div
      className='relative min-w-[140px] cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm dark:border-[#2d3540] dark:bg-[#111418]'
      style={{ ...dimStyle(isDimmed, isHighlighted, color) }}
    >
      {/* Bucket-like top bar */}
      <div className='absolute top-0 right-0 left-0 h-[3px]' style={{ background: color }} />
      <div className='px-4 pt-4 pb-3'>
        <div className='mb-2 flex items-center gap-2'>
          <div
            className='flex h-7 w-7 items-center justify-center rounded-md'
            style={{ background: `${color}15` }}
          >
            <HardDrive className='h-4 w-4' style={{ color }} />
          </div>
          <div className='text-[10px] font-bold tracking-wider uppercase' style={{ color }}>
            S3
          </div>
        </div>
        <div className='text-[13px] leading-tight font-semibold text-slate-900 dark:text-white'>
          {d.label}
        </div>
      </div>
      <NodeHandles />
    </div>
  );
}

// ── REST API Service Node (Lambda + RDS) ─────────────────────────────────

export function RestApiServiceNode({ data }: NodeProps) {
  const d = data as CatalogNodeData;
  const isDimmed = d.dimmed === true;
  const isHighlighted = d.highlighted === true;
  const lambdaColor = SERVICE_COLORS.LAMBDA;
  const rdsColor = SERVICE_COLORS.RDS;

  return (
    <div
      className='relative min-w-[200px] cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm dark:border-[#2d3540] dark:bg-[#111418]'
      style={{ ...dimStyle(isDimmed, isHighlighted, lambdaColor) }}
    >
      {/* Left accent bar */}
      <div
        className='absolute top-0 bottom-0 left-0 w-[3px] rounded-l-xl'
        style={{ background: lambdaColor }}
      />
      <div className='pt-3 pr-3 pb-3 pl-4'>
        {/* Service name */}
        <div className='text-[13px] leading-tight font-semibold text-slate-900 dark:text-white'>
          {d.label}
        </div>

        {/* REST API badge */}
        <div className='mt-2 inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-[#2d3540] dark:text-slate-400'>
          REST API
        </div>

        {/* Infrastructure icons row */}
        <div className='mt-2 flex items-center gap-3'>
          <div className='flex items-center gap-1'>
            <div
              className='flex h-6 w-6 items-center justify-center rounded'
              style={{ background: `${lambdaColor}15` }}
            >
              <Zap className='h-3.5 w-3.5' style={{ color: lambdaColor }} />
            </div>
            <span className='text-[9px] font-medium text-slate-500'>Lambda</span>
          </div>
          <div className='flex items-center gap-1'>
            <div
              className='flex h-6 w-6 items-center justify-center rounded'
              style={{ background: `${rdsColor}15` }}
            >
              <Database className='h-3.5 w-3.5' style={{ color: rdsColor }} />
            </div>
            <span className='text-[9px] font-medium text-slate-500'>RDS</span>
          </div>
        </div>
      </div>
      <NodeHandles />
    </div>
  );
}

// ── Execution Service Node (StepFunction + DynamoDB) ─────────────────────

export function ExecutionServiceNode({ data }: NodeProps) {
  const d = data as CatalogNodeData;
  const isDimmed = d.dimmed === true;
  const isHighlighted = d.highlighted === true;
  const sfColor = SERVICE_COLORS.STEPFUNCTION;
  const ddbColor = SERVICE_COLORS.DYNAMODB;

  return (
    <div
      className='relative min-w-[200px] cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm dark:border-[#2d3540] dark:bg-[#111418]'
      style={{ ...dimStyle(isDimmed, isHighlighted, sfColor) }}
    >
      {/* Left accent bar */}
      <div
        className='absolute top-0 bottom-0 left-0 w-[3px] rounded-l-xl'
        style={{ background: sfColor }}
      />
      <div className='pt-3 pr-3 pb-3 pl-4'>
        {/* Service name */}
        <div className='text-[13px] leading-tight font-semibold text-slate-900 dark:text-white'>
          {d.label}
        </div>

        {/* Execution Service badge */}
        <div
          className='mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold'
          style={{ background: `${sfColor}15`, color: sfColor }}
        >
          <Play className='h-2.5 w-2.5' />
          Execution Service
        </div>

        {/* Infrastructure icons row */}
        <div className='mt-2 flex items-center gap-3'>
          <div className='flex items-center gap-1'>
            <div
              className='flex h-6 w-6 items-center justify-center rounded'
              style={{ background: `${sfColor}15` }}
            >
              <Workflow className='h-3.5 w-3.5' style={{ color: sfColor }} />
            </div>
            <span className='text-[9px] font-medium text-slate-500'>StepFn</span>
          </div>
          <div className='flex items-center gap-1'>
            <div
              className='flex h-6 w-6 items-center justify-center rounded'
              style={{ background: `${ddbColor}15` }}
            >
              <Database className='h-3.5 w-3.5' style={{ color: ddbColor }} />
            </div>
            <span className='text-[9px] font-medium text-slate-500'>DynamoDB</span>
          </div>
        </div>
      </div>
      <NodeHandles />
    </div>
  );
}
