/**
 * Workflow Run Detail Page
 *
 * Integrates the EnhancedTimeline and tabbed content. Tab selection is driven
 * by the `tab` query param (e.g. ?tab=libraries).
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageBreadcrumb } from '@/components/ui/PageBreadcrumb';
import { Tabs } from '@/components/ui/Tabs';
import {
  mockWorkflowRunDetails,
  mockWorkflowLibraries,
  mockWorkflowRunContexts,
  mockWorkflowReadsets,
} from '@/data/mockData';
import { workflowRunTimelineEvents, failedWorkflowTimelineEvents } from '@/data/mockTimelineData';
import type {
  TimelineEvent,
  AddCustomStateFormData,
  AddCommentFormData,
} from '@/components/timeline/timeline.type';
import { toast } from 'sonner';
import {
  useWorkflowRunDetailTab,
  type WorkflowRunDetailTabId,
} from '../hooks/useWorkflowRunDetailTab';
import {
  WorkflowRunDetailPageHeader,
  WorkflowRunOverviewCard,
  WorkflowRunTimelineTab,
  WorkflowRunLibrariesTab,
  WorkflowRunRunContextTab,
  WorkflowRunReadsetsTab,
} from '../components';

export function WorkflowRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useWorkflowRunDetailTab();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Timeline state - in real app, this would come from TanStack Query
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => {
    // Use different mock data based on workflow run ID
    if (id === 'WF004') return failedWorkflowTimelineEvents;
    return workflowRunTimelineEvents;
  });

  const workflowRun = id ? mockWorkflowRunDetails[id] : null;
  const libraries = id ? mockWorkflowLibraries[id] || [] : [];
  const runContexts = id ? mockWorkflowRunContexts[id] || [] : [];
  const readsets = id ? mockWorkflowReadsets[id] || [] : [];

  if (!workflowRun) {
    return (
      <div className='p-6'>
        <div className='py-12 text-center'>
          <h2 className='mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100'>
            Workflow Run Not Found
          </h2>
          <p className='mb-4 text-neutral-600 dark:text-neutral-400'>
            The workflow run you're looking for doesn't exist.
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

  const handleCopy = (text: string, id: string) => {
    // Try modern Clipboard API first, silently fall back if blocked
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => {
          // Fall back to textarea method
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
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
          } catch (err) {
            // Silently fail
            toast.error('Failed to copy text');
            console.error(err);
          } finally {
            textArea.remove();
          }
        });
    } else {
      // Use fallback method if Clipboard API unavailable
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
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        // Silently fail
        toast.error('Failed to copy text');
        console.error(err);
      } finally {
        textArea.remove();
      }

      textArea.remove();
    }
  };

  // Timeline handlers - in real app, these would call APIs
  const handleAddCustomState = async (data: AddCustomStateFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newEvent: TimelineEvent = {
      id: `evt_custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'custom_state',
      stateName: data.stateName,
      timestamp: data.timestamp,
      comment: data.comment || undefined,
      source: { type: 'custom' },
      runId: id!,
      runDisplayName: workflowRun.portalRunId,
    };

    setTimelineEvents((prev) => {
      return [...prev, newEvent].toSorted(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    console.log('Added custom state:', newEvent);
  };

  const handleAddComment = async (data: AddCommentFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newEvent: TimelineEvent = {
      id: `evt_comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'comment',
      timestamp: data.timestamp,
      comment: data.comment,
      source: { type: 'user', userName: 'current-user@orcabus.io' },
      runId: id!,
      runDisplayName: workflowRun.portalRunId,
    };

    setTimelineEvents((prev) => {
      return [...prev, newEvent].toSorted(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    console.log('Added comment:', newEvent);
  };

  const tabs: Array<{ id: WorkflowRunDetailTabId; label: string; count: number }> = [
    { id: 'timeline', label: 'Timeline', count: timelineEvents.length },
    { id: 'libraries', label: 'Libraries', count: workflowRun.libraryCount },
    { id: 'run-context', label: 'Run Context', count: workflowRun.runContextCount },
    { id: 'readsets', label: 'Readsets', count: workflowRun.readsetCount },
  ];

  return (
    <div className='p-6'>
      <PageBreadcrumb
        items={[
          { label: 'Workflows', href: '/workflows' },
          { label: 'Workflow Runs', href: '/workflows' },
          { label: workflowRun.name },
        ]}
      />

      <WorkflowRunDetailPageHeader
        workflowRun={workflowRun}
        copiedId={copiedId}
        onCopy={handleCopy}
      />
      <WorkflowRunOverviewCard workflowRun={workflowRun} />

      {/* Tabs - selection synced to ?tab= query param */}
      <div className='mb-6'>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      {activeTab === 'timeline' && (
        <WorkflowRunTimelineTab
          events={timelineEvents}
          filterLabel='Workflow Run ID'
          onAddCustomState={handleAddCustomState}
          onAddComment={handleAddComment}
        />
      )}
      {activeTab === 'libraries' && <WorkflowRunLibrariesTab libraries={libraries} />}
      {activeTab === 'run-context' && <WorkflowRunRunContextTab runContexts={runContexts} />}
      {activeTab === 'readsets' && <WorkflowRunReadsetsTab readsets={readsets} />}
    </div>
  );
}
