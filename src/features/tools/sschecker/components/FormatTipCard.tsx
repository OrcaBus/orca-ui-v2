import { Info } from 'lucide-react';

export function FormatTipCard() {
  return (
    <div className='rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
      <div className='flex items-start gap-2.5'>
        <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600'>
          <Info className='h-3 w-3 text-white' />
        </span>
        <div>
          <p className='mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100'>Format Tip</p>
          <p className='text-sm leading-relaxed text-blue-800 dark:text-blue-200'>
            Ensure your CSV headers match the latest v2 schema. Required fields:{' '}
            <code className='rounded bg-blue-100 px-1 py-0.5 font-mono text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
              Header
            </code>
            ,{' '}
            <code className='rounded bg-blue-100 px-1 py-0.5 font-mono text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
              Bclconvert_Data
            </code>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
