import {
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSection,
  MenuSeparator,
} from '@headlessui/react';
import { LogOut, Settings, User } from 'lucide-react';

interface UserMenuProps {
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function UserMenu({ onOpenSettings, onLogout }: UserMenuProps) {
  return (
    <Menu as='div' className='relative'>
      <MenuButton className='flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-slate-50 data-active:bg-slate-50 dark:hover:bg-[#1e252e]/50 dark:data-active:bg-[#1e252e]/50'>
        <div className='hidden text-right md:block'>
          <div className='text-[13px] leading-none font-semibold text-slate-900 dark:text-white'>
            Dr. Sarah Chen
          </div>
          <div className='mt-0.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-[#9dabb9]'>
            LAB DIRECTOR
          </div>
        </div>
        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-pink-400'>
          <span className='text-[13px] font-semibold text-white'>SC</span>
        </div>
      </MenuButton>

      <MenuItems
        anchor='bottom end'
        transition
        className='z-50 w-48 origin-top-right rounded-md border border-slate-200 bg-white shadow-lg transition duration-200 ease-out outline-none [--anchor-gap:--spacing(1)] data-closed:scale-95 data-closed:opacity-0 dark:border-[#2d3540] dark:bg-[#111418] dark:shadow-black/40'
      >
        <MenuSection className='border-b border-slate-200 p-2 dark:border-[#2d3540]'>
          <MenuHeading className='text-[11px] font-normal text-slate-400 dark:text-[#9dabb9]'>
            Signed in as
          </MenuHeading>
          <div className='mt-0.5 text-[13px] font-medium text-slate-900 dark:text-white'>
            admin@orcabus.io
          </div>
        </MenuSection>
        <div className='p-1'>
          <MenuItem>
            <button
              type='button'
              className='flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[13px] text-slate-700 data-focus:bg-slate-100 dark:text-slate-300 dark:data-focus:bg-[#1e252e]'
            >
              <User className='h-4 w-4 shrink-0' />
              Profile
            </button>
          </MenuItem>
          <MenuItem>
            {({ close }) => (
              <button
                type='button'
                onClick={() => {
                  onOpenSettings();
                  close();
                }}
                className='flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[13px] text-slate-700 data-focus:bg-slate-100 dark:text-slate-300 dark:data-focus:bg-[#1e252e]'
              >
                <Settings className='h-4 w-4 shrink-0' />
                Settings
              </button>
            )}
          </MenuItem>
        </div>
        <MenuSeparator className='my-0 border-t border-slate-200 dark:border-[#2d3540]' />
        <div className='p-1'>
          <MenuItem>
            {({ close }) => (
              <button
                type='button'
                onClick={() => {
                  close();
                  onLogout();
                }}
                className='flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[13px] text-red-600 data-focus:bg-red-50 dark:text-red-400 dark:data-focus:bg-red-500/10'
              >
                <LogOut className='h-4 w-4 shrink-0' />
                Sign out
              </button>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
