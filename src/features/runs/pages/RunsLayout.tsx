import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { SecondarySidebar, SecondarySidebarMobileNav } from '@/components/layout/SecondarySidebar';
import { useTemporarySidebarCollapse } from '@/components/layout/sidebar-context';
import { getRunsSecondaryNavigation } from '../shared/utils/runsNavigation';

export function RunsLayout() {
  const location = useLocation();
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [secondarySidebarCollapsed, setSecondarySidebarCollapsed] = useState(false);
  const secondaryNavigation = useMemo(
    () => getRunsSecondaryNavigation(location.pathname),
    [location.pathname]
  );

  useTemporarySidebarCollapse();

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className='flex h-full min-h-0 min-w-0 overflow-hidden'>
      {secondaryNavigation && (
        <SecondarySidebar
          {...secondaryNavigation}
          collapsed={secondarySidebarCollapsed}
          onCollapsedChange={setSecondarySidebarCollapsed}
        />
      )}

      <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
        {secondaryNavigation && <SecondarySidebarMobileNav {...secondaryNavigation} />}
        <div ref={contentScrollRef} className='min-h-0 min-w-0 flex-1 overflow-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
