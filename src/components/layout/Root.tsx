import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SidebarProvider } from './SidebarProvider';

function RootShell() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Scroll the content area back to the top whenever the route pathname changes.
  // React Router does not reset scroll on a custom overflow container automatically.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className='flex h-screen bg-slate-50 dark:bg-[#101922]'>
      <Sidebar />

      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <Header />

        <main ref={mainRef} className='min-w-0 flex-1 overflow-auto bg-transparent'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function Root() {
  return (
    <SidebarProvider>
      <RootShell />
    </SidebarProvider>
  );
}
