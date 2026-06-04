import { describe, expect, it, vi } from 'vitest';
import { createQueryHook, type ApiClient } from '../client';

type TestPaths = {
  '/api/v1/items/': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': { results: string[] };
          };
        };
      };
    };
  };
};

function createTestApi() {
  const useQuery = vi.fn(() => ({ data: undefined }));
  const api = {
    resolvePath: (path: string) => path,
    rq: { useQuery },
  } as unknown as ApiClient<TestPaths>;

  return { api, useQuery };
}

describe('createQueryHook', () => {
  it('returns API failures as query state by default when called without args', () => {
    const { api, useQuery } = createTestApi();
    const useItems = createQueryHook(api, '/api/v1/items/');

    useItems();

    expect(useQuery).toHaveBeenCalledWith('get', '/api/v1/items/', undefined, {
      throwOnError: false,
    });
  });

  it('returns API failures as query state by default when fetch init is provided', () => {
    const { api, useQuery } = createTestApi();
    const useItems = createQueryHook(api, '/api/v1/items/');

    useItems({
      params: { query: { search: 'library' } },
    } as never);

    expect(useQuery).toHaveBeenCalledWith(
      'get',
      '/api/v1/items/',
      { params: { query: { search: 'library' } } },
      { throwOnError: false }
    );
  });

  it('preserves a caller override that opts back into error boundaries', () => {
    const { api, useQuery } = createTestApi();
    const useItems = createQueryHook(api, '/api/v1/items/');

    useItems({
      reactQuery: { enabled: true, throwOnError: true },
    } as never);

    expect(useQuery).toHaveBeenCalledWith(
      'get',
      '/api/v1/items/',
      {},
      {
        enabled: true,
        throwOnError: true,
      }
    );
  });
});
