import { useMemo } from 'react';
import {
  Briefcase,
  ChartNoAxesColumn,
  CirclePlay,
  Dna,
  LibraryBig,
  type LucideIcon,
} from 'lucide-react';
import { useCaseListModel } from '@/features/cases/api/cases.api';
import { useQueryMetadataLibraryModel } from '@/features/lab/shared/api/lab.api';
import { useSequenceRunListByInstrumentRunIdModel } from '@/features/runs/shared/api/sequence.api';
import {
  useAnalysisRunListQueryModel,
  useWorkflowRunListModel,
} from '@/features/runs/shared/api/workflows.api';
import { PARAM_SEARCH } from '@/utils/constants';

/** Number of rows fetched (and shown) per section before the "more" link takes over. */
export const GLOBAL_SEARCH_RESULT_LIMIT = 5;

export interface GlobalSearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export interface GlobalSearchSection {
  id: string;
  label: string;
  icon: LucideIcon;
  items: GlobalSearchResult[];
  /** Total matches reported by the API, not just the ones listed here. */
  totalCount: number;
  /** True when the API has more matches than the ones listed here. */
  hasMore: boolean;
  /** List page for this section, pre-filtered with the current search term. */
  viewAllHref: string;
  isLoading: boolean;
  isError: boolean;
}

function buildDescription(...parts: Array<string | number | null | undefined>): string {
  return parts.filter(Boolean).join(' · ');
}

/** List page URL carrying the current query in the shared `search` param. */
function buildViewAllHref(pathname: string, search: string): string {
  return `${pathname}?${PARAM_SEARCH}=${encodeURIComponent(search)}`;
}

/**
 * Runs one search request per entity type against the real APIs and shapes the
 * responses into uniform result sections.
 *
 * Every request is capped at `GLOBAL_SEARCH_RESULT_LIMIT` rows; the paginated
 * `count` is kept so a section can offer a "more" link into its list page.
 * Requests stay disabled until a non-empty query is supplied.
 */
