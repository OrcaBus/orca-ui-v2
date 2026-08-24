/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import {
  Activity,
  Briefcase,
  ChartNoAxesColumn,
  CirclePlay,
  Dna,
  FileText,
  LibraryBig,
  Search,
} from 'lucide-react';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Input } from '@/components/ui/Input';
import {
  mockAnalysisRuns,
  mockCases,
  mockLibraries,
  mockSequenceRuns,
  mockWorkflowRuns,
  type AnalysisRun,
  type Case,
  type Library,
  type SequenceRun,
  type WorkflowRun,
} from '@/data/mockData';
import { mockFilesFromApi } from '@/data/mockFileData';
import { cn } from '@/utils/cn';

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
  icon: ReactNode;
  items: GlobalSearchResult[];
}

export interface GlobalSearchGroup {
  id: string;
  label: string;
  icon: ReactNode;
  items: GlobalSearchResult[];
  sections?: GlobalSearchSection[];
}

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

const MAX_RESULTS_PER_SECTION = 5;

function includesQuery(value: unknown, query: string) {
  if (value === null || value === undefined) return false;
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
    return false;
  }
  return String(value).toLowerCase().includes(query);
}

function matchesCase(item: Case, query: string) {
  return [item.title, item.alias, item.description, item.id, item.status, item.type].some((value) =>
    includesQuery(value, query)
  );
}

function matchesLibrary(item: Library, query: string) {
  return [
    item.name,
    item.orcabusId,
    item.projectName,
    item.sampleId,
    item.externalSampleId,
    item.subjectId,
    item.type,
    item.assay,
    item.workflow,
  ].some((value) => includesQuery(value, query));
}

function matchesSequenceRun(item: SequenceRun, query: string) {
  return [item.runId, item.instrumentRunId, item.instrument, item.flowcellId, item.status].some(
    (value) => includesQuery(value, query)
  );
}

function matchesWorkflowRun(item: WorkflowRun, query: string) {
  return [
    item.name,
    item.id,
    item.portalRunId,
    item.executionId,
    item.workflowType,
    item.status,
    item.libraryId,
  ].some((value) => includesQuery(value, query));
}

function matchesAnalysisRun(item: AnalysisRun, query: string) {
  return [
    item.name,
    item.id,
    item.analysisId,
    item.analysisName,
    item.analysisVersion,
    item.analysisType,
    item.status,
    item.caseId,
    item.owner,
  ].some((value) => includesQuery(value, query));
}

function buildDescription(...parts: Array<string | number | undefined | null>) {
  return parts.filter(Boolean).join(' · ');
}

