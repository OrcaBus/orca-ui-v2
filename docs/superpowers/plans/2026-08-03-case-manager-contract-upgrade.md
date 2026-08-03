# Case Manager Contract Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the cases API and UI for the backend-managed case fields, split state date/time contract, new sample statuses, editable due dates, and temporarily unavailable manual case creation.

**Architecture:** Keep the generated OpenAPI declarations as the transport source of truth and adapt them at the cases feature boundary. Add one focused case-state timestamp adapter and a small optional precision field to the shared timeline so date-only backend events remain sortable without displaying invented times. Preserve the existing cases components and design language while tightening the edit payload to the backend write allowlist.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Vitest 4, React Hook Form, Zod 4, TanStack Query, Day.js, Tailwind CSS 4, openapi-react-query

---

## File map

- Create `src/features/cases/utils/caseStateDate.ts` for adapting `eventDate`/`eventTime` into timeline metadata.
- Create `src/features/cases/utils/__tests__/caseStateDate.test.ts` for timestamp adapter coverage.
- Create `src/features/cases/utils/__tests__/caseStatus.visuals.test.ts` for exhaustive status mapping coverage.
- Create `src/features/cases/components/__tests__/CaseDetailsOverviewCard.test.tsx` for new detail fields.
- Create `src/features/cases/components/__tests__/CasesListTable.test.tsx` for new list columns.
- Create `src/features/cases/pages/__tests__/CasesPage.test.tsx` for updated search guidance.
- Create `src/features/cases/components/__tests__/EditCaseModal.test.tsx` for the writable payload and due-date control.
- Modify `src/utils/timeFormat.ts` to format calendar dates and compose backend date/time values in the display timezone.
- Modify `src/components/timeline/timeline.type.ts`, `timeline.utils.ts`, `Timeline.tsx`, and timeline tests to support date-only precision.
- Modify `src/features/cases/api/cases.api.ts` to remove stale create types/hooks from the active API surface.
- Modify `src/features/cases/utils/caseStatus.visuals.ts` for the new status enum.
- Modify `src/features/cases/components/CaseDetailsTimeline.tsx` to use the split date/time fields.
- Modify `src/features/cases/components/CaseDetailsOverviewCard.tsx`, `CasesListTable.tsx`, and `CasesPage.tsx` for new fields and search guidance.
- Modify `src/features/cases/components/EditCaseModal.tsx` so only allowlisted fields are submitted and `dueDate` is editable.
- Modify `src/features/cases/components/CasesInfoDrawer.tsx`, `components/index.ts`, and preserve `AddCaseModal.tsx` as inactive future-use code.

### Task 1: Disable the removed create-case surface

**Files:**

- Modify: `src/features/cases/components/__tests__/CasesInfoDrawer.test.tsx`
- Modify: `src/features/cases/components/CasesInfoDrawer.tsx`
- Modify: `src/features/cases/components/index.ts`
- Modify: `src/features/cases/api/cases.api.ts`
- Modify: `src/features/cases/components/AddCaseModal.tsx`

- [x] **Step 1: Add a failing drawer test**

Extend the open-drawer test with explicit supported/unsupported action assertions:

```tsx
expect(html).toContain('Import from REDCap');
expect(html).not.toContain('Create a case');
expect(html).not.toContain('Add New Case');
```

- [x] **Step 2: Run the drawer test and verify RED**

Run: `CI=1 pnpm vitest run src/features/cases/components/__tests__/CasesInfoDrawer.test.tsx`

Expected: FAIL because `Create a case` and `Add New Case` are still rendered.

- [x] **Step 3: Comment out active manual-create wiring**

In `CasesInfoDrawer.tsx`, comment the `Plus` and `AddCaseModal` imports, `showAddCaseModal` state, create action card, and modal render. Place this comment immediately before the preserved block:

```tsx
// Manual case creation is temporarily unavailable because the Case Manager API
// no longer exposes POST /case/. Keep this wiring nearby for restoration when
// collection create support returns to the generated OpenAPI contract.
```

In `components/index.ts`, comment the `AddCaseModal` export with the same reason. In `cases.api.ts`, comment out both the nonexistent `CaseDetailRequest` alias and `useCaseCreateModel` declaration:

```ts
// Manual case creation is temporarily unsupported by the backend. Restore this
// request type and mutation hook when POST /case/ returns to the OpenAPI schema.
// export type CaseRequestModel = components['schemas']['CaseDetailRequest'];
// export const useCaseCreateModel = createPostMutationHook(caseApi, '/api/v1/case/');
```

