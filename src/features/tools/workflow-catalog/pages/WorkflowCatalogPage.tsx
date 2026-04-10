import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Search, X, Plus, ChevronDown, Layers } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { WorkflowNodeData, EventDef, EdgeDef } from '../types/workflow-catalog.types';
import type { WorkflowFormData } from '../types/workflow-catalog.types';
import {
  GROUP_LIST,
  WORKFLOW_CATALOG,
  CATALOG_EDGES,
  NODE_POSITIONS,
  ENGINE_COLORS,
  DIAGRAM_LIST,
} from '../data';
import {
  WorkflowModal,
  DeleteConfirmDialog,
  DiagramInner,
  WorkflowDrawer,
  DiagramDetailsModal,
} from '../components';
import {
  buildParentEdges,
  parseWorkflowConfigJson,
  workflowNodeToFormData,
} from '../utils/workflowForm';

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
  const { diagramId } = useParams<{ diagramId: string }>();
  const diagram = useMemo(() => DIAGRAM_LIST.find((d) => d.diagramId === diagramId), [diagramId]);

  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  const activeGroup = GROUP_LIST.find((g) => g.id === selectedGroup);

  const allWorkflows = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(workflows).map(([id, workflow]) => [
          id,
          { label: workflow.label, engine: workflow.engine },
        ])
      ),
    [workflows]
  );

  const emptyFormData: WorkflowFormData = useMemo(
    () => ({
      name: '',
      version: '',
      engine: ENGINE_OPTIONS[0],
      groupId: '',
      parentLinks: [],
      description: '',
      configJson: '{}',
    }),
    []
  );

  const modalInitialData = useMemo<WorkflowFormData>(() => {
    if (!editingId || !workflows[editingId]) return emptyFormData;
    return workflowNodeToFormData(editingId, workflows[editingId], catalogEdges);
  }, [editingId, workflows, catalogEdges, emptyFormData]);

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
      const tags = parseWorkflowConfigJson(formData.configJson) ?? {};
      const newWorkflow: WorkflowNodeData = {
        label: formData.name,
        version: formData.version || 'v0.1.0',
        engine: formData.engine,
        description: formData.description,
        groupIds: formData.groupId ? [formData.groupId] : [],
        inputEvents: [],
        outputEvents: [],
        tags,
      };

      // Calculate position: to the right of the rightmost parent, or a default
      let newX = 100;
      let newY = 500;
      if (formData.parentLinks.length > 0) {
        const parentPositions = formData.parentLinks
          .map((parentLink) => positions[parentLink.workflowId])
          .filter(Boolean);
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

      const newEdges = buildParentEdges(id, formData.parentLinks);

      setWorkflows((prev) => ({ ...prev, [id]: newWorkflow }));
      setPositions((prev) => ({ ...prev, [id]: { x: newX, y: newY } }));
      setCatalogEdges((prev) => [...prev, ...newEdges]);
      setSelectedWorkflowId(id);
    },
    [positions]
  );

  const handleUpdateWorkflow = useCallback((id: string, formData: WorkflowFormData) => {
    const tags = parseWorkflowConfigJson(formData.configJson) ?? {};

    setWorkflows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        label: formData.name,
        version: formData.version || prev[id].version,
        engine: formData.engine,
        description: formData.description,
        groupIds: formData.groupId ? [formData.groupId] : prev[id].groupIds,
        tags,
      },
    }));

    setCatalogEdges((prev) => {
      const kept = prev.filter((edge) => edge.target !== id);
      const newEdges = buildParentEdges(id, formData.parentLinks, prev);
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

  // Toolbar dropdown state
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close group dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(e.target as Node)) {
        setIsGroupDropdownOpen(false);
      }
    }
    if (isGroupDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isGroupDropdownOpen]);

  // Auto-focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  return (
    <div
      className='relative overflow-hidden bg-slate-50 dark:bg-[#101922]'
      style={{ height: 'calc(100vh - 56px)' }}
    >
      {/* ── Floating Toolbar ──────────────────────────────────────── */}
      <div className='pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-3'>
        <div className='pointer-events-auto flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/95 px-2.5 py-1.5 shadow-lg shadow-slate-200/50 backdrop-blur-sm dark:border-[#2d3540]/80 dark:bg-[#111418]/95 dark:shadow-black/20'>
          {/* Back button */}
          <Link
            to='/tools/workflow-catalog'
            className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:bg-[#1e252e] dark:hover:text-white'
            title='Back to Diagrams'
          >
            <ArrowLeft className='h-4 w-4' />
          </Link>

          {/* Diagram name (opens details modal) */}
          {diagram && (
            <button
              type='button'
              onClick={() => setIsDetailsOpen(true)}
              className='max-w-48 truncate rounded-lg px-2 py-1 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-[#1e252e]'
              title='View diagram details'
            >
              {diagram.name}
            </button>
          )}

          <div className='mx-0.5 h-5 w-px bg-slate-200 dark:bg-[#2d3540]' />

          {/* Group dropdown */}
          <div ref={groupDropdownRef} className='relative'>
            <button
              type='button'
              onClick={() => setIsGroupDropdownOpen((prev) => !prev)}
              className='flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#1e252e]'
            >
              {activeGroup && activeGroup.id !== 'ALL' ? (
                <>
                  <div className='h-2 w-2 rounded-full' style={{ background: activeGroup.color }} />
                  <span className='max-w-35 truncate'>{activeGroup.name}</span>
                </>
              ) : (
                <>
                  <Layers className='h-3.5 w-3.5 text-slate-400 dark:text-[#6b7a8d]' />
                  <span>All Groups</span>
                </>
              )}
              <ChevronDown className='h-3 w-3 text-slate-400 dark:text-[#6b7a8d]' />
            </button>

            {isGroupDropdownOpen && (
              <div className='absolute top-full left-0 mt-1.5 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#2d3540] dark:bg-[#111418]'>
                <div className='p-1.5'>
                  {GROUP_LIST.map((group) => {
                    const isActive = selectedGroup === group.id;
                    return (
                      <button
                        key={group.id}
                        type='button'
                        onClick={() => {
                          setSelectedGroup(group.id);
                          setIsGroupDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-slate-100 font-medium text-slate-900 dark:bg-[#1e252e] dark:text-white'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]/60'
                        }`}
                      >
                        <div
                          className='h-2 w-2 shrink-0 rounded-full'
                          style={{ background: group.color }}
                        />
                        <span className='flex-1 truncate'>{group.name}</span>
                        <span className='text-xs text-slate-400 dark:text-[#6b7a8d]'>
                          {group.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className='border-t border-slate-100 p-1.5 dark:border-[#2d3540]'>
                  <button
                    type='button'
                    className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                  >
                    <Plus className='h-3.5 w-3.5' />
                    Add Group
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active group badge */}
          {activeGroup && activeGroup.id !== 'ALL' && (
            <button
              type='button'
              onClick={() => setSelectedGroup('ALL')}
              className='flex h-6 items-center gap-1 rounded-full pr-1 pl-2 text-xs font-medium transition-colors'
              style={{
                background: `${activeGroup.color}15`,
                color: activeGroup.color,
              }}
            >
              Focused
              <X className='h-3 w-3 opacity-60' />
            </button>
          )}

          <div className='mx-0.5 h-5 w-px bg-slate-200 dark:bg-[#2d3540]' />

          {/* Search */}
          <div className='flex items-center'>
            {isSearchExpanded ? (
              <div className='relative'>
                <Search className='absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-[#6b7a8d]' />
                <input
                  ref={searchInputRef}
                  type='text'
                  placeholder='Search nodes…'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery) setIsSearchExpanded(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchQuery('');
                      setIsSearchExpanded(false);
                    }
                  }}
                  className='h-8 w-48 rounded-lg border border-slate-200 bg-white py-1 pr-7 pl-8 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#6b7a8d] dark:focus:ring-blue-900/40'
                />
                {searchQuery && (
                  <button
                    type='button'
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className='absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:text-white'
                  >
                    <X className='h-3 w-3' />
                  </button>
                )}
              </div>
            ) : (
              <button
                type='button'
                onClick={() => setIsSearchExpanded(true)}
                className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:bg-[#1e252e] dark:hover:text-white'
                title='Search nodes'
              >
                <Search className='h-4 w-4' />
              </button>
            )}
          </div>

          <div className='mx-0.5 h-5 w-px bg-slate-200 dark:bg-[#2d3540]' />

          {/* Add node */}
          <button
            type='button'
            onClick={handleOpenAddModal}
            className='flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          >
            <Plus className='h-3.5 w-3.5' />
            <span className='hidden sm:inline'>Add Node</span>
          </button>

          <div className='mx-0.5 h-5 w-px bg-slate-200 dark:bg-[#2d3540]' />

          {/* Node count */}
          <span className='px-1 text-xs text-slate-400 dark:text-[#6b7a8d]'>
            {Object.keys(workflows).length} nodes
          </span>
        </div>
      </div>

      {/* ── Diagram + Drawer ──────────────────────────────────────── */}
      <div className='flex h-full overflow-hidden'>
        <div className='relative flex-1'>
          <DiagramInner
            selectedGroup={selectedGroup}
            onNodeClick={handleNodeClick}
            searchQuery={searchQuery}
            workflows={workflows}
            positions={positions}
            catalogEdges={catalogEdges}
          />
        </div>

        {selectedWorkflowId && (
          <div className='z-30 flex w-120 shrink-0 flex-col overflow-hidden border-l border-slate-200 dark:border-[#2d3540]'>
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

      {/* ── Modals ────────────────────────────────────────────────── */}
      <WorkflowModal
        isOpen={isModalOpen}
        editingId={editingId}
        initialData={modalInitialData}
        allWorkflows={allWorkflows}
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

      {diagram && (
        <DiagramDetailsModal
          diagram={diagram}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onEdit={() => {
            // TODO: Enter edit mode for the diagram
          }}
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
