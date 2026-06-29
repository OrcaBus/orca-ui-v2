import { describe, expect, it } from 'vitest';
import type { MapEdge, MapNode } from '../../data/dynamodb-schema';
import { buildParentEdges, parseNodeConfigJson, nodeToFormData } from '../nodeForm';

describe('parseNodeConfigJson', () => {
  it('parses valid string tag values', () => {
    expect(parseNodeConfigJson('{"queue":"ica-prod","timeout":"8h"}')).toEqual({
      queue: 'ica-prod',
      timeout: '8h',
    });
  });

  it('rejects non-string values', () => {
    expect(parseNodeConfigJson('{"maxRetries":2}')).toBeNull();
  });

  it('treats blank input as an empty tag map', () => {
    expect(parseNodeConfigJson('   ')).toEqual({});
  });
});

describe('nodeToFormData', () => {
  it('hydrates tag JSON and parent edge types for editing', () => {
    const catalogNode: MapNode = {
      nodeId: 'bcl-convert',
      nodeType: 'workflow',
      workflowEngine: 'ICA',
      label: 'BCL Convert',
      version: 'v4.2.7',
      description: 'Converts BCL to FASTQ.',
      groupIds: ['SEQUENCING', 'WGS'],
      inputEvents: [],
      outputEvents: [],
      tags: {
        computeQueue: 'ica-prod-bcl-convert',
        timeout: '8h',
      },
      position: { x: 280, y: 330 },
    };

    const edges: MapEdge[] = [
      {
        edgeId: 'e-bssh-bcl-trigger',
        source: 'bssh',
        target: 'bcl-convert',
        edgeType: 'trigger',
      },
      {
        edgeId: 'e-sequencer-bcl-input_dependency',
        source: 'sequencer',
        target: 'bcl-convert',
        edgeType: 'input_dependency',
      },
    ];

    expect(nodeToFormData('bcl-convert', catalogNode, edges)).toMatchObject({
      name: 'BCL Convert',
      version: 'v4.2.7',
      nodeType: 'workflow',
      workflowEngine: 'ICA',
      groupIds: ['SEQUENCING', 'WGS'],
      parentLinks: [
        { nodeId: 'bssh', edgeType: 'trigger' },
        { nodeId: 'sequencer', edgeType: 'input_dependency' },
      ],
      description: 'Converts BCL to FASTQ.',
    });

    expect(nodeToFormData('bcl-convert', catalogNode, edges).configJson).toBe(
      '{\n  "computeQueue": "ica-prod-bcl-convert",\n  "timeout": "8h"\n}'
    );
  });
});

describe('buildParentEdges', () => {
  it('preserves the selected edge type for each parent node', () => {
    expect(
      buildParentEdges('wgs-tumor-normal', [
        { nodeId: 'wgs-alignment-qc', edgeType: 'trigger_input' },
        { nodeId: 'bcl-convert', edgeType: 'input_dependency' },
      ])
    ).toEqual([
      {
        edgeId: 'e-wgs-alignment-qc-wgs-tumor-normal-trigger_input',
        source: 'wgs-alignment-qc',
        target: 'wgs-tumor-normal',
        edgeType: 'trigger_input',
      },
      {
        edgeId: 'e-bcl-convert-wgs-tumor-normal-input_dependency',
        source: 'bcl-convert',
        target: 'wgs-tumor-normal',
        edgeType: 'input_dependency',
      },
    ]);
  });

  it('preserves labels on unchanged existing edges', () => {
    expect(
      buildParentEdges(
        'wgs-tumor-normal',
        [{ nodeId: 'bcl-convert', edgeType: 'input_dependency' }],
        [
          {
            edgeId: 'e-bcl-convert-wgs-tumor-normal-input_dependency',
            source: 'bcl-convert',
            target: 'wgs-tumor-normal',
            edgeType: 'input_dependency',
            label: 'use FASTQs as input',
          },
        ]
      )
    ).toEqual([
      {
        edgeId: 'e-bcl-convert-wgs-tumor-normal-input_dependency',
        source: 'bcl-convert',
        target: 'wgs-tumor-normal',
        edgeType: 'input_dependency',
        label: 'use FASTQs as input',
      },
    ]);
  });
});
