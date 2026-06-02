import { useEnvironment } from '@/context/environment-context';

export function EnvironmentIndicator() {
  const { environment, label } = useEnvironment();

  if (environment === 'prod') return null;

  return (
    <>
      {' '}
      <div
        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase ${
          environment === 'stg'
            ? 'border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/30 dark:bg-amber-500/10 dark:text-amber-500'
            : 'border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-500/10 dark:text-blue-400'
        }`}
      >
        {label}
      </div>
      <div className='hidden h-6 w-px bg-slate-200 sm:block dark:bg-[#2d3540]' />
    </>
  );
}
