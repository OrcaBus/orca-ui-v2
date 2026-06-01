import { PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SidebarNavLink } from './SidebarNavLink';

export interface SecondarySidebarItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface SecondarySidebarGroup {
  label: string;
  items: SecondarySidebarItem[];
}

export interface SecondarySidebarProps {
  ariaLabel: string;
  items?: SecondarySidebarItem[];
  groups: SecondarySidebarGroup[];
  activeItemId: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function SecondarySidebar({
  ariaLabel,
  items = [],
  groups,
  activeItemId,
  collapsed = false,
  onCollapsedChange,
}: SecondarySidebarProps) {
  return (
    <aside
      className={cn(
        'hidden h-full min-h-0 shrink-0 border-r border-slate-200 bg-slate-50/90 transition-[width] duration-300 md:flex md:flex-col dark:border-[#2d3540] dark:bg-[#151a22]',
        collapsed ? 'w-16' : 'w-48'
      )}
    >
      <nav
        aria-label={ariaLabel}
        className={cn('flex-1 overflow-y-auto', collapsed ? 'px-3 py-4' : 'px-3 py-5')}
      >
        {items.length > 0 && (
          <section className={cn(collapsed ? 'mb-4' : 'mb-5')}>
            <div className='space-y-1'>
              {items.map((item) => (
                <SidebarNavLink
                  key={item.id}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={activeItemId === item.id}
                  collapsed={collapsed}
                  variant='secondary'
                />
              ))}
            </div>
          </section>
        )}

        {groups.map((group) => (
          <section key={group.label} className={cn('last:mb-0', collapsed ? 'mb-4' : 'mb-5')}>
            {!collapsed && (
              <h5 className='px-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-400 uppercase dark:text-[#9dabb9]/70'>
                {group.label}
              </h5>
            )}
            <div className={cn('space-y-1', collapsed ? 'mt-0' : 'mt-2')}>
              {group.items.map((item) => (
                <SidebarNavLink
                  key={item.id}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={activeItemId === item.id}
                  collapsed={collapsed}
                  variant='secondary'
                />
              ))}
            </div>
          </section>
        ))}
      </nav>

      {onCollapsedChange && (
        <div
          className={cn(
            'border-t border-slate-200 p-3 dark:border-[#2d3540]',
            collapsed ? 'text-center' : ''
          )}
        >
          <button
            type='button'
            onClick={() => onCollapsedChange(!collapsed)}
            className='flex w-full items-center justify-center gap-2 rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
            title={collapsed ? 'Expand secondary navigation' : 'Collapse secondary navigation'}
          >
            {collapsed ? (
              <PanelLeftOpen className='h-4 w-4' />
            ) : (
              <>
                <PanelLeftClose className='h-4 w-4' />
                <span className='text-xs'>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}

export function SecondarySidebarMobileNav({
  ariaLabel,
  items = [],
  groups,
  activeItemId,
}: SecondarySidebarProps) {
  return (
    <div className='border-b border-slate-200 bg-slate-50/95 px-3 py-2 md:hidden dark:border-[#2d3540] dark:bg-[#151a22]'>
      <nav aria-label={ariaLabel} className='flex gap-4 overflow-x-auto pb-1'>
        {items.length > 0 && (
          <div className='flex shrink-0 items-center gap-2'>
            {items.map((item) => (
              <SidebarNavLink
                key={item.id}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={activeItemId === item.id}
                variant='secondaryMobile'
              />
            ))}
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label} className='flex shrink-0 items-center gap-2'>
            <span className='text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase dark:text-[#9dabb9]/70'>
              {group.label}
            </span>
            {group.items.map((item) => (
              <SidebarNavLink
                key={item.id}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={activeItemId === item.id}
                variant='secondaryMobile'
              />
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}
