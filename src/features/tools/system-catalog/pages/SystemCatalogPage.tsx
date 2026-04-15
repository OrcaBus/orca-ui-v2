import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { CatalogNodeData, EventDef, EdgeDef, GroupItem } from '../types/system-catalog.types';
import type { NodeFormData } from '../types/system-catalog.types';
import {
  GROUP_LIST,
  PIPELINE_NODES,
  CATALOG_EDGES,
  NODE_POSITIONS,
  ENGINE_COLORS,
  MAP_LIST,
  EVENT_FLOW_NODES,
  EVENT_FLOW_EDGES,
  EVENT_FLOW_POSITIONS,
  EVENT_FLOW_GROUPS,
} from '../data';
import {
  NodeModal,
  DeleteConfirmDialog,
  DeleteGroupConfirmDialog,
  MapInner,
  NodeDrawer,
  MapDetailsModal,
  FloatingToolbar,
  GroupEditModal,
} from '../components';
import { MapEditModal } from '../components/MapEditModal';
import type { MapFormData } from '../components/MapEditModal';
import type { GroupFormData } from '../components/GroupEditModal';

import { buildParentEdges, parseNodeConfigJson, nodeToFormData } from '../utils/nodeForm';

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const ENGINE_OPTIONS = Object.keys(ENGINE_COLORS);

// ─── Main Page Component ───────────────────────────────────────────────────

