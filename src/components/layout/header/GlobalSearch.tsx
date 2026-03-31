import { Search } from 'lucide-react';

export function GlobalSearch() {
  return (
    <div className='max-w-xl flex-1'>
      <div className='group relative'>
        <label htmlFor='global-search' className='sr-only'>
          Search genomic data, runs, or files
        </label>
        <Search
          className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-[#9dabb9] dark:group-focus-within:text-[#137fec]'
          aria-hidden='true'
        />
        <input
          id='global-search'
          type='text'
          placeholder='Search genomic data, runs, or files...'
          className='w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-[13px] text-slate-900 placeholder-slate-400 transition-colors focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:bg-[#1e252e] dark:focus:ring-[#137fec]'
        />
      </div>
    </div>
  );
}