Keep `AddCaseModal.tsx` in place for future restoration. Since TypeScript includes inactive source files, comment its removed API imports and submission calls and add an explanatory local legacy request shape so it remains type-safe without exporting an active API hook:

```ts
type LegacyCaseCreateRequest = {
  requestFormId: string;
  type: CaseTypeEnum;
  studyType: CaseStudyTypeEnum;
  isReportRequired: boolean;
  isNataAccredited: boolean;
  alias: string[];
  description: string | null;
  links?: Record<string, string>;
};
```

The inactive submit handler must not call a network hook. Keep the former calls as comments under the restoration note.

- [x] **Step 4: Verify GREEN and type safety**

Run: `CI=1 pnpm vitest run src/features/cases/components/__tests__/CasesInfoDrawer.test.tsx`

Expected: PASS, with REDCap import still visible and create-case text absent.

Run: `CI=1 pnpm type-check`

Expected: no missing `CaseDetailRequest`, removed path `post`, or `useCaseCreateModel` errors.

- [ ] **Step 5: Commit the create-flow removal**

```bash
git add src/features/cases/api/cases.api.ts src/features/cases/components/AddCaseModal.tsx src/features/cases/components/CasesInfoDrawer.tsx src/features/cases/components/index.ts src/features/cases/components/__tests__/CasesInfoDrawer.test.tsx
git commit -m "fix(cases): disable unsupported manual creation"
```

### Task 2: Add date-only timeline support and case state timestamp adaptation

**Files:**

- Create: `src/features/cases/utils/caseStateDate.ts`
- Create: `src/features/cases/utils/__tests__/caseStateDate.test.ts`
- Modify: `src/utils/timeFormat.ts`
- Modify: `src/components/timeline/timeline.type.ts`
- Modify: `src/components/timeline/timeline.utils.ts`
- Modify: `src/components/timeline/Timeline.tsx`
- Modify: `src/components/timeline/__tests__/timeline.utils.test.ts`

- [ ] **Step 1: Write failing calendar-date and adapter tests**

Add a timeline assertion:

```ts
expect(formatTimelineTimestamp('2026-08-03', 'date')).toBe('03 Aug 2026');
```

Create the case adapter tests:

```ts
describe('getCaseStateTimelineTimestamp', () => {
  it('anchors an event date and time to the display timezone', () => {
    expect(getCaseStateTimelineTimestamp('2026-08-03', '09:30:00', '2026-08-04T00:00:00Z')).toEqual(
      { timestamp: '2026-08-02T23:30:00.000Z' }
    );
  });

  it('marks an event without time as date-only', () => {
    expect(getCaseStateTimelineTimestamp('2026-08-03', null, '2026-08-04T00:00:00Z')).toEqual({
      timestamp: '2026-08-03',
      timestampPrecision: 'date',
    });
  });

  it('falls back to createdAt for an invalid event date', () => {
    expect(getCaseStateTimelineTimestamp('invalid', null, '2026-08-04T00:00:00Z')).toEqual({
      timestamp: '2026-08-04T00:00:00Z',
    });
  });
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `CI=1 pnpm vitest run src/components/timeline/__tests__/timeline.utils.test.ts src/features/cases/utils/__tests__/caseStateDate.test.ts`

Expected: FAIL because precision formatting and the case adapter do not exist.

- [ ] **Step 3: Implement date formatting and precision**

Add to `timeFormat.ts`:

```ts
export function formatCalendarDate(dateString: string): string {
  const d = dayjs.utc(dateString);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString) || !d.isValid()) return dateString;
  return d.format('DD MMM YYYY');
}

export function composeDisplayZoneDateTime(
  dateString: string,
  timeString: string
): string | undefined {
  const d = dayjs.tz(`${dateString}T${timeString}`, DISPLAY_TIME_ZONE);
  return d.isValid() ? d.toISOString() : undefined;
}
```

Add `timestampPrecision?: 'date' | 'date-time'` to `TimelineBaseEvent`. Update the formatter and component call:

```ts
export function formatTimelineTimestamp(
  timestamp: string,
  precision: 'date' | 'date-time' = 'date-time'
): string {
  return precision === 'date' ? formatCalendarDate(timestamp) : formatDetailDate(timestamp);
}
```

```tsx
const timestamp = formatTimelineTimestamp(event.timestamp, event.timestampPrecision);
```

- [ ] **Step 4: Implement the focused case adapter**

Create `caseStateDate.ts`:

```ts
import { composeDisplayZoneDateTime } from '@/utils/timeFormat';

