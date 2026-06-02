import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AppShellContext,
  resolveSidebarCollapsed,
  type AppShellContextValue,
  type AppShellHeaderConfig,
  type AppShellSecondarySidebarConfig,
} from './app-shell-context';

interface TemporaryCollapseState {
  requestIds: Set<number>;
  expandedOverride: boolean;
}

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [headerConfig, setHeaderConfigState] = useState<AppShellHeaderConfig | null>(null);
  const [secondarySidebarConfig, setSecondarySidebarConfigState] =
    useState<AppShellSecondarySidebarConfig | null>(null);
  const [secondarySidebarCollapsed, setSecondarySidebarCollapsed] = useState(false);
  const [userSidebarCollapsed, setUserSidebarCollapsed] = useState(false);
  const [temporarySidebarCollapseState, setTemporarySidebarCollapseState] =
    useState<TemporaryCollapseState>(() => ({
      requestIds: new Set(),
      expandedOverride: false,
    }));
  const nextTemporarySidebarRequestIdRef = useRef(0);

  const temporarySidebarCollapseRequestCount = temporarySidebarCollapseState.requestIds.size;
  const temporarySidebarCollapseExpandedOverride = temporarySidebarCollapseState.expandedOverride;
  const isSidebarCollapsed = resolveSidebarCollapsed(
    userSidebarCollapsed,
    temporarySidebarCollapseRequestCount,
    temporarySidebarCollapseExpandedOverride
  );

  const setHeaderConfig = useCallback((config: AppShellHeaderConfig | null) => {
    setHeaderConfigState(config);
  }, []);

  const clearHeaderConfig = useCallback(() => {
    setHeaderConfigState(null);
  }, []);

  const setSecondarySidebarConfig = useCallback((config: AppShellSecondarySidebarConfig | null) => {
    setSecondarySidebarConfigState(config);
  }, []);

  const clearSecondarySidebarConfig = useCallback(() => {
    setSecondarySidebarConfigState(null);
    setSecondarySidebarCollapsed(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (temporarySidebarCollapseRequestCount > 0) {
      setTemporarySidebarCollapseState((current) => {
        if (current.requestIds.size === 0) return current;

        return {
          ...current,
          expandedOverride: resolveSidebarCollapsed(
            userSidebarCollapsed,
            current.requestIds.size,
            current.expandedOverride
          ),
        };
      });
      return;
    }

    setUserSidebarCollapsed((collapsed) => !collapsed);
  }, [temporarySidebarCollapseRequestCount, userSidebarCollapsed]);

  const requestTemporarySidebarCollapse = useCallback(() => {
    const requestId = nextTemporarySidebarRequestIdRef.current;
    nextTemporarySidebarRequestIdRef.current += 1;

    setTemporarySidebarCollapseState((current) => {
      const requestIds = new Set(current.requestIds);
      const hadRequests = requestIds.size > 0;
      requestIds.add(requestId);

      return {
        requestIds,
        expandedOverride: hadRequests ? current.expandedOverride : false,
      };
    });

    let released = false;
    return () => {
      if (released) return;
      released = true;

      setTemporarySidebarCollapseState((current) => {
        if (!current.requestIds.has(requestId)) return current;

        const requestIds = new Set(current.requestIds);
        requestIds.delete(requestId);

        return {
          requestIds,
          expandedOverride: requestIds.size > 0 ? current.expandedOverride : false,
        };
      });
    };
  }, []);

  const value = useMemo<AppShellContextValue>(
    () => ({
      headerConfig,
      setHeaderConfig,
      clearHeaderConfig,
      secondarySidebarConfig,
      setSecondarySidebarConfig,
      clearSecondarySidebarConfig,
      secondarySidebarCollapsed,
      setSecondarySidebarCollapsed,
      userSidebarCollapsed,
      isSidebarCollapsed,
      temporarySidebarCollapseRequestCount,
      temporarySidebarCollapseExpandedOverride,
      toggleSidebar,
      setSidebarCollapsed: setUserSidebarCollapsed,
      requestTemporarySidebarCollapse,
    }),
    [
      headerConfig,
      setHeaderConfig,
      clearHeaderConfig,
      secondarySidebarConfig,
      setSecondarySidebarConfig,
      clearSecondarySidebarConfig,
      secondarySidebarCollapsed,
      userSidebarCollapsed,
      isSidebarCollapsed,
      temporarySidebarCollapseRequestCount,
      temporarySidebarCollapseExpandedOverride,
      toggleSidebar,
      requestTemporarySidebarCollapse,
    ]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}
