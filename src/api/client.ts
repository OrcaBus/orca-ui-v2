import createFetchClient, { type FetchResponse, type MaybeOptionalInit } from 'openapi-fetch';
import createClient from 'openapi-react-query';
import type {
  QueryClient,
  UseQueryOptions,
  UseQueryResult,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { authMiddleware } from './auth-middleware';
import { errorStatusMiddleware } from './error-status-middleware';

/* ---------------------------------- */
/* Base types                         */
/* ---------------------------------- */

// Matches the `Paths extends {}` constraint used by openapi-fetch / openapi-react-query.
// `Record<string, …>` would require an index signature that codegen'd `interface paths` lacks.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PathsRecord = {};

type PathsWithMethod<
  Paths extends PathsRecord,
  Method extends 'get' | 'put' | 'post' | 'patch' | 'delete',
> = {
  [K in keyof Paths]: Paths[K] extends Record<Method, unknown> ? K : never;
}[keyof Paths] &
  string;

export type PathsWithGet<Paths extends PathsRecord> = PathsWithMethod<Paths, 'get'>;
export type PathsWithPut<Paths extends PathsRecord> = PathsWithMethod<Paths, 'put'>;
export type PathsWithPost<Paths extends PathsRecord> = PathsWithMethod<Paths, 'post'>;
export type PathsWithPatch<Paths extends PathsRecord> = PathsWithMethod<Paths, 'patch'>;
export type PathsWithDelete<Paths extends PathsRecord> = PathsWithMethod<Paths, 'delete'>;

/* ---------------------------------- */
/* Internal type helpers              */
/* ---------------------------------- */

type MediaType = `${string}/${string}`;

// Intersection ensures TS can prove the method key exists on the path item,
// even through the indirection of PathsWithMethod mapped types.
type Ensure<P, M extends string> = P & Record<M, Record<string | number, unknown>>;
type OpOf<P, M extends string> = Ensure<P, M>[M];
type InitOf<P, M extends string> = MaybeOptionalInit<Ensure<P, M>, M>;
type RespOf<P, M extends string> = Required<FetchResponse<OpOf<P, M>, InitOf<P, M>, MediaType>>;

// Allows extra query params (DRF filter lookups like `workflow__orcabus_id`)
// and extra top-level keys on the init object.
type LooseInit = Record<string, unknown> & { params?: { query?: Record<string, unknown> } };

// Common React Query options accepted by `reactQuery` on all hooks.
// TanStack's full option types are difficult to infer through the generic
// plumbing, so we surface the most-used options explicitly here and
// forward everything else via `Opts` (the inferred query/mutation options).
type ReactQueryExtras = {
  enabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeholderData?: any;
};

// Build the single-argument type for hooks:
//   { ...fetchInit, reactQuery?: TanStackOptions }
// Init is optional when the endpoint has no required params/body.
type HookArg<I, Opts> = undefined extends I
  ? (Exclude<I, undefined> & LooseInit & { reactQuery?: Opts & ReactQueryExtras }) | undefined
  : I & LooseInit & { reactQuery?: Opts & ReactQueryExtras };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

type QueryStateDefault<Opts> = Opts & { throwOnError?: boolean };

// Mutation result where variables are optional (pre-bound via baseInit at hook-call time).
type BoundMutationResult<D, E, V, C = unknown> = Omit<
  UseMutationResult<D, E, V, C>,
  'mutate' | 'mutateAsync'
> & {
  mutate: (variables?: V, options?: Parameters<UseMutationResult<D, E, V, C>['mutate']>[1]) => void;
  mutateAsync: (
    variables?: V,
    options?: Parameters<UseMutationResult<D, E, V, C>['mutateAsync']>[1]
  ) => Promise<D>;
};

/* ---------------------------------- */
/* Utilities                          */
/* ---------------------------------- */

export function getVersionedPath<K extends string>(path: K, apiVersion?: string): K {
  if (!apiVersion) return path;
  return path.replace('/api/v1/', `/api/${apiVersion}/`) as K;
}

export function assertOk<T>(data: T | undefined, error: unknown, response: Response): T {
  if (error || !response.ok) {
    throw error instanceof Error ? error : new Error(`Request failed: ${response.status}`);
  }
  return data as T;
}

function withQueryStateDefault<Opts>(reactQuery?: Opts): QueryStateDefault<Opts> {
  return {
    throwOnError: false,
    ...(reactQuery && typeof reactQuery === 'object' ? reactQuery : {}),
  } as QueryStateDefault<Opts>;
}

/* ---------------------------------- */
/* Service client                     */
/* ---------------------------------- */

export class ApiClient<Paths extends PathsRecord> {
  readonly fetch: ReturnType<typeof createFetchClient<Paths>>;
  readonly rq: ReturnType<typeof createClient<Paths>>;
  private pathTransform: <K extends keyof Paths & string>(path: K) => K;

  constructor(config: {
    baseUrl: string;
    getPath?: <K extends keyof Paths & string>(path: K) => K;
  }) {
    this.fetch = createFetchClient<Paths>({ baseUrl: config.baseUrl });
    this.fetch.use(authMiddleware);
    this.fetch.use(errorStatusMiddleware);
    this.rq = createClient(this.fetch);
    this.pathTransform = config.getPath ?? ((p) => p);
  }

  resolvePath<K extends keyof Paths & string>(path: K): K {
    return this.pathTransform(path);
  }

  getClient() {
    return this.fetch;
  }
}

/* ---------------------------------- */
/* Query hook factories               */
/* ---------------------------------- */

/**
 * Creates a typed `useQuery` hook pre-bound to a GET endpoint.
 *
 * Use this for standard component-driven data fetching where the caller
 * wants to handle loading, error, refetch, pagination, filters, or
 * conditional execution manually through the returned React Query result.
 *
 * The generated hook accepts one argument shaped like the openapi-fetch
 * init object plus optional `{ reactQuery }` options:
 *
 *   useSomeModel({
 *     params: { path: { id }, query: { page: 1 } },
 *     reactQuery: { enabled: !!id, placeholderData: keepPreviousData },
 *   })
 *
 * Extra query-param keys are allowed for DRF filter lookups such as
 * `workflow__orcabus_id`.
 */
export function createQueryHook<
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'get'>,
>(api: ApiClient<Paths>, path: Path) {
  const resolved = api.resolvePath(path);

  type I = InitOf<Paths[Path], 'get'>;
  type R = RespOf<Paths[Path], 'get'>;
  type Opts = Omit<UseQueryOptions<R['data'], R['error']>, 'queryKey' | 'queryFn'>;

  return (arg?: HookArg<I, Opts>): UseQueryResult<R['data'], R['error']> => {
    if (!arg) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return (api.rq.useQuery as AnyFn)('get', resolved, undefined, withQueryStateDefault<Opts>());
    }
    const { reactQuery, ...init } = arg as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (api.rq.useQuery as AnyFn)(
      'get',
      resolved,
      init,
      withQueryStateDefault<Opts>(reactQuery as Opts | undefined)
    );
  };
}

