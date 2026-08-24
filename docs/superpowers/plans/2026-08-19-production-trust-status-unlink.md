# Production Trust Status and Unlink Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render every supported workflow lifecycle state consistently and require explicit confirmation before unlinking libraries or workflow runs from cases.

**Architecture:** `status-config.ts` remains the canonical lifecycle registry; timelines, badges, and stat icons normalize through it. Case unlinking uses a typed target/request utility plus one presentational confirmation modal, while each case tab retains its existing mutation, toast, refresh, and view-cleanup responsibilities.

**Tech Stack:** React 19, TypeScript 6, React Router 8, Headless UI, Tailwind CSS 4, Lucide React, TanStack Query, Vitest, Testing Library, JSDOM.

---

## Preconditions

- Work in `/Users/rayliu/orcabus-work/orca-ui-v2/.worktrees/status-unlink-trust` on branch `feat/status-unlink-trust`.
- Use Node 24.16.0, matching `.github/workflows/pr-tests.yml`'s Node 24 CI runtime.
- The branch already includes baseline repair commit `9aa87d6`, which removes the incompatible `react-router-dom` 7 / `react-router` 8 pairing.
- Generated OpenAPI declarations are copied into `src/api/types/` locally and remain ignored by Git.
- Do not modify global search or any file under `src/features/vault/`.

## File Map

### Status lifecycle

- Create `src/components/ui/__tests__/status-config.test.ts`: canonical status, alias, normalization, fallback, and family tests.
- Modify `src/components/ui/status-config.ts`: canonical workflow entries and typed alias resolution.
- Create `src/features/runs/shared/utils/__tests__/statusIcons.test.tsx`: stat-icon coverage for supported workflow states.
- Modify `src/features/runs/shared/utils/statusIcons.tsx`: render run icons from canonical registry metadata.
- Modify `src/components/timeline/timeline.visuals.ts`: obtain orchestration-state families from the registry.
- Modify `src/components/timeline/__tests__/timeline.visuals.test.ts`: orchestration state and alias consistency tests.
- Modify `src/features/runs/workflow-runs/components/WorkflowRunsStatsCards.tsx`: derive card variants from the registry.
- Modify `src/features/runs/analysis-runs/components/AnalysisRunsStatusCards.tsx`: derive card variants from the registry.

### Case unlinking

- Modify `package.json` and `pnpm-lock.yaml`: add Testing Library, user-event, and JSDOM as test-only dependencies.
- Create `src/features/cases/utils/caseUnlink.ts`: typed unlink target, request builder, and mutation submission boundary.
- Create `src/features/cases/utils/__tests__/caseUnlink.test.ts`: endpoint path, success, failure, and retry tests.
- Create `src/features/cases/components/CaseDetailsUnlinkEntityModal.tsx`: shared confirmation presentation.
- Create `src/features/cases/components/__tests__/CaseDetailsUnlinkEntityModal.test.tsx`: copy, accessibility, and pending-state rendering tests.
- Modify `src/features/cases/components/CaseDetailsLinkedLibrariesTab.tsx`: select target, confirm mutation, retain failure context.
- Modify `src/features/cases/components/CaseDetailsLinkedWorkflowRunsTab.tsx`: select target, confirm mutation, retain failure context, clear files view on success.
- Modify `src/features/cases/components/CaseDetailsLinkedWorkflowRunsTable.tsx`: pass the selected run to the parent and label icon-only actions.

## Task 1: Make Workflow Status Normalization Exhaustive

**Files:**

- Create: `src/components/ui/__tests__/status-config.test.ts`
- Modify: `src/components/ui/status-config.ts`

- [ ] **Step 1: Write the failing registry tests**

