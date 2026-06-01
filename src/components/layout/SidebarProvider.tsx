import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  resolveSidebarCollapsed,
  SidebarContext,
  type SidebarContextValue,
} from './sidebar-context';

interface TemporaryCollapseState {
  requestIds: Set<number>;
  expandedOverride: boolean;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [temporaryCollapseState, setTemporaryCollapseState] = useState<TemporaryCollapseState>(
    () => ({
      requestIds: new Set(),
      expandedOverride: false,
    })
  );
  const nextTemporaryRequestIdRef = useRef(0);

  const temporaryCollapseRequestCount = temporaryCollapseState.requestIds.size;
  const temporaryCollapseExpandedOverride = temporaryCollapseState.expandedOverride;
  const isCollapsed = resolveSidebarCollapsed(
    userCollapsed,
    temporaryCollapseRequestCount,
    temporaryCollapseExpandedOverride
  );

  const toggleSidebar = useCallback(() => {
    if (temporaryCollapseRequestCount > 0) {
      setTemporaryCollapseState((current) => {
        if (current.requestIds.size === 0) return current;

        return {
          ...current,
          expandedOverride: resolveSidebarCollapsed(
            userCollapsed,
            current.requestIds.size,
            current.expandedOverride
          ),
        };
      });
      return;
    }

    setUserCollapsed((collapsed) => !collapsed);
  }, [temporaryCollapseRequestCount, userCollapsed]);

  const requestTemporaryCollapse = useCallback(() => {
    const requestId = nextTemporaryRequestIdRef.current;
    nextTemporaryRequestIdRef.current += 1;

    setTemporaryCollapseState((current) => {
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

      setTemporaryCollapseState((current) => {
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

  const value = useMemo<SidebarContextValue>(
    () => ({
      userCollapsed,
      isCollapsed,
      temporaryCollapseRequestCount,
      temporaryCollapseExpandedOverride,
      toggleSidebar,
      setSidebarCollapsed: setUserCollapsed,
      requestTemporaryCollapse,
    }),
    [
      userCollapsed,
      isCollapsed,
      temporaryCollapseRequestCount,
      temporaryCollapseExpandedOverride,
      toggleSidebar,
      requestTemporaryCollapse,
    ]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
