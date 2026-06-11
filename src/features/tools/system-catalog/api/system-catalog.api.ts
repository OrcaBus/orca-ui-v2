import config from '@/app/config';
import type { components, operations, paths } from '@/api/types/system-catalog.openapi.d.ts';
import {
  ApiClient,
  createDeleteMutationHook,
  createPatchMutationHook,
  createPostMutationHook,
  createPutMutationHook,
  createQueryHook,
  createQueryModel,
} from '@/api/client';

const systemCatalogApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.systemCatalog || '',
});

export type SystemCatalogMapSummary = components['schemas']['MapSummary'];
export type SystemCatalogMapFull = components['schemas']['MapFull'];
export type SystemCatalogMapNode = components['schemas']['MapNode'];
export type SystemCatalogResourceType = components['schemas']['ResourceType'];
export type SystemCatalogWorkflowEngine = components['schemas']['WorkflowEngine'];
export type SystemCatalogMapHistoryEntry = components['schemas']['MapHistoryEntry'];
export type SystemCatalogCreateMapRequest = components['schemas']['CreateMapRequest'];
export type SystemCatalogUpdateMapMetadataRequest =
  components['schemas']['UpdateMapMetadataRequest'];
export type SystemCatalogSaveMapContentRequest = components['schemas']['SaveMapContentRequest'];

export type SystemCatalogMapListResponse =
  operations['listMaps']['responses']['200']['content']['application/json'];
export type SystemCatalogMapHistoryResponse =
  operations['getMapHistory']['responses']['200']['content']['application/json'];

export const systemCatalogMapsQuery = createQueryModel(systemCatalogApi, '/api/v1/maps');
export const systemCatalogMapQuery = createQueryModel(systemCatalogApi, '/api/v1/maps/{mapId}');
export const useSystemCatalogMaps = systemCatalogMapsQuery.useQuery;
export const useSystemCatalogMap = createQueryHook(systemCatalogApi, '/api/v1/maps/{mapId}');
export const useSystemCatalogMapHistory = createQueryHook(
  systemCatalogApi,
  '/api/v1/maps/{mapId}/history'
);

export const useCreateSystemCatalogMap = createPostMutationHook(systemCatalogApi, '/api/v1/maps');
export const useUpdateSystemCatalogMap = createPatchMutationHook(
  systemCatalogApi,
  '/api/v1/maps/{mapId}'
);
export const useSaveSystemCatalogMapContent = createPutMutationHook(
  systemCatalogApi,
  '/api/v1/maps/{mapId}/content'
);
export const useDeleteSystemCatalogMap = createDeleteMutationHook(
  systemCatalogApi,
  '/api/v1/maps/{mapId}'
);
