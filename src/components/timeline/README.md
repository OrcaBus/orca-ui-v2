# Enhanced Timeline Component System

A comprehensive, production-ready timeline component for the Orcabus LIMS system. Designed for displaying operational events, state changes, and user interactions for Sequence Runs and Workflow Runs.

## Features

### Core Functionality

- **Event Display**: Vertical timeline showing progression from start to end with visual indicators
- **Event Types**: Status updates, comments, file uploads, QC events, custom states, and more
- **Filtering**: Filter events by run ID (supports multiple runs on same timeline)
- **Sorting**: Toggle between "Latest First" and "Oldest First"
- **Interactive Actions**: Add custom states, add comments, view event payloads

### Event Information

Each timeline event displays:

- **Event Type**: Clear label (e.g., "Status Updated", "Comment Added", "Sample Sheet Validated")
- **State Badge**: Visual pill showing state name (only for state-based events)
- **Timestamp**: Formatted date and time
- **Source**: System (automated), User (manual), or Custom (user-added)
- **Comment/Note**: Optional descriptive text
- **Payload**: Optional JSON data with viewer dialog

### Visual Design

- **Icon-based nodes**: Different icons and colors for different event types
  - ✅ Green checkmark: Success states (completed, succeeded)
  - ❌ Red X: Failure states (failed, aborted, error)
  - ▶️ Blue play: Active states (running, ongoing, processing)
  - 🕐 Amber clock: Pending states (queued, pending, initializing)
  - 💬 Blue speech bubble: Comments
  - ⬆️ Purple upload: File/samplesheet uploads
  - ⚪ Grey dot: Neutral/other events

- **Vertical rail**: Connecting line between events
- **Event cards**: Clean cards with hover effects
- **Dark mode**: Full dark mode support throughout

## Components

### 1. EnhancedTimeline (Main Component)

**Location**: `/components/timeline/EnhancedTimeline.tsx`

The primary timeline component that orchestrates all features.

```tsx
import { EnhancedTimeline } from '../timeline/EnhancedTimeline';

<EnhancedTimeline
  events={timelineEvents}
  availableRunIds={[
    { value: 'SEQ001', label: 'SEQ.240201.A01052' },
    { value: 'WF001', label: 'WFR.7x9k2m5p' },
  ]}
  availableStates={[
    { value: 'succeeded', label: 'Succeeded' },
    { value: 'failed', label: 'Failed' },
    { value: 'ongoing', label: 'Ongoing' },
  ]}
  onAddCustomState={handleAddCustomState}
  onAddComment={handleAddComment}
  filterLabel='Workflow Run ID' // or "Sequence Run ID"
/>;
```

**Props**:

- `events`: Array of `TimelineEvent` objects
- `availableRunIds`: Optional array of run IDs for filtering dropdown
- `availableStates`: Array of states available for custom state creation
- `onAddCustomState`: Async handler for adding custom states
- `onAddComment`: Async handler for adding comments
- `filterLabel`: Label for the run ID filter (default: "Run ID")

### 2. AddCustomStateDialog

**Location**: `/components/timeline/AddCustomStateDialog.tsx`

Dialog for adding custom states with validation.

**Features**:

- State name dropdown (required)
- Timestamp picker (default: now, required)
- Comment textarea (optional, max 2000 chars)
- Form validation with Zod
- Optimistic updates supported

### 3. AddCommentDialog

**Location**: `/components/timeline/AddCommentDialog.tsx`

Dialog for adding timestamped comments.

**Features**:

- Timestamp picker (default: now, required)
- Comment textarea (required, max 2000 chars)
- Form validation with Zod
- Optimistic updates supported

### 4. PayloadViewerDialog

**Location**: `/components/timeline/PayloadViewerDialog.tsx`

Dialog for viewing event payload JSON.

**Features**:

- Pretty-printed JSON display
- Copy to clipboard button
- Download JSON button
- Scrollable for large payloads
- Syntax highlighting with monospace font

## Type Definitions

**Location**: `/types/timeline.ts`

### TimelineEvent

```typescript
interface TimelineEvent {
  id: string;
  eventType: TimelineEventType;
  stateName?: WorkflowRunStatus | SequenceRunStatus | string;
  timestamp: string; // ISO 8601 format
  comment?: string;
  source: TimelineEventSource;
  payload?: Record<string, unknown>;
  runId?: string;
  runDisplayName?: string;
}
```

### TimelineEventType

```typescript
type TimelineEventType =
  | 'status_updated'
  | 'comment'
  | 'samplesheet_added'
  | 'samplesheet_validated'
  | 'workflow_started'
  | 'workflow_completed'
  | 'lane_completed'
  | 'qc_passed'
  | 'qc_failed'
  | 'file_uploaded'
  | 'metadata_updated'
  | 'custom_state';
```

### TimelineEventSource

```typescript
type TimelineEventSource =
  | { type: 'system' }
  | { type: 'user'; userName: string }
  | { type: 'custom' };
```

## Mock Data

**Location**: `/data/mockTimelineData.ts`

Comprehensive mock data including:

- `sequenceRunTimelineEvents`: Complete sequence run lifecycle (11 events)
- `workflowRunTimelineEvents`: Successful workflow run (9 events)
- `failedWorkflowTimelineEvents`: Failed workflow with error handling (6 events)
- Helper functions: `getTimelineEventsForRun()`, `getAllRunIds()`
- State definitions: `workflowRunStates`, `sequenceRunStates`

## API Integration

### MSW Handlers

**Location**: `/mocks/handlers.ts`

Mock API endpoints:

