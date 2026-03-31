# Timeline Component - Feature Reference Card

## 🎨 Visual Indicators

### Event Node Icons

| Icon             | Color  | States/Events                                           |
| ---------------- | ------ | ------------------------------------------------------- |
| ✅ CheckCircle   | Green  | succeeded, completed, success, qc_passed                |
| ❌ XCircle       | Red    | failed, aborted, error, qc_failed                       |
| ▶️ PlayCircle    | Blue   | running, ongoing, processing                            |
| 🕐 Clock         | Amber  | queued, pending, initializing                           |
| 💬 MessageSquare | Blue   | comment events                                          |
| ⬆️ Upload        | Purple | file_uploaded, samplesheet_added, samplesheet_validated |
| ⚪ Circle        | Grey   | neutral/other events                                    |

### Source Badges

| Badge        | Color  | Description              |
| ------------ | ------ | ------------------------ |
| Custom       | Purple | User-added custom states |
| System       | -      | Automated system events  |
| User: [name] | -      | Manual user actions      |

## 🛠️ Interactive Actions

### Header Controls

```
┌─────────────────────────────────────────────────────────────┐
│ Timeline (9 events)                                         │
│                                                             │
│  [↕️ Latest First]  [🔽 All Workflow Run IDs]              │
│  [+ Add State]  [💬 Add Comment]                           │
└─────────────────────────────────────────────────────────────┘
```

- **Sort Toggle**: Switch between "Latest First" ↔ "Oldest First"
- **Filter Dropdown**: Select specific run ID or view "All"
- **Add State**: Opens dialog to add custom state
- **Add Comment**: Opens dialog to add timestamped comment

### Event Actions Menu (⋮)

```
┌──────────────────────┐
│ 🔗 Copy link to event │
│ 📄 View payload       │ (if payload exists)
└──────────────────────┘
```

## 📝 Event Types (12 Total)

### State-Based Events

1. **status_updated** - State transitions
2. **workflow_started** - Workflow initiation
3. **workflow_completed** - Workflow completion

### Upload Events

4. **samplesheet_added** - Sample sheet uploads
5. **samplesheet_validated** - Sample sheet validation
6. **file_uploaded** - File uploads

### QC Events

7. **qc_passed** - QC approval
8. **qc_failed** - QC failure

### Progress Events

9. **lane_completed** - Sequencing lane completion

### Metadata Events

10. **metadata_updated** - Metadata changes

### User Events

11. **comment** - User comments
12. **custom_state** - User-defined states

## 🎯 Event Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ ⚪ ─┐                                                       │
│     │  Status Updated • succeeded                      ⋮   │
│     │  System • Feb 2, 2026 at 6:45 PM • WFR.7x9k2m5p     │
│     │                                                      │
│     │  ┃ Workflow completed successfully. All outputs    │
│     │  ┃ validated.                                       │
└─────┴──────────────────────────────────────────────────────┘
  │
  └─ Timeline rail with connecting line
```

### Event Card Structure:

1. **Top Line**: Event Type • State Badge (optional) • Menu (⋮)
2. **Second Line**: Source • Timestamp • Run Display Name
3. **Body**: Comment/Note (if present)
4. **Actions**: Via overflow menu

## 📋 Dialog Forms

### Add Custom State Dialog

```
┌─────────────────────────────────────┐
│ Add Custom State                 ✕ │
├─────────────────────────────────────┤
│                                     │
│ State Name *                        │
│ [Dropdown: Select a state...]       │
│                                     │
│ Timestamp *                         │
│ [2026-02-12T14:30]                 │
│                                     │
│ Comment                             │
│ ┌─────────────────────────────────┐ │
│ │ Add an optional note...         │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│              [Cancel]  [Add State]  │
└─────────────────────────────────────┘
```

**Validation**:

- State name: Required
- Timestamp: Required, valid ISO date
- Comment: Optional, max 2000 chars

### Add Comment Dialog

```
┌─────────────────────────────────────┐
│ Add Comment                      ✕ │
├─────────────────────────────────────┤
│                                     │
│ Timestamp *                         │
│ [2026-02-12T14:30]                 │
│                                     │
│ Comment *                           │
│ ┌─────────────────────────────────┐ │
│ │ Enter your comment...           │ │
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│            [Cancel]  [Add Comment]  │
└─────────────────────────────────────┘
```

**Validation**:

- Timestamp: Required, valid ISO date
- Comment: Required, non-empty after trim, max 2000 chars

### Payload Viewer Dialog

```
┌───────────────────────────────────────────────────┐
│ Event Payload               📋 💾 ✕              │
├───────────────────────────────────────────────────┤
│                                                   │
│  {                                                │
│    "totalDuration": "3h 25m",                    │
│    "outputFiles": 96,                            │
│    "totalOutputSize": "487.3 GB",                │
│    "finalStatus": "All samples passed QC"        │
│  }                                                │
│                                                   │
│                                                   │
│                                      [Close]      │
└───────────────────────────────────────────────────┘
```

**Features**:

- 📋 Copy to clipboard
- 💾 Download as JSON
- Scrollable for large payloads
- Syntax-highlighted monospace font

## 🔄 Workflow States

### For Workflow Runs:

- queued
- initializing
- ongoing
- succeeded
- failed
- aborted
- resolved
- deprecated
- under_review (custom)

### For Sequence Runs:

- pending
- running
- completed
- failed
- aborted
- on_hold (custom)

## 📊 Example Timeline Flow

### Successful Workflow Run:

```
Latest ↓