type CaseStateTimelineTimestamp = {
  timestamp: string;
  timestampPrecision?: 'date';
};

const API_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getCaseStateTimelineTimestamp(
  eventDate: string | null | undefined,
  eventTime: string | null | undefined,
  createdAt: string
): CaseStateTimelineTimestamp {
  if (!eventDate || !API_DATE_PATTERN.test(eventDate)) return { timestamp: createdAt };
  if (!eventTime) return { timestamp: eventDate, timestampPrecision: 'date' };

  const timestamp = composeDisplayZoneDateTime(eventDate, eventTime);
  return timestamp ? { timestamp } : { timestamp: eventDate, timestampPrecision: 'date' };
}
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `CI=1 pnpm vitest run src/components/timeline/__tests__/timeline.utils.test.ts src/features/cases/utils/__tests__/caseStateDate.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit timeline date support**

```bash
git add src/utils/timeFormat.ts src/components/timeline/timeline.type.ts src/components/timeline/timeline.utils.ts src/components/timeline/Timeline.tsx src/components/timeline/__tests__/timeline.utils.test.ts src/features/cases/utils/caseStateDate.ts src/features/cases/utils/__tests__/caseStateDate.test.ts
git commit -m "feat(cases): support split state event dates"
```

### Task 3: Update case state statuses and timeline mapping

**Files:**

- Create: `src/features/cases/utils/__tests__/caseStatus.visuals.test.ts`
- Modify: `src/features/cases/utils/caseStatus.visuals.ts`
- Modify: `src/features/cases/components/CaseDetailsTimeline.tsx`

- [ ] **Step 1: Write a failing exhaustive status test**

```ts
it('maps every generated case status to a visual', () => {
  expect(CASE_STATUS_VISUALS).toEqual(
    expect.objectContaining({
      wgts_tumour_sample_received: expect.objectContaining({
        label: 'WGTS Tumour Sample Received',
      }),
      wgts_germline_sample_received: expect.objectContaining({
        label: 'WGTS Germline Sample Received',
      }),
      cttso_sample_received: expect.objectContaining({ label: 'CTTSO Sample Received' }),
      all_sample_received: expect.objectContaining({ label: 'All Sample Received' }),
    })
  );
  expect(CASE_STATUS_VISUALS).not.toHaveProperty('sample_received');
});
```

- [ ] **Step 2: Run the status test and verify RED**

Run: `CI=1 pnpm vitest run src/features/cases/utils/__tests__/caseStatus.visuals.test.ts`

Expected: FAIL because the four new mappings are absent and `sample_received` remains.

- [ ] **Step 3: Replace the retired mapping and use split state fields**

Use blue for individual intake receipts and purple for the all-samples milestone:

```ts
wgts_tumour_sample_received: { variant: 'blue', label: 'WGTS Tumour Sample Received' },
wgts_germline_sample_received: { variant: 'blue', label: 'WGTS Germline Sample Received' },
cttso_sample_received: { variant: 'blue', label: 'CTTSO Sample Received' },
all_sample_received: { variant: 'purple', label: 'All Sample Received' },
```

In `CaseDetailsTimeline.tsx`, replace `state.eventAt ?? state.createdAt` with:

```tsx
const eventTimestamp = getCaseStateTimelineTimestamp(
  state.eventDate,
  state.eventTime,
  state.createdAt
);

return {
  // existing fields
  ...eventTimestamp,
} satisfies TimelineEvent;
```

- [ ] **Step 4: Run status and adapter tests**

Run: `CI=1 pnpm vitest run src/features/cases/utils/__tests__/caseStatus.visuals.test.ts src/features/cases/utils/__tests__/caseStateDate.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit status and timeline mapping**

```bash
git add src/features/cases/utils/caseStatus.visuals.ts src/features/cases/utils/__tests__/caseStatus.visuals.test.ts src/features/cases/components/CaseDetailsTimeline.tsx
git commit -m "feat(cases): add sample receipt statuses"
```

### Task 4: Display new case fields in list and detail views

**Files:**

- Create: `src/features/cases/components/__tests__/CaseDetailsOverviewCard.test.tsx`
- Create: `src/features/cases/components/__tests__/CasesListTable.test.tsx`
- Create: `src/features/cases/pages/__tests__/CasesPage.test.tsx`
- Modify: `src/features/cases/components/CaseDetailsOverviewCard.tsx`
- Modify: `src/features/cases/components/CasesListTable.tsx`
- Modify: `src/features/cases/pages/CasesPage.tsx`

