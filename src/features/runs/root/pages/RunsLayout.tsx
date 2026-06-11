import { useEffect, useMemo, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { SecondarySidebarMobileNav } from '@/components/layout/SecondarySidebar';
import {
  useAppShellSecondarySidebar,
  useTemporarySidebarCollapse,
} from '@/context/app-shell-context';
import { getRunsSecondaryNavigation } from '../utils/runsNavigation';

export function RunsLayout() {
  const location = useLocation();
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const secondaryNavigation = useMemo(
    () => getRunsSecondaryNavigation(location.pathname),
    [location.pathname]
  );

  useAppShellSecondarySidebar(secondaryNavigation);
  useTemporarySidebarCollapse();

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className='flex h-full min-h-0 min-w-0 overflow-hidden'>
      <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
        {secondaryNavigation && <SecondarySidebarMobileNav {...secondaryNavigation} />}
        <div ref={contentScrollRef} className='min-h-0 min-w-0 flex-1 overflow-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
