// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { WorkflowRunListModel } from '@/features/runs/shared/api/workflows.api';
import type { CaseDetailModel } from '../../api/cases.api';
import { useCaseDetailsContext } from '../../context/CaseDetailsContext';
import { CaseDetailsLinkedWorkflowRunsTab } from '../CaseDetailsLinkedWorkflowRunsTab';

type UnlinkCallbacks = {
  onSuccess: () => void;
  onError: () => void;
};

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  unlinkMutate: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  isPending: false,
}));

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ caseOrcabusId: 'cas.01CASE' }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

vi.mock('../../api/cases.api', () => ({
  useCaseUnlinkEntityModel: () => ({
    mutate: mocks.unlinkMutate,
    isPending: mocks.isPending,
  }),
}));

vi.mock('../../context/CaseDetailsContext', () => ({
  useCaseDetailsContext: vi.fn(),
}));

vi.mock('@/features/runs/shared/api/workflows.api', () => ({
  useWorkflowRunListModel: () => ({
    data: { results: [workflowRun] },
    isLoading: false,
    isRefetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/components/tables/DataTable', () => ({
  DataTable: ({
    data,
    columns,
  }: {
    data: Array<Record<string, unknown>>;
    columns: Array<{
      key: string;
      render?: (item: Record<string, unknown>) => React.ReactNode;
    }>;
  }) => (
    <table>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.key}>{column.render?.(item)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock('../CaseDetailsLinkWorkflowRunsModal', () => ({
  CaseDetailsLinkWorkflowRunsModal: () => null,
}));

vi.mock('../CaseDetailsLinkedWorkflowRunFilesTable', () => ({
  CaseDetailsLinkedWorkflowRunFilesTable: ({ portalRunId }: { portalRunId: string }) => (
    <div>Files for {portalRunId}</div>
  ),
}));

const workflowRun = {
  orcabusId: 'wfr.01WORKFLOW',
  portalRunId: 'portal-run-distinct',
  workflowRunName: 'Unique workflow run',
  workflow: { name: 'Alignment' },
  currentState: undefined,
} as unknown as WorkflowRunListModel;

const caseDetail = {
  externalEntitySet: [
    {
      externalEntity: {
        serviceName: 'workflow',
        type: 'workflow_run',
        orcabusId: workflowRun.orcabusId,
      },
    },
  ],
} as unknown as CaseDetailModel;

const useCaseDetailsContextMock = vi.mocked(useCaseDetailsContext);

function renderTab() {
  return render(<CaseDetailsLinkedWorkflowRunsTab />);
}

function viewFilesAction() {
  return screen.getByRole('button', { name: 'View files for workflow run Unique workflow run' });
}

function unlinkAction() {
  return screen.getByRole('button', { name: 'Unlink workflow run Unique workflow run' });
}

function confirmAction() {
  return screen.getByRole('button', {
    name: 'Confirm unlink workflow run Unique workflow run',
  });
}

function unlinkCallbacks(callIndex: number): UnlinkCallbacks {
  return mocks.unlinkMutate.mock.calls[callIndex]?.[1] as UnlinkCallbacks;
}

function openFilesViewWhileUnlinkModalIsOpen(fileAction: HTMLElement) {
  // Construct this defensive simultaneous state because modal inertness prevents the user interaction; ordinary paths use userEvent.
  act(() => {
    fileAction.click();
  });
}

afterEach(cleanup);

describe('CaseDetailsLinkedWorkflowRunsTab', () => {
  beforeEach(() => {
    mocks.isPending = false;
    mocks.refresh.mockReset();
    mocks.unlinkMutate.mockReset();
    mocks.toastError.mockReset();
    mocks.toastSuccess.mockReset();
    useCaseDetailsContextMock.mockReturnValue({
      caseDetail,
      isLoadingCaseDetail: false,
      caseStatesData: undefined,
      isLoadingCaseStates: false,
      refresh: mocks.refresh,
    });
  });

  it('matches the compact, left-aligned Lab workflow type selector', () => {
    renderTab();

    const allWorkflowTypes = screen.getByRole('button', { name: 'All1' });

    expect(allWorkflowTypes.classList.contains('h-9')).toBe(true);
    expect(allWorkflowTypes.classList.contains('justify-start')).toBe(true);
    expect(allWorkflowTypes.classList.contains('rounded-none')).toBe(true);
    expect(allWorkflowTypes.classList.contains('text-left')).toBe(true);
    expect(allWorkflowTypes.getAttribute('aria-pressed')).toBe('true');
    expect(allWorkflowTypes.firstElementChild?.classList.contains('w-full')).toBe(true);
  });

  it('labels file and unlink actions, and requires confirmation after cancellation', async () => {
    const user = userEvent.setup();
    renderTab();

    expect(viewFilesAction()).toBeTruthy();
    expect(unlinkAction()).toBeTruthy();

    await user.click(unlinkAction());

    expect(screen.getByRole('heading', { name: 'Unlink Workflow Run' })).toBeTruthy();
    expect(mocks.unlinkMutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Unlink Workflow Run' })).toBeNull();
    });
    expect(mocks.unlinkMutate).not.toHaveBeenCalled();

    await user.click(unlinkAction());

    expect(screen.getByRole('heading', { name: 'Unlink Workflow Run' })).toBeTruthy();
    expect(mocks.unlinkMutate).not.toHaveBeenCalled();
  });

  it('submits the workflow run OrcaBus ID after confirmation', async () => {
    const user = userEvent.setup();
    renderTab();

    await user.click(unlinkAction());
    await user.click(confirmAction());

    expect(mocks.unlinkMutate).toHaveBeenCalledOnce();
    expect(mocks.unlinkMutate.mock.calls[0]?.[0]).toEqual({
      params: {
        path: {
          orcabusId: 'cas.01CASE',
          externalEntityOrcabusId: 'wfr.01WORKFLOW',
        },
      },
    });
  });

  it('keeps the confirmation target and files view after an error, then retries', async () => {
    const user = userEvent.setup();
    renderTab();
    const fileAction = viewFilesAction();

    await user.click(unlinkAction());
    openFilesViewWhileUnlinkModalIsOpen(fileAction);

    expect(screen.getByText('Files for portal-run-distinct')).toBeTruthy();
    await user.click(confirmAction());
    act(() => {
      unlinkCallbacks(0).onError();
    });

    expect(mocks.toastError).toHaveBeenCalledWith('Failed to unlink workflow run');
    expect(screen.getByRole('heading', { name: 'Unlink Workflow Run' })).toBeTruthy();
    expect(screen.getByText('Files for portal-run-distinct')).toBeTruthy();

    await user.click(confirmAction());

    expect(mocks.unlinkMutate).toHaveBeenCalledTimes(2);
  });

  it('clears the selected files view only after successful unlinking', async () => {
    const user = userEvent.setup();
    renderTab();
    const fileAction = viewFilesAction();

    await user.click(unlinkAction());
    openFilesViewWhileUnlinkModalIsOpen(fileAction);
    expect(screen.getByText('Files for portal-run-distinct')).toBeTruthy();

    await user.click(confirmAction());
    act(() => {
      unlinkCallbacks(0).onSuccess();
    });

    expect(mocks.toastSuccess).toHaveBeenCalledWith('Workflow run unlinked');
    expect(mocks.refresh).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Unlink Workflow Run' })).toBeNull();
      expect(screen.queryByText('Files for portal-run-distinct')).toBeNull();
    });
  });

  it('disables unlink and confirmation controls while pending', async () => {
    const user = userEvent.setup();
    const { rerender } = renderTab();

    expect(viewFilesAction()).toBeTruthy();
    await user.click(unlinkAction());
    mocks.isPending = true;
    rerender(<CaseDetailsLinkedWorkflowRunsTab />);

    expect(
      screen
        .getByRole('button', { name: 'Unlink workflow run Unique workflow run', hidden: true })
        .matches(':disabled')
    ).toBe(true);
    expect(screen.getByRole('button', { name: 'Cancel' }).matches(':disabled')).toBe(true);
    expect(confirmAction().matches(':disabled')).toBe(true);
  });
});