export function useGlobalSearch(rawQuery: string): GlobalSearchSection[] {
  const search = rawQuery.trim();
  const enabled = search.length > 0;

  const listQuery = {
    page: 1,
    rowsPerPage: GLOBAL_SEARCH_RESULT_LIMIT,
    search,
  };
  const reactQuery = { enabled };

  const casesResult = useCaseListModel({ params: { query: listQuery }, reactQuery });
  const librariesResult = useQueryMetadataLibraryModel({
    params: { query: listQuery },
    reactQuery,
  });
  const sequenceRunsResult = useSequenceRunListByInstrumentRunIdModel({
    params: { query: listQuery },
    reactQuery,
  });
  const workflowRunsResult = useWorkflowRunListModel({ params: { query: listQuery }, reactQuery });
  const analysisRunsResult = useAnalysisRunListQueryModel({
    params: { query: listQuery },
    reactQuery,
  });

  const cases = casesResult.data;
  const libraries = librariesResult.data;
  const sequenceRuns = sequenceRunsResult.data;
  const workflowRuns = workflowRunsResult.data;
  const analysisRuns = analysisRunsResult.data;

  return useMemo(() => {
    if (!enabled) return [];

    const caseItems =
      cases?.results?.map<GlobalSearchResult>((item) => ({
        id: item.orcabusId,
        title: item.requestFormId,
        description: buildDescription(
          item.studyName,
          item.urNumber,
          item.alias?.length ? item.alias.join(', ') : undefined
        ),
        href: `/cases/${item.orcabusId}`,
        badge: item.type,
      })) ?? [];

    const libraryItems =
      libraries?.results?.map<GlobalSearchResult>((item) => ({
        id: item.orcabusId,
        title: item.libraryId ?? item.orcabusId,
        description: buildDescription(
          item.subject?.subjectId,
          item.sample?.sampleId,
          item.assay,
          item.phenotype
        ),
        href: `/lab/libraries/${item.orcabusId}`,
        badge: item.type ?? undefined,
      })) ?? [];

    const sequenceRunItems =
      sequenceRuns?.results?.map<GlobalSearchResult>((item) => ({
        id: item.instrumentRunId,
        title: item.instrumentRunId,
        description: buildDescription(
          item.count ? `${item.count} sequence run${item.count === 1 ? '' : 's'}` : undefined,
          item.items?.[0]?.experimentName
        ),
        href: `/runs/sequence-runs/${item.instrumentRunId}`,
        badge: item.status ?? undefined,
      })) ?? [];

    const workflowRunItems =
      workflowRuns?.results?.map<GlobalSearchResult>((item) => ({
        id: item.orcabusId,
        title: item.workflowRunName ?? item.portalRunId,
        description: buildDescription(item.workflow?.name, item.portalRunId),
        href: `/runs/workflow-runs/${item.orcabusId}`,
        badge: item.currentState?.status ?? undefined,
      })) ?? [];

    const analysisRunItems =
      analysisRuns?.results?.map<GlobalSearchResult>((item) => ({
        id: item.orcabusId,
        title: item.analysisRunName,
        description: buildDescription(
          item.analysis?.analysisName,
          item.analysis?.analysisVersion,
          item.libraries?.length ? `${item.libraries.length} libraries` : undefined
        ),
        href: `/runs/analysis-runs/${item.orcabusId}`,
        badge: item.currentState?.status ?? undefined,
      })) ?? [];

    const sections: GlobalSearchSection[] = [
      {
        id: 'cases',
        label: 'Cases',
        icon: Briefcase,
        items: caseItems,
        totalCount: cases?.pagination?.count ?? caseItems.length,
        hasMore: false,
        viewAllHref: buildViewAllHref('/cases', search),
        isLoading: casesResult.isLoading,
        isError: casesResult.isError,
      },
      {
        id: 'libraries',
        label: 'Lab (Library)',
        icon: LibraryBig,
        items: libraryItems,
        totalCount: libraries?.pagination?.count ?? libraryItems.length,
        hasMore: false,
        viewAllHref: buildViewAllHref('/lab', search),
        isLoading: librariesResult.isLoading,
        isError: librariesResult.isError,
      },
      {
        id: 'sequence-runs',
        label: 'Sequence Runs',
        icon: Dna,
        items: sequenceRunItems,
        totalCount: sequenceRuns?.pagination?.count ?? sequenceRunItems.length,
        hasMore: false,
        viewAllHref: buildViewAllHref('/runs/sequence-runs', search),
        isLoading: sequenceRunsResult.isLoading,
        isError: sequenceRunsResult.isError,
      },
      {
        id: 'workflow-runs',
        label: 'Workflow Runs',
        icon: CirclePlay,
        items: workflowRunItems,
        totalCount: workflowRuns?.pagination?.count ?? workflowRunItems.length,
        hasMore: false,
        viewAllHref: buildViewAllHref('/runs/workflow-runs', search),
        isLoading: workflowRunsResult.isLoading,
        isError: workflowRunsResult.isError,
      },
      {
        id: 'analysis-runs',
        label: 'Analysis Runs',
        icon: ChartNoAxesColumn,
        items: analysisRunItems,
        totalCount: analysisRuns?.pagination?.count ?? analysisRunItems.length,
        hasMore: false,
        viewAllHref: buildViewAllHref('/runs/analysis-runs', search),
        isLoading: analysisRunsResult.isLoading,
        isError: analysisRunsResult.isError,
      },
    ];

    return sections.map((section) => ({
      ...section,
      hasMore: section.totalCount > section.items.length,
    }));
  }, [
    enabled,
    search,
    cases,
    libraries,
    sequenceRuns,
    workflowRuns,
    analysisRuns,
    casesResult.isLoading,
    casesResult.isError,
    librariesResult.isLoading,
    librariesResult.isError,
    sequenceRunsResult.isLoading,
    sequenceRunsResult.isError,
    workflowRunsResult.isLoading,
    workflowRunsResult.isError,
    analysisRunsResult.isLoading,
    analysisRunsResult.isError,
  ]);
}