Create `src/components/ui/__tests__/status-config.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  getStatusFamily,
  normalizeStatusBadgeKey,
  statusConfig,
  type StatusBadgeStatus,
  type StatusFamily,
} from '../status-config';

const workflowStates: Array<[StatusBadgeStatus, StatusFamily]> = [
  ['draft', 'neutral'],
  ['submitted', 'neutral'],
  ['runnable', 'neutral'],
  ['starting', 'neutral'],
  ['started', 'info'],
  ['running', 'info'],
  ['succeeded', 'success'],
  ['failed', 'error'],
  ['aborted', 'neutral'],
  ['cancelled', 'neutral'],
  ['resolved', 'info'],
  ['deprecated', 'neutral'],
];

describe('workflow status registry', () => {
  it.each(workflowStates)('maps %s to the %s family', (status, family) => {
    expect(normalizeStatusBadgeKey(status)).toBe(status);
    expect(getStatusFamily(status)).toBe(family);
    expect(statusConfig[status].label).not.toBe('Unknown');
  });

  it.each([
    ['canceled', 'cancelled'],
    ['complete', 'succeeded'],
    ['success', 'succeeded'],
    ['error', 'failed'],
    ['initializing', 'started'],
  ] as const)('normalizes alias %s to %s', (raw, canonical) => {
    expect(normalizeStatusBadgeKey(raw)).toBe(canonical);
    expect(getStatusFamily(raw)).toBe(statusConfig[canonical].family);
  });

  it.each([
    [' SUBMITTED ', 'submitted'],
    ['not_started', 'not-started'],
    ['request received', 'request-received'],
  ] as const)('normalizes formatting in %s', (raw, canonical) => {
    expect(normalizeStatusBadgeKey(raw)).toBe(canonical);
  });

  it.each([null, undefined, '', '   ', 'unkown', 'brand-new-state'])(
    'falls back to unknown for %s',
    (raw) => {
      expect(normalizeStatusBadgeKey(raw)).toBe('unknown');
      expect(getStatusFamily(raw)).toBe('neutral');
    }
  );
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm test src/components/ui/__tests__/status-config.test.ts
```

Expected: FAIL because `submitted`, `runnable`, `starting`, `started`, and `cancelled` are not valid `StatusBadgeStatus` keys and aliases resolve to `unknown`.

- [ ] **Step 3: Add canonical entries and alias normalization**

In `src/components/ui/status-config.ts`, add `CircleArrowUp` to the Lucide imports, then insert these entries after `draft`:

```ts
  submitted: {
    family: 'neutral',
    label: 'Submitted',
    icon: CircleArrowUp,
    tooltip: 'Workflow has been submitted to the orchestration system',
  },
  runnable: {
    family: 'neutral',
    label: 'Runnable',
    icon: PlayCircle,
    tooltip: 'Workflow is eligible to start when execution capacity is available',
  },
  starting: {
    family: 'neutral',
    label: 'Starting',
    icon: Clock,
    tooltip: 'Workflow is preparing to start execution',
  },
  started: {
    family: 'info',
    label: 'Started',
    icon: Loader,
    tooltip: 'Workflow execution has started',
    animate: true,
  },
```

Insert `cancelled` after `aborted`:

```ts
  cancelled: {
    family: 'neutral',
    label: 'Cancelled',
    icon: Ban,
    tooltip: 'Workflow execution was cancelled',
  },
```

Replace `normalizeStatusBadgeKey` with the typed alias map and normalizer:

```ts
export type StatusBadgeStatus = keyof typeof statusConfig;

const STATUS_ALIASES = {
  canceled: 'cancelled',
  complete: 'succeeded',
  success: 'succeeded',
  error: 'failed',
  initializing: 'started',
} as const satisfies Record<string, StatusBadgeStatus>;

export function normalizeStatusBadgeKey(raw: string | null | undefined): StatusBadgeStatus {
  if (raw == null || String(raw).trim() === '') {
    return 'unknown';
  }

  const normalized = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-');
  const aliased = STATUS_ALIASES[normalized as keyof typeof STATUS_ALIASES] ?? normalized;

  if (aliased in statusConfig) {
    return aliased as StatusBadgeStatus;
  }

  if (normalized === 'unkown') {
    return 'unknown';
  }

  return 'unknown';
}
```

