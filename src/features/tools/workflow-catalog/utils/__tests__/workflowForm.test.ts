import { describe, expect, it } from 'vitest';
import type { EdgeDef, WorkflowNodeData } from '../../types/workflow-catalog.types';
import { buildParentEdges, parseWorkflowConfigJson, workflowNodeToFormData } from '../workflowForm';

describe('parseWorkflowConfigJson', () => {
  it('parses valid string tag values', () => {
    expect(parseWorkflowConfigJson('{"queue":"ica-prod","timeout":"8h"}')).toEqual({
      queue: 'ica-prod',
      timeout: '8h',
    });
  });

  it('rejects non-string values', () => {
    expect(parseWorkflowConfigJson('{"maxRetries":2}')).toBeNull();
  });

  it('treats blank input as an empty tag map', () => {
    expect(parseWorkflowConfigJson('   ')).toEqual({});
  });
});

describe('workflowNodeToFormData', () => {
  it('hydrates tag JSON and parent edge types for editing', () => {
    const workflow: WorkflowNodeData = {
      label: 'BCL Convert',
      version: 'v4.2.7',
      engine: 'ICA',
      description: 'Converts BCL to FASTQ.',
      groupIds: ['SEQUENCING', 'WGS'],
      inputEvents: [],
      outputEvents: [],
      tags: {
        computeQueue: 'ica-prod-bcl-convert',
        timeout: '8h',
      },
    };

    const edges: EdgeDef[] = [
      {
        id: 'e-bssh-bcl',
        source: 'bssh',
        target: 'bcl-convert',
        edgeType: 'trigger',
      },
      {
        id: 'e-sequencer-bcl',
        source: 'sequencer',
        target: 'bcl-convert',
        edgeType: 'input_dependency',
      },
    ];

    expect(workflowNodeToFormData('bcl-convert', workflow, edges)).toMatchObject({
      name: 'BCL Convert',
      version: 'v4.2.7',
      engine: 'ICA',
      groupId: 'SEQUENCING',
      parentLinks: [
        { workflowId: 'bssh', edgeType: 'trigger' },
        { workflowId: 'sequencer', edgeType: 'input_dependency' },
      ],
      description: 'Converts BCL to FASTQ.',
    });

    expect(workflowNodeToFormData('bcl-convert', workflow, edges).configJson).toBe(
      '{\n  "computeQueue": "ica-prod-bcl-convert",\n  "timeout": "8h"\n}'
    );
  });
});

describe('buildParentEdges', () => {
  it('preserves the selected edge type for each parent workflow', () => {
    expect(
      buildParentEdges('wgs-tumor-normal', [
        { workflowId: 'wgs-alignment-qc', edgeType: 'trigger_input' },
        { workflowId: 'bcl-convert', edgeType: 'input_dependency' },
      ])
    ).toEqual([
      {
        id: 'e-wgs-alignment-qc-wgs-tumor-normal',
        source: 'wgs-alignment-qc',
        target: 'wgs-tumor-normal',
        edgeType: 'trigger_input',
      },
      {
        id: 'e-bcl-convert-wgs-tumor-normal',
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
        [{ workflowId: 'bcl-convert', edgeType: 'input_dependency' }],
        [
          {
            id: 'e-bcl-convert-wgs-tumor-normal',
            source: 'bcl-convert',
            target: 'wgs-tumor-normal',
            edgeType: 'input_dependency',
            label: 'use FASTQs as input',
          },
        ]
      )
    ).toEqual([
      {
        id: 'e-bcl-convert-wgs-tumor-normal',
        source: 'bcl-convert',
        target: 'wgs-tumor-normal',
        edgeType: 'input_dependency',
        label: 'use FASTQs as input',
      },
    ]);
  });
});