⚪ queued                    (System)
↓
⚪ initializing              (System)
↓
🔵 ongoing                   (System)
↓
💬 Comment: "Lane 1 completed..." (User: ops)
↓
📄 metadata_updated          (User: curator)
↓
⬆️ file_uploaded             (User: bioinfo)
↓
✅ qc_passed                 (System)
↓
✅ succeeded                 (System)
↓
💬 Comment: "Excellent run"  (User: ops)

Oldest ↑
```

### Failed Workflow Run:

```
Latest ↓

⚪ queued                    (System)
↓
🔵 ongoing                   (System)
↓
💬 Comment: "Normal processing..." (System)
↓
❌ failed                    (System)
  "Insufficient coverage"
↓
💬 Comment: "Investigating..." (User: ops)
↓
🟣 under_review              (Custom)

Oldest ↑
```

## 🎨 Color Palette (Light/Dark)

| Element    | Light Mode              | Dark Mode               |
| ---------- | ----------------------- | ----------------------- |
| Success    | green-600/green-100     | green-400/green-950     |
| Failure    | red-600/red-100         | red-400/red-950         |
| Active     | blue-600/blue-100       | blue-400/blue-950       |
| Pending    | amber-600/amber-100     | amber-400/amber-950     |
| Upload     | purple-600/purple-100   | purple-400/purple-950   |
| Neutral    | neutral-600/neutral-100 | neutral-400/neutral-800 |
| Background | white                   | neutral-900             |
| Border     | neutral-200             | neutral-800             |
| Text       | neutral-900             | neutral-100             |

## 🔑 Key Props

```typescript
interface EnhancedTimelineProps {
  events: TimelineEvent[]; // Required
  availableRunIds?: Array<{
    // Optional
    value: string;
    label: string;
  }>;
  availableStates: Array<{
    // Required
    value: string;
    label: string;
  }>;
  onAddCustomState: (data) => Promise<void>; // Required
  onAddComment: (data) => Promise<void>; // Required
  filterLabel?: string; // Optional (default: "Run ID")
}
```

## 📱 Responsive Breakpoints

```
Desktop (≥1024px):  Full layout, all features visible
Tablet (768-1023px): Wrapped controls, condensed spacing
Mobile (<768px):     Stacked layout, smaller cards
```

## ⚡ Performance Tips

1. **Pagination**: For >100 events, implement pagination
2. **Virtualization**: For >500 events, use virtual scrolling
3. **Debouncing**: Debounce filter/sort for large datasets
4. **Memoization**: Use React.memo for event cards
5. **Lazy Loading**: Load dialogs on demand

## 🔒 Security Checklist

- ✅ Input validation (Zod schemas)
- ✅ XSS prevention (React auto-escaping)
- ✅ Permission checks (before mutations)
- ✅ HTTPS only (production)
- ✅ Sanitized payload display
- ✅ CSRF protection (API layer)

## 📈 Analytics Events

Track these user actions:

- Timeline viewed
- Filter applied
- Sort order changed
- Custom state added
- Comment added
- Payload viewed
- Event link copied

## 🎓 Common Patterns

### Pattern 1: Simple Display

```tsx
<EnhancedTimeline
  events={events}
  availableStates={states}
  onAddCustomState={handleState}
  onAddComment={handleComment}
/>
```

### Pattern 2: With Filtering

```tsx
<EnhancedTimeline
  events={allEvents}
  availableRunIds={runIds}
  availableStates={states}
  onAddCustomState={handleState}
  onAddComment={handleComment}
  filterLabel='Workflow Run ID'
/>
```

### Pattern 3: With TanStack Query

```tsx
const { data: events } = useQuery({
  queryKey: ['timeline', runId],
  queryFn: fetchTimeline,
});

const addState = useMutation({
  mutationFn: addCustomState,
  onSuccess: () => invalidate(),
});

<EnhancedTimeline
  events={events || []}
  onAddCustomState={addState.mutateAsync}
  // ...
/>;
```

---

**Quick Reference** | **Version 1.0.0** | **Feb 2026**
