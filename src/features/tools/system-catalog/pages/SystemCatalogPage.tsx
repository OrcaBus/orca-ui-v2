import '@xyflow/react/dist/style.css';
import { useState, useCallback, useMemo, useEffect, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { toast } from 'sonner';
import { useAppShellHeader } from '@/context/app-shell-context';
import type { MapFull, MapGroup, MapNode } from '../data/dynamodb-schema';
import {
  systemCatalogMapQuery,
  systemCatalogMapsQuery,
  useDeleteSystemCatalogMap,
  useSaveSystemCatalogMapContent,
  useSystemCatalogMap,
  useUpdateSystemCatalogMap,
} from '../api/system-catalog.api';
import {
  NodeModal,
  DeleteConfirmDialog,
  DeleteMapConfirmDialog,
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
import type { EventDef, GroupFilterItem, NodeFormData } from '../types/system-catalog.types';
import { mapEditorReducer } from '../utils/mapEditor';
import { ALL_GROUP_ID, buildGroupFilters, buildNodeLookup, mapToSummary } from '../utils/mapModel';
import { nodeToFormData, parseNodeConfigJson } from '../utils/nodeForm';
import { WORKFLOW_ENGINE_OPTIONS, RESOURCE_TYPE_OPTIONS } from '../utils/nodeDisplay';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toRecord(nodes: MapNode[]): Record<string, MapNode> {
  return Object.fromEntries(nodes.map((node) => [node.nodeId, node]));
}

function parseTagsJson(value: string): Record<string, string> {
  try {
    const parsed = JSON.parse(value) as Record<string, string>;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isPreconditionFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as {
    status?: number;
    response?: { status?: number };
    code?: string;
    error?: { code?: string };
  };

  return (
    candidate.status === 412 ||
    candidate.response?.status === 412 ||
    candidate.code === 'PRECONDITION_FAILED' ||
    candidate.error?.code === 'PRECONDITION_FAILED'
  );
}

function buildNodeFromForm({
  nodeId,
  formData,
  position,
  existingNode,
}: {
  nodeId: string;
  formData: NodeFormData;
  position: MapNode['position'];
  existingNode?: MapNode;
}): MapNode {
  const tags = parseNodeConfigJson(formData.configJson) ?? {};
  const baseNode = {
    nodeId,
    label: formData.name,
    version: formData.version || existingNode?.version || 'v0.1.0',
    description: formData.description,
    groupIds: formData.groupIds,
    inputEvents: existingNode?.inputEvents ?? [],
    outputEvents: existingNode?.outputEvents ?? [],
    tags,
    position,
  };

  if (formData.nodeType === 'resource') {
    return {
      ...baseNode,
      nodeType: 'resource',
      resourceType: formData.resourceType,
    };
  }

  return {
    ...baseNode,
    nodeType: 'workflow',
    workflowEngine: formData.workflowEngine,
  };
}

function getNextNodePosition(map: MapFull, parentNodeIds: string[]): MapNode['position'] {
  const nodesById = toRecord(map.nodes);
  const parentPositions = parentNodeIds
    .map((nodeId) => nodesById[nodeId]?.position)
    .filter(Boolean);

  if (parentPositions.length > 0) {
    return {
      x: Math.max(...parentPositions.map((position) => position.x)) + 320,
      y: parentPositions.reduce((sum, position) => sum + position.y, 0) / parentPositions.length,
    };
  }

  if (map.nodes.length > 0) {
    return {
      x: Math.max(...map.nodes.map((node) => node.position.x)) + 320,
      y: map.nodes.reduce((sum: number, node) => sum + node.position.y, 0) / map.nodes.length,
    };
  }

  return { x: 100, y: 500 };
}

function buildListCacheUpdater(savedMap: MapFull) {
  const summary = mapToSummary(savedMap);

  return (
    previous: { maps?: ReturnType<typeof mapToSummary>[]; nextCursor?: string | null } | undefined
  ) => {
    if (!previous?.maps) {
      return previous;
    }

    const existingIndex = previous.maps.findIndex((map) => map.mapId === summary.mapId);
    if (existingIndex === -1) {
      return {
        ...previous,
        maps: [summary, ...previous.maps],
      };
    }

    return {
      ...previous,
      maps: previous.maps.map((map) => (map.mapId === summary.mapId ? summary : map)),
    };
  };
}

function SystemCatalogContent({ mapId }: { mapId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedGroup, setSelectedGroup] = useState(ALL_GROUP_ID);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMapEditOpen, setIsMapEditOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MapGroup | null>(null);
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState<MapGroup | null>(null);
  const [isMapDeleteConfirmOpen, setIsMapDeleteConfirmOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const {
    data: fetchedMap,
    isPending,
    isError,
  } = useSystemCatalogMap({
    params: {
      path: {
        mapId: mapId ?? '',
      },
    },
    reactQuery: {
      enabled: !!mapId,
    },
  });

  const [editorMap, dispatch] = useReducer(mapEditorReducer, null as MapFull | null);

  const updateMapMutation = useUpdateSystemCatalogMap();
  const saveContentMutation = useSaveSystemCatalogMapContent();
  const deleteMapMutation = useDeleteSystemCatalogMap();

  useEffect(() => {
    if (fetchedMap) {
      dispatch({ type: 'hydrate', map: fetchedMap });
    }
  }, [fetchedMap]);

  const applyEditorAction = useCallback((action: Parameters<typeof dispatch>[0]) => {
    dispatch(action);
    setIsDirty(true);
  }, []);

  const nodesById = useMemo(() => (editorMap ? toRecord(editorMap.nodes) : {}), [editorMap]);
  const allNodes = useMemo(() => (editorMap ? buildNodeLookup(editorMap.nodes) : {}), [editorMap]);
  const groupFilters = useMemo<GroupFilterItem[]>(
    () => (editorMap ? buildGroupFilters(editorMap.groups, editorMap.nodes.length) : []),
    [editorMap]
  );
  const mapSummary = useMemo(() => (editorMap ? mapToSummary(editorMap) : null), [editorMap]);
  const headerMapName =
    mapSummary?.name ?? fetchedMap?.name ?? (isError ? 'Unavailable' : 'Loading...');
  const headerConfig = useMemo(
    () => ({
      mode: 'detail' as const,
      breadcrumbs: [
        { label: 'Tools', href: '/tools' },
        { label: 'System Catalog', href: '/tools/system-catalog' },
        {
          label: headerMapName,
          isLoading: isPending,
        },
      ],
    }),
    [headerMapName, isPending]
  );

  useAppShellHeader(headerConfig);

  const emptyFormData: NodeFormData = useMemo(
    () => ({
      name: '',
      version: '',
      nodeType: 'workflow',
      resourceType: RESOURCE_TYPE_OPTIONS[0]?.value ?? 'aws_lambda',
      workflowEngine: WORKFLOW_ENGINE_OPTIONS[0]?.value ?? 'ICA',
      groupIds: [],
      parentLinks: [],
      description: '',
      configJson: '{}',
    }),
    []
  );

  const modalInitialData = useMemo<NodeFormData>(() => {
    if (!editingId || !editorMap) {
      return emptyFormData;
    }

    const node = nodesById[editingId];
    return node ? nodeToFormData(editingId, node, editorMap.edges) : emptyFormData;
  }, [editingId, editorMap, nodesById, emptyFormData]);

  const emptyGroupFormData = useMemo<GroupFormData>(
    () => ({
      name: '',
      description: '',
      type: 'analysis',
      color: '#6366f1',
      nodeIds: [],
    }),
    []
  );

  const groupModalInitialData = useMemo<GroupFormData>(() => {
    if (!editingGroup) {
      return emptyGroupFormData;
    }

    return {
      name: editingGroup.name,
      description: editingGroup.description ?? '',
      type: editingGroup.type,
      color: editingGroup.color,
      nodeIds: editingGroup.nodeIds,
    };
  }, [editingGroup, emptyGroupFormData]);

  const handleOpenAddModal = useCallback(() => {
    setEditingId(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((nodeId: string) => {
    setEditingId(nodeId);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingId(null);
  }, []);

  const handleSubmitNode = useCallback(
    (formData: NodeFormData) => {
      if (!editorMap) {
        return;
      }

      const nodeId = editingId ?? slugify(formData.name);
      const existingNode = editingId ? nodesById[editingId] : undefined;
      const resolvedNodeId = !editingId && nodesById[nodeId] ? `${nodeId}-${Date.now()}` : nodeId;
      const position =
        existingNode?.position ??
        getNextNodePosition(
          editorMap,
          formData.parentLinks.map((parentLink) => parentLink.nodeId)
        );

      applyEditorAction({
        type: 'upsertNode',
        nodeId: resolvedNodeId,
        node: buildNodeFromForm({
          nodeId: resolvedNodeId,
          formData,
          position,
          existingNode,
        }),
        groupIds: formData.groupIds,
        parentLinks: formData.parentLinks,
      });

      setSelectedNodeId(resolvedNodeId);
      handleCloseModal();
    },
    [editorMap, editingId, nodesById, applyEditorAction, handleCloseModal]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      applyEditorAction({ type: 'deleteNode', nodeId });
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
      setDeleteConfirmId(null);
    },
    [applyEditorAction, selectedNodeId]
  );

  const handleUpdateNodeEvents = useCallback(
    (nodeId: string, patch: { inputEvents?: EventDef[]; outputEvents?: EventDef[] }) => {
      applyEditorAction({ type: 'updateNodeEvents', nodeId, patch });
    },
    [applyEditorAction]
  );

  const handleOpenAddGroup = useCallback(() => {
    setEditingGroup(null);
    setIsGroupModalOpen(true);
  }, []);

  const handleOpenEditGroup = useCallback(
    (groupFilter: GroupFilterItem) => {
      if (!editorMap || groupFilter.id === ALL_GROUP_ID) {
        return;
      }

      const group = editorMap.groups.find((candidate) => candidate.groupId === groupFilter.id);
      if (!group) {
        return;
      }

      setEditingGroup(group);
      setIsGroupModalOpen(true);
    },
    [editorMap]
  );

  const handleCloseGroupModal = useCallback(() => {
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  }, []);

  const handleSubmitGroup = useCallback(
    (data: GroupFormData) => {
      const groupId = editingGroup?.groupId ?? data.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_');

      applyEditorAction({
        type: 'upsertGroup',
        group: {
          groupId,
          name: data.name,
          description: data.description || undefined,
          type: data.type,
          color: data.color,
          nodeIds: data.nodeIds,
        },
      });

      handleCloseGroupModal();
    },
    [editingGroup, applyEditorAction, handleCloseGroupModal]
  );

  const handleDeleteGroup = useCallback(
    (groupFilter: GroupFilterItem) => {
      if (groupFilter.id === ALL_GROUP_ID) {
        return;
      }

      applyEditorAction({ type: 'deleteGroup', groupId: groupFilter.id });
      if (selectedGroup === groupFilter.id) {
        setSelectedGroup(ALL_GROUP_ID);
      }
      setDeleteGroupConfirm(null);
    },
    [applyEditorAction, selectedGroup]
  );

  const handleUpdateNodePosition = useCallback(
    (nodeId: string, position: MapNode['position']) => {
      applyEditorAction({ type: 'updateNodePosition', nodeId, position });
    },
    [applyEditorAction]
  );

  const updateCaches = useCallback(
    (nextMap: MapFull) => {
      const mapQueryKey = systemCatalogMapQuery.queryOptions({
        params: {
          path: { mapId: nextMap.mapId },
        },
      }).queryKey;
      const listQueryKey = systemCatalogMapsQuery.queryOptions().queryKey;

      queryClient.setQueryData(mapQueryKey, nextMap);
      queryClient.setQueryData(listQueryKey, buildListCacheUpdater(nextMap));
    },
    [queryClient]
  );

  const handleSaveContent = useCallback(async () => {
    if (!editorMap || !mapId || !isDirty) {
      return;
    }

    try {
      const savedMap = await saveContentMutation.mutateAsync({
        params: {
          path: { mapId },
          header: {
            'If-Match': `"${editorMap.version}"`,
          },
        },
        body: {
          nodes: editorMap.nodes,
          groups: editorMap.groups,
          edges: editorMap.edges,
          engineColors: editorMap.engineColors,
        },
      });

      dispatch({ type: 'hydrate', map: savedMap });
      setIsDirty(false);
      updateCaches(savedMap);
      toast.success('System catalog changes saved.');
    } catch (error) {
      toast.error(
        isPreconditionFailure(error)
          ? 'This map changed on the server. Refresh before saving again.'
          : 'Unable to save system catalog changes.'
      );
    }
  }, [editorMap, mapId, isDirty, saveContentMutation, updateCaches]);

  const handleUpdateMap = useCallback(
    async (data: MapFormData) => {
      if (!editorMap || !mapId) {
        return;
      }

      try {
        const updatedMap = await updateMapMutation.mutateAsync({
          params: {
            path: { mapId },
            header: {
              'If-Match': `"${editorMap.version}"`,
            },
          },
          body: {
            name: data.name,
            description: data.description,
            status: data.status,
            tags: parseTagsJson(data.tagsJson),
          },
        });

        const mergedMap: MapFull = {
          ...editorMap,
          name: updatedMap.name,
          description: updatedMap.description,
          status: updatedMap.status,
          tags: updatedMap.tags,
          version: updatedMap.version,
          updatedAt: updatedMap.updatedAt,
          updatedBy: updatedMap.updatedBy,
        };

        dispatch({ type: 'hydrate', map: mergedMap });
        updateCaches(mergedMap);
        setIsMapEditOpen(false);
        toast.success('Map metadata updated.');
      } catch (error) {
        toast.error(
          isPreconditionFailure(error)
            ? 'This map changed on the server. Refresh before updating metadata again.'
            : 'Unable to update map metadata.'
        );
      }
    },
    [editorMap, mapId, updateMapMutation, updateCaches]
  );

  const handleArchiveMap = useCallback(async () => {
    if (!editorMap || !mapId) {
      return;
    }

    try {
      await deleteMapMutation.mutateAsync({
        params: {
          path: { mapId },
          header: {
            'If-Match': `"${editorMap.version}"`,
          },
        },
      });

      const listQueryKey = systemCatalogMapsQuery.queryOptions().queryKey;
      const mapQueryKey = systemCatalogMapQuery.queryOptions({
        params: {
          path: { mapId },
        },
      }).queryKey;

      queryClient.setQueryData(
        listQueryKey,
        (
          previous:
            | { maps?: ReturnType<typeof mapToSummary>[]; nextCursor?: string | null }
            | undefined
        ) => {
          if (!previous?.maps) {
            return previous;
          }

          return {
            ...previous,
            maps: previous.maps.filter((map) => map.mapId !== mapId),
          };
        }
      );
      queryClient.removeQueries({ queryKey: mapQueryKey });

      toast.success('Map archived.');
      void navigate('/tools/system-catalog');
    } catch (error) {
      toast.error(
        isPreconditionFailure(error)
          ? 'This map changed on the server. Refresh before archiving it.'
          : 'Unable to archive map.'
      );
    } finally {
      setIsMapDeleteConfirmOpen(false);
    }
  }, [deleteMapMutation, editorMap, mapId, navigate, queryClient]);

  if (isError) {
    return (
      <div
        className='flex items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-500 dark:bg-[#101922] dark:text-[#9dabb9]'
        style={{ height: 'calc(100vh - 56px)' }}
      >
        <div>
          <div className='font-medium text-slate-700 dark:text-slate-200'>
            Unable to load system catalog map.
          </div>
          <button
            type='button'
            onClick={() => void navigate('/tools/system-catalog')}
            className='mt-3 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white dark:border-[#2d3540] dark:text-slate-200 dark:hover:bg-[#1e252e]'
          >
            Back to maps
          </button>
        </div>
      </div>
    );
  }

  if (isPending || !editorMap || !mapSummary) {
    return (
      <div
        className='flex items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-[#101922] dark:text-[#9dabb9]'
        style={{ height: 'calc(100vh - 56px)' }}
      >
        Loading system catalog…
      </div>
    );
  }

  return (
    <div
      className='relative overflow-hidden bg-slate-50 dark:bg-[#101922]'
      style={{ height: 'calc(100vh - 56px)' }}
    >
      <FloatingToolbar
        mapName={editorMap.name}
        groups={groupFilters}
        selectedGroup={selectedGroup}
        searchQuery={searchQuery}
        nodeCount={editorMap.nodes.length}
        onMapNameClick={() => setIsDetailsOpen(true)}
        onSelectGroup={setSelectedGroup}
        onSearchChange={setSearchQuery}
        onAddNode={handleOpenAddModal}
        onSave={() => {
          void handleSaveContent();
        }}
        onAddGroup={handleOpenAddGroup}
        onEditGroup={handleOpenEditGroup}
        onDeleteGroup={(group) =>
          group.id !== ALL_GROUP_ID &&
          setDeleteGroupConfirm(
            editorMap.groups.find((candidate) => candidate.groupId === group.id) ?? null
          )
        }
        isDirty={isDirty}
        isSaving={saveContentMutation.isPending}
      />

      <div className='flex h-full overflow-hidden'>
        <div className='relative flex-1'>
          <MapInner
            selectedGroup={selectedGroup}
            onNodeClick={setSelectedNodeId}
            onNodePositionChange={handleUpdateNodePosition}
            searchQuery={searchQuery}
            nodes={editorMap.nodes}
            edges={editorMap.edges}
            groups={editorMap.groups}
            engineColors={editorMap.engineColors}
          />
        </div>

        {selectedNodeId && (
          <div className='z-30 flex w-120 shrink-0 flex-col overflow-hidden border-l border-slate-200 dark:border-[#2d3540]'>
            <NodeDrawer
              nodeId={selectedNodeId}
              nodes={nodesById}
              groups={editorMap.groups}
              onClose={() => setSelectedNodeId(null)}
              onEdit={handleOpenEditModal}
              onDelete={(nodeId) => setDeleteConfirmId(nodeId)}
              onUpdateEvents={handleUpdateNodeEvents}
            />
          </div>
        )}
      </div>

      <NodeModal
        isOpen={isModalOpen}
        editingId={editingId}
        initialData={modalInitialData}
        allNodes={allNodes}
        groups={editorMap.groups}
        onSubmit={handleSubmitNode}
        onClose={handleCloseModal}
      />

      {deleteConfirmId && nodesById[deleteConfirmId] && (
        <DeleteConfirmDialog
          nodeLabel={nodesById[deleteConfirmId].label}
          onConfirm={() => handleDeleteNode(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      <MapDetailsModal
        map={mapSummary}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={() => setIsMapEditOpen(true)}
        onDelete={() => setIsMapDeleteConfirmOpen(true)}
        isDeleting={deleteMapMutation.isPending}
      />

      <MapEditModal
        isOpen={isMapEditOpen}
        isEditing={true}
        initialData={{
          name: editorMap.name,
          description: editorMap.description,
          status: editorMap.status,
          tagsJson: JSON.stringify(editorMap.tags, null, 2),
        }}
        onSubmit={(data) => {
          void handleUpdateMap(data);
        }}
        onClose={() => setIsMapEditOpen(false)}
      />

      <GroupEditModal
        isOpen={isGroupModalOpen}
        isEditing={editingGroup !== null}
        initialData={groupModalInitialData}
        allNodes={allNodes}
        engineColors={editorMap.engineColors}
        onSubmit={handleSubmitGroup}
        onClose={handleCloseGroupModal}
      />

      {deleteGroupConfirm && (
        <DeleteGroupConfirmDialog
          groupName={deleteGroupConfirm.name}
          onConfirm={() =>
            handleDeleteGroup({
              id: deleteGroupConfirm.groupId,
              name: deleteGroupConfirm.name,
              type: deleteGroupConfirm.type,
              count: deleteGroupConfirm.nodeIds.length,
              color: deleteGroupConfirm.color,
              nodeIds: deleteGroupConfirm.nodeIds,
              description: deleteGroupConfirm.description,
            })
          }
          onCancel={() => setDeleteGroupConfirm(null)}
        />
      )}

      {isMapDeleteConfirmOpen && (
        <DeleteMapConfirmDialog
          mapName={editorMap.name}
          isDeleting={deleteMapMutation.isPending}
          onConfirm={() => {
            void handleArchiveMap();
          }}
          onCancel={() => setIsMapDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
}

export function SystemCatalogPage() {
  const { mapId } = useParams<{ mapId: string }>();

  return (
    <ReactFlowProvider>
      <SystemCatalogContent key={mapId ?? 'system-catalog'} mapId={mapId ?? ''} />
    </ReactFlowProvider>
  );
}
