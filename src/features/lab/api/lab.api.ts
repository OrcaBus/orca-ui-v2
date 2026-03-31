import { mockLibraries } from '@/data/mockData';
import type { Library as mockLibrary } from '../types/library.types';

export function getLibraries(): mockLibrary[] {
  return mockLibraries as mockLibrary[];
}

import config from '@/app/config';
import type { paths, components, operations } from '@/api/types/metadata.openapi.d.ts';
import { ApiClient, createQueryHook, createPostMutationHook } from '@/api/client';

const metadataApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.metadata,
});

export type PhenotypeEnum = components['schemas']['PhenotypeEnum'];
export type QualityEnum = components['schemas']['QualityEnum'];
export type TypeEnum = components['schemas']['TypeEnum'];
export type WorkflowEnum = components['schemas']['WorkflowEnum'];

export type LibraryListQueryParams = operations['libraryList']['parameters']['query'];
export type SubjectListQueryParams = operations['subjectList']['parameters']['query'];
export type IndividualListQueryParams = operations['individualList']['parameters']['query'];
export type SampleListQueryParams = operations['sampleList']['parameters']['query'];
export type ContactListQueryParams = operations['contactList']['parameters']['query'];
export type ProjectListQueryParams = operations['projectList']['parameters']['query'];

export type LibraryDetailType = components['schemas']['LibraryDetail'];

export const useQueryMetadataSubjectModel = createQueryHook(metadataApi, '/api/v1/subject/');
export const useQueryMetadataLibraryModel = createQueryHook(metadataApi, '/api/v1/library/');
export const useQueryMetadataDetailLibraryModel = createQueryHook(
  metadataApi,
  '/api/v1/library/{orcabusId}/'
);
export const useQueryMetadataDetailLibraryHistoryModel = createQueryHook(
  metadataApi,
  '/api/v1/library/{orcabusId}/history/'
);
export const useQueryMetadataIndividualModel = createQueryHook(metadataApi, '/api/v1/individual/');
export const useQueryMetadataSampleModel = createQueryHook(metadataApi, '/api/v1/sample/');
export const useQueryMetadataContactModel = createQueryHook(metadataApi, '/api/v1/contact/');
export const useQueryMetadataProjectModel = createQueryHook(metadataApi, '/api/v1/project/');

export const useMutationSyncGsheet = createPostMutationHook(metadataApi, '/api/v1/sync/gsheet/');
export const useMutationSyncCustomCsv = createPostMutationHook(
  metadataApi,
  '/api/v1/sync/presigned-csv/'
);
export const useMutationPreviewGsheetRecords = createPostMutationHook(
  metadataApi,
  '/api/v1/sync/preview-gsheet/'
);
