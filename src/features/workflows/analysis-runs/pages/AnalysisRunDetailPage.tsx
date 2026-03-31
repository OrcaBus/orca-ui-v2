/**
 * Analysis Run Detail Page
 *
 * Tab selection is driven by the `tab` query param (e.g. ?tab=libraries).
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageBreadcrumb } from '@/components/ui/PageBreadcrumb';
import { Tabs } from '@/components/ui/Tabs';
import {
  mockAnalysisRunDetails,
  mockAnalysisWorkflowRuns,
  mockAnalysisLibraries,
  mockAnalysisRunContexts,
  mockAnalysisReadsets,
} from '@/data/mockData';
import {
  useAnalysisRunDetailTab,
  type AnalysisRunDetailTabId,
} from '../hooks/useAnalysisRunDetailTab';
import {
  AnalysisRunDetailPageHeader,
  AnalysisRunOverviewCard,
  AnalysisWorkflowRunsTab,
  AnalysisLibrariesTab,
  AnalysisRunContextTab,
  AnalysisReadsetsTab,
} from '../components';

export function AnalysisRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useAnalysisRunDetailTab();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const analysisRun = id ? mockAnalysisRunDetails[id] : null;
  const workflowRuns = id ? mockAnalysisWorkflowRuns[id] || [] : [];
  const libraries = id ? mockAnalysisLibraries[id] || [] : [];
  const runContexts = id ? mockAnalysisRunContexts[id] || [] : [];
  const readsets = id ? mockAnalysisReadsets[id] || [] : [];

  if (!analysisRun) {
    return (
      <div className='p-6'>
        <div className='py-12 text-center'>
          <h2 className='mb-2 text-xl font-semibold text-neutral-900 dark:text-white'>
            Analysis Run Not Found
          </h2>
          <p className='mb-4 text-neutral-600 dark:text-neutral-400'>
            The analysis run you're looking for doesn't exist.
          </p>
          <button
            onClick={() => {
              void navigate('/workflows');
            }}
            className='text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            Back to Workflows
          </button>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, copyId: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedId(copyId);
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
            setCopiedId(copyId);
            setTimeout(() => setCopiedId(null), 2000);
          } catch {
            // Silently fail
          }
          textArea.remove();
        });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(copyId);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        // Silently fail
      }
      textArea.remove();
    }
  };

  const tabs: Array<{ id: AnalysisRunDetailTabId; label: string; count: number }> = [
    { id: 'workflow-runs', label: 'Workflow Runs', count: analysisRun.workflowRunCount },
    { id: 'libraries', label: 'Libraries', count: analysisRun.libraryCount },
    { id: 'run-context', label: 'Run Context', count: analysisRun.contextCount },
    { id: 'readsets', label: 'Readsets', count: analysisRun.readsetCount },
  ];

  return (
    <div className='p-6'>
      <PageBreadcrumb
        items={[
          { label: 'Workflows', href: '/workflows' },
          { label: 'Analysis Runs', href: '/workflows/analysisRuns' },
          { label: analysisRun.name },
        ]}
      />

      <AnalysisRunDetailPageHeader
        analysisRun={analysisRun}
        copiedId={copiedId}
        onCopy={handleCopy}
      />
      <AnalysisRunOverviewCard analysisRun={analysisRun} />

      {/* Tabs - selection synced to ?tab= query param */}
      <div className='mb-6'>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === 'workflow-runs' && <AnalysisWorkflowRunsTab workflowRuns={workflowRuns} />}
      {activeTab === 'libraries' && <AnalysisLibrariesTab libraries={libraries} />}
      {activeTab === 'run-context' && <AnalysisRunContextTab runContexts={runContexts} />}
      {activeTab === 'readsets' && (
        <AnalysisReadsetsTab readsets={readsets} copiedId={copiedId} onCopy={handleCopy} />
      )}
    </div>
  );
}
