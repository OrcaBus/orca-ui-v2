import { describe, expect, it } from 'vitest';
import type { DeployStatusStack, DeployStatusStackSummary } from '../../api/deploy-status.api';
import { mergeDeployStatusStacks } from '../deploy-status.rows';

const stacks: DeployStatusStack[] = [
  {
    orcabusId: 'cfs.01STACKA00000000000000000',
    stackId: '11111111-1111-1111-1111-111111111111',
    latestEventId: 'cfe.01EVENTA00000000000000000',
    stackName: 'AlphaStack',
  },
  {
    orcabusId: 'cfs.01STACKB00000000000000000',
    stackId: '22222222-2222-2222-2222-222222222222',
    latestEventId: 'cfe.01EVENTB00000000000000000',
    stackName: 'BetaStack',
  },
];

const summaries: DeployStatusStackSummary[] = [
  {
    stackId: stacks[1].stackId,
    stackName: stacks[1].stackName,
    status: 'UPDATE_IN_PROGRESS',
    modificationTimestamp: '2026-08-04T01:30:00Z',
  },
  {
    stackId: stacks[0].stackId,
    stackName: stacks[0].stackName,
    status: 'UPDATE_COMPLETE',
    modificationTimestamp: '2026-08-04T01:00:00Z',
    gitCommitId: 'abcdef1234567890', //pragma: allowlist secret
  },
  {
    stackId: '33333333-3333-3333-3333-333333333333',
    stackName: 'SummaryOnlyStack',
    status: 'CREATE_COMPLETE',
    modificationTimestamp: '2026-08-04T00:30:00Z',
  },
];

describe('mergeDeployStatusStacks', () => {
  it('preserves registry order and joins summaries by stackId', () => {
    const result = mergeDeployStatusStacks(stacks, summaries);

    expect(result.map((row) => row.stackName)).toEqual(['AlphaStack', 'BetaStack']);
    expect(result[0].summary).toEqual(summaries[1]);
    expect(result[1].summary).toEqual(summaries[0]);
  });

  it('keeps registry rows when a summary is unavailable', () => {
    const result = mergeDeployStatusStacks(stacks, [summaries[0]]);

    expect(result).toHaveLength(2);
    expect(result[0].summary).toBeNull();
    expect(result[1].summary).toEqual(summaries[0]);
  });
});
