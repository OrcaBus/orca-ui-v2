import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  ChevronDown,
  SlidersHorizontal,
  GitBranch,
  ArrowLeft,
} from 'lucide-react';

import type { DiagramSummary } from '../data/diagrams';
import type { DiagramStatus } from '../data/dynamodb-schema';
import { DIAGRAM_LIST } from '../data';
import { getRelativeTime } from '@/utils/timeFormat';

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DiagramStatus, { label: string; className: string }> = {
  active: {
    label: 'ACTIVE',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  draft: {
    label: 'DRAFT',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  archived: {
    label: 'ARCHIVED',
    className:
      'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700',
  },
};

const STATUS_OPTIONS: { value: DiagramStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Any Status' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUniqueAuthors(diagrams: DiagramSummary[]): string[] {
  return [...new Set(diagrams.map((d) => d.createdBy))].sort();
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Diagram Card ───────────────────────────────────────────────────────────

function DiagramCard({ diagram }: { diagram: DiagramSummary }) {
  const statusCfg = STATUS_CONFIG[diagram.status];

  return (
    <Link
      to={`/tools/workflow-catalog/${diagram.diagramId}`}
      className='group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-lg dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-blue-500/50 dark:hover:shadow-blue-900/10'
    >
      {/* Top row: icon + status */}
      <div className='mb-4 flex items-start justify-between'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-[#1e252e] dark:text-[#9dabb9] dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400'>
          <GitBranch className='h-5 w-5' />
        </div>
        <span
          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider ${statusCfg.className}`}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Title + Description */}
      <h3 className='mb-1.5 text-base font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
        {diagram.name}
      </h3>
      <p className='mb-5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-[#9dabb9]'>
        {diagram.description}
      </p>

      {/* Footer: author + last modified */}
      <div className='flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-[#2d3540]'>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-[#2d3540] dark:text-[#9dabb9]'>
          {getInitials(diagram.createdBy)}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='truncate text-xs font-medium text-slate-700 dark:text-slate-300'>
            {diagram.createdBy}
          </div>
          <div className='text-[10px] text-slate-400 dark:text-[#6b7a8d]'>Author</div>
        </div>
        <div className='text-right'>
          <div className='text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-[#6b7a8d]'>
            Last Modified
          </div>
          <div className='text-xs font-medium text-slate-600 dark:text-slate-300'>
            {getRelativeTime(diagram.updatedAt)}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Create Card ────────────────────────────────────────────────────────────

function CreateDiagramCard() {
  return (
    <button
      type='button'
      className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white/50 p-8 text-center transition-all hover:border-blue-300 hover:bg-blue-50/50 dark:border-[#2d3540] dark:bg-transparent dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10'
    >
      <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 text-slate-400 transition-colors dark:border-[#2d3540] dark:text-[#6b7a8d]'>
        <Plus className='h-5 w-5' />
      </div>
      <div className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
        Create New Diagram
      </div>
      <div className='mt-1 text-xs text-slate-400 dark:text-[#6b7a8d]'>
        Start building a new workflow from a template or scratch.
      </div>
    </button>
  );
}

// ─── Filter Dropdown ────────────────────────────────────────────────────────

function FilterSelect({
  value,
  options,
  icon,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <div className='relative'>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='h-10 appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm text-slate-700 transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none dark:border-[#2d3540] dark:bg-[#111418] dark:text-slate-300 dark:focus:border-blue-500/50 dark:focus:ring-blue-900/30'
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 dark:text-[#6b7a8d]'>
        {icon ?? <ChevronDown className='h-4 w-4' />}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function DiagramListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DiagramStatus | 'all'>('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const authors = useMemo(() => getUniqueAuthors(DIAGRAM_LIST), []);
  const authorOptions = useMemo(
    () => [{ value: 'all', label: 'All Users' }, ...authors.map((a) => ({ value: a, label: a }))],
    [authors]
  );

  const filtered = useMemo(() => {
    return DIAGRAM_LIST.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (authorFilter !== 'all' && d.createdBy !== authorFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.createdBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, statusFilter, authorFilter]);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-[#101922]'>
      <div className='mx-auto max-w-6xl px-6 py-8'>
        {/* Back link */}
        <Link
          to='/tools'
          className='mb-6 inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-600 dark:text-[#9dabb9] dark:hover:text-white'
        >
          <ArrowLeft className='h-3 w-3' />
          Back to Tools
        </Link>

        {/* Header */}
        <div className='mb-8 flex items-start justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>
              Workflow Diagrams
            </h1>
            <p className='mt-1 text-sm text-slate-500 dark:text-[#9dabb9]'>
              Manage and explore workflow catalogs and event diagrams.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {/* View mode toggle */}
            <div className='flex rounded-lg border border-slate-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
              <button
                type='button'
                onClick={() => setViewMode('grid')}
                className={`flex h-9 w-9 items-center justify-center rounded-l-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 text-slate-900 dark:bg-[#1e252e] dark:text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:text-slate-300'
                }`}
              >
                <LayoutGrid className='h-4 w-4' />
              </button>
              <button
                type='button'
                onClick={() => setViewMode('list')}
                className={`flex h-9 w-9 items-center justify-center rounded-r-lg border-l border-slate-200 transition-colors dark:border-[#2d3540] ${
                  viewMode === 'list'
                    ? 'bg-slate-100 text-slate-900 dark:bg-[#1e252e] dark:text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:text-slate-300'
                }`}
              >
                <List className='h-4 w-4' />
              </button>
            </div>

            {/* Add button */}
            <button
              type='button'
              className='flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            >
              <Plus className='h-4 w-4' />
              Add New Diagram
            </button>
          </div>
        </div>

        {/* Search + Filters bar */}
        <div className='mb-6 flex flex-wrap items-center gap-3'>
          <div className='relative min-w-0 flex-1'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#6b7a8d]' />
            <input
              type='text'
              placeholder='Search by diagram name or user...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-10 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-10 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none dark:border-[#2d3540] dark:bg-[#111418] dark:text-white dark:placeholder:text-[#6b7a8d] dark:focus:border-blue-500/50 dark:focus:ring-blue-900/30'
            />
          </div>

          <FilterSelect value={authorFilter} options={authorOptions} onChange={setAuthorFilter} />

          <FilterSelect
            value={statusFilter}
            options={STATUS_OPTIONS}
            icon={<SlidersHorizontal className='h-3.5 w-3.5' />}
            onChange={(v) => setStatusFilter(v as DiagramStatus | 'all')}
          />
        </div>

        {/* Results count */}
        {filtered.length !== DIAGRAM_LIST.length && (
          <div className='mb-4 text-xs text-slate-400 dark:text-[#6b7a8d]'>
            Showing {filtered.length} of {DIAGRAM_LIST.length} diagrams
          </div>
        )}

        {/* Grid / List view */}
        {viewMode === 'grid' ? (
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {filtered.map((diagram) => (
              <DiagramCard key={diagram.diagramId} diagram={diagram} />
            ))}
            <CreateDiagramCard />
          </div>
        ) : (
          <div className='space-y-3'>
            {filtered.map((diagram) => (
              <DiagramListRow key={diagram.diagramId} diagram={diagram} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <Search className='mb-3 h-10 w-10 text-slate-300 dark:text-[#2d3540]' />
            <div className='text-sm font-medium text-slate-500 dark:text-[#9dabb9]'>
              No diagrams match your filters
            </div>
            <div className='mt-1 text-xs text-slate-400 dark:text-[#6b7a8d]'>
              Try adjusting your search or filter criteria.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── List Row (for list view mode) ──────────────────────────────────────────

function DiagramListRow({ diagram }: { diagram: DiagramSummary }) {
  const statusCfg = STATUS_CONFIG[diagram.status];

  return (
    <Link
      to={`/tools/workflow-catalog/${diagram.diagramId}`}
      className='group flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-blue-500/50'
    >
      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-[#1e252e] dark:text-[#9dabb9]'>
        <GitBranch className='h-4 w-4' />
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
            {diagram.name}
          </span>
          <span
            className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${statusCfg.className}`}
          >
            {statusCfg.label}
          </span>
        </div>
        <p className='mt-0.5 truncate text-xs text-slate-500 dark:text-[#9dabb9]'>
          {diagram.description}
        </p>
      </div>

      <div className='flex shrink-0 items-center gap-3 text-xs text-slate-500 dark:text-[#9dabb9]'>
        <span>{diagram.nodeCount} nodes</span>
        <span className='text-slate-300 dark:text-[#2d3540]'>·</span>
        <span>{diagram.createdBy}</span>
        <span className='text-slate-300 dark:text-[#2d3540]'>·</span>
        <span>{getRelativeTime(diagram.updatedAt)}</span>
      </div>
    </Link>
  );
}
