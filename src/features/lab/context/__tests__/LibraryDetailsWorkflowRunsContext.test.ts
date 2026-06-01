import { describe, expect, it } from 'vitest';
import type { WorkflowModel } from '@/features/runs/api/workflows.api';
import {
  groupLibraryDetailsWorkflowsByName,
  resolveLibraryDetailsWorkflowTypeGroup,
} from '../LibraryDetailsWorkflowRunsContext';

function workflow(name: string, orcabusId: string): WorkflowModel {
  return { name, orcabusId } as WorkflowModel;
}

describe('groupLibraryDetailsWorkflowsByName', () => {
  it('groups workflow records by name and dedupes workflow Orcabus IDs', () => {
    const groups = groupLibraryDetailsWorkflowsByName([
      workflow('sash', 'wf.1'),
      workflow('SASH', 'wf.1'),
      workflow('sash', 'wf.2'),
      workflow('dragen-wgts-dna', 'wf.3'),
    ]);

    expect(groups).toEqual([
      {
        key: 'dragen-wgts-dna',
        name: 'dragen-wgts-dna',
        workflowOrcabusIds: ['wf.3'],
      },
      {
        key: 'sash',
        name: 'sash',
        workflowOrcabusIds: ['wf.1', 'wf.2'],
      },
    ]);
  });
});

describe('resolveLibraryDetailsWorkflowTypeGroup', () => {
  const groups = groupLibraryDetailsWorkflowsByName([
    workflow('oncoanalyser-wgts-dna', 'wf.1'),
    workflow('sash', 'wf.2'),
  ]);

  it('returns null for All when workflow type is absent', () => {
    expect(resolveLibraryDetailsWorkflowTypeGroup(groups, undefined)).toBeNull();
  });

  it('matches workflow type query params case-insensitively', () => {
    expect(resolveLibraryDetailsWorkflowTypeGroup(groups, 'ONCOANALYSER-WGTS-DNA')).toEqual({
      key: 'oncoanalyser-wgts-dna',
      name: 'oncoanalyser-wgts-dna',
      workflowOrcabusIds: ['wf.1'],
    });
  });

  it('returns null for unknown workflow type names', () => {
    expect(resolveLibraryDetailsWorkflowTypeGroup(groups, 'unknown')).toBeNull();
  });
});
