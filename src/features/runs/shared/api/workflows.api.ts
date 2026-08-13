import config from '@/app/config';
import type { paths, components, operations } from '@/api/types/workflow.openapi.d.ts';
import {
  ApiClient,
  getVersionedPath,
  createQueryHook,
  createQueryModel,
  createSuspenseQueryHook,
  createPostMutationHook,
  createPatchMutationHook,
  createDeleteMutationHook,
} from '@/api/client';
import { env } from '@/utils/env';

const apiVersion = env.VITE_WORKFLOW_API_VERSION as string;

const workflowApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.workflow,
  getPath: (path) => getVersionedPath(path, apiVersion),
});

// path constants for invalidating react query caches after mutations
export const WORKFLOWRUNS_LIST_PATH = workflowApi.resolvePath('/api/v1/workflowrun/');
export const WORKFLOWRUNS_STATUS_COUNT_PATH = workflowApi.resolvePath(
  '/api/v1/stats/workflow_run/status_counts/'
);

// export component types for consumers
export type ExecutionEngineEnum = components['schemas']['ExecutionEngineEnum'];
export type RunContext = components['schemas']['RunContext'];
export type Readset = components['schemas']['Readset'];
export type CommentSeverityEnum = components['schemas']['SeverityEnum'];

export type WorkflowModel = components['schemas']['Workflow'];
export type WorkflowStatusEnum = components['schemas']['StatusEnum'];
export type WorkflowListModel = components['schemas']['WorkflowList'];
export type WorkflowHistoryModel = components['schemas']['WorkflowHistory'];
export type ValidationStateEnum = components['schemas']['ValidationStateEnum'];

export type WorkflowRunModel = components['schemas']['WorkflowRunDetail'];
export type WorkflowRunListModel = components['schemas']['WorkflowRun'];
export type WorkflowRunListParamsModel = operations['workflowrunList']['parameters']['query'];
export type WorkflowRunPaginatedModel = components['schemas']['PaginatedWorkflowRunList'];
export type WorkflowRunRerunValidMapDataModel = components['schemas']['AllowedRerunWorkflow'];
export type WorkflowRunStateModel = components['schemas']['State'];
export type WorkflowRunCommentModel = components['schemas']['Comment'];
export type WorkflowRunStateTransitionRequestModel =
  components['schemas']['StateTransitionRequestRequest'];
export type WorkflowRunStateTransitionResponseModel =
  components['schemas']['StateTransitionResponse'];

export type AnalysisRunModel = components['schemas']['AnalysisRunDetail'];
export type AnalysisRunListModel = components['schemas']['AnalysisRun'];
export type AnalysisRunStateModel = components['schemas']['AnalysisRunState'];
export type AnalysisRunCommentModel = components['schemas']['Comment'];

export type AnalysisModel = components['schemas']['Analysis'];
export type AnalysisListModel = components['schemas']['AnalysisMin'];
export type AnalysisContextModel = components['schemas']['AnalysisContext'];
export type ComputeContextModel = components['schemas']['AnalysisContext'];
export type StorageContextModel = components['schemas']['AnalysisContext'];
export type AnalysisStatusEnum = components['schemas']['StatusEnum'];
export type UsecaseEnum = components['schemas']['UsecaseEnum'];

export type ListWorkflowModel = operations['workflowList']['parameters']['query'];
export type ListWorkflowRunModel = operations['workflowrunList']['parameters']['query'];
export type ListAnalysisRunModel = operations['analysisrunList']['parameters']['query'];
export type ListAnalysisModel = operations['analysisList']['parameters']['query'];
export type ListAnalysisContextModel = operations['analysiscontextList']['parameters']['query'];
export type ListRunContextModel = operations['runcontextList']['parameters']['query'];
export type DatasetEnum = components['schemas']['DatasetEnum'];

export type WorkflowRunStatsStatusCountModel = components['schemas']['WorkflowRunStatusCount'];
export type WorkflowStatusCountModel = components['schemas']['WorkflowStatusCount'];
export type AnalysisRunStatusCountModel = components['schemas']['AnalysisRunStatusCount'];
export type AnalysisStatusCountModel = components['schemas']['AnalysisStatusCount'];

// workflow model
export const useWorkflowModel = createQueryHook(workflowApi, '/api/v1/workflow/');
export const useWorkflowDetailModel = createQueryHook(workflowApi, '/api/v1/workflow/{orcabusId}/');
export const useWorkflowGroupedModel = createQueryHook(workflowApi, '/api/v1/workflow/grouped/');

// workflow run model
export const workflowRunListModel = createQueryModel(workflowApi, '/api/v1/workflowrun/');
export const useWorkflowRunListModel = createQueryHook(workflowApi, '/api/v1/workflowrun/');
export const useWorkflowRunDetailModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/'
);

// payload model
export const useWorkflowRunPayloadModel = createQueryHook(
  workflowApi,
  '/api/v1/payload/{orcabusId}/'
);

