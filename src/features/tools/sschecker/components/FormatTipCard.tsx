import { ExternalLink, Info } from 'lucide-react';

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className='rounded bg-blue-100 px-1 py-0.5 font-mono text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
      {children}
    </code>
  );
}

export function FormatTipCard() {
  return (
    <div className='rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
      <div className='flex items-start gap-2.5'>
        <span className='bg-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full'>
          <Info className='text-primary-foreground h-3 w-3' />
        </span>
        <div>
          <p className='mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100'>Format Tip</p>
          <p className='text-xs leading-relaxed text-blue-800 dark:text-blue-200'>
            Ensure your CSV files match the latest v2 schema. Required fields such as{' '}
            <InlineCode>Header</InlineCode>, <InlineCode>Reads</InlineCode>, and application
            sections like <InlineCode>BCLConvert_Settings</InlineCode> ,{' '}
            <InlineCode>BCLConvert_Data</InlineCode> .
          </p>
          <a
            href='https://help.connected.illumina.com/run-set-up/overview/sample-sheet-structure'
            target='_blank'
            rel='noreferrer'
            className='mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-300'
          >
            Official Illumina reference
            <ExternalLink className='h-3 w-3' aria-hidden='true' />
          </a>
        </div>
      </div>
    </div>
  );
}
