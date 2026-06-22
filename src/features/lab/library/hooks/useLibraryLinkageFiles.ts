import { useMemo } from 'react';
import { useQueries, type UseQueryOptions } from '@tanstack/react-query';
import { fileObjectListModel, type S3Record } from '@/features/files/api/files.api';
import {
  workflowRunListModel,
  type WorkflowRunListModel,
  type WorkflowRunPaginatedModel,
} from '@/features/runs/shared/api/workflows.api';
import type { LibraryDetailType } from '../../shared/api/lab.api';
import {
  buildLatestWorkflowRunQueryParams,
  buildLinkageFileQueryParams,
  getLibraryLinkageWorkflowConfigs,
  groupLibraryLinkageFiles,
  type LibraryLinkageFileGroup,
  type LibraryLinkageWorkflowConfig,
} from '../utils/libraryLinkage';

type UseLibraryLinkageFilesOptions = {
  libraryDetail: LibraryDetailType | null | undefined;
  enabled?: boolean;
};

type LatestWorkflowRun = {
  config: LibraryLinkageWorkflowConfig;
  workflowRun: WorkflowRunListModel;
};

type FileObjectListData = {
  links?: {
    next?: string | null;
  };
  results: S3Record[];
};

type LinkageQueryOptions<TData> = UseQueryOptions<TData, Error, TData, readonly unknown[]>;

export type UseLibraryLinkageFilesResult = {
  workflowConfigs: LibraryLinkageWorkflowConfig[];
  latestWorkflowRuns: LatestWorkflowRun[];
  groupedFiles: LibraryLinkageFileGroup[];
  fileCount: number;
  hasMatchingWorkflowConfig: boolean;
  hasLatestWorkflowRuns: boolean;
  hasTruncatedFileResults: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
};

export function useLibraryLinkageFiles({
  libraryDetail,
  enabled = true,
}: UseLibraryLinkageFilesOptions): UseLibraryLinkageFilesResult {
  const workflowConfigs = useMemo(
    () => getLibraryLinkageWorkflowConfigs(libraryDetail),
    [libraryDetail]
  );

  const libraryOrcabusId = libraryDetail?.orcabusId;
  const canQueryWorkflowRuns = enabled && !!libraryOrcabusId && workflowConfigs.length > 0;

  const workflowRunQueries = useQueries({
    queries: workflowConfigs.map((config): LinkageQueryOptions<WorkflowRunPaginatedModel> => {
      const queryOptions = workflowRunListModel.queryOptions({
        params: {
          query: buildLatestWorkflowRunQueryParams({
            libraryOrcabusId: libraryOrcabusId ?? '',
            workflowNames: config.workflowNames,
          }),
        },
      }) as unknown as LinkageQueryOptions<WorkflowRunPaginatedModel>;

      return {
        ...queryOptions,
        enabled: canQueryWorkflowRuns,
      };
    }),
  });

  const latestWorkflowRuns = useMemo(
    () =>
      workflowRunQueries
        .map((query, index): LatestWorkflowRun | null => {
          const data = query.data;
          const workflowRun = data?.results?.[0];
          const config = workflowConfigs[index];

          if (!workflowRun || !config) {
            return null;
          }

          return { config, workflowRun };
        })
        .filter((item): item is LatestWorkflowRun => item !== null),
    [workflowRunQueries, workflowConfigs]
  );

  const fileQueries = useQueries({
    queries: latestWorkflowRuns.map(
      ({ config, workflowRun }): LinkageQueryOptions<FileObjectListData> => {
        const queryOptions = fileObjectListModel.queryOptions({
          params: {
            query: buildLinkageFileQueryParams({
              portalRunId: workflowRun.portalRunId,
              keyPatterns: config.keyPatterns,
            }),
          },
        }) as unknown as LinkageQueryOptions<FileObjectListData>;

        return {
          ...queryOptions,
          enabled: enabled && !!workflowRun.portalRunId,
        };
      }
    ),
  });

  const fileRecords = useMemo(
    () =>
      fileQueries.flatMap((query) => {
        const data = query.data;
        return data?.results ?? [];
      }),
    [fileQueries]
  );

  const groupedFiles = useMemo(() => groupLibraryLinkageFiles(fileRecords), [fileRecords]);

  const hasTruncatedFileResults = fileQueries.some((query) => {
    const data = query.data;
    return !!data?.links?.next;
  });

  const isLoading =
    workflowRunQueries.some((query) => query.isLoading) ||
    fileQueries.some((query) => query.isLoading);
  const isFetching =
    workflowRunQueries.some((query) => query.isFetching) ||
    fileQueries.some((query) => query.isFetching);
  const isError =
    workflowRunQueries.some((query) => query.isError) || fileQueries.some((query) => query.isError);

  const refetch = async () => {
    await Promise.all([...workflowRunQueries, ...fileQueries].map((query) => query.refetch()));
  };

  return {
    workflowConfigs,
    latestWorkflowRuns,
    groupedFiles,
    fileCount: fileRecords.length,
    hasMatchingWorkflowConfig: workflowConfigs.length > 0,
    hasLatestWorkflowRuns: latestWorkflowRuns.length > 0,
    hasTruncatedFileResults,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
