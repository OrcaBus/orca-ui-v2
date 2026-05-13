import config from '@/app/config';
import { ApiClient, createPostMutationHook } from '@/api/client';

interface components {
  schemas: {
    LoggingLevel: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    SsCheckRequest: {
      /** Binary sample sheet file uploaded through multipart/form-data. */
      file: string;
      logLevel: components['schemas']['LoggingLevel'];
    };
    ValidationResponse: {
      check_status: string;
      error_message?: string;
      log_file: string;
      v2_sample_sheet?: string;
    };
  };
}

interface operations {
  ssCheckCreate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'multipart/form-data': components['schemas']['SsCheckRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ValidationResponse'];
        };
      };
    };
  };
}

/** Minimal paths type for sscheck (no OpenAPI codegen for this service) */
interface SsCheckPaths {
  '/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['ssCheckCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}

export type LoggingLevel = components['schemas']['LoggingLevel'];
export type SSCheckRequest = components['schemas']['SsCheckRequest'];
export type ValidationResponse = components['schemas']['ValidationResponse'];

const sscheckApi = new ApiClient<SsCheckPaths>({
  baseUrl: config.apiEndpoint.sscheck,
});

export const useSSCheckPostMutation = createPostMutationHook(sscheckApi, '/');