/**
 * Creates a typed `useSuspenseQuery` hook pre-bound to a GET endpoint.
 *
 * Use this when the component subtree cannot render meaningful UI until
 * the data is available.  Initial loading suspends to the nearest
 * `<Suspense fallback={...}>`, and initial load errors are expected to be
 * handled by an error boundary around that subtree.
 *
 * Once the component renders, `data` is available on the returned result,
 * so callers usually do not need local `isLoading` branches.  Avoid using
 * this for optional or conditionally enabled requests; TanStack suspense
 * queries run with suspense semantics and should be mounted only when the
 * required params are ready.
 */
export function createSuspenseQueryHook<
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'get'>,
>(api: ApiClient<Paths>, path: Path) {
  const resolved = api.resolvePath(path);

  type I = InitOf<Paths[Path], 'get'>;
  type R = RespOf<Paths[Path], 'get'>;
  type Opts = Omit<UseSuspenseQueryOptions<R['data'], R['error']>, 'queryKey' | 'queryFn'>;

  return (arg?: HookArg<I, Opts>): UseSuspenseQueryResult<R['data'], R['error']> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (!arg) return (api.rq.useSuspenseQuery as AnyFn)('get', resolved);
    const { reactQuery, ...init } = arg as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (api.rq.useSuspenseQuery as AnyFn)('get', resolved, init, reactQuery);
  };
}

/* ---------------------------------- */
/* Query model factory                */
/* ---------------------------------- */

