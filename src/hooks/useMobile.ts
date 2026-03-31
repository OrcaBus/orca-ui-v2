import { useCallback, useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
const mediaQueryListCache = new Map<string, MediaQueryList>();
const mediaQuerySubscriptionCache = new Map<
  string,
  { callbacks: Set<MediaQueryListener>; teardown: (() => void) | null }
>();

type MediaQueryListener = () => void;

interface UseMediaQueryOptions {
  defaultValue?: boolean;
}

function getMediaQueryList(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;

  const cachedMediaQueryList = mediaQueryListCache.get(query);
  if (cachedMediaQueryList) return cachedMediaQueryList;

  const mediaQueryList = window.matchMedia(query);
  mediaQueryListCache.set(query, mediaQueryList);
  return mediaQueryList;
}

function subscribeToMediaQuery(query: string, callback: MediaQueryListener): () => void {
  const mediaQueryList = getMediaQueryList(query);
  if (!mediaQueryList) return () => {};

  const existingState = mediaQuerySubscriptionCache.get(query);
  if (existingState) {
    existingState.callbacks.add(callback);
    return () => {
      existingState.callbacks.delete(callback);
      if (existingState.callbacks.size > 0) return;
      existingState.teardown?.();
      mediaQuerySubscriptionCache.delete(query);
    };
  }

  const callbacks = new Set<MediaQueryListener>([callback]);
  const state = { callbacks, teardown: null as (() => void) | null };

  const notify = () => {
    callbacks.forEach((cb) => cb());
  };

  if (typeof mediaQueryList.addEventListener === 'function') {
    const handler = (_ev: MediaQueryListEvent) => notify();
    mediaQueryList.addEventListener('change', handler);
    state.teardown = () => mediaQueryList.removeEventListener('change', handler);
  } else {
    // Older browsers only support `onchange` for MediaQueryList.
    const previousOnChange = mediaQueryList.onchange;
    const onchangeHandler = function (this: MediaQueryList, _ev: MediaQueryListEvent) {
      notify();
    };
    mediaQueryList.onchange = onchangeHandler;
    state.teardown = () => {
      mediaQueryList.onchange = previousOnChange;
    };
  }

  mediaQuerySubscriptionCache.set(query, state);
  return () => {
    state.callbacks.delete(callback);
    if (state.callbacks.size > 0) return;
    state.teardown?.();
    mediaQuerySubscriptionCache.delete(query);
  };
}

function getMediaQuerySnapshot(query: string): boolean {
  const mediaQueryList = getMediaQueryList(query);
  return mediaQueryList?.matches ?? false;
}

export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}): boolean {
  const { defaultValue = false } = options;

  const subscribe = useCallback(
    (callback: () => void) => subscribeToMediaQuery(query, callback),
    [query]
  );
  const getSnapshot = useCallback(() => getMediaQuerySnapshot(query), [query]);
  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_MEDIA_QUERY);
}
