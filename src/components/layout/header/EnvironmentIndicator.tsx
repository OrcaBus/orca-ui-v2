import { useEnvironment } from '@/context/environment-context';

export function EnvironmentIndicator() {
  const { environment, label } = useEnvironment();

  return (
    <div
      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase ${
        environment === 'prod'
          ? 'border border-green-200 bg-green-100 text-green-700 dark:border-green-900/30 dark:bg-green-500/10 dark:text-green-500'
          : environment === 'stg'
            ? 'border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/30 dark:bg-amber-500/10 dark:text-amber-500'
            : 'border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-500/10 dark:text-blue-400'
      }`}
    >
      {label}
    </div>
  );
}
