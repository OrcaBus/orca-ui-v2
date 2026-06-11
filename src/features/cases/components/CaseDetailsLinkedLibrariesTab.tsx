import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import { Link as LinkIcon, Unlink, Search } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { PillTag, type PillTagVariant } from '@/components/ui/PillTag';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constants';
import {
  useQueryMetadataLibraryModel,
  type LibraryDetailType,
  type QualityEnum,
} from '@/features/lab/shared/api/lab.api';
import { useCaseExternalEntityCreateModel, useCaseUnlinkEntityModel } from '../api/cases.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';

// ---------------------------------------------------------------------------
// Link Libraries Modal
// ---------------------------------------------------------------------------

interface CaseDetailsLinkLibrariesModalProps {
  isOpen: boolean;
  alreadyLinkedIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

function CaseDetailsLinkLibrariesModal({
  isOpen,
  alreadyLinkedIds,
  onClose,
  onSuccess,
}: CaseDetailsLinkLibrariesModalProps) {
  const { caseOrcabusId } = useParams<{ caseOrcabusId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const linkMutation = useCaseExternalEntityCreateModel();

  const { data: searchData, isLoading: isSearching } = useQueryMetadataLibraryModel({
    params: {
      query: {
        search: searchQuery || undefined,
        rowsPerPage: 20,
      },
    },
    reactQuery: {
      enabled: !!searchQuery,
    },
  });

  const availableLibraries = useMemo(
    () => (searchData?.results ?? []).filter((lib) => !alreadyLinkedIds.includes(lib.orcabusId)),
    [searchData, alreadyLinkedIds]
  );

  const handleToggle = (orcabusId: string) => {
    setSelectedIds((prev) =>
      prev.includes(orcabusId) ? prev.filter((id) => id !== orcabusId) : [...prev, orcabusId]
    );
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedIds([]);
    onClose();
  };

  const handleConfirm = async () => {
    if (!caseOrcabusId || selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedIds.map((libraryOrcabusId) =>
          linkMutation.mutateAsync({
            params: { path: { orcabusId: caseOrcabusId } },
            body: { externalEntity: libraryOrcabusId },
          })
        )
      );
      toast.success(
        `${selectedIds.length} ${selectedIds.length === 1 ? 'library' : 'libraries'} linked`
      );
      onSuccess();
    } catch {
      toast.error('Failed to link libraries');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={handleClose} />

      <div className='relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-[#111418]'>
        {/* Header */}
        <div className='border-b border-neutral-200 px-6 py-4 dark:border-neutral-700'>
          <h2 className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Link Libraries
          </h2>
          <p className='mt-0.5 text-sm text-neutral-500 dark:text-[#9dabb9]'>
            Search for libraries by Library ID or any attribute to link to this case.
          </p>
        </div>

        {/* Search */}
        <div className='border-b border-neutral-200 px-6 py-4 dark:border-neutral-700'>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by Library ID, phenotype, type...'
              className='w-full rounded-md border border-neutral-300 bg-white py-2 pr-4 pl-10 text-sm text-neutral-900 placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-[#1e252e] dark:text-neutral-100 dark:placeholder:text-[#9dabb9] dark:focus:ring-blue-500'
            />
          </div>
        </div>

        {/* Results */}
        <div className='flex-1 overflow-y-auto p-6'>
          {!searchQuery ? (
            <p className='py-6 text-center text-sm text-neutral-500 dark:text-[#9dabb9]'>
              Start typing to search for libraries.
            </p>
          ) : isSearching ? (
            <p className='py-6 text-center text-sm text-neutral-500 dark:text-[#9dabb9]'>
              Searching...
            </p>
          ) : availableLibraries.length === 0 ? (
            <p className='py-6 text-center text-sm text-neutral-500 dark:text-[#9dabb9]'>
              No libraries found matching your search.
            </p>
          ) : (
            <div className='space-y-2'>
              {availableLibraries.map((lib) => (
                <label
                  key={lib.orcabusId}
                  className='flex cursor-pointer items-center gap-3 rounded-md border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-[#1e252e]'
                >
                  <input
                    type='checkbox'
                    checked={selectedIds.includes(lib.orcabusId)}
                    onChange={() => handleToggle(lib.orcabusId)}
                    className='h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600'
                  />
                  <div className='flex-1'>
                    <div className='font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                      {lib.libraryId ?? lib.orcabusId}
                    </div>
                    <div className='mt-1 flex items-center gap-2'>
                      {lib.type && (
                        <PillTag variant='purple' size='sm'>
                          {lib.type as string}
                        </PillTag>
                      )}
                      {lib.phenotype && typeof lib.phenotype === 'string' && (
                        <PillTag variant='blue' size='sm'>
                          {lib.phenotype}
                        </PillTag>
                      )}
                      {lib.workflow && typeof lib.workflow === 'string' && (
                        <span className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                          {lib.workflow}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-[#1e252e]'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
              {selectedIds.length} {selectedIds.length === 1 ? 'library' : 'libraries'} selected
            </p>
            <div className='flex items-center gap-2'>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-[#111418] dark:text-neutral-200 dark:hover:bg-neutral-700/50'
              >
                Cancel
              </button>
              <button
                onClick={() => void handleConfirm()}
                disabled={selectedIds.length === 0 || isSubmitting}
                className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
              >
                <LinkIcon className='h-4 w-4' />
                {isSubmitting
                  ? 'Linking...'
                  : `Link${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Tab Component
// ---------------------------------------------------------------------------

export function CaseDetailsLinkedLibrariesTab() {
  const { caseDetail, refresh } = useCaseDetailsContext();
  const { caseOrcabusId } = useParams<{ caseOrcabusId: string }>();
  const navigate = useNavigate();

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Build a map: libraryOrcabusId → externalEntityOrcabusId (for unlinking).
  // We only care about external entities from the metadata service of type 'library'.
  const libraryEntityMap = useMemo(() => {
    const map: Record<string, string> = {};
    caseDetail?.externalEntitySet.forEach((link) => {
      if (
        link.externalEntity.serviceName === 'metadata' &&
        link.externalEntity.type === 'library'
      ) {
        map[link.externalEntity.orcabusId] = link.externalEntity.orcabusId;
      }
    });
    return map;
  }, [caseDetail]);

  const libraryOrcabusIdArray = useMemo(() => Object.keys(libraryEntityMap), [libraryEntityMap]);

  const {
    data: libraryData,
    isLoading: isLoadingLibraries,
    isRefetching: isRefetchingLibraries,
    isError: isErrorLibraries,
    error: libraryError,
    refetch: refetchLibraries,
  } = useQueryMetadataLibraryModel({
    params: {
      query: {
        orcabusId: libraryOrcabusIdArray,
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
      },
    },
    reactQuery: {
      enabled: libraryOrcabusIdArray.length > 0,
    },
  });

  const unlinkMutation = useCaseUnlinkEntityModel();

  const handleUnlink = (libraryOrcabusId: string) => {
    if (!caseOrcabusId) return;
    unlinkMutation.mutate(
      {
        params: {
          path: {
            orcabusId: caseOrcabusId,
            externalEntityOrcabusId: libraryOrcabusId,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success('Library unlinked');
          refresh();
        },
        onError: () => {
          toast.error('Failed to unlink library');
        },
      }
    );
  };

  const linkedLibraries = libraryData?.results ?? [];
  const pagination = useTablePagination(1, 10, linkedLibraries.length);

  const columns: Column<LibraryDetailType>[] = [
    {
      key: 'libraryId',
      header: 'Library ID',
      sortable: true,
      render: (lib) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            void navigate(`/lab/libraries/${lib.orcabusId}`);
          }}
          className='cursor-pointer font-mono font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400'
        >
          {lib.libraryId ?? lib.orcabusId}
        </button>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (lib) =>
        lib.type && typeof lib.type === 'string' ? (
          <PillTag variant='purple' size='sm'>
            {lib.type}
          </PillTag>
        ) : (
          <span className='text-neutral-400'>-</span>
        ),
    },
    {
      key: 'phenotype',
      header: 'Phenotype',
      sortable: true,
      render: (lib) => (
        <span className='text-sm text-neutral-700 dark:text-[#9dabb9]'>
          {typeof lib.phenotype === 'string' ? lib.phenotype : '-'}
        </span>
      ),
    },
    {
      key: 'workflow',
      header: 'Workflow',
      sortable: true,
      render: (lib) => (
        <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          {typeof lib.workflow === 'string' ? lib.workflow : '-'}
        </span>
      ),
    },
    {
      key: 'quality',
      header: 'Quality',
      sortable: true,
      render: (lib) => {
        const mapQualityToVariant: Record<QualityEnum, PillTagVariant> = {
          'very-poor': 'red',
          poor: 'red',
          good: 'green',
          borderline: 'amber',
        };
        if (!lib.quality || typeof lib.quality !== 'string') {
          return <span className='text-neutral-400'>-</span>;
        }
        const variant = mapQualityToVariant[lib.quality] ?? 'neutral';
        return (
          <PillTag variant={variant} size='sm'>
            {lib.quality}
          </PillTag>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (lib) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleUnlink(lib.orcabusId);
          }}
          disabled={unlinkMutation.isPending}
          className='rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10'
          title='Unlink library'
        >
          <Unlink className='h-4 w-4' />
        </button>
      ),
    },
  ];

  if (isErrorLibraries) {
    return <ApiErrorState error={libraryError} onRetry={() => void refetchLibraries()} />;
  }

  return (
    <>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
          Linked Libraries
        </h3>
        <button
          onClick={() => setIsLinkModalOpen(true)}
          className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
        >
          <LinkIcon className='h-4 w-4' />
          Link Libraries
        </button>
      </div>

      <DataTable
        data={linkedLibraries}
        columns={columns}
        isLoading={isLoadingLibraries || isRefetchingLibraries}
        emptyMessage='No libraries linked yet.'
        paginationProps={libraryOrcabusIdArray.length === 0 ? undefined : pagination}
      />

      <CaseDetailsLinkLibrariesModal
        isOpen={isLinkModalOpen}
        alreadyLinkedIds={libraryOrcabusIdArray}
        onClose={() => setIsLinkModalOpen(false)}
        onSuccess={() => {
          setIsLinkModalOpen(false);
          refresh();
        }}
      />
    </>
  );
}
