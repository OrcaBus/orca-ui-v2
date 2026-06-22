import { describe, expect, it } from 'vitest';
import { getRunsSectionForPathname, getRunsSecondaryNavigation } from '../runsNavigation';

describe('getRunsSectionForPathname', () => {
  it.each([
    { pathname: '/runs', expected: 'overview' },
    { pathname: '/runs/', expected: 'overview' },
    { pathname: '/runs/overview', expected: 'overview' },
    { pathname: '/runs/sequence-runs', expected: 'sequence-runs' },
    {
      pathname: '/runs/sequence-runs/240201_A01052_0280_AHTV35DSX7',
      expected: 'sequence-runs',
    },
    { pathname: '/runs/workflow-runs', expected: 'workflow-runs' },
    {
      pathname: '/runs/workflow-runs/wfr.123',
      expected: 'workflow-runs',
    },
    {
      pathname: '/runs/workflow-runs/prid/portal-run-123',
      expected: 'workflow-runs',
    },
    { pathname: '/runs/analysis-runs', expected: 'analysis-runs' },
    {
      pathname: '/runs/analysis-runs/ar.123',
      expected: 'analysis-runs',
    },
    { pathname: '/runs/workflow-types', expected: 'workflow-types' },
    { pathname: '/runs/analysis-types', expected: 'analysis-types' },
    { pathname: '/runs/analysis-contexts', expected: 'analysis-contexts' },
    { pathname: '/runs/run-contexts', expected: 'run-contexts' },
  ])('matches $pathname to $expected', ({ pathname, expected }) => {
    expect(getRunsSectionForPathname(pathname)).toBe(expected);
  });

  it.each(['/lab', '/sequence', '/workflows', '/files', '/workflow-runs', '/tools/workflows'])(
    'returns null for non-runs pathname %s',
    (pathname) => {
      expect(getRunsSectionForPathname(pathname)).toBeNull();
    }
  );
});

describe('getRunsSecondaryNavigation', () => {
  it('renders overview as a standalone item before grouped navigation', () => {
    const navigation = getRunsSecondaryNavigation('/runs/analysis-types');

    expect(navigation).not.toBeNull();
    expect(navigation?.items).toEqual([
      expect.objectContaining({ id: 'overview', label: 'Overview' }),
    ]);
    expect(navigation?.groups).toEqual([
      expect.objectContaining({
        label: 'Runs',
        items: [
          expect.objectContaining({ id: 'sequence-runs', label: 'Sequence Runs' }),
          expect.objectContaining({ id: 'workflow-runs', label: 'Workflow Runs' }),
          expect.objectContaining({ id: 'analysis-runs', label: 'Analysis Runs' }),
        ],
      }),
      expect.objectContaining({
        label: 'Types',
        items: [
          expect.objectContaining({ id: 'workflow-types', label: 'Workflow Types' }),
          expect.objectContaining({ id: 'analysis-types', label: 'Analysis Types' }),
        ],
      }),
      expect.objectContaining({
        label: 'Contexts',
        items: [
          expect.objectContaining({ id: 'run-contexts', label: 'Run Contexts' }),
          expect.objectContaining({ id: 'analysis-contexts', label: 'Analysis Contexts' }),
        ],
      }),
    ]);
    expect(
      navigation?.groups.flatMap((group) => group.items).some((item) => item.id === 'overview')
    ).toBe(false);
    expect(navigation?.activeItemId).toBe('analysis-types');
  });

  it('marks overview active for the runs index and overview route', () => {
    expect(getRunsSecondaryNavigation('/runs')?.activeItemId).toBe('overview');
    expect(getRunsSecondaryNavigation('/runs/')?.activeItemId).toBe('overview');
    expect(getRunsSecondaryNavigation('/runs/overview')?.activeItemId).toBe('overview');
  });

  it('marks analysis contexts active for the contexts route', () => {
    const navigation = getRunsSecondaryNavigation('/runs/analysis-contexts');

    expect(navigation?.activeItemId).toBe('analysis-contexts');
  });

  it('marks run contexts active for the contexts route', () => {
    const navigation = getRunsSecondaryNavigation('/runs/run-contexts');

    expect(navigation?.activeItemId).toBe('run-contexts');
  });

  it('returns null outside runs routes', () => {
    expect(getRunsSecondaryNavigation('/lab')).toBeNull();
  });
});