// workflow run comment model
export const useWorkflowRunCommentsListModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/comment/'
);
export const useWorkflowRunCommentCreateModel = createPostMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/comment/'
);
export const useWorkflowRunCommentUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/comment/{commentOrcabusId}/'
);
export const useWorkflowRunCommentDeleteModel = createDeleteMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/comment/{commentOrcabusId}/'
);

// workflow run state creation model
export const useWorkflowRunStateListModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/state/'
);
export const useWorkflowRunStateUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/state/{id}/'
);
export const useWorkflowRunStateCreationValidMapModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/state/get_states_transition_validation_map/'
);
export const useWorkflowRunStateCancelModel = createPostMutationHook(
  workflowApi,
  '/api/v1/workflowrun/state/cancel/'
);
export const useWorkflowRunStateDeprecateModel = createPostMutationHook(
  workflowApi,
  '/api/v1/workflowrun/state/deprecate/'
);
export const useWorkflowRunStateResolveModel = createPostMutationHook(
  workflowApi,
  '/api/v1/workflowrun/state/resolve/'
);

// workflow run list model
export const useSuspenseWorkflowRunListModel = createSuspenseQueryHook(
  workflowApi,
  '/api/v1/workflowrun/'
);
export const useSuspenseWorkflowModel = createSuspenseQueryHook(workflowApi, '/api/v1/workflow/');
export const useSuspensePayloadListModel = createSuspenseQueryHook(workflowApi, '/api/v1/payload/');

// analysis run model
export const useAnalysisRunListModel = createSuspenseQueryHook(workflowApi, '/api/v1/analysisrun/');
export const useAnalysisRunDetailModel = createQueryHook(
  workflowApi,
  '/api/v1/analysisrun/{orcabusId}/'
);

// analysis run comment model
export const useAnalysisRunCommentListModel = createQueryHook(
  workflowApi,
  '/api/v1/analysisrun/{orcabusId}/comment/'
);
export const useAnalysisRunCommentCreateModel = createPostMutationHook(
  workflowApi,
  '/api/v1/analysisrun/{orcabusId}/comment/'
);
export const useAnalysisRunCommentUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/analysisrun/{orcabusId}/comment/{commentOrcabusId}/'
);
export const useAnalysisRunCommentDeleteModel = createDeleteMutationHook(
  workflowApi,
  '/api/v1/analysisrun/{orcabusId}/comment/{commentOrcabusId}/'
);

// analysis model
export const useAnalysisListModel = createQueryHook(workflowApi, '/api/v1/analysis/');
export const useAnalysisCreateModel = createPostMutationHook(workflowApi, '/api/v1/analysis/');
export const useAnalysisDetailModel = createQueryHook(workflowApi, '/api/v1/analysis/{orcabusId}/');
export const useAnalysisDetailUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/analysis/{orcabusId}/'
);

// analysis context model
export const useAnalysisContextListModel = createQueryHook(workflowApi, '/api/v1/analysiscontext/');
export const useAnalysisContextCreateModel = createPostMutationHook(
  workflowApi,
  '/api/v1/analysiscontext/'
);
export const useAnalysisContextDetailModel = createQueryHook(
  workflowApi,
  '/api/v1/analysiscontext/{orcabusId}/'
);
export const useAnalysisContextDetailUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/analysiscontext/{orcabusId}/'
);

// library model
export const useLibraryListModel = createQueryHook(workflowApi, '/api/v1/library/');
export const useLibraryDetailModel = createQueryHook(workflowApi, '/api/v1/library/{orcabusId}/');

// run context model
export const useRunContextListModel = createQueryHook(workflowApi, '/api/v1/runcontext/');
export const useRunContextCreateModel = createPostMutationHook(workflowApi, '/api/v1/runcontext/');
export const useRunContextDetailModel = createQueryHook(
  workflowApi,
  '/api/v1/runcontext/{orcabusId}/'
);
export const useRunContextDetailUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/runcontext/{orcabusId}/'
);

// rerun model
export const useWorkflowRunRerunModel = createPostMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/rerun/'
);
export const useWorkflowRunRerunValidateModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/validate_rerun_workflows/'
);

// statistics model
export const useWorkflowRunStatusCountModel = createQueryHook(
  workflowApi,
  '/api/v1/stats/workflow_run/status_counts/'
);
export const useWorkflowStatusCountModel = createQueryHook(
  workflowApi,
  '/api/v1/stats/workflow/status_counts/'
);
export const useGroupedWorkflowStatusCountModel = createQueryHook(
  workflowApi,
  '/api/v1/stats/grouped_workflow/status_counts/'
);
export const useAnalysisRunStatusCountModel = createQueryHook(
  workflowApi,
  '/api/v1/stats/analysis_run/status_counts/'
);
export const useAnalysisStatusCountModel = createQueryHook(
  workflowApi,
  '/api/v1/stats/analysis/status_counts/'
);
