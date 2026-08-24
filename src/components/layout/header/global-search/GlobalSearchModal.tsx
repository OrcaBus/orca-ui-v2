import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';
import {
  useGlobalSearch,
  type GlobalSearchResult,
  type GlobalSearchSection,
} from './useGlobalSearch';

export type { GlobalSearchResult, GlobalSearchSection } from './useGlobalSearch';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface GlobalSearchModalContentProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
}

const SEARCH_PLACEHOLDER =
  'Search cases, libraries, sequence runs, workflow runs, or analysis runs...';

function ResultRow({ item, onClose }: { item: GlobalSearchResult; onClose: () => void }) {
  return (
    <Link
      to={item.href}
      onClick={onClose}
      className='block rounded-md border border-transparent px-3 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:hover:border-[#2d3540] dark:hover:bg-[#1e252e]'
    >
      <div className='flex min-w-0 items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='truncate text-sm font-semibold text-slate-900 dark:text-slate-100'>
            {item.title}
          </div>
          {item.description && (
            <div className='text-muted-foreground mt-0.5 line-clamp-1 text-xs'>
              {item.description}
            </div>
          )}
        </div>
        {item.badge && (
          <span className='text-caption shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold tracking-wide text-slate-500 uppercase dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9]'>
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );
}

function SearchSection({
  section,
  onClose,
}: {
  section: GlobalSearchSection;
  onClose: () => void;
}) {
  const Icon = section.icon;

  return (
    <section className='rounded-md border border-slate-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      <div className='flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-[#2d3540] dark:text-[#9dabb9]'>
        <div className='flex items-center gap-2'>
          <Icon className='h-4 w-4' />
          <span>{section.label}</span>
        </div>
        <span className='text-caption font-semibold normal-case'>{section.totalCount}</span>
      </div>

      <div className='p-1'>
        {section.items.map((item) => (
          <ResultRow key={item.id} item={item} onClose={onClose} />
        ))}
      </div>

      {section.hasMore && (
        <Link
          to={section.viewAllHref}
          onClick={onClose}
          className='flex items-center justify-center gap-1.5 border-t border-slate-100 px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-[#2d3540] dark:text-blue-400 dark:hover:bg-[#1e252e]'
        >
          <span>More ({section.totalCount - section.items.length} more)</span>
          <ArrowRight className='h-3.5 w-3.5' />
        </Link>
      )}
    </section>
  );
}

export function GlobalSearchModal({ isOpen, onClose, initialQuery = '' }: GlobalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Global Search'
      description='Search across cases, lab libraries, and runs.'
      icon={<Search className='h-5 w-5' />}
      size='xl'
      bodyClassName='space-y-4 bg-slate-50 dark:bg-[#101922]'
    >
      <GlobalSearchModalContent query={query} onQueryChange={setQuery} onClose={onClose} />
    </DialogFrame>
  );
}

export function GlobalSearchModalContent({
  query,
  onQueryChange,
  onClose,
}: GlobalSearchModalContentProps) {
  const debouncedQuery = useDebounce(query, 400);
  const sections = useGlobalSearch(debouncedQuery);

  const hasQuery = query.trim().length > 0;
  const isSettling = hasQuery && query.trim() !== debouncedQuery.trim();
  const isLoading = isSettling || sections.some((section) => section.isLoading);
  const populatedSections = sections.filter((section) => section.items.length > 0);
  const hasFailures = sections.some((section) => section.isError);

  const showEmptyState = hasQuery && !isLoading && populatedSections.length === 0;

  return (
    <>
      <div className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#9dabb9]' />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={SEARCH_PLACEHOLDER}
          autoFocus
          className='h-11 bg-white pl-10 text-sm dark:bg-[#111418]'
        />
      </div>

      <div
        className={cn(
          'max-h-[60vh] min-h-48 overflow-y-auto',
          populatedSections.length > 0 ? 'space-y-3' : 'flex items-center justify-center'
        )}
      >
        {!hasQuery && (
          <div className='text-muted-foreground text-center text-sm'>
            Start typing to search across cases, lab libraries, and runs.
          </div>
        )}

        {hasQuery && isLoading && populatedSections.length === 0 && (
          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Searching...</span>
          </div>
        )}

        {showEmptyState && (
          <div className='text-muted-foreground text-center text-sm'>
            No results found for "{query.trim()}".
          </div>
        )}

        {populatedSections.map((section) => (
          <SearchSection key={section.id} section={section} onClose={onClose} />
        ))}

        {populatedSections.length > 0 && hasFailures && (
          <p className='text-muted-foreground px-1 text-xs'>
            Some sources could not be searched right now.
          </p>
        )}
      </div>
    </>
  );
}
