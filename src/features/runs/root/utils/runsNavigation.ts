import {
  Dna,
  Braces,
  FileBraces,
  ChartNoAxesColumn,
  CirclePlay,
  Workflow,
  Combine,
  LayoutDashboard,
} from 'lucide-react';
import type {
  SecondarySidebarGroup,
  SecondarySidebarItem,
} from '@/components/layout/SecondarySidebar';

export const RUNS_PAGE_SECTION_IDS = [
  'sequence-runs',
  'workflow-runs',
  'analysis-runs',
  'workflow-types',
  'analysis-types',
  'analysis-contexts',
  'run-contexts',
] as const;

export type RunsPageSectionId = (typeof RUNS_PAGE_SECTION_IDS)[number];

export const RUNS_NAVIGATION_ITEM_IDS = ['overview', ...RUNS_PAGE_SECTION_IDS] as const;

export type RunsNavigationItemId = (typeof RUNS_NAVIGATION_ITEM_IDS)[number];

export const RUNS_SECONDARY_NAVIGATION_ITEMS: SecondarySidebarItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    to: '/runs/overview',
    icon: LayoutDashboard,
  },
];

export const RUNS_SECONDARY_NAVIGATION_GROUPS: SecondarySidebarGroup[] = [
  {
    label: 'Runs',
    items: [
      {
        id: 'sequence-runs',
        label: 'Sequence Runs',
        to: '/runs/sequence-runs',
        icon: Dna,
      },
      {
        id: 'analysis-runs',
        label: 'Analysis Runs',
        to: '/runs/analysis-runs',
        icon: ChartNoAxesColumn,
      },
      {
        id: 'workflow-runs',
        label: 'Workflow Runs',
        to: '/runs/workflow-runs',
        icon: CirclePlay,
      },
    ],
  },
  {
    label: 'Types',
    items: [
      {
        id: 'workflow-types',
        label: 'Workflow Types',
        to: '/runs/workflow-types',
        icon: Workflow,
      },
      {
        id: 'analysis-types',
        label: 'Analysis Types',
        to: '/runs/analysis-types',
        icon: Combine,
      },
    ],
  },
  {
    label: 'Contexts',
    items: [
      {
        id: 'run-contexts',
        label: 'Run Contexts',
        to: '/runs/run-contexts',
        icon: Braces,
      },
      {
        id: 'analysis-contexts',
        label: 'Analysis Contexts',
        to: '/runs/analysis-contexts',
        icon: FileBraces,
      },
    ],
  },
];

const RUNS_NAVIGATION_PATHS: Array<{ id: RunsNavigationItemId; path: string }> = [
  { id: 'overview', path: '/runs/overview' },
  { id: 'sequence-runs', path: '/runs/sequence-runs' },
  { id: 'workflow-runs', path: '/runs/workflow-runs' },
  { id: 'analysis-runs', path: '/runs/analysis-runs' },
  { id: 'workflow-types', path: '/runs/workflow-types' },
  { id: 'analysis-types', path: '/runs/analysis-types' },
  { id: 'analysis-contexts', path: '/runs/analysis-contexts' },
  { id: 'run-contexts', path: '/runs/run-contexts' },
];

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

function isSameOrChildPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function getRunsSectionForPathname(pathname: string): RunsNavigationItemId | null {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === '/runs') {
    return 'overview';
  }

  const section = RUNS_NAVIGATION_PATHS.find(({ path }) =>
    isSameOrChildPath(normalizedPathname, path)
  );

  return section?.id ?? null;
}

export function getRunsSecondaryNavigation(pathname: string) {
  const activeItemId = getRunsSectionForPathname(pathname);

  if (!activeItemId) {
    return null;
  }

  return {
    ariaLabel: 'Runs navigation',
    items: RUNS_SECONDARY_NAVIGATION_ITEMS,
    groups: RUNS_SECONDARY_NAVIGATION_GROUPS,
    activeItemId,
  };
}
