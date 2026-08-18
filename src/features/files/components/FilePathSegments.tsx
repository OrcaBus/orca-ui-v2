export function FilePathSegments({ path }: { path: string }) {
  const segments = path.split('/').filter(Boolean);
  return (
    <div className='flex flex-wrap items-center gap-1'>
      {segments.map((segment, i) => (
        <span key={i} className='flex items-center gap-1'>
          <span className='text-caption rounded bg-neutral-100 px-1.5 py-0.5 font-mono font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100'>
            {segment}
          </span>
          <span className='text-xs text-neutral-400 dark:text-neutral-500'>/</span>
        </span>
      ))}
    </div>
  );
}
