/**
 * Cases feature API layer. Currently uses mock data; replace with real API calls when integrating backend.
 */
import {
  mockCases,
  mockLibraries,
  mockWorkflowRuns,
  mockFiles,
  type Case,
  type Library,
  type WorkflowRun,
  type File,
} from '../../../data/mockData';

export type { Case, Library, WorkflowRun, File };

export function getCases(): Case[] {
  return mockCases;
}

export function getCaseById(id: string): Case | undefined {
  return mockCases.find((c) => c.id === id);
}

export function getLibraries(): Library[] {
  return mockLibraries;
}

export function getWorkflowRuns(): WorkflowRun[] {
  return mockWorkflowRuns;
}

export function getFiles(): File[] {
  return mockFiles;
}

import config from '@/app/config';
import type { components, paths, operations } from '@/api/types/case.openapi.d.ts';
import {
  ApiClient,
  getVersionedPath,
  createPostMutationHook,
  createPatchMutationHook,
  createDeleteMutationHook,
  createQueryHook,
} from '@/api/client';
import { env } from '@/utils/env';

const apiVersion = env.VITE_CASE_API_VERSION as string;
const caseApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.case,
  getPath: (path) => getVersionedPath(path, apiVersion),
});

export type CaseTypeEnum = components['schemas']['TypeEnum'];
export type CaseStudyTypeEnum = components['schemas']['StudyTypeEnum'];
export type CaseStatusEnum = components['schemas']['StatusEnum'];
export type ExternalServiceEnum = components['schemas']['ExternalServiceEnum'];

export type CaseExternalEntityLinkModel = components['schemas']['CaseExternalEntityLink'];
export type CaseUserLinkModel = components['schemas']['CaseUserLink'];
export type CaseStateModel = components['schemas']['State'];
export type CaseCommentModel = components['schemas']['Comment'];

export type CaseModel = components['schemas']['Case'];
export type CaseDetailModel = components['schemas']['CaseDetail'];

export type CaseRequestModel = components['schemas']['CaseDetailRequest'];
export type PatchedCaseDetailRequestModel = components['schemas']['PatchedCaseDetailRequest'];
export type CaseExternalEntityLinkCreateRequestModel =
  components['schemas']['CaseExternalEntityLinkCreateRequest'];
export type CaseExternalEntityUnlinkModel =
  operations['caseExternalEntityDestroy']['responses']['204']['content'];
export type ExternalSyncLogModel = components['schemas']['ExternalSyncLog'];

// case models
export const CASE_LIST_PATH = caseApi.resolvePath('/api/v1/case/');
export const useCaseListModel = createQueryHook(caseApi, '/api/v1/case/');
export const useCaseDetailModel = createQueryHook(caseApi, '/api/v1/case/{orcabusId}/');
export const useCaseCreateModel = createPostMutationHook(caseApi, '/api/v1/case/');
export const useCaseUpdateModel = createPatchMutationHook(caseApi, '/api/v1/case/{orcabusId}/');

// case sync
export const useCaseSyncFromRedcapAutoModel = createPostMutationHook(
  caseApi,
  '/api/v1/case/sync-from-redcap/auto/'
);
export const useCaseSyncFromRedcapAutoHistoryModel = createQueryHook(
  caseApi,
  '/api/v1/case/sync-from-redcap/auto/history/'
);
export const useCaseSyncFromRedcapModel = createPostMutationHook(
  caseApi,
  '/api/v1/case/{orcabusId}/sync-from-redcap/'
);

// case external entities
export const useCaseActivityModel = createQueryHook(caseApi, '/api/v1/case/{orcabusId}/activity/');
export const useCaseExternalEntityCreateModel = createPostMutationHook(
  caseApi,
  '/api/v1/case/{orcabusId}/external-entity/'
);
export const useCaseUnlinkEntityModel = createDeleteMutationHook(
  caseApi,
  '/api/v1/case/{orcabusId}/external-entity/{externalEntityOrcabusId}/'
);
export const useExternalEntityListModel = createQueryHook(caseApi, '/api/v1/external-entity/');
export const useCaseExternalEntityDetailModel = createQueryHook(
  caseApi,
  '/api/v1/external-entity/{orcabusId}/'
);

// case user management
export const useUsersListModel = createQueryHook(caseApi, '/api/v1/user/');
export const useUserDetailModel = createQueryHook(caseApi, '/api/v1/user/{orcabusId}/');
export const useCaseAddUserModel = createPostMutationHook(
  caseApi,
  '/api/v1/case/{orcabusId}/user/'
);
export const useCaseRemoveUserModel = createDeleteMutationHook(
  caseApi,
  '/api/v1/case/{orcabusId}/user/{userOrcabusId}/'
);

// case states
export const useStatesListModel = createQueryHook(caseApi, '/api/v1/state/');
export const useStateDetailModel = createQueryHook(caseApi, '/api/v1/state/{orcabusId}/');
export const useCaseStatesModel = createQueryHook(caseApi, '/api/v1/case/{orcabusId}/states/');
export const useStateCreateModel = createPostMutationHook(caseApi, '/api/v1/state/');
export const useCaseArchiveModel = createPatchMutationHook(
  caseApi,
  '/api/v1/state/{orcabusId}/archive/'
);

// case comments
export const useCommentsListModel = createQueryHook(caseApi, '/api/v1/comment/');
export const useCommentDetailModel = createQueryHook(caseApi, '/api/v1/comment/{orcabusId}/');
export const useCaseAddCommentModel = createPostMutationHook(caseApi, '/api/v1/comment/');
export const useCaseArchiveCommentModel = createPatchMutationHook(
  caseApi,
  '/api/v1/comment/{orcabusId}/archive/'
);