export function getGlobalSearchGroups(rawQuery: string): GlobalSearchGroup[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const cases = mockCases
    .filter((item) => matchesCase(item, query))
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map<GlobalSearchResult>((item) => ({
      id: item.id,
      title: item.title,
      description: buildDescription(item.alias, item.type, item.status),
      href: `/cases/${item.id}`,
      badge: item.type,
    }));

  const labs = mockLibraries
    .filter((item) => matchesLibrary(item, query))
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map<GlobalSearchResult>((item) => ({
      id: item.id,
      title: item.name,
      description: buildDescription(item.projectName, item.sampleId, item.assay),
      href: `/lab/libraries/${item.orcabusId}`,
      badge: item.type,
    }));

  const sequenceRuns = mockSequenceRuns
    .filter((item) => matchesSequenceRun(item, query))
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map<GlobalSearchResult>((item) => ({
      id: item.id,
      title: item.instrumentRunId,
      description: buildDescription(item.instrument, item.flowcellId, item.status),
      href: `/runs/sequence-runs/${item.instrumentRunId}`,
      badge: item.status,
    }));

  const workflowRuns = mockWorkflowRuns
    .filter((item) => matchesWorkflowRun(item, query))
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map<GlobalSearchResult>((item) => ({
      id: item.id,
      title: item.name,
      description: buildDescription(item.workflowType, item.portalRunId, item.status),
      href: `/runs/workflow-runs/${item.id}`,
      badge: item.status,
    }));

  const analysisRuns = mockAnalysisRuns
    .filter((item) => matchesAnalysisRun(item, query))
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map<GlobalSearchResult>((item) => ({
      id: item.id,
      title: item.name,
      description: buildDescription(item.analysisName, item.analysisVersion, item.status),
      href: `/runs/analysis-runs/${item.id}`,
      badge: item.status,
    }));

  const files = mockFilesFromApi
    .filter((item) =>
      [item.name, item.s3Key, item.bucket, item.portalRunId, item.type].some((value) =>
        includesQuery(value, query)
      )
    )
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map<GlobalSearchResult>((item) => ({
      id: item.id,
      title: item.name,
      description: buildDescription(item.bucket, item.portalRunId, item.s3Key),
      href: `/files?search=${encodeURIComponent(item.name)}`,
      badge: item.type,
    }));

  const runsSections: GlobalSearchSection[] = [
    {
      id: 'sequence-runs',
      label: 'Sequence Runs',
      icon: <Dna className='h-4 w-4' />,
      items: sequenceRuns,
    },
    {
      id: 'workflow-runs',
      label: 'Workflow Runs',
      icon: <CirclePlay className='h-4 w-4' />,
      items: workflowRuns,
    },
    {
      id: 'analysis-runs',
      label: 'Analysis Runs',
      icon: <ChartNoAxesColumn className='h-4 w-4' />,
      items: analysisRuns,
    },
  ].filter((section) => section.items.length > 0);

  return [
    {
      id: 'cases',
      label: 'Cases',
      icon: <Briefcase className='h-4 w-4' />,
      items: cases,
    },
    {
      id: 'labs',
      label: 'Labs',
      icon: <LibraryBig className='h-4 w-4' />,
      items: labs,
    },
    {
      id: 'runs',
      label: 'Runs',
      icon: <Activity className='h-4 w-4' />,
      items: runsSections.flatMap((section) => section.items),
      sections: runsSections,
    },
    {
      id: 'files',
      label: 'Files',
      icon: <FileText className='h-4 w-4' />,
      items: files,
    },
  ].filter((group) => group.items.length > 0);
}

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
          <div className='text-muted-foreground mt-0.5 line-clamp-1 text-xs'>
            {item.description}
          </div>
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

function SearchGroup({ group, onClose }: { group: GlobalSearchGroup; onClose: () => void }) {
  return (
    <section className='rounded-md border border-slate-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      <div className='flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-[#2d3540] dark:text-[#9dabb9]'>
        {group.icon}
        <span>{group.label}</span>
      </div>
      <div className='p-1'>
        {group.sections
          ? group.sections.map((section) => (
              <div key={section.id} className='py-1'>
                <div className='text-caption flex items-center gap-2 px-3 py-1 font-semibold text-slate-400 dark:text-[#9dabb9]/70'>
                  {section.icon}
                  <span>{section.label}</span>
                </div>
                {section.items.map((item) => (
                  <ResultRow key={item.id} item={item} onClose={onClose} />
                ))}
              </div>
            ))
          : group.items.map((item) => <ResultRow key={item.id} item={item} onClose={onClose} />)}
      </div>
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
      description='Search across cases, labs, runs, and files.'
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
  const groups = useMemo(() => getGlobalSearchGroups(query), [query]);
  const hasQuery = query.trim().length > 0;

  return (
    <>
      <div className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#9dabb9]' />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder='Search cases, labs, sequence runs, workflow runs, analysis runs, or files...'
          autoFocus
          className='h-11 bg-white pl-10 text-sm dark:bg-[#111418]'
        />
      </div>

      <div
        className={cn(
          'max-h-[60vh] min-h-48 overflow-y-auto',
          groups.length > 0 ? 'space-y-3' : 'flex items-center justify-center'
        )}
      >
        {!hasQuery && (
          <div className='text-muted-foreground text-center text-sm'>
            Start typing to search across cases, labs, runs, and files.
          </div>
        )}

        {hasQuery && groups.length === 0 && (
          <div className='text-muted-foreground text-center text-sm'>
            No results found for "{query.trim()}".
          </div>
        )}

        {groups.map((group) => (
          <SearchGroup key={group.id} group={group} onClose={onClose} />
        ))}
      </div>
    </>
  );
}
