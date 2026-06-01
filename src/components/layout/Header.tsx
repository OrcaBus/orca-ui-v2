import { EnvironmentIndicator } from './header/EnvironmentIndicator';
import { GlobalSearch } from './header/GlobalSearch';
// import { NotificationsMenu } from './header/NotificationsMenu';
import { UserMenu } from './header/UserMenu';

export function Header() {
  return (
    <header className='flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6 dark:border-[#2d3540] dark:bg-[#111418]'>
      <GlobalSearch />

      <div className='flex-1' />

      <div className='flex items-center gap-3'>
        <EnvironmentIndicator />

        <div className='hidden h-6 w-px bg-slate-200 sm:block dark:bg-[#2d3540]' />
        {/* todo: implement global notifications menu */}
        {/* <NotificationsMenu /> */}
        <UserMenu />
      </div>
    </header>
  );
}
