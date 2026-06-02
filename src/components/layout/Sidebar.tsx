import { useLocation } from 'react-router';
import {
  Activity,
  Briefcase,
  Database,
  LibraryBig,
  FileText,
  Warehouse,
  PanelLeftClose,
  PanelLeftOpen,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { SidebarNavLink } from './SidebarNavLink';
import { useAppShell } from '../../context/app-shell-context';

interface PrimaryNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  sublabel?: string;
}

const navItems: PrimaryNavItem[] = [
  { path: '/', label: 'Cases', icon: Briefcase },
  { path: '/lab', label: 'Lab', icon: LibraryBig },
  { path: '/runs', label: 'Runs', icon: Activity },
  { path: '/files', label: 'Files', icon: FileText },
  { path: '/vault', label: 'Vault', icon: Warehouse },
  { path: '/tools', label: 'Tools', icon: Wrench },
];

function isNavItemActive(pathname: string, path: string) {
  if (path === '/' && pathname === '/') return true;
  if (path !== '/' && pathname.startsWith(path)) return true;
  return false;
}

export function Sidebar() {
  const location = useLocation();
  const { isSidebarCollapsed: isCollapsed, toggleSidebar } = useAppShell();

  return (
    <aside
      className={`${isCollapsed ? 'w-16' : 'w-48'} flex shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-[#2d3540] dark:bg-[#111418]`}
    >
      <div className={`flex items-center p-4 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-lg dark:bg-[#137fec] dark:shadow-[#137fec]/20'>
          <Database className='h-5 w-5 text-white' />
        </div>
        {!isCollapsed && (
          <div>
            <div className='text-sm leading-tight font-bold text-slate-900 dark:text-white'>
              Orcabus
            </div>
            <div className='mt-0.5 text-[11px] leading-tight font-semibold tracking-wider text-slate-400 uppercase dark:text-[#9dabb9]/60'>
              LIMS Console
            </div>
          </div>
        )}
      </div>

      <nav className='flex-1 space-y-0.5 p-3'>
        {navItems.map((item) => {
          const active = isNavItemActive(location.pathname, item.path);
          return (
            <SidebarNavLink
              key={item.path}
              to={item.path}
              label={item.label}
              sublabel={item.sublabel}
              icon={item.icon}
              active={active}
              collapsed={isCollapsed}
            />
          );
        })}
      </nav>

      <div
        className={`border-t border-slate-200 p-3 dark:border-[#2d3540] ${isCollapsed ? 'text-center' : ''}`}
      >
        <button
          type='button'
          onClick={toggleSidebar}
          className='flex w-full items-center justify-center gap-2 rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className='h-4 w-4' />
          ) : (
            <>
              <PanelLeftClose className='h-4 w-4' />
              <span className='text-xs'>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
