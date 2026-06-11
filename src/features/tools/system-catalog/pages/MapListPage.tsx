import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  SlidersHorizontal,
  NotebookText,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppShellHeader } from '@/context/app-shell-context';
import { useAuthContext } from '@/context/auth-context';
import type { MapSummary, MapStatus } from '../data/dynamodb-schema';
import {
  systemCatalogMapsQuery,
  useCreateSystemCatalogMap,
  useSystemCatalogMaps,
} from '../api/system-catalog.api';
import { mapToSummary } from '../utils/mapModel';
import { getRelativeTime } from '@/utils/timeFormat';
import { MapEditModal, SystemCatalogInfoDrawer } from '../components';
import type { MapFormData } from '../components/MapEditModal';
import { useToolsPageQueryParams } from '../../hooks/useToolsPageQueryParams';

const STATUS_CONFIG: Record<MapStatus, { label: string; className: string }> = {
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

const STATUS_OPTIONS: { value: MapStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Any Status' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const EMPTY_MAP_FORM: MapFormData = {
  name: '',
  description: '',
  status: 'draft',
  tagsJson: '{}',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function parseTagsJson(value: string): Record<string, string> {
  try {
    const parsed = JSON.parse(value) as Record<string, string>;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function MapCard({ map }: { map: MapSummary }) {
  const statusCfg = STATUS_CONFIG[map.status];

  return (
    <Link
      to={`/tools/system-catalog/${map.mapId}`}
      className='group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-lg dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-blue-500/50 dark:hover:shadow-blue-900/10'
    >
      <div className='mb-4 flex items-start justify-between'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-[#1e252e] dark:text-[#9dabb9] dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400'>
          <NotebookText className='h-5 w-5' />
        </div>
        <span
          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider ${statusCfg.className}`}
        >
          {statusCfg.label}
        </span>
      </div>

      <h3 className='mb-1.5 text-base font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
        {map.name}
      </h3>
      <p className='mb-5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-[#9dabb9]'>
        {map.description}
      </p>

      <div className='flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-[#2d3540]'>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-[#2d3540] dark:text-[#9dabb9]'>
          {getInitials(map.createdBy)}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='truncate text-xs font-medium text-slate-700 dark:text-slate-300'>
            {map.createdBy}
          </div>
          <div className='text-[10px] text-slate-400 dark:text-[#6b7a8d]'>Author</div>
        </div>
        <div className='text-right'>
          <div className='text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-[#6b7a8d]'>
            Last Modified
          </div>
          <div className='text-xs font-medium text-slate-600 dark:text-slate-300'>
            {getRelativeTime(map.updatedAt)}
          </div>
        </div>
      </div>
    </Link>
  );
}

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
        onChange={(event) => onChange(event.target.value)}
        className='h-10 appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm text-slate-700 transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none dark:border-[#2d3540] dark:bg-[#111418] dark:text-slate-300 dark:focus:border-blue-500/50 dark:focus:ring-blue-900/30'
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 dark:text-[#6b7a8d]'>
        {icon ?? <ChevronDown className='h-4 w-4' />}
      </div>
    </div>
  );
}

export function MapListPage() {
  const title = 'System Catalog';
  const description = 'Explore and plan system architecture through interactive maps.';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isInfoDrawerOpen, openInfoDrawer, closeInfoDrawer } = useToolsPageQueryParams();

  const { user } = useAuthContext();
  const userEmail = user.email ?? '';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MapStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isPending, isError, refetch } = useSystemCatalogMaps(
    showOnlyMine && userEmail ? { params: { query: { userEmail } } } : undefined
  );
  const createMapMutation = useCreateSystemCatalogMap();

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title,
      icon: <NotebookText className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer, title]
  );

  useAppShellHeader(headerConfig);

  const maps = useMemo(() => data?.maps ?? [], [data]);

  const filtered = useMemo(() => {
    return maps.filter((map) => {
      if (statusFilter !== 'all' && map.status !== statusFilter) {
        return false;
      }

      if (searchQuery) {
        const loweredQuery = searchQuery.toLowerCase();
        return (
          map.name.toLowerCase().includes(loweredQuery) ||
          map.description.toLowerCase().includes(loweredQuery) ||
          map.createdBy.toLowerCase().includes(loweredQuery)
        );
      }

      return true;
    });
  }, [maps, searchQuery, statusFilter]);

  const handleOpenCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const handleCloseCreateModal = useCallback(() => setIsCreateModalOpen(false), []);

  const handleCreateMap = useCallback(
    async (data: MapFormData) => {
      try {
        const createdMap = await createMapMutation.mutateAsync({
          body: {
            name: data.name,
            description: data.description,
            status: data.status,
            tags: parseTagsJson(data.tagsJson),
          },
        });

        const listQueryKey = systemCatalogMapsQuery.queryOptions().queryKey;
        queryClient.setQueryData(
          listQueryKey,
          (previous: { maps?: MapSummary[]; nextCursor?: string | null } | undefined) => {
            if (!previous?.maps) {
              return previous;
            }

            return {
              ...previous,
              maps: [mapToSummary(createdMap), ...previous.maps],
            };
          }
        );

        setIsCreateModalOpen(false);
        toast.success('Map created.');
        void navigate(`/tools/system-catalog/${createdMap.mapId}`);
      } catch {
        toast.error('Unable to create map.');
      }
    },
    [createMapMutation, navigate, queryClient]
  );

  const infoDrawer = (
    <SystemCatalogInfoDrawer
      isOpen={isInfoDrawerOpen}
      onClose={closeInfoDrawer}
      title={title}
      description={description}
      onCreateMap={handleOpenCreateModal}
    />
  );

  const createMapModal = (
    <MapEditModal
      isOpen={isCreateModalOpen}
      initialData={EMPTY_MAP_FORM}
      isEditing={false}
      onSubmit={(data) => {
        void handleCreateMap(data);
      }}
      onClose={handleCloseCreateModal}
    />
  );

  if (isPending) {
    return (
      <>
        <div className='min-h-screen bg-slate-50 dark:bg-[#101922]'>
          <div className='mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500 dark:text-[#9dabb9]'>
            Loading system catalog maps…
          </div>
        </div>

        {infoDrawer}
        {createMapModal}
      </>
    );
  }

  if (isError) {
    return (
      <>
        <div className='min-h-screen bg-slate-50 dark:bg-[#101922]'>
          <div className='mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-24 text-center'>
            <NotebookText className='mb-3 h-10 w-10 text-slate-300 dark:text-[#2d3540]' />
            <div className='text-sm font-medium text-slate-700 dark:text-slate-200'>
              Unable to load system catalog maps.
            </div>
            <button
              type='button'
              onClick={() => void refetch()}
              className='mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-[#2d3540] dark:bg-[#111418] dark:text-slate-200 dark:hover:border-blue-500/50 dark:hover:text-blue-400'
            >
              Retry
            </button>
          </div>
        </div>

        {infoDrawer}
        {createMapModal}
      </>
    );
  }

  return (
    <>
      <div className='min-h-screen bg-slate-50 dark:bg-[#101922]'>
        <div className='mx-auto max-w-6xl px-6 py-8'>
          <div className='mb-6 flex flex-wrap items-center gap-3'>
            <div className='relative min-w-0 flex-1'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#6b7a8d]' />
              <input
                type='text'
                placeholder='Search by map name or user...'
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className='h-10 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-10 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none dark:border-[#2d3540] dark:bg-[#111418] dark:text-white dark:placeholder:text-[#6b7a8d] dark:focus:border-blue-500/50 dark:focus:ring-blue-900/30'
              />
            </div>

            {/* mine / all filter */}
            <div className='flex rounded-lg border border-slate-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
              <button
                type='button'
                onClick={() => setShowOnlyMine(false)}
                className={`flex h-9 items-center rounded-l-lg px-3 text-sm font-medium transition-colors ${
                  !showOnlyMine
                    ? 'bg-slate-100 text-slate-900 dark:bg-[#1e252e] dark:text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:text-slate-300'
                }`}
              >
                All
              </button>
              <button
                type='button'
                onClick={() => setShowOnlyMine(true)}
                className={`flex h-9 items-center gap-1.5 rounded-r-lg border-l border-slate-200 px-3 text-sm font-medium transition-colors dark:border-[#2d3540] ${
                  showOnlyMine
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:text-slate-300'
                }`}
              >
                <User className='h-3.5 w-3.5' />
                Mine
              </button>
            </div>

            {/* view mode: layout grid view and list view */}
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
            {/* status filter */}
            <FilterSelect
              value={statusFilter}
              options={STATUS_OPTIONS}
              icon={<SlidersHorizontal className='h-3.5 w-3.5' />}
              onChange={(value) => setStatusFilter(value as MapStatus | 'all')}
            />
          </div>

          {filtered.length !== maps.length && (
            <div className='mb-4 text-xs text-slate-400 dark:text-[#6b7a8d]'>
              Showing {filtered.length} of {maps.length} maps
            </div>
          )}

          {viewMode === 'grid' ? (
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              {filtered.map((map) => (
                <MapCard key={map.mapId} map={map} />
              ))}
            </div>
          ) : (
            <div className='space-y-3'>
              {filtered.map((map) => (
                <MapListRow key={map.mapId} map={map} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <Search className='mb-3 h-10 w-10 text-slate-300 dark:text-[#2d3540]' />
              <div className='text-sm font-medium text-slate-500 dark:text-[#9dabb9]'>
                No maps match your filters
              </div>
              <div className='mt-1 text-xs text-slate-400 dark:text-[#6b7a8d]'>
                Try adjusting your search or filter criteria.
              </div>
            </div>
          )}
        </div>

        {createMapModal}
      </div>

      {infoDrawer}
    </>
  );
}

function MapListRow({ map }: { map: MapSummary }) {
  const statusCfg = STATUS_CONFIG[map.status];

  return (
    <Link
      to={`/tools/system-catalog/${map.mapId}`}
      className='group flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-blue-500/50'
    >
      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-[#1e252e] dark:text-[#9dabb9]'>
        <NotebookText className='h-4 w-4' />
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
            {map.name}
          </span>
          <span
            className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${statusCfg.className}`}
          >
            {statusCfg.label}
          </span>
        </div>
        <p className='mt-0.5 truncate text-xs text-slate-500 dark:text-[#9dabb9]'>
          {map.description}
        </p>
      </div>

      <div className='flex shrink-0 items-center gap-3 text-xs text-slate-500 dark:text-[#9dabb9]'>
        <span>{map.nodeCount} nodes</span>
        <span className='text-slate-300 dark:text-[#2d3540]'>·</span>
        <span>{map.createdBy}</span>
        <span className='text-slate-300 dark:text-[#2d3540]'>·</span>
        <span>{getRelativeTime(map.updatedAt)}</span>
      </div>
    </Link>
  );
}
