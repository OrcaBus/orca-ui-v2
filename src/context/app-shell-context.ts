import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { BreadcrumbEntry } from '@/components/ui/PageBreadcrumb';
import type { SecondarySidebarProps } from '../components/layout/SecondarySidebar';

export interface AppShellInfoConfig {
  label?: string;
  onOpen: () => void;
}

export type AppShellHeaderConfig =
  | {
      mode: 'main';
      title: string;
      icon?: ReactNode;
      info?: AppShellInfoConfig;
    }
  | {
      mode: 'detail';
      breadcrumbs: BreadcrumbEntry[];
    };

export type AppShellSecondarySidebarConfig = Pick<
  SecondarySidebarProps,
  'ariaLabel' | 'items' | 'groups' | 'activeItemId'
>;

export interface AppShellContextValue {
  headerConfig: AppShellHeaderConfig | null;
  setHeaderConfig: (config: AppShellHeaderConfig | null) => void;
  clearHeaderConfig: () => void;
  secondarySidebarConfig: AppShellSecondarySidebarConfig | null;
  setSecondarySidebarConfig: (config: AppShellSecondarySidebarConfig | null) => void;
  clearSecondarySidebarConfig: () => void;
  secondarySidebarCollapsed: boolean;
  setSecondarySidebarCollapsed: (collapsed: boolean) => void;
  userSidebarCollapsed: boolean;
  isSidebarCollapsed: boolean;
  temporarySidebarCollapseRequestCount: number;
  temporarySidebarCollapseExpandedOverride: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  requestTemporarySidebarCollapse: () => () => void;
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);

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

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);

  if (!ctx) {
    throw new Error('useAppShell must be used within an <AppShellProvider>');
  }

  return ctx;
}

export function useAppShellHeader(config: AppShellHeaderConfig | null) {
  const { setHeaderConfig, clearHeaderConfig } = useAppShell();

  useEffect(() => {
    setHeaderConfig(config);
  }, [config, setHeaderConfig]);

  useEffect(() => clearHeaderConfig, [clearHeaderConfig]);
}

export function useAppShellSecondarySidebar(config: AppShellSecondarySidebarConfig | null) {
  const { setSecondarySidebarConfig, clearSecondarySidebarConfig } = useAppShell();

  useEffect(() => {
    setSecondarySidebarConfig(config);
  }, [config, setSecondarySidebarConfig]);

  useEffect(() => clearSecondarySidebarConfig, [clearSecondarySidebarConfig]);
}

export function useTemporarySidebarCollapse(enabled = true) {
  const { requestTemporarySidebarCollapse } = useAppShell();

  useEffect(() => {
    if (!enabled) return;

    return requestTemporarySidebarCollapse();
  }, [enabled, requestTemporarySidebarCollapse]);
}
