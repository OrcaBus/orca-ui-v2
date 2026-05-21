import config from '@/app/config';
import type { paths, components } from '@/api/types/file.openapi.d.ts';
import {
  ApiClient,
  createQueryHook,
  createQueryModel,
  createSuspenseQueryHook,
} from '@/api/client';

const fileApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.file,
});

export type S3Record = components['schemas']['ListResponse_S3']['results'][number];

export const fileObjectListModel = createQueryModel(fileApi, '/api/v1/s3');
export const useFileObjectListModel = createQueryHook(fileApi, '/api/v1/s3');

export const useSuspenseFilePresignedURLModel = createSuspenseQueryHook(
  fileApi,
  '/api/v1/s3/presign/{id}'
);

export const useFilePresignedURLModel = createQueryHook(fileApi, '/api/v1/s3/presign/{id}');

export const useSuspenseFilePresignedURLListModel = createSuspenseQueryHook(
  fileApi,
  '/api/v1/s3/presign'
);

export const useFilePresignedURLListModel = createQueryHook(fileApi, '/api/v1/s3/presign');