- [ ] **Step 4: Run the registry test and verify GREEN**

Run:

```bash
pnpm test src/components/ui/__tests__/status-config.test.ts
```

Expected: PASS with all canonical, alias, formatting, and fallback cases green.

- [ ] **Step 5: Commit the registry change**

```bash
git add src/components/ui/status-config.ts src/components/ui/__tests__/status-config.test.ts
git commit -m "fix: make workflow status registry exhaustive"
```

## Task 2: Make Timeline and Stat Consumers Use the Registry

**Files:**

- Create: `src/features/runs/shared/utils/__tests__/statusIcons.test.tsx`
- Modify: `src/features/runs/shared/utils/statusIcons.tsx`
- Modify: `src/components/timeline/timeline.visuals.ts`
- Modify: `src/components/timeline/__tests__/timeline.visuals.test.ts`
- Modify: `src/features/runs/workflow-runs/components/WorkflowRunsStatsCards.tsx`
- Modify: `src/features/runs/analysis-runs/components/AnalysisRunsStatusCards.tsx`

- [ ] **Step 1: Write failing icon and timeline tests**

Create `src/features/runs/shared/utils/__tests__/statusIcons.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getRunsStatusIcon } from '../statusIcons';

describe('getRunsStatusIcon', () => {
  it.each([
    'draft',
    'submitted',
    'runnable',
    'starting',
    'started',
    'running',
    'succeeded',
    'failed',
    'aborted',
    'cancelled',
    'resolved',
    'deprecated',
  ])('renders a registry icon for %s', (status) => {
    expect(renderToStaticMarkup(getRunsStatusIcon(status))).toContain('<svg');
  });

  it('normalizes uppercase and alias values', () => {
    expect(renderToStaticMarkup(getRunsStatusIcon('CANCELED'))).toContain('<svg');
    expect(renderToStaticMarkup(getRunsStatusIcon('SUCCESS'))).toContain('<svg');
  });

  it('returns null for an unsupported status', () => {
    expect(getRunsStatusIcon('brand-new-state')).toBeNull();
  });
});
```

Add this test inside the existing `getTimelineStateVisual` describe block in `src/components/timeline/__tests__/timeline.visuals.test.ts`:

```ts
it.each([
  ['SUBMITTED', 'neutral-100'],
  ['RUNNABLE', 'neutral-100'],
  ['STARTING', 'neutral-100'],
  ['STARTED', 'blue'],
  ['CANCELLED', 'neutral-100'],
  ['CANCELED', 'neutral-100'],
])('uses the registry family for workflow state %s', (status, expectedClassPart) => {
  expect(getTimelineStateVisual(status).badgeClassName).toContain(expectedClassPart);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
pnpm test src/features/runs/shared/utils/__tests__/statusIcons.test.tsx src/components/timeline/__tests__/timeline.visuals.test.ts
```

Expected: FAIL because run icons do not normalize aliases and do not render `cancelled`, `submitted`, `runnable`, `starting`, or `started` from registry metadata.

- [ ] **Step 3: Render workflow-run icons from registry metadata**

In `src/features/runs/shared/utils/statusIcons.tsx`, replace the Lucide import with:

```ts
import {
  XCircle,
  Archive,
  ShieldCheck,
  ShieldQuestion,
  CircleDot,
  CircleOff,
  Hash,
} from 'lucide-react';
```

Replace the registry import with:

```ts
import {
  FAMILY_ACCENT,
  getStatusFamily,
  normalizeStatusBadgeKey,
  statusConfig,
} from '@/components/ui/status-config';
```

Replace `getRunsStatusIcon` with:

```tsx
export function getRunsStatusIcon(status: string) {
  const canonicalStatus = normalizeStatusBadgeKey(status);
  if (canonicalStatus === 'unknown') return null;

  const config = statusConfig[canonicalStatus];
  const Icon = config.icon;
  const shouldAnimate = 'animate' in config && config.animate;

  return (
    <Icon
      className={cn(
        'h-5 w-5',
        shouldAnimate && 'motion-safe:animate-spin',
        FAMILY_ACCENT[config.family]
      )}
    />
  );
}
```