/**
 * Creates a reusable query model for one GET endpoint.
 *
 * The model bundles all common query entry points for the same endpoint:
 * `path`, `queryOptions`, `useQuery`, `useSuspenseQuery`, and `prefetch`.
 *
 * Use this when an endpoint needs more than a single component hook, such
 * as dynamic `useQueries` arrays, route loaders, cache prefetching, or
 * shared query option construction.  For simple component-only usage,
 * `createQueryHook` is usually enough.
 *
 * Example:
 *
 *   export const fileObjectListModel = createQueryModel(fileApi, '/api/v1/s3');
 *
 *   const queryOptions = fileObjectListModel.queryOptions({
 *     params: { query: { bucket: 'example-bucket' } },
 *   });
 *
 *   await fileObjectListModel.prefetch(queryClient, {
 *     params: { query: { bucket: 'example-bucket' } },
 *   });
 */
export function createQueryModel<
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'get'>,
>(api: ApiClient<Paths>, path: Path) {
  const resolved = api.resolvePath(path);

  type I = InitOf<Paths[Path], 'get'>;
  type InitArg = undefined extends I
    ? (Exclude<I, undefined> & LooseInit) | undefined
    : I & LooseInit;

  return {
    path: resolved,

    queryOptions(arg?: InitArg): ReturnType<typeof api.rq.queryOptions> {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return (api.rq.queryOptions as AnyFn)('get', resolved, arg);
    },

    useQuery: createQueryHook(api, path),
    useSuspenseQuery: createSuspenseQueryHook(api, path),

    prefetch(queryClient: QueryClient, arg?: InitArg): Promise<void> {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return queryClient.prefetchQuery((api.rq.queryOptions as AnyFn)('get', resolved, arg));
    },
  } satisfies {
    path: Path;
    queryOptions: AnyFn;
    useQuery: AnyFn;
    useSuspenseQuery: AnyFn;
    prefetch: AnyFn;
  };
}

/* ---------------------------------- */
/* Mutation hook factories            */
/* ---------------------------------- */

/**
 * Creates a typed `useMutation` hook pre-bound to a mutating endpoint.
 *
 * Accepts a single argument `{ params?, body?, reactQuery? }`.
 * If `params`/`body` are provided at hook-call time they become the
 * default variables for `mutate()` — callers can override by passing
 * new variables directly to `mutate(newInit)`.
 */
export function createMutationHook<
  Paths extends PathsRecord,
  Method extends 'put' | 'post' | 'patch' | 'delete',
  Path extends PathsWithMethod<Paths, Method>,
>(api: ApiClient<Paths>, method: Method, path: Path) {
  const resolved = api.resolvePath(path);

  type I = InitOf<Paths[Path], Method>;
  type R = RespOf<Paths[Path], Method>;
  type MutOpts = Omit<UseMutationOptions<R['data'], R['error'], I>, 'mutationKey' | 'mutationFn'>;

  return (arg?: HookArg<I, MutOpts>): BoundMutationResult<R['data'], R['error'], I> => {
    const { reactQuery, ...baseInit } = (arg ?? {}) as Record<string, unknown>;
    const mutation = (api.rq.useMutation as AnyFn)(
      method,
      resolved,
      reactQuery
    ) as UseMutationResult<R['data'], R['error'], I>;

    const hasBaseInit = Object.keys(baseInit).length > 0;
    if (!hasBaseInit) return mutation as BoundMutationResult<R['data'], R['error'], I>;

    return {
      ...mutation,
      mutate: (runtimeInit?: I, opts?: Parameters<typeof mutation.mutate>[1]) =>
        mutation.mutate((runtimeInit ?? baseInit) as I, opts),
      mutateAsync: (runtimeInit?: I, opts?: Parameters<typeof mutation.mutateAsync>[1]) =>
        mutation.mutateAsync((runtimeInit ?? baseInit) as I, opts),
    };
  };
}
/* ---------------------------------- */
/* Convenience factories for common methods */
/* ---------------------------------- */

export const createPutMutationHook = <
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'put'>,
>(
  api: ApiClient<Paths>,
  path: Path
) => createMutationHook(api, 'put', path);

export const createPostMutationHook = <
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'post'>,
>(
  api: ApiClient<Paths>,
  path: Path
) => createMutationHook(api, 'post', path);

export const createPatchMutationHook = <
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'patch'>,
>(
  api: ApiClient<Paths>,
  path: Path
) => createMutationHook(api, 'patch', path);

export const createDeleteMutationHook = <
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'delete'>,
>(
  api: ApiClient<Paths>,
  path: Path
) => createMutationHook(api, 'delete', path);
