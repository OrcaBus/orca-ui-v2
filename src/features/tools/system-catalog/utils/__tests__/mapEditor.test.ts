import { describe, expect, it } from 'vitest';
import type { MapFull, MapGroup, MapNode } from '../../data/dynamodb-schema';
import { mapEditorReducer } from '../mapEditor';

function createMapFixture(): MapFull {
  const nodes: MapNode[] = [
    {
      nodeId: 'source',
      nodeType: 'workflow',
      workflowEngine: 'ICA',
      label: 'Source',
      version: 'v1.0.0',
      description: 'Source node',
      groupIds: [],
      inputEvents: [],
      outputEvents: [],
      tags: {},
      position: { x: 0, y: 0 },
    },
    {
      nodeId: 'target',
      nodeType: 'workflow',
      workflowEngine: 'AWS_BATCH',
      label: 'Target',
      version: 'v1.0.0',
      description: 'Target node',
      groupIds: [],
      inputEvents: [],
      outputEvents: [],
      tags: {},
      position: { x: 320, y: 0 },
    },
  ];

  const groups: MapGroup[] = [
    {
      groupId: 'ANALYSIS',
      name: 'Analysis',
      type: 'analysis',
      color: '#3b82f6',
      nodeIds: ['source'],
    },
  ];

  return {
    mapId: 'test-map',
    name: 'Test Map',
    description: 'Fixture',
    status: 'draft',
    version: 1,
    isDeleted: false,
    createdBy: 'tester',
    createdAt: '2026-04-22T00:00:00Z',
    updatedBy: 'tester',
    updatedAt: '2026-04-22T00:00:00Z',
    tags: {},
    nodes,
    groups,
    edges: [
      {
        edgeId: 'e-source-target-trigger',
        source: 'source',
        target: 'target',
        edgeType: 'trigger',
      },
    ],
    engineColors: {
      ICA: '#06b6d4',
      AWS: '#ff9900',
    },
  };
}

describe('mapEditorReducer', () => {
  it('hydrates node groupIds from canonical group membership', () => {
    const map = mapEditorReducer(null, { type: 'hydrate', map: createMapFixture() });

    expect(map?.nodes.find((node) => node.nodeId === 'source')?.groupIds).toEqual(['ANALYSIS']);
    expect(map?.nodes.find((node) => node.nodeId === 'target')?.groupIds).toEqual([]);
  });

  it('reconciles groups when a node is updated', () => {
    const initial = mapEditorReducer(null, { type: 'hydrate', map: createMapFixture() });
    const next = mapEditorReducer(initial, {
      type: 'upsertNode',
      nodeId: 'target',
      node: {
        ...(initial as MapFull).nodes.find((node) => node.nodeId === 'target')!,
        label: 'Target Updated',
      },
      groupIds: ['ANALYSIS'],
      parentLinks: [{ nodeId: 'source', edgeType: 'trigger_input' }],
    });

    expect(next?.groups[0].nodeIds).toEqual(['source', 'target']);
    expect(next?.nodes.find((node) => node.nodeId === 'target')?.groupIds).toEqual(['ANALYSIS']);
    expect(next?.edges).toEqual([
      {
        edgeId: 'e-source-target-trigger_input',
        source: 'source',
        target: 'target',
        edgeType: 'trigger_input',
      },
    ]);
  });

  it('removes dangling memberships and edges when deleting a node', () => {
    const initial = mapEditorReducer(null, { type: 'hydrate', map: createMapFixture() });
    const next = mapEditorReducer(initial, { type: 'deleteNode', nodeId: 'source' });

    expect(next?.nodes.map((node) => node.nodeId)).toEqual(['target']);
    expect(next?.groups[0].nodeIds).toEqual([]);
    expect(next?.edges).toEqual([]);
  });

  it('removes group memberships from nodes when deleting a group', () => {
    const initial = mapEditorReducer(null, { type: 'hydrate', map: createMapFixture() });
    const next = mapEditorReducer(initial, { type: 'deleteGroup', groupId: 'ANALYSIS' });

    expect(next?.groups).toEqual([]);
    expect(next?.nodes.find((node) => node.nodeId === 'source')?.groupIds).toEqual([]);
  });
});
