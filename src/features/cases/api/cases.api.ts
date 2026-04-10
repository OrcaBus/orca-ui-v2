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
import type { components, paths } from '@/api/types/case.openapi.d.ts';
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
export type CaseRequestModel = components['schemas']['CaseRequest'];
export type PatchedCaseDetailRequestModel = components['schemas']['PatchedCaseDetailRequest'];
export type CaseExternalEntityLinkCreateRequestModel =
  components['schemas']['CaseExternalEntityLinkCreateRequest'];
export type CaseExternalEntityLinkModel =
  components['schemas']['CaseExternalEntityLinkCreateRequest'];
export type CaseExternalEntityUnlinkModel = components['schemas']['CaseExternalEntityLinkRequest'];

export const useCaseListModel = createSuspenseQueryHook(caseApi, '/api/v1/case/');
export const useCaseDetailModel = createSuspenseQueryHook(caseApi, '/api/v1/case/{orcabusId}/');
export const useCaseCreateModel = createPostMutationHook(caseApi, '/api/v1/case/');
export const useCaseUpdateModel = createPatchMutationHook(caseApi, '/api/v1/case/{orcabusId}/');
export const useCaseDeleteModel = createDeleteMutationHook(caseApi, '/api/v1/case/{orcabusId}/');

export const useCaseUnlinkEntityModel = createDeleteMutationHook(
  caseApi,
  '/api/v1/case/{orcabusId}/external-entity/{externalEntityOrcabusId}/'
);
export const useCaseLinkEntityModel = createPostMutationHook(
  caseApi,
  '/api/v1/case/link/external-entity/'
);

export const useCaseGenerateModel = createPostMutationHook(caseApi, '/api/v1/case/generate/');