- [ ] **Step 1: Write failing presentation tests**

Mock `useCaseDetailsContext` and render the overview to static markup. Assert:

```tsx
expect(html).toContain('Study Name');
expect(html).toContain('ASPi2L');
expect(html).toContain('Study ID');
expect(html).toContain('STUDY-42');
expect(html).toContain('UR Number');
expect(html).toContain('UR123456');
expect(html).toContain('Due Date');
expect(html).toContain('31 Aug 2026');
```

Mock `DataTable` in the list test so it renders column headers and cell renderers for one generated `CaseDetailModel`. Assert the Study, UR Number, and Due Date headers and their values.

Mock `FilterBar`, the cases query-parameter hook, the app-shell hook, and child components in the page test. Render `CasesPage` to static markup and assert:

```tsx
expect(html).toContain('Search request ID, alias, study, study ID, or UR number...');
```

- [ ] **Step 2: Run the component tests and verify RED**

Run: `CI=1 pnpm vitest run src/features/cases/components/__tests__/CaseDetailsOverviewCard.test.tsx src/features/cases/components/__tests__/CasesListTable.test.tsx src/features/cases/pages/__tests__/CasesPage.test.tsx`

Expected: FAIL because the fields/columns are absent.

- [ ] **Step 3: Add responsive detail fields**

Change the overview grid to `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`. Add Study Name, Study ID, UR Number, and Due Date cells using `formatCalendarDate(caseDetail.dueDate)` and the existing skeleton/em-dash patterns. Change the description span to `sm:col-span-2 xl:col-span-3` so it remains readable.

- [ ] **Step 4: Add compact list columns and search guidance**

Add these column shapes to `CasesListTable.tsx`:

```tsx
{
  key: 'studyName',
  header: 'Study',
  render: (case_) => (
    <div className='min-w-36'>
      <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
        {case_.studyName ?? '—'}
      </div>
      {case_.studyId && (
        <div className='font-mono text-xs text-neutral-500 dark:text-neutral-400'>
          {case_.studyId}
        </div>
      )}
    </div>
  ),
},
{
  key: 'urNumber',
  header: 'UR Number',
  render: (case_) => case_.urNumber ?? '—',
},
{
  key: 'dueDate',
  header: 'Due Date',
  sortable: true,
  render: (case_) => (case_.dueDate ? formatCalendarDate(case_.dueDate) : '—'),
},
```

Set the page search placeholder to `Search request ID, alias, study, study ID, or UR number...`.

- [ ] **Step 5: Run the presentation tests and verify GREEN**

Run: `CI=1 pnpm vitest run src/features/cases/components/__tests__/CaseDetailsOverviewCard.test.tsx src/features/cases/components/__tests__/CasesListTable.test.tsx src/features/cases/pages/__tests__/CasesPage.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit case presentation changes**

```bash
git add src/features/cases/components/CaseDetailsOverviewCard.tsx src/features/cases/components/CasesListTable.tsx src/features/cases/pages/CasesPage.tsx src/features/cases/components/__tests__/CaseDetailsOverviewCard.test.tsx src/features/cases/components/__tests__/CasesListTable.test.tsx src/features/cases/pages/__tests__/CasesPage.test.tsx
git commit -m "feat(cases): show study and due date fields"
```

### Task 5: Restrict editing to writable fields and add due date

**Files:**

- Create: `src/features/cases/components/__tests__/EditCaseModal.test.tsx`
- Modify: `src/features/cases/components/EditCaseModal.tsx`

- [ ] **Step 1: Write failing edit-payload tests**

Export `buildCaseUpdateRequest` for direct behavior testing and add:

```ts
it('builds a request containing only backend-writable fields', () => {
  expect(
    buildCaseUpdateRequest({
      studyType: 'clinical',
      isReportRequired: true,
      isNataAccredited: false,
      dueDate: '2026-08-31',
      alias: [{ value: 'CASE-ALIAS' }],
      links: [{ key: 'trello', value: 'https://example.com/card' }],
      description: 'Ready for review',
    })
  ).toEqual({
    studyType: 'clinical',
    isReportRequired: true,
    isNataAccredited: false,
    dueDate: '2026-08-31',
    alias: ['CASE-ALIAS'],
    links: { trello: 'https://example.com/card' },
    description: 'Ready for review',
  });
});

