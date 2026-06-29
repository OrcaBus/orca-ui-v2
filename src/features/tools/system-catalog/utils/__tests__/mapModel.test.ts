import { describe, expect, it } from 'vitest';
import type { MapFull } from '../../data/dynamodb-schema';
import { mapToSummary, normalizeMap } from '../mapModel';

function createMapFixture(): MapFull {
  return {
    mapId: 'catalog-map',
    name: 'Catalog Map',
    description: 'Fixture for model tests',
    status: 'active',
    version: 4,
    isDeleted: false,
    createdBy: 'tester',
    createdAt: '2026-04-22T00:00:00Z',
    updatedBy: 'tester',
    updatedAt: '2026-04-22T01:00:00Z',
    tags: {
      team: 'platform',
    },
    nodes: [
      {
        nodeId: 'api',
        nodeType: 'rest_api_service',
        label: 'API',
        version: 'v1.2.3',
        engine: 'AWS',
        description: 'REST API',
        groupIds: ['WRONG'],
        inputEvents: [
          {
            name: 'catalog.requested',
            payload: {
              id: '123',
            },
          },
        ],
        outputEvents: [
          {
            name: 'catalog.returned',
            payload: {
              ok: true,
            },
          },
        ],
        tags: {
          type: 'rest_api_service',
        },
        position: { x: 120, y: 240 },
      },
      {
        nodeId: 'worker',
        nodeType: 'execution_service',
        label: 'Worker',
        version: 'v9.9.9',
        engine: 'ICA',
        description: 'Async worker',
        groupIds: ['LEGACY'],
        inputEvents: [],
        outputEvents: [],
        tags: {
          type: 'execution_service',
        },
        position: { x: 520, y: 240 },
      },
    ],
    groups: [
      {
        groupId: 'SERVICES',
        name: 'Services',
        type: 'service',
        color: '#3b82f6',
        nodeIds: ['api', 'worker', 'worker'],
      },
    ],
    edges: [
      {
        edgeId: 'e-api-worker-rest_call',
        source: 'api',
        target: 'worker',
        edgeType: 'rest_call',
      },
      {
        edgeId: 'e-api-missing-rest_call',
        source: 'api',
        target: 'missing',
        edgeType: 'rest_call',
      },
      {
        edgeId: 'e-api-worker-rest_call',
        source: 'api',
        target: 'worker',
        edgeType: 'rest_call',
      },
    ],
    engineColors: {
      AWS: '#ff9900',
      ICA: '#06b6d4',
    },
  } as unknown as MapFull;
}

describe('mapModel', () => {
  it('normalizes canonical group membership while preserving node data', () => {
    const normalized = normalizeMap(createMapFixture());

    expect(normalized.groups).toEqual([
      {
        groupId: 'SERVICES',
        name: 'Services',
        type: 'service',
        color: '#3b82f6',
        nodeIds: ['api', 'worker'],
      },
    ]);
    expect(normalized.nodes.find((node) => node.nodeId === 'api')).toMatchObject({
      nodeType: 'resource',
      resourceType: 'rest_api_service',
      groupIds: ['SERVICES'],
      position: { x: 120, y: 240 },
      inputEvents: [
        {
          name: 'catalog.requested',
          payload: {
            id: '123',
          },
        },
      ],
      outputEvents: [
        {
          name: 'catalog.returned',
          payload: {
            ok: true,
          },
        },
      ],
    });
    expect(normalized.nodes.find((node) => node.nodeId === 'worker')).toMatchObject({
      nodeType: 'resource',
      resourceType: 'execution_service',
      groupIds: ['SERVICES'],
    });
    expect(normalized.nodes.find((node) => node.nodeId === 'api')).not.toHaveProperty('engine');
    expect(normalized.edges).toEqual([
      {
        edgeId: 'e-api-worker-rest_call',
        source: 'api',
        target: 'worker',
        edgeType: 'rest_call',
      },
    ]);
  });

  it('builds map summaries from normalized full maps', () => {
    const summary = mapToSummary(normalizeMap(createMapFixture()));

    expect(summary).toEqual({
      mapId: 'catalog-map',
      name: 'Catalog Map',
      description: 'Fixture for model tests',
      status: 'active',
      version: 4,
      isDeleted: false,
      createdBy: 'tester',
      createdAt: '2026-04-22T00:00:00Z',
      updatedBy: 'tester',
      updatedAt: '2026-04-22T01:00:00Z',
      nodeCount: 2,
      edgeCount: 1,
      tags: {
        team: 'platform',
      },
    });
  });
});
