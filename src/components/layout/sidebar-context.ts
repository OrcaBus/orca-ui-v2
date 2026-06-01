import { createContext, useContext, useEffect } from 'react';

export function resolveSidebarCollapsed(
  userCollapsed: boolean,
  temporaryCollapseRequestCount: number,
  temporaryCollapseExpandedOverride = false
) {
  if (temporaryCollapseRequestCount > 0) {
    return !temporaryCollapseExpandedOverride;
  }

  return userCollapsed;
}

export interface SidebarContextValue {
  userCollapsed: boolean;
  isCollapsed: boolean;
  temporaryCollapseRequestCount: number;
  temporaryCollapseExpandedOverride: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  requestTemporaryCollapse: () => () => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);

  if (!ctx) {
    throw new Error('useSidebar must be used within a <SidebarProvider>');
  }

  return ctx;
}

export function useTemporarySidebarCollapse(enabled = true) {
  const { requestTemporaryCollapse } = useSidebar();

  useEffect(() => {
    if (!enabled) return;

    return requestTemporaryCollapse();
  }, [enabled, requestTemporaryCollapse]);
}
