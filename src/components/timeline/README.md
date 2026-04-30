# Timeline Component

Reusable timeline components for Orcabus operational details pages. The timeline displays state changes and comments for sequence runs, workflow runs, etc. And also support for sorting, selection, caller-owned actions, custom state/comment dialogs, and state payload inspection.

## Feature Summary

- Vertical event timeline with icon nodes, a connecting rail, and responsive event rows.
- Built-in sort toggle for latest-first and oldest-first ordering.
- Optional header actions rendered by the caller through `customActions`.
- Optional per-event overflow actions through `TimelineEventAction[]`.
- Controlled or uncontrolled event selection through `selectedEventId` and `onEventSelect`.
- State, comment, sample sheet, and severity-specific visual styling.
- Dark mode support throughout the timeline and dialogs.
- Dialogs for adding/editing custom states, adding/editing comments, deleting comments, and viewing payloads.

## Files

| File                      | Purpose                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `Timeline.tsx`            | Main timeline UI and `TimelineFunctionButton`.                  |
| `CustomStateDialog.tsx`   | Create/edit dialog for custom state events.                     |
| `CommentDialog.tsx`       | Create/edit dialog for comment events.                          |
| `DeleteCommentDialog.tsx` | Confirmation dialog for comment deletion.                       |
| `PayloadViewerDialog.tsx` | State payload carousel, structured payload view, and JSON view. |
| `TimelineDialogFrame.tsx` | Shared dialog shell for state/comment forms.                    |
| `timeline.type.ts`        | Event, form, source, severity, and action types.                |
| `timeline.constants.ts`   | Event label/icon configuration.                                 |
| `timeline.visuals.ts`     | State/comment icon and color mappings.                          |
| `index.ts`                | Public exports.                                                 |

## Main Component

```tsx
import { Timeline, TimelineFunctionButton } from '@/components/timeline';
import type { TimelineEvent } from '@/components/timeline';

export function RunTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <Timeline
      events={events}
      customActions={
        <TimelineFunctionButton onClick={() => console.log('filter')}>
          Filter
        </TimelineFunctionButton>
      }
    />
  );
}
```

### Timeline Props

```ts
interface TimelineProps {
  events: TimelineEvent[];
  customActions?: ReactNode;
  selectedEventId?: string | null;
  onEventSelect?: (event: TimelineEvent) => void;
}
```

`selectedEventId` makes selection controlled. If it is omitted, the timeline manages the focused event internally.

### Function Buttons

Use `TimelineFunctionButton` for timeline-level actions such as add state, add comment, view payload, or filters.

```tsx
<TimelineFunctionButton
  icon={<Plus className='h-4 w-4' />}
  variant='primary'
  onClick={openCustomStateDialog}
>
  Add State
</TimelineFunctionButton>
```

## Event Model

The current timeline has two event families: `state` and `comment`. Older mock data and legacy labels such as `workflow_completed`, `samplesheet_added`, and `qc_failed` are converted into one of these families before rendering.

```ts
export enum TimelineEventTypes {
  STATE = 'state',
  COMMENT = 'comment',
}

export enum TimelineEventSourceTypes {
  SYSTEM = 'system',
  USER = 'user',
  CUSTOM = 'custom',
}

interface TimelineBaseEvent {
  eventId: string;
  timestamp: string;
  createdBy?: string;
  sourceType: TimelineEventSourceTypes;
  actions?: TimelineEventAction[];
  payloadId?: string;
  payload?: Record<string, unknown>;
}

export interface TimelineStateEvent extends TimelineBaseEvent {
  eventType: TimelineEventTypes.STATE;
  state: string;
  comment?: string;
}

export interface TimelineCommentEvent extends TimelineBaseEvent {
  eventType: TimelineEventTypes.COMMENT;
  comment: string;
  severity?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
  commentType?: 'comment' | 'samplesheet';
}

export type TimelineEvent = TimelineStateEvent | TimelineCommentEvent;
```

### Event Actions

Each event can expose caller-owned actions in the overflow menu.

```ts
interface TimelineEventAction {
  id: string;
  label: string;
  onClick: (event: TimelineEvent) => void | Promise<void>;
  disabled?: boolean | ((event: TimelineEvent) => boolean);
  icon?: ReactNode;
}
```

Actions with `delete` in the action id are styled as destructive. Async action failures are caught and shown with a toast.

## Event Anatomy

Each rendered event includes:

| Area     | Contents                                                                    |
| -------- | --------------------------------------------------------------------------- |
| Node     | Icon selected from the event state, comment severity, or sample sheet type. |
| Rail     | Vertical connector between events.                                          |
| Title    | `Workflow State Update`, `Comment Added`, or `Sample Sheet Uploaded`.       |
| Metadata | Non-system source label, formatted timestamp, and contextual badges.        |
| Badges   | State badge, `Custom`, `Sample Sheet`, or non-info severity badge.          |
| Body     | Optional event comment/note.                                                |
| Menu     | Optional event actions from `event.actions`.                                |

