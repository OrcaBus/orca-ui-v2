import { useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router';
import {
  LayoutDashboard,
  Briefcase,
  Database,
  Activity,
  GitBranch,
  FileText,
  Lock,
  Wrench,
  PanelLeftOpen,
  PanelLeftClose,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuthContext } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { EnvironmentIndicator } from './header/EnvironmentIndicator';
import { GlobalSearch } from './header/GlobalSearch';
import { NotificationsMenu } from './header/NotificationsMenu';
import { UserMenu } from './header/UserMenu';

export function Root() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuthContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems: Array<{
    path: string;
    label: string;
    icon: typeof Briefcase;
    sublabel?: string;
  }> = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/cases', label: 'Cases', icon: Briefcase },
    { path: '/lab', label: 'Lab', icon: Database },
    { path: '/sequence', label: 'Sequence', icon: Activity },
    { path: '/workflows', label: 'Workflows', icon: GitBranch },
    { path: '/files', label: 'Files', icon: FileText },
    { path: '/vault', label: 'Vault', icon: Lock },
    { path: '/tools', label: 'Tools', icon: Wrench },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className='flex h-screen bg-slate-50 dark:bg-[#101922]'>
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? 'w-16' : 'w-56'} flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-[#2d3540] dark:bg-[#111418]`}
      >
        <div className={`flex items-center p-4 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-lg dark:bg-[#137fec] dark:shadow-[#137fec]/20'>
            <Database className='h-5 w-5 text-white' />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className='text-sm leading-tight font-bold text-slate-900 dark:text-white'>
                Orcabus
              </div>
              <div className='mt-0.5 text-[11px] leading-tight font-semibold tracking-wider text-slate-400 uppercase dark:text-[#9dabb9]/60'>
                LIMS Admin Console
              </div>
            </div>
          )}
        </div>

        <nav className='flex-1 space-y-0.5 p-3'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-md px-3 py-2 text-[13px] transition-colors ${
                  active
                    ? 'bg-blue-50 font-semibold text-blue-700 dark:border dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white'
                    : 'font-medium text-slate-600 hover:bg-slate-100 dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? 'dark:text-[#137fec]' : 'dark:group-hover:text-[#137fec]'}`}
                />
                {!sidebarCollapsed && (
                  <div>
                    <div>{item.label}</div>
                    {item.sublabel && (
                      <div className='text-[11px] font-normal text-slate-400 dark:text-[#9dabb9]'>
                        {item.sublabel}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div
          className={`border-t border-slate-200 p-3 dark:border-[#2d3540] ${sidebarCollapsed ? 'text-center' : ''}`}
        >
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className='flex w-full items-center justify-center gap-2 rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className='h-4 w-4' />
            ) : (
              <>
                <PanelLeftClose className='h-4 w-4' />
                <span className='text-xs'>Collapse</span>
              </>
            )}
          </button>
          {!sidebarCollapsed && (
            <div className='mt-2 text-center text-[11px] text-slate-400 dark:text-[#9dabb9]/60'>
              v2.4.1 • Build 2847
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <header className='flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-6 dark:border-[#2d3540] dark:bg-[#111418]'>
          <GlobalSearch />

          <div className='flex-1' />

          {/* Right-aligned Actions */}
          <div className='flex items-center gap-3'>
            <EnvironmentIndicator />

            <div className='hidden h-6 w-px bg-slate-200 sm:block dark:bg-[#2d3540]' />

            <NotificationsMenu />
            <UserMenu onOpenSettings={() => setSettingsOpen(true)} onLogout={() => void logout()} />
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-auto bg-transparent'>
          <Outlet />
        </main>
      </div>

      {/* Theme Settings Modal */}
      {settingsOpen && (
        <>
          <div className='fixed inset-0 z-40 bg-black/50' onClick={() => setSettingsOpen(false)} />
          <div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center'>
            <div className='pointer-events-auto mx-4 w-full max-w-md rounded-lg border border-transparent bg-white shadow-xl dark:border-[#2d3540] dark:bg-[#111418] dark:shadow-black/40'>
              {/* Modal Header */}
              <div className='flex items-center justify-between border-b border-slate-200 p-4 dark:border-[#2d3540]'>
                <div className='flex items-center gap-3'>
                  <Settings className='h-5 w-5 text-slate-500 dark:text-[#9dabb9]' />
                  <div>
                    <h2 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Theme preferences
                    </h2>
                    <p className='text-[11px] text-slate-400 dark:text-[#9dabb9]'>
                      Choose how your application looks
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className='rounded p-1 transition-colors hover:bg-slate-100 dark:hover:bg-[#1e252e]'
                >
                  <ChevronDown className='h-5 w-5 rotate-180 text-slate-400 dark:text-[#9dabb9]' />
                </button>
              </div>

              {/* Theme Options */}
              <div className='space-y-2 p-4'>
                {/* Light Theme */}
                <button
                  onClick={() => setTheme('light')}
                  className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:border-[#137fec] dark:bg-[#137fec]/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:bg-[#1e252e]'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      theme === 'light'
                        ? 'bg-white dark:bg-[#1e252e]'
                        : 'bg-neutral-100 dark:bg-[#1e252e]'
                    }`}
                  >
                    <Sun
                      className={`h-5 w-5 ${theme === 'light' ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-[#9dabb9]'}`}
                    />
                  </div>
                  <div className='flex-1 text-left'>
                    <div className='text-[13px] font-medium text-slate-900 dark:text-white'>
                      Light
                    </div>
                    <div className='text-[11px] text-slate-500 dark:text-[#9dabb9]'>
                      Light theme for bright environments
                    </div>
                  </div>
                  {theme === 'light' && (
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-[#137fec]'>
                      <svg
                        className='h-3 w-3 text-white'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={3}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Dark Theme */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:border-[#137fec] dark:bg-[#137fec]/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:bg-[#1e252e]'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      theme === 'dark'
                        ? 'bg-neutral-800 dark:bg-[#101922]'
                        : 'bg-neutral-100 dark:bg-[#1e252e]'
                    }`}
                  >
                    <Moon
                      className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-neutral-600 dark:text-[#9dabb9]'}`}
                    />
                  </div>
                  <div className='flex-1 text-left'>
                    <div className='text-[13px] font-medium text-slate-900 dark:text-white'>
                      Dark
                    </div>
                    <div className='text-[11px] text-slate-500 dark:text-[#9dabb9]'>
                      Dark theme for low-light environments
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-[#137fec]'>
                      <svg
                        className='h-3 w-3 text-white'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={3}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </div>
                  )}
                </button>

                {/* System Theme */}
                <button
                  onClick={() => setTheme('system')}
                  className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                    theme === 'system'
                      ? 'border-blue-500 bg-blue-50 dark:border-[#137fec] dark:bg-[#137fec]/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:bg-[#1e252e]'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      theme === 'system'
                        ? 'bg-blue-600 dark:bg-[#137fec]'
                        : 'bg-neutral-100 dark:bg-[#1e252e]'
                    }`}
                  >
                    <Monitor
                      className={`h-5 w-5 ${theme === 'system' ? 'text-white' : 'text-neutral-600 dark:text-[#9dabb9]'}`}
                    />
                  </div>
                  <div className='flex-1 text-left'>
                    <div className='text-[13px] font-medium text-slate-900 dark:text-white'>
                      System
                    </div>
                    <div className='text-[11px] text-slate-500 dark:text-[#9dabb9]'>
                      Follows your system preferences
                    </div>
                  </div>
                  {theme === 'system' && (
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-[#137fec]'>
                      <svg
                        className='h-3 w-3 text-white'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={3}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
