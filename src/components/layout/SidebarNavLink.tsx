import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/utils/cn';

type SidebarNavLinkVariant = 'primary' | 'secondary' | 'secondaryMobile';

export interface SidebarNavLinkProps {
  to: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed?: boolean;
  sublabel?: string;
  variant?: SidebarNavLinkVariant;
}

const variantClasses: Record<SidebarNavLinkVariant, string> = {
  primary: 'px-3 py-2 text-[13px]',
  secondary: 'h-9 px-2.5 text-[13px]',
  secondaryMobile: 'h-8 shrink-0 px-3 text-[12px]',
};

const inactiveClasses: Record<SidebarNavLinkVariant, string> = {
  primary:
    'font-medium text-slate-600 hover:bg-slate-100 dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-white',
  secondary:
    'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-white',
  secondaryMobile:
    'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-white',
};

export function SidebarNavLink({
  to,
  label,
  icon: Icon,
  active,
  collapsed = false,
  sublabel,
  variant = 'primary',
}: SidebarNavLinkProps) {
  const link = (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        'group flex items-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-[#111418]',
        collapsed ? 'justify-center' : 'gap-3',
        variantClasses[variant],
        active
          ? 'bg-blue-50 font-semibold text-blue-700 dark:border dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white'
          : inactiveClasses[variant]
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0',
          active
            ? cn(variant === 'primary' ? 'text-blue-700' : 'text-blue-600', 'dark:text-[#137fec]')
            : variant === 'primary'
              ? 'dark:group-hover:text-[#137fec]'
              : 'text-slate-400 dark:text-[#9dabb9]'
        )}
      />
      {!collapsed && (
        <>
          {sublabel ? (
            <div>
              <div>{label}</div>
              <div className='text-[11px] font-normal text-slate-400 dark:text-[#9dabb9]'>
                {sublabel}
              </div>
            </div>
          ) : (
            <span className='whitespace-nowrap'>{label}</span>
          )}
        </>
      )}
    </Link>
  );

  if (!collapsed || variant === 'secondaryMobile') return link;

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side='right' variant='light' size='sm' showArrow={false}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