- [ ] **Step 4: Resolve timeline families through the registry**

In `src/components/timeline/timeline.visuals.ts`, replace the orchestration entries with:

```ts
  SUBMITTED: visualFor(getStatusFamily('submitted'), CircleArrowUp),
  RUNNABLE: visualFor(getStatusFamily('runnable'), PlayCircle),
  STARTING: visualFor(getStatusFamily('starting'), Clock),
  RUNNING: visualFor(getStatusFamily('running'), LoaderCircle),
  STARTED: visualFor(getStatusFamily('started'), LoaderCircle),
  SUCCEEDED: visualFor(getStatusFamily('succeeded'), CheckCircle),
  FAILED: visualFor(getStatusFamily('failed'), XCircle),
  ABORTED: visualFor(getStatusFamily('aborted'), Ban),
  CANCELLED: visualFor(getStatusFamily('cancelled'), Ban),
```

Change the spelling alias in `STATE_ALIASES` to:

```ts
  CANCELED: 'CANCELLED',
```

Remove the previous `CANCELLED: 'ABORTED'` alias. Keep the remaining domain-specific aliases unchanged.

- [ ] **Step 5: Derive stat-card variants from the status family**

In both stats-card components, import `getStatusFamily`:

```ts
import { getStatusFamily } from '@/components/ui/status-config';
```

Remove `variant` from each local `statusCards` type and item. Replace the rendered prop with:

```tsx
variant={getStatusFamily(card.status)}
```

This changes `ongoing` from a local warning treatment to the registry's informational treatment and prevents future drift.

- [ ] **Step 6: Run focused tests and verification**

Run:

```bash
pnpm test src/components/ui/__tests__/status-config.test.ts src/features/runs/shared/utils/__tests__/statusIcons.test.tsx src/components/timeline/__tests__/timeline.visuals.test.ts
pnpm type-check
```

Expected: all focused tests PASS and TypeScript exits 0.

- [ ] **Step 7: Commit consumer consistency**

```bash
git add src/components/timeline src/features/runs/shared/utils src/features/runs/workflow-runs/components/WorkflowRunsStatsCards.tsx src/features/runs/analysis-runs/components/AnalysisRunsStatusCards.tsx
git commit -m "fix: align workflow status visuals"
```

## Task 3: Add a Typed Case-Unlink Request Boundary

**Files:**

- Create: `src/features/cases/utils/caseUnlink.ts`
- Create: `src/features/cases/utils/__tests__/caseUnlink.test.ts`

- [ ] **Step 1: Write the failing request and submission tests**

