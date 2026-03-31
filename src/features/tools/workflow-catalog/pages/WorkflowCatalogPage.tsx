import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Search, X, Plus } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { WorkflowNodeData, EventDef, EdgeDef } from '../types/workflow-catalog.types';
import {
  ANALYSIS_LIST,
  WORKFLOW_CATALOG,
  CATALOG_EDGES,
  NODE_POSITIONS,
  ENGINE_COLORS,
} from '../data';
import {
  WorkflowModal,
  DeleteConfirmDialog,
  DiagramInner,
  WorkflowDrawer,
  type WorkflowFormData,
} from '../components';

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const ENGINE_OPTIONS = Object.keys(ENGINE_COLORS);

// ─── Main Page Component ───────────────────────────────────────────────────

function WorkflowCatalogContent() {
  const [selectedAnalysis, setSelectedAnalysis] = useState('ALL');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mutable catalog state
  const [workflows, setWorkflows] = useState<Record<string, WorkflowNodeData>>(() => ({
    ...WORKFLOW_CATALOG,
  }));
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => ({
    ...NODE_POSITIONS,
  }));
  const [catalogEdges, setCatalogEdges] = useState<EdgeDef[]>(() => [...CATALOG_EDGES]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const activeAnalysis = ANALYSIS_LIST.find((a) => a.id === selectedAnalysis);

  const allWorkflowIds = useMemo(() => Object.keys(workflows), [workflows]);
  const allWorkflowLabels = useMemo(
    () => Object.fromEntries(Object.entries(workflows).map(([id, w]) => [id, w.label])),
    [workflows]
  );

  const getParentIdsForWorkflow = useCallback(
    (workflowId: string) =>
      catalogEdges
        .filter((e) => e.target === workflowId && e.edgeType !== 'input_dependency')
        .map((e) => e.source),
    [catalogEdges]
  );

  const emptyFormData: WorkflowFormData = useMemo(
    () => ({
      name: '',
      version: '',
      engine: ENGINE_OPTIONS[0],
      analysisId: '',
      parentNodeIds: [],
      description: '',
    }),
    []
  );

  const modalInitialData = useMemo<WorkflowFormData>(() => {
    if (!editingId || !workflows[editingId]) return emptyFormData;
    const w = workflows[editingId];
    return {
      name: w.label,
      version: w.version,
      engine: w.engine,
      analysisId: w.analysisIds[0] ?? '',
      parentNodeIds: getParentIdsForWorkflow(editingId),
      description: w.description,
    };
  }, [editingId, workflows, getParentIdsForWorkflow, emptyFormData]);

  // ── CRUD Handlers ──────────────────────────────────────────────────────

  const handleOpenAddModal = useCallback(() => {
    setEditingId(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingId(null);
  }, []);

  const handleCreateWorkflow = useCallback(
    (id: string, formData: WorkflowFormData) => {
      const newWorkflow: WorkflowNodeData = {
        label: formData.name,
        version: formData.version || 'v0.1.0',
        engine: formData.engine,
        description: formData.description,
        analysisIds: formData.analysisId ? [formData.analysisId] : [],
        inputEvents: [],
        outputEvents: [],
        config: { maxRetries: 1, timeout: '1h', computeQueue: 'default' },
      };

      // Calculate position: to the right of the rightmost parent, or a default
      let newX = 100;
      let newY = 500;
      if (formData.parentNodeIds.length > 0) {
        const parentPositions = formData.parentNodeIds.map((pid) => positions[pid]).filter(Boolean);
        if (parentPositions.length > 0) {
          newX = Math.max(...parentPositions.map((p) => p.x)) + 320;
          newY = parentPositions.reduce((sum, p) => sum + p.y, 0) / parentPositions.length;
        }
      } else {
        const allPos = Object.values(positions);
        if (allPos.length > 0) {
          newX = Math.max(...allPos.map((p) => p.x)) + 320;
          newY = allPos.reduce((sum, p) => sum + p.y, 0) / allPos.length;
        }
      }

      const newEdges: EdgeDef[] = formData.parentNodeIds.map((parentId) => ({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        edgeType: 'trigger_input' as const,
      }));

      setWorkflows((prev) => ({ ...prev, [id]: newWorkflow }));
      setPositions((prev) => ({ ...prev, [id]: { x: newX, y: newY } }));
      setCatalogEdges((prev) => [...prev, ...newEdges]);
      setSelectedWorkflowId(id);
    },
    [positions]
  );

  const handleUpdateWorkflow = useCallback((id: string, formData: WorkflowFormData) => {
    setWorkflows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        label: formData.name,
        version: formData.version || prev[id].version,
        engine: formData.engine,
        description: formData.description,
        analysisIds: formData.analysisId ? [formData.analysisId] : prev[id].analysisIds,
      },
    }));

    // Reconcile edges: remove old trigger/trigger_input edges targeting this node,
    // then add the new parent edges
    setCatalogEdges((prev) => {
      const kept = prev.filter((e) => !(e.target === id && e.edgeType !== 'input_dependency'));
      const newEdges: EdgeDef[] = formData.parentNodeIds.map((parentId) => ({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        edgeType: 'trigger_input' as const,
      }));
      return [...kept, ...newEdges];
    });
  }, []);

  const handleSubmitWorkflow = useCallback(
    (formData: WorkflowFormData) => {
      const id = editingId ?? slugify(formData.name);

      if (!editingId && workflows[id]) {
        const uniqueId = `${id}-${Date.now()}`;
        handleCreateWorkflow(uniqueId, formData);
      } else if (editingId) {
        handleUpdateWorkflow(editingId, formData);
      } else {
        handleCreateWorkflow(id, formData);
      }

      handleCloseModal();
    },
    [editingId, workflows, handleCloseModal, handleCreateWorkflow, handleUpdateWorkflow]
  );

  const handleDeleteWorkflow = useCallback(
    (id: string) => {
      setWorkflows((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setPositions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setCatalogEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
      if (selectedWorkflowId === id) setSelectedWorkflowId(null);
      setDeleteConfirmId(null);
    },
    [selectedWorkflowId]
  );

  const handleNodeClick = useCallback((id: string) => {
    setSelectedWorkflowId((prev) => (prev === id ? null : id));
  }, []);

  const handleUpdateWorkflowEvents = useCallback(
    (id: string, patch: { inputEvents?: EventDef[]; outputEvents?: EventDef[] }) => {
      setWorkflows((prev) => {
        const w = prev[id];
        if (!w) return prev;
        return {
          ...prev,
          [id]: {
            ...w,
            ...(patch.inputEvents !== undefined && { inputEvents: patch.inputEvents }),
            ...(patch.outputEvents !== undefined && { outputEvents: patch.outputEvents }),
          },
        };
      });
    },
    []
  );

  return (
    <div
      className='flex overflow-hidden bg-slate-50 dark:bg-[#101922]'
      style={{ height: 'calc(100vh - 56px)' }}
    >
      {/* ── Left Panel: Analysis List ──────────────────────────────── */}
      <div className='flex w-56 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
        {/* Back link + title */}
        <div className='border-b border-slate-100 px-4 pt-5 pb-4 dark:border-[#2d3540]'>
          <Link
            to='/tools'
            className='mb-3 inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-600 dark:text-[#9dabb9] dark:hover:text-white'
          >
            <ArrowLeft className='h-3 w-3' />
            Back to Tools
          </Link>
          <h1 className='text-sm font-bold text-slate-900 dark:text-white'>Analysis Type</h1>
        </div>

        {/* Analysis items */}
        <nav className='flex-1 overflow-y-auto py-2'>
          {ANALYSIS_LIST.map((analysis) => {
            const isActive = selectedAnalysis === analysis.id;
            return (
              <button
                key={analysis.id}
                type='button'
                onClick={() => setSelectedAnalysis(analysis.id)}
                className='group flex w-full items-center justify-between px-4 py-2.5 text-sm transition-all'
                style={
                  isActive
                    ? {
                        background: `${analysis.color}12`,
                        color: analysis.color,
                        fontWeight: 600,
                      }
                    : {}
                }
              >
                <span
                  className={
                    isActive
                      ? 'text-[13px]'
                      : 'text-[13px] text-slate-600 group-hover:text-slate-900 dark:text-[#9dabb9] dark:group-hover:text-white'
                  }
                >
                  {analysis.label}
                </span>
                <span
                  className={`min-w-[24px] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold ${
                    isActive
                      ? ''
                      : 'bg-slate-100 text-slate-500 dark:bg-[#1e252e] dark:text-[#9dabb9]'
                  }`}
                  style={
                    isActive
                      ? { background: `${analysis.color}20`, color: analysis.color }
                      : undefined
                  }
                >
                  {analysis.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* + New Workflow button */}
        <div className='px-4 pb-3'>
          <button
            type='button'
            onClick={handleOpenAddModal}
            className='flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          >
            <Plus className='h-4 w-4' />
            New Workflow
          </button>
        </div>

        {/* Footer legend */}
        <div className='border-t border-slate-100 px-4 py-3 dark:border-[#2d3540]'>
          <div className='mb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-[#9dabb9]'>
            Platform
          </div>
          <div className='space-y-1.5'>
            {Object.entries(ENGINE_COLORS).map(([engine, color]) => (
              <div key={engine} className='flex items-center gap-2'>
                <div className='h-2 w-2 shrink-0 rounded-full' style={{ background: color }} />
                <span className='text-[10px] text-slate-500 dark:text-[#9dabb9]'>{engine}</span>
              </div>
            ))}
          </div>

          <div className='mt-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-[#9dabb9]'>
            Edge Type
          </div>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <svg width='20' height='6'>
                <line x1='0' y1='3' x2='20' y2='3' stroke='#94a3b8' strokeWidth='2' />
              </svg>
              <span className='text-[10px] text-slate-500 dark:text-[#9dabb9]'>Trigger</span>
            </div>
            <div className='flex items-center gap-2'>
              <svg width='20' height='6'>
                <line
                  x1='0'
                  y1='3'
                  x2='20'
                  y2='3'
                  stroke='#94a3b8'
                  strokeWidth='1.5'
                  strokeDasharray='4 2'
                />
              </svg>
              <span className='text-[10px] text-slate-500 dark:text-[#9dabb9]'>
                Trigger + Input
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <svg width='20' height='6'>
                <line
                  x1='0'
                  y1='3'
                  x2='20'
                  y2='3'
                  stroke='#cbd5e1'
                  strokeWidth='1'
                  strokeDasharray='3 2'
                />
              </svg>
              <span className='text-[10px] text-slate-500 dark:text-[#9dabb9]'>Input Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────────────── */}
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        {/* Top bar */}
        <div className='flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 dark:border-[#2d3540] dark:bg-[#111418]'>
          <div className='relative max-w-sm flex-1'>
            <Search className='absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-[#9dabb9]' />
            <input
              type='text'
              placeholder='Search workflows…'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-8 pl-8 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:bg-[#1e252e] dark:focus:ring-indigo-400'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-[#9dabb9] dark:hover:text-white'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>

          {activeAnalysis && activeAnalysis.id !== 'ALL' && (
            <div
              className='flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium'
              style={{
                background: `${activeAnalysis.color}12`,
                color: activeAnalysis.color,
                border: `1px solid ${activeAnalysis.color}30`,
              }}
            >
              <div
                className='h-1.5 w-1.5 rounded-full'
                style={{ background: activeAnalysis.color }}
              />
              Focusing: {activeAnalysis.label}
            </div>
          )}

          <div className='ml-auto text-xs text-slate-400 dark:text-[#9dabb9]'>
            {Object.keys(workflows).length} workflows
          </div>
        </div>

        {/* Diagram + Drawer row */}
        <div className='flex min-h-0 flex-1 overflow-hidden'>
          <div className='relative flex-1'>
            {selectedAnalysis === 'ALL' && !searchQuery && (
              <div className='pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2'>
                <div className='max-w-xs rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-center text-sm text-slate-500 shadow-sm backdrop-blur-sm dark:border-[#2d3540] dark:bg-[#1e252e]/90 dark:text-[#9dabb9]'>
                  Select an analysis to focus the diagram, or search workflows to explore.
                </div>
              </div>
            )}
            <DiagramInner
              selectedAnalysis={selectedAnalysis}
              onNodeClick={handleNodeClick}
              searchQuery={searchQuery}
              workflows={workflows}
              positions={positions}
              catalogEdges={catalogEdges}
            />
          </div>

          {selectedWorkflowId && (
            <div className='flex w-[480px] shrink-0 flex-col overflow-hidden border-l border-slate-200 dark:border-[#2d3540]'>
              <WorkflowDrawer
                workflowId={selectedWorkflowId}
                workflows={workflows}
                onClose={() => setSelectedWorkflowId(null)}
                onEdit={handleOpenEditModal}
                onDelete={(id) => setDeleteConfirmId(id)}
                onUpdateEvents={handleUpdateWorkflowEvents}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <WorkflowModal
        isOpen={isModalOpen}
        editingId={editingId}
        initialData={modalInitialData}
        allWorkflowIds={allWorkflowIds}
        allWorkflowLabels={allWorkflowLabels}
        onSubmit={handleSubmitWorkflow}
        onClose={handleCloseModal}
      />

      {deleteConfirmId && workflows[deleteConfirmId] && (
        <DeleteConfirmDialog
          workflowLabel={workflows[deleteConfirmId].label}
          onConfirm={() => handleDeleteWorkflow(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}

export function WorkflowCatalogPage() {
  return (
    <ReactFlowProvider>
      <WorkflowCatalogContent />
    </ReactFlowProvider>
  );
}
