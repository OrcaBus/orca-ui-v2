/* eslint-disable react-refresh/only-export-components -- Pure grouping helpers are exported for focused unit tests. */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type FC,
  type PropsWithChildren,
} from 'react';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constants';
import { useWorkflowModel, type WorkflowModel } from '@/features/runs/shared/api/workflows.api';
import { useLibraryDetails } from './LibraryDetailsContext';
import { useLibraryDetailsWorkflowRunsQueryParams } from '../hooks/useLibraryDetailsWorkflowRunsQueryParams';

export type LibraryDetailsWorkflowTypeGroup = {
  key: string;
  name: string;
  workflowOrcabusIds: string[];
};

type LibraryDetailsWorkflowRunsContextType = {
  workflowTypeGroups: LibraryDetailsWorkflowTypeGroup[];
  selectedWorkflowTypeName: string;
  selectedWorkflowTypeGroup: LibraryDetailsWorkflowTypeGroup | null;
  selectedWorkflowOrcabusIds: string[];
  isAllWorkflowTypes: boolean;
  isSelectedWorkflowTypePending: boolean;
  isLoadingWorkflowTypes: boolean;
  isErrorWorkflowTypes: boolean;
  workflowTypesError: unknown;
  refetchWorkflowTypes: () => void;
};

const LibraryDetailsWorkflowRunsContext = createContext<
  LibraryDetailsWorkflowRunsContextType | undefined
>(undefined);

export function normalizeWorkflowTypeName(name: string | null | undefined): string {
  return String(name ?? '')
    .trim()
    .toLowerCase();
}

export function groupLibraryDetailsWorkflowsByName(
  workflows: WorkflowModel[] = []
): LibraryDetailsWorkflowTypeGroup[] {
  const groups = new Map<string, LibraryDetailsWorkflowTypeGroup>();

  for (const workflow of workflows) {
    const displayName = workflow.name || 'Unknown workflow';
    const key = normalizeWorkflowTypeName(displayName);
    const existing = groups.get(key);

    if (existing) {
      if (!existing.workflowOrcabusIds.includes(workflow.orcabusId)) {
        existing.workflowOrcabusIds.push(workflow.orcabusId);
      }
      continue;
    }

    groups.set(key, {
      key,
      name: displayName,
      workflowOrcabusIds: [workflow.orcabusId],
    });
  }

  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function resolveLibraryDetailsWorkflowTypeGroup(
  groups: LibraryDetailsWorkflowTypeGroup[],
  workflowTypeName: string | null | undefined
): LibraryDetailsWorkflowTypeGroup | null {
  const key = normalizeWorkflowTypeName(workflowTypeName);
  if (!key) return null;
  return groups.find((group) => group.key === key) ?? null;
}

export const LibraryDetailsWorkflowRunsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { libraryDetail, isLoadingLibraryDetail } = useLibraryDetails();
  const { workflowTypeName } = useLibraryDetailsWorkflowRunsQueryParams();

  const {
    data: relatedWorkflows,
    isLoading: isLoadingWorkflowTypes,
    isError: isErrorWorkflowTypes,
    error: workflowTypesError,
    refetch,
  } = useWorkflowModel({
    params: {
      query: {
        workflowrun__libraries__orcabusId: libraryDetail?.orcabusId ?? undefined,
        ordering: 'name',
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
      },
    },
    reactQuery: {
      enabled: !!libraryDetail && !isLoadingLibraryDetail,
    },
  });

  const workflowTypeGroups = useMemo(
    () => groupLibraryDetailsWorkflowsByName(relatedWorkflows?.results ?? []),
    [relatedWorkflows?.results]
  );

  const selectedWorkflowTypeName = workflowTypeName.trim();
  const selectedWorkflowTypeGroup = useMemo(
    () => resolveLibraryDetailsWorkflowTypeGroup(workflowTypeGroups, selectedWorkflowTypeName),
    [workflowTypeGroups, selectedWorkflowTypeName]
  );

  const hasWorkflowTypeSelection = selectedWorkflowTypeName.length > 0;
  const isSelectedWorkflowTypePending =
    hasWorkflowTypeSelection && isLoadingWorkflowTypes && !selectedWorkflowTypeGroup;
  const isAllWorkflowTypes =
    !hasWorkflowTypeSelection || (!isLoadingWorkflowTypes && !selectedWorkflowTypeGroup);

  const refetchWorkflowTypes = useCallback(() => {
    void refetch();
  }, [refetch]);

  const value = useMemo(
    () => ({
      workflowTypeGroups,
      selectedWorkflowTypeName,
      selectedWorkflowTypeGroup,
      selectedWorkflowOrcabusIds: selectedWorkflowTypeGroup?.workflowOrcabusIds ?? [],
      isAllWorkflowTypes,
      isSelectedWorkflowTypePending,
      isLoadingWorkflowTypes,
      isErrorWorkflowTypes,
      workflowTypesError,
      refetchWorkflowTypes,
    }),
    [
      workflowTypeGroups,
      selectedWorkflowTypeName,
      selectedWorkflowTypeGroup,
      isAllWorkflowTypes,
      isSelectedWorkflowTypePending,
      isLoadingWorkflowTypes,
      isErrorWorkflowTypes,
      workflowTypesError,
      refetchWorkflowTypes,
    ]
  );

  return (
    <LibraryDetailsWorkflowRunsContext.Provider value={value}>
      {children}
    </LibraryDetailsWorkflowRunsContext.Provider>
  );
};

export function useLibraryDetailsWorkflowRuns() {
  const context = useContext(LibraryDetailsWorkflowRunsContext);
  if (!context) {
    throw new Error(
      'useLibraryDetailsWorkflowRuns must be used within a LibraryDetailsWorkflowRunsProvider'
    );
  }
  return context;
}
