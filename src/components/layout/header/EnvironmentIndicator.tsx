import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { useEnvironment, type AppEnvironment } from '@/context/environment-context';
import {
  ENVIRONMENT_HOSTNAMES,
  buildEnvironmentUrl,
  getEnvironmentLabel,
} from '@/context/environment-resolver';

const ALL_ENVIRONMENTS = ['dev', 'stg', 'prod'] as const;

const ENV_BADGE_STYLES: Record<AppEnvironment, string> = {
  dev: 'border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-500/10 dark:text-blue-400',
  stg: 'border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/30 dark:bg-amber-500/10 dark:text-amber-500',
  prod: 'border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-500/10 dark:text-emerald-400',
};

const ENV_DOT_STYLES: Record<AppEnvironment, string> = {
  dev: 'bg-blue-500',
  stg: 'bg-amber-500',
  prod: 'bg-emerald-500',
};

export function EnvironmentIndicator() {
  const { environment, label } = useEnvironment();

  // No indicator (and no switcher) on prod.
  if (environment === 'prod') return null;

  const otherEnvironments = ALL_ENVIRONMENTS.filter((env) => env !== environment);

  return (
    <>
      {' '}
      <Menu as='div' className='relative'>
        <MenuButton
          aria-label={`Switch environment (current: ${label})`}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase transition-colors hover:brightness-95 data-active:brightness-95 dark:hover:brightness-125 dark:data-active:brightness-125 ${ENV_BADGE_STYLES[environment]}`}
        >
          {label}
          <ChevronDown className='h-3 w-3' />
        </MenuButton>

        <MenuItems
          anchor='bottom end'
          transition
          className='z-50 w-56 origin-top-right rounded-md border border-slate-200 bg-white shadow-lg transition duration-200 ease-out outline-none [--anchor-gap:--spacing(1)] data-closed:scale-95 data-closed:opacity-0 dark:border-[#2d3540] dark:bg-[#111418] dark:shadow-black/40'
        >
          <div className='border-b border-slate-200 px-3 py-2 dark:border-[#2d3540]'>
            <p className='text-[11px] font-normal tracking-wide text-slate-400 uppercase dark:text-[#9dabb9]'>
              Switch environment
            </p>
          </div>
          <div className='p-1'>
            {otherEnvironments.map((env) => (
              <MenuItem key={env}>
                {({ close }) => (
                  <button
                    type='button'
                    onClick={() => {
                      close();
                      window.location.assign(buildEnvironmentUrl(env));
                    }}
                    className='flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-[13px] text-slate-700 data-focus:bg-slate-100 dark:text-slate-300 dark:data-focus:bg-[#1e252e]'
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${ENV_DOT_STYLES[env]}`} />
                    <span className='flex min-w-0 flex-col'>
                      <span className='font-medium'>{getEnvironmentLabel(env)}</span>
                      <span className='truncate text-[11px] text-slate-400 dark:text-[#9dabb9]'>
                        {ENVIRONMENT_HOSTNAMES[env]}
                      </span>
                    </span>
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
      <div className='hidden h-6 w-px bg-slate-200 sm:block dark:bg-[#2d3540]' />
    </>
  );
}