System events intentionally omit a source label in the row. User and custom events can display `createdBy`.

## Visual Reference

State visuals are defined in `timeline.visuals.ts`. State keys are normalized to uppercase and can also match aliases such as `completed -> SUCCEEDED`, `ongoing -> STARTED`, and `queued -> DRAFT`.

| State group                                        | Icon            | Color   |
| -------------------------------------------------- | --------------- | ------- |
| `DRAFT`, `QUEUED`, `PENDING`                       | `FilePenLine`   | Neutral |
| `READY`, `SUCCEEDED`, `COMPLETED`, `SUCCESS`       | `CheckCircle`   | Green   |
| `SUBMITTED`                                        | `CircleArrowUp` | Neutral |
| `RUNNABLE`                                         | `PlayCircle`    | Neutral |
| `STARTING`                                         | `Clock`         | Neutral |
| `RUNNING`                                          | `LoaderCircle`  | Neutral |
| `STARTED`, `ONGOING`, `PROCESSING`, `INITIALIZING` | `LoaderCircle`  | Blue    |
| `FAILED`, `ERROR`                                  | `XCircle`       | Red     |
| `ABORTED`, `CANCELLED`, `CANCELED`                 | `Ban`           | Orange  |
| `RESOLVED`                                         | `CheckCircle`   | Teal    |
| `DEPRECATED`                                       | `Archive`       | Neutral |
| Unknown state                                      | `PlayCircle`    | Neutral |

Comment visuals are severity-driven:

| Comment kind          | Icon                   | Color          |
| --------------------- | ---------------------- | -------------- |
| `DEBUG`               | `MessageCircleCode`    | Neutral        |
| `INFO`                | `MessageCircle`        | Slate          |
| `WARNING`             | `MessageCircleWarning` | Amber          |
| `ERROR`               | `MessageCircleX`       | Red            |
| Sample sheet `INFO`   | `FileText`             | Cyan           |
| Sample sheet non-info | `FileText`             | Severity color |

## Dialogs

### CustomStateDialog

Creates or edits state events.

```tsx
<CustomStateDialog
  isOpen={isCustomStateDialogOpen}
  onClose={() => setIsCustomStateDialogOpen(false)}
  onSubmit={handleAddCustomState}
  availableStates={availableStateOptions}
  hideTimestamp
  actorEmail={currentUserEmail}
  actorTimestamp={dialogActorTimestamp}
/>
```

Props:

```ts
interface CustomStateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomStateFormData) => Promise<void>;
  availableStates?: Array<{ value: string; label: string }>;
  initialValues?: Partial<CustomStateFormData>;
  mode?: 'create' | 'edit';
  title?: string;
  submitLabel?: string;
  hideTimestamp?: boolean;
  actorEmail?: string;
  actorTimestamp?: string;
}
```

Validation:

- `stateName` is required.
- `timestamp` is required unless the caller hides it and supplies a value.
- `comment` is optional and limited to 2000 characters.
- Submit is disabled when `availableStates` is provided but empty.

### CommentDialog

Creates or edits comments.

```tsx
<CommentDialog
  isOpen={isCommentDialogOpen}
  onClose={() => setIsCommentDialogOpen(false)}
  onSubmit={handleAddComment}
  hideTimestamp
  hideSeverity
  actorEmail={currentUserEmail}
  actorTimestamp={dialogActorTimestamp}
/>
```

Props:

```ts
interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CommentFormData) => Promise<void>;
  initialValues?: Partial<CommentFormData>;
  mode?: 'create' | 'edit';
  title?: string;
  submitLabel?: string;
  hideTimestamp?: boolean;
  hideSeverity?: boolean;
  actorEmail?: string;
  actorTimestamp?: string;
}
```

Validation:

- `timestamp` is required unless the caller hides it and supplies a value.
- `comment` is required and limited to 2000 characters.
- `severity` is one of `DEBUG`, `INFO`, `WARNING`, or `ERROR`.

### DeleteCommentDialog

Confirms comment deletion and can show a short preview.

```tsx
<DeleteCommentDialog
  isOpen={!!deletingComment}
  onClose={() => setDeletingComment(null)}
  onDelete={handleDeleteComment}
  commentPreview={deletingComment?.text}
/>
```

### PayloadViewerDialog

Displays workflow state payloads. It provides a selectable state carousel, a structured payload tab, a raw JSON tab, copy-to-clipboard, download, loading, and empty states.