Create `src/features/cases/utils/__tests__/caseUnlink.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  buildCaseUnlinkRequest,
  submitCaseUnlink,
  type CaseUnlinkMutation,
  type CaseUnlinkTarget,
} from '../caseUnlink';

const target: CaseUnlinkTarget = {
  type: 'library',
  orcabusId: 'lib.01TEST',
  label: 'L2400001',
};

describe('buildCaseUnlinkRequest', () => {
  it.each([
    { type: 'library', orcabusId: 'lib.01TEST', label: 'L2400001' },
    { type: 'workflow run', orcabusId: 'wfr.01TEST', label: 'Alignment run' },
  ] satisfies CaseUnlinkTarget[])('builds the unlink path for a $type', (target) => {
    expect(buildCaseUnlinkRequest('cas.01TEST', target)).toEqual({
      params: {
        path: {
          orcabusId: 'cas.01TEST',
          externalEntityOrcabusId: target.orcabusId,
        },
      },
    });
  });

  it('does not mutate without both case and target context', () => {
    const mutate = vi.fn<CaseUnlinkMutation>();

    expect(
      submitCaseUnlink({
        caseOrcabusId: undefined,
        target,
        mutate,
        onSuccess: vi.fn(),
        onError: vi.fn(),
      })
    ).toBe(false);
    expect(
      submitCaseUnlink({
        caseOrcabusId: 'cas.01TEST',
        target: null,
        mutate,
        onSuccess: vi.fn(),
        onError: vi.fn(),
      })
    ).toBe(false);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('keeps success and error effects behind mutation callbacks', () => {
    const mutate = vi.fn<CaseUnlinkMutation>();
    const onSuccess = vi.fn();
    const onError = vi.fn();

    expect(
      submitCaseUnlink({
        caseOrcabusId: 'cas.01TEST',
        target,
        mutate,
        onSuccess,
        onError,
      })
    ).toBe(true);

    const callbacks = mutate.mock.calls[0][1];
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    callbacks.onError();
    expect(onError).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();

    callbacks.onSuccess();
    expect(onSuccess).toHaveBeenCalledWith(target);
  });

  it('allows retry after an error callback', () => {
    const mutate = vi.fn<CaseUnlinkMutation>();
    const options = {
      caseOrcabusId: 'cas.01TEST',
      target,
      mutate,
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    submitCaseUnlink(options);
    mutate.mock.calls[0][1].onError();
    submitCaseUnlink(options);

    expect(mutate).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm test src/features/cases/utils/__tests__/caseUnlink.test.ts
```

Expected: FAIL because `caseUnlink.ts` does not exist.

- [ ] **Step 3: Implement the typed target and submission boundary**

Create `src/features/cases/utils/caseUnlink.ts`:

```ts
export type CaseUnlinkEntityType = 'library' | 'workflow run';

export interface CaseUnlinkTarget {
  type: CaseUnlinkEntityType;
  orcabusId: string;
  label: string;
}

type CaseUnlinkRequest = ReturnType<typeof buildCaseUnlinkRequest>;

interface CaseUnlinkMutationCallbacks {
  onSuccess: () => void;
  onError: () => void;
}

export type CaseUnlinkMutation = (
  request: CaseUnlinkRequest,
  callbacks: CaseUnlinkMutationCallbacks
) => void;

interface SubmitCaseUnlinkOptions {
  caseOrcabusId: string | undefined;
  target: CaseUnlinkTarget | null;
  mutate: CaseUnlinkMutation;
  onSuccess: (target: CaseUnlinkTarget) => void;
  onError: () => void;
}

export function buildCaseUnlinkRequest(caseOrcabusId: string, target: CaseUnlinkTarget) {
  return {
    params: {
      path: {
        orcabusId: caseOrcabusId,
        externalEntityOrcabusId: target.orcabusId,
      },
    },
  } as const;
}

export function submitCaseUnlink({
  caseOrcabusId,
  target,
  mutate,
  onSuccess,
  onError,
}: SubmitCaseUnlinkOptions): boolean {
  if (!caseOrcabusId || !target) return false;

  mutate(buildCaseUnlinkRequest(caseOrcabusId, target), {
    onSuccess: () => onSuccess(target),
    onError,
  });

  return true;
}
```

- [ ] **Step 4: Run the test and verify GREEN**

Run:

```bash
pnpm test src/features/cases/utils/__tests__/caseUnlink.test.ts
```

Expected: PASS for both entity types, missing-context protection, success/error callbacks, and retry.

- [ ] **Step 5: Commit the request boundary**

```bash
git add src/features/cases/utils/caseUnlink.ts src/features/cases/utils/__tests__/caseUnlink.test.ts
git commit -m "refactor: isolate case unlink submission"
```

## Task 4: Build the Shared Case Unlink Confirmation Modal

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/features/cases/components/CaseDetailsUnlinkEntityModal.tsx`
- Create: `src/features/cases/components/__tests__/CaseDetailsUnlinkEntityModal.test.tsx`

- [ ] **Step 1: Add the DOM interaction test harness**

Run:

```bash
pnpm add -D @testing-library/react @testing-library/user-event jsdom
```

Expected: `package.json` gains three development dependencies and `pnpm-lock.yaml` records their exact resolved versions.

- [ ] **Step 2: Write failing modal interaction tests**

Create `src/features/cases/components/__tests__/CaseDetailsUnlinkEntityModal.test.tsx`:

```tsx
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseDetailsUnlinkEntityModal } from '../CaseDetailsUnlinkEntityModal';