it('sends null when the due date is cleared', () => {
  expect(buildCaseUpdateRequest(baseValues({ dueDate: '' })).dueDate).toBeNull();
});
```

Render the modal with mocked context/API and assert the HTML contains `type="date"` and does not contain labels for Request Form ID or Type.

Export `editCaseSchema` and verify an appended link must contain both a name and a valid URL:

```ts
expect(() =>
  editCaseSchema.parse(baseValues({ links: [{ key: '', value: 'https://example.com' }] }))
).toThrow();
```

- [ ] **Step 2: Run the edit test and verify RED**

Run: `CI=1 pnpm vitest run src/features/cases/components/__tests__/EditCaseModal.test.tsx`

Expected: FAIL because `dueDate` is absent and read-only fields are still included.

- [ ] **Step 3: Update schema, defaults, and payload builder**

Remove `requestFormId` and `type` from `editCaseSchema`, defaults, reset values, and JSX. Add an optional due date and strict named-link rows:

```ts
export const editCaseSchema = z.object({
  studyType: z.enum(['clinical', 'research']),
  isReportRequired: z.boolean(),
  isNataAccredited: z.boolean(),
  dueDate: z.string(),
  alias: z.array(z.object({ value: z.string() })),
  links: z.array(
    z.object({
      key: z.string().trim().min(1, 'Link name is required'),
      value: z.url('Enter a valid URL'),
    })
  ),
  description: z.string(),
});
```

Export a pure builder:

```ts
export function buildCaseUpdateRequest(values: EditCaseFormValues): PatchedCaseDetailRequestModel {
  return {
    studyType: values.studyType,
    isReportRequired: values.isReportRequired,
    isNataAccredited: values.isNataAccredited,
    dueDate: values.dueDate || null,
    alias: values.alias.map(({ value }) => value.trim()).filter(Boolean),
    links: Object.fromEntries(
      values.links
        .map(({ key, value }) => [key.trim(), value.trim()] as const)
        .filter(([key, value]) => key && value)
    ),
    description: values.description.trim() || null,
  };
}
```

Use `body: buildCaseUpdateRequest(values)` in the mutation.

- [ ] **Step 4: Add the due-date input**

Place it beside Study Type on a responsive two-column row:

```tsx
<div className='space-y-2'>
  <label
    htmlFor='edit-dueDate'
    className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
  >
    Due Date
  </label>
  <Input id='edit-dueDate' type='date' {...form.register('dueDate')} />
</div>
```

- [ ] **Step 5: Run the edit tests and verify GREEN**

Run: `CI=1 pnpm vitest run src/features/cases/components/__tests__/EditCaseModal.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the edit contract update**

```bash
git add src/features/cases/components/EditCaseModal.tsx src/features/cases/components/__tests__/EditCaseModal.test.tsx
git commit -m "fix(cases): restrict updates to writable fields"
```

### Task 6: Full verification and focused cleanup

**Files:**

- Modify only files already listed if verification reveals a scoped issue.

- [ ] **Step 1: Confirm no retired contract usage remains**

Run: `rg -n 'eventAt|sample_received|CaseDetailRequest|useCaseCreateModel' src/features/cases src/api/types/case.openapi.d.ts`

Expected: no active `eventAt` or retired status usage; create references appear only in explanatory comments/inactive preserved code.

- [ ] **Step 2: Run all cases and shared timeline tests**

Run: `CI=1 pnpm vitest run src/features/cases src/components/timeline`

Expected: all tests pass with zero failures.

- [ ] **Step 3: Run static verification**

Run: `CI=1 pnpm type-check`

Expected: exit 0.

Run: `CI=1 pnpm lint`

Expected: exit 0.

Run: `CI=1 pnpm format:check`

Expected: exit 0.

- [ ] **Step 4: Run the production build**

Run: `CI=1 pnpm build`

Expected: TypeScript and Vite build succeed and produce `build/`.

- [ ] **Step 5: Review the final diff against the approved design**

Run: `git diff --check && git status --short && git diff 3e12407 -- src/features/cases src/components/timeline src/utils/timeFormat.ts`

Expected: no whitespace errors, no unintended files, and every approved contract item represented.

- [ ] **Step 6: Commit any verification-only cleanup**

If verification required code or formatting changes:

```bash
git add src/features/cases src/components/timeline src/utils/timeFormat.ts
git commit -m "chore(cases): finish contract upgrade verification"
```