```typescript
GET    /api/timeline/:runId      // Get events for specific run
GET    /api/timeline              // Get all events
POST   /api/timeline/custom-state // Add custom state
POST   /api/timeline/comment      // Add comment
DELETE /api/timeline/:eventId     // Delete event (optional)
```

### Example Handlers

```typescript
// Add custom state
const handleAddCustomState = async (data: AddCustomStateFormData) => {
  const response = await fetch('/api/timeline/custom-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      runId: currentRunId,
      runDisplayName: currentRunDisplayName,
    }),
  });

  if (!response.ok) throw new Error('Failed to add custom state');

  // Refetch timeline data or update optimistically
};
```

## Usage Examples

### In a Workflow Run Detail Page

```tsx
import { EnhancedTimeline } from '../timeline/EnhancedTimeline';
import { workflowRunStates } from '../../data/mockTimelineData';

export function WorkflowRunDetailPage() {
  const { runId } = useParams();
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  const handleAddCustomState = async (data: AddCustomStateFormData) => {
    // API call to add custom state
    const newEvent = await addCustomStateAPI(data, runId);
    setTimelineEvents((prev) => [...prev, newEvent]);
  };

  const handleAddComment = async (data: AddCommentFormData) => {
    // API call to add comment
    const newEvent = await addCommentAPI(data, runId);
    setTimelineEvents((prev) => [...prev, newEvent]);
  };

  return (
    <div className='p-6'>
      <EnhancedTimeline
        events={timelineEvents}
        availableStates={workflowRunStates}
        onAddCustomState={handleAddCustomState}
        onAddComment={handleAddComment}
        filterLabel='Workflow Run ID'
      />
    </div>
  );
}
```

### In a Sequence Run Detail Page

```tsx
import { EnhancedTimeline } from '../timeline/EnhancedTimeline';
import { sequenceRunStates } from '../../data/mockTimelineData';

export function SequenceRunDetailPage() {
  const { runId } = useParams();
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  return (
    <div className='p-6'>
      <EnhancedTimeline
        events={timelineEvents}
        availableStates={sequenceRunStates}
        onAddCustomState={handleAddCustomState}
        onAddComment={handleAddComment}
        filterLabel='Sequence Run ID'
      />
    </div>
  );
}
```

## Showcase Page

**Location**: `/components/pages/TimelineShowcasePage.tsx`
**Route**: `/timeline-showcase`

A comprehensive demonstration page showing:

- Multiple timeline examples (successful workflow, failed workflow, sequence run)
- All interactive features
- Usage instructions
- Feature overview

Access it by navigating to `/timeline-showcase` in your browser.

## Best Practices

### 1. Event Creation

- Always provide an `id` (use unique identifiers like UUIDs)
- Use ISO 8601 format for timestamps
- Keep comments concise but descriptive
- Include relevant payload data for debugging/auditing

### 2. State Management

- Use optimistic updates for better UX
- Handle API errors gracefully with toast notifications
- Sort events chronologically after adding new ones
- Consider using TanStack Query for server state management

### 3. Performance

- Paginate events if timeline grows very large (>100 events)
- Use virtualization for extremely long timelines
- Debounce filter/sort operations if needed

### 4. Accessibility

- All dialogs have proper ARIA labels
- Keyboard navigation supported
- Focus management in dialogs
- Color contrast meets WCAG AA standards

### 5. Dark Mode

- All components fully support dark mode
- Use semantic color classes (e.g., `text-neutral-900 dark:text-neutral-100`)
- Test in both light and dark modes

## Customization

### Adding New Event Types

1. Add to `TimelineEventType` in `/types/timeline.ts`
2. Add configuration to `TIMELINE_EVENT_CONFIGS`
3. Update icon mapping in `EnhancedTimeline.tsx` → `getEventIcon()`
4. Add mock data examples in `/data/mockTimelineData.ts`

### Custom Event Icons

Modify the `getEventIcon()` function in `EnhancedTimeline.tsx`:

```typescript
if (event.eventType === 'my_custom_event') {
  return {
    icon: MyCustomIcon,
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    iconColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-300 dark:border-purple-800',
  };
}
```

### Styling

All styling uses Tailwind CSS v4 with the design system tokens from `/styles/globals.css`. Modify colors, spacing, and typography there for global changes.

## Dependencies

- React 18+
- Headless UI (dialogs, menus)
- React Hook Form (form handling)
- Zod (validation)
- Lucide React (icons)
- Sonner (toast notifications)
- TanStack Router (routing)

## Future Enhancements

Potential improvements:

- [ ] Event editing/deletion with permissions
- [ ] Event reactions (emoji, upvotes)
- [ ] Event mentions/tagging
- [ ] Export timeline as PDF/CSV
- [ ] Real-time updates via WebSocket
- [ ] Advanced filtering (date range, event type, source)
- [ ] Event search/highlight
- [ ] Collapsed view with expand/collapse
- [ ] Timeline swimlanes (multiple runs side-by-side)
- [ ] Attachment support for events

## Troubleshooting

### Events not appearing

- Check that `events` prop is being passed correctly
- Verify event structure matches `TimelineEvent` type
- Check browser console for errors

### Dialogs not opening

- Ensure Headless UI is installed: `@headlessui/react`
- Check z-index conflicts with other modals
- Verify dialog state management

### Dark mode not working

- Ensure Tailwind dark mode is configured
- Check that `dark:` classes are present
- Verify color tokens in `/styles/globals.css`

### Form validation errors

- Check Zod schema matches form fields
- Verify React Hook Form resolver is configured
- Check console for validation error messages

## Support

For questions or issues, please refer to the main project documentation or contact the development team.
