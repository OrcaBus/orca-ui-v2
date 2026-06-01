import { isValidElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Navigate, type RouteObject } from 'react-router';
import runsRoutes from '../routes';

function getRoutes(): RouteObject[] {
  return Array.isArray(runsRoutes) ? runsRoutes : [runsRoutes];
}

function findRoute(path: string) {
  return getRoutes().find((route) => route.path === path);
}

function findChild(route: RouteObject | undefined, path: string) {
  return route?.children?.find((child) => child.path === path);
}

function getNavigateTo(route: RouteObject | undefined) {
  if (!route || !isValidElement(route.element) || route.element.type !== Navigate) {
    return null;
  }

  return (route.element.props as { to: string }).to;
}

describe('runs routes', () => {
  it('defines canonical runs routes with overview as the default section', () => {
    const runsRoute = findRoute('/runs');

    expect(runsRoute).toBeDefined();
    expect(getNavigateTo(runsRoute?.children?.find((child) => child.index))).toBe('overview');
    expect(findChild(runsRoute, 'overview')).toBeDefined();
    expect(findChild(runsRoute, 'sequence-runs')).toBeDefined();
    expect(findChild(runsRoute, 'sequence-runs/:instrumentRunId')).toBeDefined();
    expect(findChild(runsRoute, 'workflow-runs')).toBeDefined();
    expect(findChild(runsRoute, 'workflow-runs/prid/:portalRunId')).toBeDefined();
    expect(findChild(runsRoute, 'workflow-runs/:workflowRunOrcabusId')).toBeDefined();
    expect(findChild(runsRoute, 'analysis-runs')).toBeDefined();
    expect(findChild(runsRoute, 'analysis-runs/:analysisRunOrcabusId')).toBeDefined();
    expect(findChild(runsRoute, 'workflow-types')).toBeDefined();
    expect(findChild(runsRoute, 'analysis-types')).toBeDefined();
    expect(findChild(runsRoute, 'analysis-contexts')).toBeDefined();
    expect(findChild(runsRoute, 'run-contexts')).toBeDefined();
    expect(findChild(runsRoute, 'sequence-runs/instrument-runs/:instrumentRunId')).toBeUndefined();
  });

  it('does not define legacy sequence and workflows redirect routes', () => {
    expect(findRoute('/sequence')).toBeUndefined();
    expect(findRoute('/workflows')).toBeUndefined();
  });
});
