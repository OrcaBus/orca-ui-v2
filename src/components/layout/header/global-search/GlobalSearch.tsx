import { useState } from 'react';
import { Search } from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';

export function GlobalSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <button
        type='button'
        onClick={() => setIsSearchOpen(true)}
        className='rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-white'
        aria-label='Open global search'
      >
        <Search className='h-5 w-5' />
      </button>
      <div className='hidden h-6 w-px bg-slate-200 sm:block dark:bg-[#2d3540]' />

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