```tsx
<PayloadViewerDialog
  isOpen={isPayloadViewerOpen}
  onClose={() => setIsPayloadViewerOpen(false)}
  states={payloadViewerStates}
  selectedStateEventId={selectedPayloadStateEventId}
  onSelectedStateEventIdChange={setSelectedPayloadStateEventId}
  payload={payloadViewerPayload}
  isLoading={isFetchingSelectedWorkflowPayload}
/>
```

The structured tab reads from `payload.data` when `payload` is an object. The JSON tab renders the full payload object.

## Usage Patterns

### Basic Timeline

```tsx
<Timeline events={events} />
```

### Timeline With Header Actions

```tsx
<Timeline
  events={events}
  customActions={
    <>
      <TimelineFunctionButton
        icon={<Plus className='h-4 w-4' />}
        variant='primary'
        onClick={openStateDialog}
      >
        Add State
      </TimelineFunctionButton>
      <TimelineFunctionButton
        icon={<MessageCircle className='h-4 w-4' />}
        onClick={openCommentDialog}
      >
        Add Comment
      </TimelineFunctionButton>
    </>
  }
/>
```

### Controlled Selection

```tsx
const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

<Timeline
  events={events}
  selectedEventId={selectedEventId}
  onEventSelect={(event) => setSelectedEventId(event.eventId)}
/>;
```

### Event Menu Actions

```tsx
const event: TimelineEvent = {
  eventId: 'comment-1',
  eventType: TimelineEventTypes.COMMENT,
  timestamp: new Date().toISOString(),
  comment: 'Review complete',
  sourceType: TimelineEventSourceTypes.USER,
  createdBy: 'operator@example.org',
  severity: TimelineCommentSeverityEnum.INFO,
  commentType: TimelineCommentTypes.GENERAL,
  actions: [
    {
      id: 'edit-comment',
      label: 'Edit comment',
      icon: <Pencil className='h-4 w-4' />,
      onClick: openEditDialog,
    },
    {
      id: 'delete-comment',
      label: 'Delete comment',
      icon: <Trash2 className='h-4 w-4' />,
      onClick: openDeleteDialog,
    },
  ],
};
```

### TanStack Query Mutation Pattern

```tsx
const addComment = useMutation({
  mutationFn: createComment,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeline', runId] }),
});

<CommentDialog
  isOpen={isCommentDialogOpen}
  onClose={() => setIsCommentDialogOpen(false)}
  onSubmit={(data) => addComment.mutateAsync(data)}
/>;
```

## Data Integration

The MSW handlers in `src/mocks/handlers.ts` provide mock timeline endpoints:

```txt
GET    /api/timeline/:runId
GET    /api/timeline
POST   /api/timeline/custom-state
POST   /api/timeline/comment
DELETE /api/timeline/:eventId
```

`src/data/mockTimelineData.ts` includes legacy-shaped timeline examples and converts them into the current `TimelineEvent` shape. This is useful for demos and tests, but new application code should create `TimelineStateEvent` and `TimelineCommentEvent` objects directly.

Current in-app consumers include:

- `SequenceTimelineTab`
- `WorkflowRunDetailsTimeline`
- `AnalysisRunDetailsTimeline`

## Extending The Timeline

### Add A New State Visual

Add the canonical state key to `STATE_VISUALS` in `timeline.visuals.ts`.

```ts
STATE_VISUALS.UNDER_REVIEW = {
  icon: Clock,
  nodeClassName: 'border-transparent bg-amber-100 dark:bg-amber-950',
  iconClassName: 'text-amber-700 dark:text-amber-300',
  cardClassName: '...',
  badgeClassName: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};
```

If the API can send alternative names, add aliases to `STATE_ALIASES`.

### Add A New Comment Type

Add the type to `TimelineCommentTypes` in `timeline.type.ts`, then update `getCommentVisual()` in `timeline.visuals.ts` and the badge logic in `Timeline.tsx` if the new type needs distinct display.

### Add A New Mutation

Keep mutation behavior owned by the consuming feature. The timeline should receive:

- Updated `events` data.
- Header actions through `customActions`.
- Per-event actions through `event.actions`.
- Dialog state and submit handlers from the parent.

## Best Practices

- Use stable, unique `eventId` values.
- Use ISO 8601 timestamps.
- Keep timeline mutations in the feature layer and refetch or invalidate after success.
- Prefer `TimelineFunctionButton` for header actions so controls stay visually consistent.
- Keep event action ids stable; include `delete` in destructive action ids for automatic destructive styling.
- Use `hideTimestamp` and `hideSeverity` when the backend owns those fields.
- Paginate or virtualize if a timeline grows beyond a few hundred events.
- Validate API permissions before exposing edit or delete actions.

## Dependencies

- React
- Headless UI
- React Hook Form
- Zod
- Lucide React
- Sonner
- Day.js
- Tailwind CSS
