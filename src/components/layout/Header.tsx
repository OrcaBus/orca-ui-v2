import { EnvironmentIndicator } from './header/EnvironmentIndicator';
import { GlobalSearch } from './header/GlobalSearch';
// import { NotificationsMenu } from './header/NotificationsMenu';
import { UserMenu } from './header/UserMenu';
import { PageBreadcrumb } from '@/components/ui/PageBreadcrumb';
import { cn } from '@/utils/cn';
import { useAppShell, type AppShellHeaderConfig } from '@/context/app-shell-context';

interface HeaderProps {
  headerConfig: AppShellHeaderConfig | null;
}

function HeaderLeftContent({ headerConfig }: HeaderProps) {
  if (!headerConfig) return null;

  if (headerConfig.mode === 'detail') {
    return (
      <div className='min-w-0 py-2'>
        <PageBreadcrumb items={headerConfig.breadcrumbs} className='mb-0' />
      </div>
    );
  }

  const infoConfig = headerConfig.info;
  const infoLabel = infoConfig?.label ?? 'info';

  return (
    <>
      <div className='flex min-w-0 items-end gap-3 pt-2'>
        <div className='flex min-w-0 items-center gap-3'>
          {headerConfig.icon && (
            <div className='shrink-0 text-slate-500 dark:text-[#9dabb9]'>{headerConfig.icon}</div>
          )}
          <h1 className='truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>
            {headerConfig.title}
          </h1>
        </div>

        {infoConfig && (
          <button
            type='button'
            onClick={infoConfig.onOpen}
            className='mb-0.5 shrink-0 text-[13px] font-medium text-blue-600 underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-blue-400'
            aria-label={`Open ${headerConfig.title} information`}
          >
            {infoLabel}
          </button>
        )}
      </div>
    </>
  );
}

export function Header() {
  const { headerConfig } = useAppShell();

  return (
    <header
      className={cn(
        'flex shrink-0 gap-4 px-6',
        headerConfig?.mode === 'detail' ? 'min-h-14 items-center py-2' : 'h-14 items-center'
      )}
    >
      <HeaderLeftContent headerConfig={headerConfig} />

      <div className='flex-1' />

      <div className='flex items-center gap-3'>
        <GlobalSearch />
        <EnvironmentIndicator />

        {/* todo: implement global notifications menu */}
        {/* <NotificationsMenu /> */}
        <UserMenu />
      </div>
    </header>
  );
}
