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
  createSuspenseQueryHook,
} from '@/api/client';
import { env } from '@/utils/env';

const apiVersion = env.VITE_SEQUENCE_RUN_API_VERSION as string;
const caseApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.case,
  getPath: (path) => getVersionedPath(path, apiVersion),
});

export type CaseModel = components['schemas']['Case'];
export type CaseDetailModel = components['schemas']['CaseDetail'];
export type CaseRequestModel = components['schemas']['CaseDetailRequest'];
export type PatchedCaseDetailRequestModel = components['schemas']['PatchedCaseDetailRequest'];
export type CaseExternalEntityLinkCreateRequestModel =
  components['schemas']['CaseExternalEntityLinkCreateRequest'];
export type CaseExternalEntityLinkModel =
  components['schemas']['CaseExternalEntityLinkCreateRequest'];
export type CaseExternalEntityUnlinkModel =
  operations['caseExternalEntityDestroy']['responses']['204']['content'];

// case models
export const useCaseListModel = createSuspenseQueryHook(caseApi, '/api/v1/case/');
export const useCaseDetailModel = createSuspenseQueryHook(caseApi, '/api/v1/case/{orcabusId}/');
export const useCaseCreateModel = createPostMutationHook(caseApi, '/api/v1/case/');
export const useCaseUpdateModel = createPatchMutationHook(caseApi, '/api/v1/case/{orcabusId}/');

// case activity and external entities
export const useCaseActivityModel = createSuspenseQueryHook(
  caseApi,
  '/api/v1/case/{orcabusId}/activity/'
);
export const useCaseExternalEntityCreateModel = createPostMutationHook(
  caseApi,
  '/api/v1/case/{orcabusId}/external-entity/'
);
export const useCaseUnlinkEntityModel = createDeleteMutationHook(
  caseApi,
  '/api/v1/case/{orcabusId}/external-entity/{externalEntityOrcabusId}/'
);

// case user management
export const useCaseAddUserModel = createPostMutationHook(
  caseApi,
  '/api/v1/case/{orcabusId}/user/'
);
export const useCaseRemoveUserModel = createDeleteMutationHook(
  caseApi,
  '/api/v1/case/{orcabusId}/user/{userOrcabusId}/'
);

// case states
export const useCaseStatesModel = createSuspenseQueryHook(
  caseApi,
  '/api/v1/case/{orcabusId}/states/'
);
export const useCaseStateCreateModel = createPostMutationHook(caseApi, '/api/v1/state/');

// case comments
export const useCaseCommentCreateModel = createPostMutationHook(caseApi, '/api/v1/comment/');