afterEach(cleanup);

describe('CaseDetailsUnlinkEntityModal', () => {
  it('requires an explicit confirmation before invoking unlink', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CaseDetailsUnlinkEntityModal
        isOpen
        target={{ type: 'library', orcabusId: 'lib.01TEST', label: 'L2400001' }}
        isPending={false}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole('heading', { name: 'Unlink Library' })).toBeTruthy();
    expect(screen.getByText(/will not delete the library/i)).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Confirm unlink library L2400001' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('disables dismissal and actions while unlinking', () => {
    render(
      <CaseDetailsUnlinkEntityModal
        isOpen
        target={{ type: 'workflow run', orcabusId: 'wfr.01TEST', label: 'Alignment run' }}
        isPending
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(
      (screen.getByRole('button', { name: 'Close dialog' }) as HTMLButtonElement).disabled
    ).toBe(true);
    expect((screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement).disabled).toBe(
      true
    );
    expect(
      (
        screen.getByRole('button', {
          name: 'Confirm unlink workflow run Alignment run',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(screen.getByText('Unlinking…')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run the test and verify RED**

Run:

```bash
pnpm test src/features/cases/components/__tests__/CaseDetailsUnlinkEntityModal.test.tsx
```

Expected: FAIL because the modal component does not exist.

- [ ] **Step 4: Implement the shared modal**

Create `src/features/cases/components/CaseDetailsUnlinkEntityModal.tsx`:

```tsx
import { Unlink } from 'lucide-react';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import { useLastPresent } from '@/hooks/useLastPresent';
import type { CaseUnlinkTarget } from '../utils/caseUnlink';

interface CaseDetailsUnlinkEntityModalProps {
  isOpen: boolean;
  target: CaseUnlinkTarget | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function titleCaseEntity(type: CaseUnlinkTarget['type']) {
  return type === 'library' ? 'Library' : 'Workflow Run';
}

export function CaseDetailsUnlinkEntityModal({
  isOpen,
  target,
  isPending,
  onCancel,
  onConfirm,
}: CaseDetailsUnlinkEntityModalProps) {
  const shownTarget = useLastPresent(target);
  const entityTitle = shownTarget ? titleCaseEntity(shownTarget.type) : 'Entity';
  const entityLabel = shownTarget?.label ?? '';
  const entityType = shownTarget?.type ?? 'entity';

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onCancel}
      title={`Unlink ${entityTitle}`}
      description='Remove this relationship from the case?'
      icon={<Unlink className='h-5 w-5' aria-hidden='true' />}
      size='sm'
      closeDisabled={isPending}
      footer={
        <>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={onConfirm}
            disabled={isPending || !shownTarget}
            aria-label={`Confirm unlink ${entityType} ${entityLabel}`}
          >
            <Unlink className='h-4 w-4' aria-hidden='true' />
            {isPending ? 'Unlinking…' : 'Unlink'}
          </Button>
        </>
      }
    >
      <div className='space-y-3'>
        <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          Unlink{' '}
          <strong className='font-medium text-neutral-900 dark:text-white'>{entityLabel}</strong>{' '}
          from this case?
        </p>
        <p className='text-sm text-neutral-500 dark:text-[#9dabb9]'>
          This removes only the case relationship and will not delete the {entityType}.
        </p>
      </div>
    </DialogFrame>
  );
}
```

- [ ] **Step 5: Run the modal test and verify GREEN**

Run:

```bash
pnpm test src/features/cases/components/__tests__/CaseDetailsUnlinkEntityModal.test.tsx
```

Expected: PASS for entity copy, accessible confirmation name, and pending-state lockout.

- [ ] **Step 6: Commit the test harness and shared modal**

```bash
git add package.json pnpm-lock.yaml src/features/cases/components/CaseDetailsUnlinkEntityModal.tsx src/features/cases/components/__tests__/CaseDetailsUnlinkEntityModal.test.tsx
git commit -m "feat: confirm case entity unlinking"
```

## Task 5: Integrate Confirmation into Linked Libraries

**Files:**

- Modify: `src/features/cases/components/CaseDetailsLinkedLibrariesTab.tsx`

- [ ] **Step 1: Replace immediate unlinking with selected-target state**

Import the modal, submission boundary, and target type:

```ts
import { CaseDetailsUnlinkEntityModal } from './CaseDetailsUnlinkEntityModal';
import { submitCaseUnlink, type CaseUnlinkTarget } from '../utils/caseUnlink';
```

Add state beside `isLinkModalOpen`:

```ts
const [unlinkTarget, setUnlinkTarget] = useState<CaseUnlinkTarget | null>(null);
```

Replace `handleUnlink` with:

```ts
const handleConfirmUnlink = () => {
  submitCaseUnlink({
    caseOrcabusId,
    target: unlinkTarget,
    mutate: unlinkMutation.mutate,
    onSuccess: () => {
      toast.success('Library unlinked');
      setUnlinkTarget(null);
      refresh();
    },
    onError: () => {
      toast.error('Failed to unlink library');
    },
  });
};
```

- [ ] **Step 2: Make the table action open confirmation**

Replace the action button click body with:

```tsx
onClick={(event) => {
  event.stopPropagation();
  setUnlinkTarget({
    type: 'library',
    orcabusId: lib.orcabusId,
    label: lib.libraryId ?? lib.orcabusId,
  });
}}
```

Add the explicit name and focus treatment:

```tsx
aria-label={`Unlink library ${lib.libraryId ?? lib.orcabusId}`}
className='rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10'
```

Remove the `title='Unlink library'` attribute because the accessible name is now explicit.

- [ ] **Step 3: Render the confirmation modal**

Add beside the existing link modal:

```tsx
<CaseDetailsUnlinkEntityModal
  isOpen={unlinkTarget !== null}
  target={unlinkTarget}
  isPending={unlinkMutation.isPending}
  onCancel={() => setUnlinkTarget(null)}
  onConfirm={handleConfirmUnlink}
/>
```

- [ ] **Step 4: Run focused tests and typecheck**

Run:

```bash
pnpm test src/features/cases/utils/__tests__/caseUnlink.test.ts src/features/cases/components/__tests__/CaseDetailsUnlinkEntityModal.test.tsx
pnpm type-check
```

Expected: tests PASS and TypeScript exits 0. Only `handleConfirmUnlink` calls the tested submission boundary; the icon action only sets `unlinkTarget`.

- [ ] **Step 5: Commit the library integration**

```bash
git add src/features/cases/components/CaseDetailsLinkedLibrariesTab.tsx
git commit -m "feat: confirm library unlinking"
```

## Task 6: Integrate Confirmation into Linked Workflow Runs

**Files:**

- Modify: `src/features/cases/components/CaseDetailsLinkedWorkflowRunsTab.tsx`
- Modify: `src/features/cases/components/CaseDetailsLinkedWorkflowRunsTable.tsx`

- [ ] **Step 1: Pass the selected workflow run to the parent**

In `CaseDetailsLinkedWorkflowRunsTable.tsx`, change the prop type to:

```ts
onUnlink: (run: WorkflowRunListModel) => void;
```

Change the unlink action to `onUnlink(run)` and add:

```tsx
aria-label={`Unlink workflow run ${run.workflowRunName ?? run.portalRunId}`}
className='rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10'
```

Also add `aria-label={`View files for workflow run ${run.workflowRunName ?? run.portalRunId}`}` to the adjacent icon-only file action.

- [ ] **Step 2: Add selected-target state and confirmed mutation**

In `CaseDetailsLinkedWorkflowRunsTab.tsx`, add these imports:

```ts
import { CaseDetailsUnlinkEntityModal } from './CaseDetailsUnlinkEntityModal';
import { submitCaseUnlink, type CaseUnlinkTarget } from '../utils/caseUnlink';
```

Add:

```ts
const [unlinkTarget, setUnlinkTarget] = useState<CaseUnlinkTarget | null>(null);
```

Replace `handleUnlink` with:

```ts
const handleConfirmUnlink = () => {
  submitCaseUnlink({
    caseOrcabusId,
    target: unlinkTarget,
    mutate: unlinkMutation.mutate,
    onSuccess: () => {
      toast.success('Workflow run unlinked');
      setUnlinkTarget(null);
      setSelectedPortalRunId(null);
      refresh();
    },
    onError: () => {
      toast.error('Failed to unlink workflow run');
    },
  });
};
```

Pass this target-selection callback to the table:

```tsx
onUnlink={(run) =>
  setUnlinkTarget({
    type: 'workflow run',
    orcabusId: run.orcabusId,
    label: run.workflowRunName ?? run.portalRunId,
  })
}
```

- [ ] **Step 3: Render the confirmation modal**

Add beside the workflow-run link modal:

```tsx
<CaseDetailsUnlinkEntityModal
  isOpen={unlinkTarget !== null}
  target={unlinkTarget}
  isPending={unlinkMutation.isPending}
  onCancel={() => setUnlinkTarget(null)}
  onConfirm={handleConfirmUnlink}
/>
```

- [ ] **Step 4: Run focused tests and typecheck**

Run:

```bash
pnpm test src/features/cases/utils/__tests__/caseUnlink.test.ts src/features/cases/components/__tests__/CaseDetailsUnlinkEntityModal.test.tsx
pnpm type-check
```

Expected: tests PASS and TypeScript exits 0. Mutation failure leaves `unlinkTarget` intact; mutation success clears both target and files view.

- [ ] **Step 5: Commit the workflow-run integration**

```bash
git add src/features/cases/components/CaseDetailsLinkedWorkflowRunsTab.tsx src/features/cases/components/CaseDetailsLinkedWorkflowRunsTable.tsx
git commit -m "feat: confirm workflow run unlinking"
```

## Task 7: Final Verification and Scope Audit

**Files:**

- Verify all modified files.
- Do not create or modify global-search or Vault files.

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: 85 or more test files PASS and 331 or more tests PASS, with the newly added tests included.

- [ ] **Step 2: Run static verification**

```bash
pnpm type-check
pnpm lint
pnpm format:check
```

Expected:

- TypeScript exits 0.
- ESLint exits 0 with no errors; the pre-existing raw-control warnings may remain until the dedicated design-system migration stage.
- Prettier exits 0.

- [ ] **Step 3: Verify the approved scope boundary**

```bash
git diff 7140ca8...HEAD --name-only
```

Expected: no path under `src/features/vault/` and no `GlobalSearch` file appears.

- [ ] **Step 4: Verify lifecycle coverage and removal of immediate unlink paths**

```bash
rg -n "submitted|runnable|starting|started|cancelled" src/components/ui/status-config.ts
rg -n "handleUnlink\(|onUnlink\(run\.orcabusId\)" src/features/cases/components
```

Expected: all five canonical lifecycle entries are present; the second command returns no immediate-unlink handler or ID-only table callback.

- [ ] **Step 5: Run pre-commit hooks under Node 24**

```bash
source /Users/rayliu/.nvm/nvm.sh
nvm use 24.16.0
/opt/homebrew/opt/pre-commit/libexec/bin/python3.14 -m pre_commit run --all-files
```

Expected: every configured hook passes.

- [ ] **Step 6: Commit any verification-only formatting changes**

If Step 5 changes formatting, stage only those formatting changes and commit:

```bash
git add src
git commit -m "style: format production trust changes"
```

If Step 5 makes no changes, do not create an empty commit.
