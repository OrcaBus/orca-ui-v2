# Production Trust: Workflow Statuses and Case Unlinking

Date: 2026-08-19
Status: Approved design

## Purpose

Remove two production-trust risks identified by the overall frontend design review:

1. Workflow lifecycle states can be rendered as `Unknown` or inconsistently styled because status interpretation is split across badges, timelines, and stat-card icons.
2. Unlinking a library or workflow run from a case currently executes immediately without confirmation.

Global search and all Vault work are explicitly excluded. They use mock data today and will be handled in a separate change request.

## Scope

### Included

- Centralize workflow status normalization, aliases, labels, families, icons, and animation metadata in `status-config.ts`.
- Add canonical support for `submitted`, `runnable`, `starting`, `started`, and `cancelled`.
- Normalize known aliases and formatting variations before status lookup.
- Make timeline status families and workflow-run stat icons use the central registry.
- Add one case-scoped unlink confirmation dialog shared by linked libraries and linked workflow runs.
- Add accessible names and focus treatment to affected unlink controls.
- Add focused unit and component tests for status handling and unlink behavior.

### Excluded

- Global search implementation or visibility changes.
- Any Vault page, component, mock dataset, or API integration.
- A generic application-wide destructive-action framework.
- An undo system for unlink operations.
- Unrelated design-token, table, navigation, or accessibility refactors.

## Architecture

### Status registry

`src/components/ui/status-config.ts` remains the single source of truth for status metadata. A canonical status entry defines its label, family, icon, tooltip, and optional animation. A separate typed alias map resolves backend or legacy synonyms to a canonical key.

Normalization follows this order:

1. Convert null, undefined, or blank input to `unknown`.
2. Trim whitespace, lowercase the value, and normalize spaces and underscores to hyphens.
3. Resolve the normalized value through the alias map.
4. Return the canonical registry key when present; otherwise return `unknown`.

The registry will add these canonical workflow states and families:

| Status      | Family  | Meaning                                                            |
| ----------- | ------- | ------------------------------------------------------------------ |
| `submitted` | neutral | Accepted by orchestration but not yet ready to execute             |
| `runnable`  | neutral | Eligible to execute but not actively executing                     |
| `starting`  | neutral | Pre-execution startup state, preserving current timeline semantics |
| `started`   | info    | Execution has begun                                                |
| `cancelled` | neutral | Execution was deliberately stopped                                 |

The alias map includes at least:

| Alias          | Canonical status |
| -------------- | ---------------- |
| `canceled`     | `cancelled`      |
| `complete`     | `succeeded`      |
| `success`      | `succeeded`      |
| `error`        | `failed`         |
| `initializing` | `started`        |

Existing timeline-only domain aliases remain supported. Unknown backend values stay neutral and display `Unknown`; they must never imply success or failure.

Timeline cards retain timeline-specific icon choices and richer card treatments. Their color family is resolved through the central status registry. Workflow-run stat icons normalize the input first, so aliases and uppercase API values receive the same icon and family as badges.

### Case unlink confirmation

A case-scoped `CaseDetailsUnlinkEntityModal` component presents the confirmation UI for both entity types. It accepts:

- whether the dialog is open;
- entity type (`library` or `workflow run`);
- immutable entity ID;
- human-readable display label;
- pending state;
- cancel callback;
- confirm callback.

The modal owns copy and presentation only. The library and workflow-run tabs continue to own their existing mutation hooks, success side effects, and refresh behavior. This keeps API concerns close to the data-owning feature and avoids a premature application-wide abstraction.

Each tab stores either a selected unlink target or `null`. Pressing an unlink control selects the target and opens the modal; it never calls the API directly.

## User Interaction

The dialog identifies the selected entity and explains that unlinking removes only the case relationship; it does not delete the underlying library or workflow run.

- **Cancel:** Close the dialog and clear the selected target.
- **Unlink:** Invoke the existing case unlink mutation.
- **Pending:** Disable cancel, confirm, overlay dismissal, and the triggering unlink controls to prevent duplicate requests or ambiguous state.
- **Success:** Close and clear the dialog, clear the selected workflow file view when relevant, refresh case data, and show an entity-specific success toast.
- **Failure:** Keep the dialog open with its target intact, re-enable its actions, and show the existing entity-specific error toast so the user can retry.

Affected icon-only unlink controls receive explicit accessible names. The dialog uses the existing `DialogFrame` focus management and a destructive button variant.

## Error Handling

- Missing route or entity IDs prevent the mutation and leave application data unchanged.
- Mutation errors do not close the confirmation dialog or discard the target.
- Refresh happens only after a successful unlink response.
- Unknown status strings render through the neutral `unknown` fallback.
- Status normalization is pure and deterministic so all consumers handle the same raw value identically.

## Testing

### Status tests

- Verify every canonical workflow status resolves to its expected canonical key and family.
- Verify uppercase, underscore, hyphen, and whitespace variations.
- Verify aliases including `canceled`, `complete`, `success`, `error`, and `initializing`.
- Verify null, undefined, blank, misspelled `unkown`, and unrecognized values resolve to `unknown`.
- Verify every workflow-run stat-card status produces an icon.
- Verify timeline states derive the expected family for canonical states and aliases.

### Unlink tests

- Clicking a library or workflow-run unlink control opens confirmation without invoking a mutation.
- Cancel closes the dialog without invoking a mutation.
- Confirm calls the existing unlink endpoint with the selected case and external-entity IDs.
- Pending state disables dismissal and duplicate confirmation.
- Success closes the dialog, refreshes case data, and performs workflow-view cleanup where relevant.
- Failure keeps the dialog open and permits retry.
- The triggering controls and dialog actions have accessible names.

## Acceptance Criteria

- No supported workflow orchestration state renders as `Unknown`.
- Badge, timeline, and stat-card colors agree for the same status family.
- Uppercase and aliased API values render consistently.
- Neither a linked library nor linked workflow run can be unlinked without explicit confirmation.
- The dialog makes clear that the underlying entity is not deleted.
- Duplicate unlink requests are prevented while a mutation is pending.
- Existing success/error toasts and data refresh behavior remain intact.
- Focused tests pass, followed by the repository's full typecheck, test, and lint verification commands.
- Global search and Vault files have no changes in this implementation.