function SystemCatalogContent() {
  const { mapId } = useParams<{ mapId: string }>();
  const map = useMemo(() => MAP_LIST.find((d) => d.mapId === mapId), [mapId]);

  const isEventFlow = mapId === 'orcabus-event-flow';

  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMapEditOpen, setIsMapEditOpen] = useState(false);

  // Mutable catalog state — conditionally load event-flow or pipeline data
  const [catalogNodes, setCatalogNodes] = useState<Record<string, CatalogNodeData>>(() => ({
    ...(isEventFlow ? EVENT_FLOW_NODES : PIPELINE_NODES),
  }));
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => ({
    ...(isEventFlow ? EVENT_FLOW_POSITIONS : NODE_POSITIONS),
  }));
  const [catalogEdges, setCatalogEdges] = useState<EdgeDef[]>(() => [
    ...(isEventFlow ? EVENT_FLOW_EDGES : CATALOG_EDGES),
  ]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Group state
  const [groups, setGroups] = useState<GroupItem[]>(() => [
    ...(isEventFlow ? EVENT_FLOW_GROUPS : GROUP_LIST),
  ]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupItem | null>(null);
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState<GroupItem | null>(null);

  const allNodes = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(catalogNodes).map(([id, n]) => [id, { label: n.label, engine: n.engine }])
      ),
    [catalogNodes]
  );

  const emptyFormData: NodeFormData = useMemo(
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

  const modalInitialData = useMemo<NodeFormData>(() => {
    if (!editingId || !catalogNodes[editingId]) return emptyFormData;
    return nodeToFormData(editingId, catalogNodes[editingId], catalogEdges);
  }, [editingId, catalogNodes, catalogEdges, emptyFormData]);

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

  const handleCreateNode = useCallback(
    (id: string, formData: NodeFormData) => {
      const tags = parseNodeConfigJson(formData.configJson) ?? {};
      const newNode: CatalogNodeData = {
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
          .map((parentLink) => positions[parentLink.nodeId])
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

      setCatalogNodes((prev) => ({ ...prev, [id]: newNode }));
      setPositions((prev) => ({ ...prev, [id]: { x: newX, y: newY } }));
      setCatalogEdges((prev) => [...prev, ...newEdges]);
      setSelectedNodeId(id);
    },
    [positions]
  );

  const handleUpdateNode = useCallback((id: string, formData: NodeFormData) => {
    const tags = parseNodeConfigJson(formData.configJson) ?? {};

    setCatalogNodes((prev) => ({
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

  const handleSubmitNode = useCallback(
    (formData: NodeFormData) => {
      const id = editingId ?? slugify(formData.name);

      if (!editingId && catalogNodes[id]) {
        const uniqueId = `${id}-${Date.now()}`;
        handleCreateNode(uniqueId, formData);
      } else if (editingId) {
        handleUpdateNode(editingId, formData);
      } else {
        handleCreateNode(id, formData);
      }

      handleCloseModal();
    },
    [editingId, catalogNodes, handleCloseModal, handleCreateNode, handleUpdateNode]
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      setCatalogNodes((prev) => {
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
      if (selectedNodeId === id) setSelectedNodeId(null);
      setDeleteConfirmId(null);
    },
    [selectedNodeId]
  );

  const handleNodeClick = useCallback((id: string) => {
    setSelectedNodeId((prev) => (prev === id ? null : id));
  }, []);

  const handleUpdateNodeEvents = useCallback(
    (id: string, patch: { inputEvents?: EventDef[]; outputEvents?: EventDef[] }) => {
      setCatalogNodes((prev) => {
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

  // ── Group CRUD Handlers ─────────────────────────────────────────────────

  const emptyGroupFormData: GroupFormData = useMemo(
    () => ({
      name: '',
      type: 'analysis' as const,
      color: '#6366f1',
      nodeIds: [],
    }),
    []
  );

  const groupModalInitialData = useMemo<GroupFormData>(() => {
    if (!editingGroup) return emptyGroupFormData;
    return {
      name: editingGroup.name,
      type: editingGroup.type as GroupFormData['type'],
      color: editingGroup.color,
      nodeIds: editingGroup.nodeIds,
    };
  }, [editingGroup, emptyGroupFormData]);

  const handleOpenAddGroup = useCallback(() => {
    setEditingGroup(null);
    setIsGroupModalOpen(true);
  }, []);

  const handleOpenEditGroup = useCallback((group: GroupItem) => {
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  }, []);

  const handleCloseGroupModal = useCallback(() => {
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  }, []);

  const handleSubmitGroup = useCallback(
    (data: GroupFormData) => {
      if (editingGroup) {
        // Update existing group
        setGroups((prev) =>
          prev.map((g) =>
            g.id === editingGroup.id
              ? {
                  ...g,
                  name: data.name,
                  type: data.type,
                  color: data.color,
                  nodeIds: data.nodeIds,
                  count: data.nodeIds.length,
                }
              : g
          )
        );
      } else {
        // Create new group
        const id = data.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
        const newGroup: GroupItem = {
          id,
          name: data.name,
          type: data.type,
          count: data.nodeIds.length,
          color: data.color,
          nodeIds: data.nodeIds,
        };
        setGroups((prev) => [...prev, newGroup]);
      }
      handleCloseGroupModal();
    },
    [editingGroup, handleCloseGroupModal]
  );

  const handleDeleteGroup = useCallback(
    (group: GroupItem) => {
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      if (selectedGroup === group.id) setSelectedGroup('ALL');
      setDeleteGroupConfirm(null);
    },
    [selectedGroup]
  );

  return (
    <div
      className='relative overflow-hidden bg-slate-50 dark:bg-[#101922]'
      style={{ height: 'calc(100vh - 56px)' }}
    >
      {/* ── Floating Toolbar ──────────────────────────────────────── */}
      <FloatingToolbar
        mapName={map?.name}
        groups={groups}
        selectedGroup={selectedGroup}
        searchQuery={searchQuery}
        nodeCount={Object.keys(catalogNodes).length}
        onMapNameClick={() => setIsDetailsOpen(true)}
        onSelectGroup={setSelectedGroup}
        onSearchChange={setSearchQuery}
        onAddNode={handleOpenAddModal}
        onAddGroup={handleOpenAddGroup}
        onEditGroup={handleOpenEditGroup}
        onDeleteGroup={(group) => setDeleteGroupConfirm(group)}
      />

      {/* ── Map + Drawer ─────────────────────────────────────────── */}
      <div className='flex h-full overflow-hidden'>
        <div className='relative flex-1'>
          <MapInner
            selectedGroup={selectedGroup}
            onNodeClick={handleNodeClick}
            searchQuery={searchQuery}
            catalogNodes={catalogNodes}
            positions={positions}
            catalogEdges={catalogEdges}
            groups={groups}
          />
        </div>

        {selectedNodeId && (
          <div className='z-30 flex w-120 shrink-0 flex-col overflow-hidden border-l border-slate-200 dark:border-[#2d3540]'>
            <NodeDrawer
              nodeId={selectedNodeId}
              nodes={catalogNodes}
              onClose={() => setSelectedNodeId(null)}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeleteConfirmId(id)}
              onUpdateEvents={handleUpdateNodeEvents}
            />
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <NodeModal
        isOpen={isModalOpen}
        editingId={editingId}
        initialData={modalInitialData}
        allNodes={allNodes}
        onSubmit={handleSubmitNode}
        onClose={handleCloseModal}
      />

      {deleteConfirmId && catalogNodes[deleteConfirmId] && (
        <DeleteConfirmDialog
          nodeLabel={catalogNodes[deleteConfirmId].label}
          onConfirm={() => handleDeleteNode(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {map && (
        <MapDetailsModal
          map={map}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onEdit={() => {
            setIsMapEditOpen(true);
          }}
        />
      )}

      {map && (
        <MapEditModal
          isOpen={isMapEditOpen}
          isEditing={true}
          initialData={{
            name: map.name,
            description: map.description,
            status: map.status,
            tagsJson: JSON.stringify(map.tags, null, 2),
          }}
          onSubmit={(data: MapFormData) => {
            // TODO: Persist updated map to backend
            console.log('Update map:', data);
          }}
          onClose={() => setIsMapEditOpen(false)}
        />
      )}

      <GroupEditModal
        isOpen={isGroupModalOpen}
        isEditing={editingGroup !== null}
        initialData={groupModalInitialData}
        allNodes={allNodes}
        engineColors={ENGINE_COLORS}
        onSubmit={handleSubmitGroup}
        onClose={handleCloseGroupModal}
      />

      {deleteGroupConfirm && (
        <DeleteGroupConfirmDialog
          groupName={deleteGroupConfirm.name}
          onConfirm={() => handleDeleteGroup(deleteGroupConfirm)}
          onCancel={() => setDeleteGroupConfirm(null)}
        />
      )}
    </div>
  );
}

export function SystemCatalogPage() {
  return (
    <ReactFlowProvider>
      <SystemCatalogContent />
    </ReactFlowProvider>
  );
}
