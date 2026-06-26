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

export type SyncGSheetRequestType = components['schemas']['SyncGSheetRequest'];

export type LibraryListQueryParams = operations['libraryList']['parameters']['query'];
export type SubjectListQueryParams = operations['subjectList']['parameters']['query'];
export type IndividualListQueryParams = operations['individualList']['parameters']['query'];
export type SampleListQueryParams = operations['sampleList']['parameters']['query'];
export type ContactListQueryParams = operations['contactList']['parameters']['query'];
export type ProjectListQueryParams = operations['projectList']['parameters']['query'];

export type LibraryDetailType = components['schemas']['LibraryDetail'];
export type LibraryHistoryType = components['schemas']['LibraryHistory'];

export type SubjectDetailType = components['schemas']['SubjectDetail'];
export type IndividualDetailType = components['schemas']['IndividualDetail'];
export type SampleDetailType = components['schemas']['SampleDetail'];
export type ContactDetailType = components['schemas']['ContactDetail'];
export type ProjectDetailType = components['schemas']['ProjectDetail'];

// Lab components can use these hooks to fetch data from the metadata API.
export const useQueryMetadataLibraryModel = createQueryHook(metadataApi, '/api/v1/library/');
export const useQueryMetadataDetailLibraryModel = createQueryHook(
  metadataApi,
  '/api/v1/library/{orcabusId}/'
);
export const useQueryMetadataDetailLibraryHistoryModel = createQueryHook(
  metadataApi,
  '/api/v1/library/{orcabusId}/history/'
);

export const useQueryMetadataSubjectModel = createQueryHook(metadataApi, '/api/v1/subject/');

export const useQueryMetadataIndividualModel = createQueryHook(metadataApi, '/api/v1/individual/');
export const useQueryMetadataSampleModel = createQueryHook(metadataApi, '/api/v1/sample/');
export const useQueryMetadataContactModel = createQueryHook(metadataApi, '/api/v1/contact/');
export const useQueryMetadataProjectModel = createQueryHook(metadataApi, '/api/v1/project/');

// Lab components can use these hooks to perform mutations (POST requests) to the metadata API.
export const useMutationSyncGsheet = createPostMutationHook(metadataApi, '/api/v1/sync/gsheet/');
export const useMutationSyncCustomCsv = createPostMutationHook(
  metadataApi,
  '/api/v1/sync/presigned-csv/'
);
export const useMutationPreviewGsheetRecords = createPostMutationHook(
  metadataApi,
  '/api/v1/sync/preview-gsheet/'
);
