# Case Manager Contract Upgrade Design

## Goal

Bring the cases frontend into line with the updated Case Manager API contract while preserving the existing cases workflow and visual language.

## Scope

The upgrade covers the case API bindings, list and detail presentation, case editing, timeline event rendering, status visuals, search guidance, and temporary removal of manual case creation. It does not add backend capabilities that are absent from the generated OpenAPI contract.

## API contract

- Keep the generated OpenAPI declarations as the source of truth.
- Export case request types that still exist in the generated schema.
- Comment out the case-create mutation hook with an explanation that the backend temporarily removed collection `POST` support and that the hook can be restored when that operation returns.
- Keep the existing case list, detail, update, REDCap sync, state, comment, user, and external-entity hooks.
- PATCH requests may contain only `description`, `studyType`, `isReportRequired`, `isNataAccredited`, `links`, `alias`, and `dueDate`.
- `requestFormId`, `type`, `studyName`, `studyId`, and `urNumber` are backend-managed display values.

## Case presentation

The case detail overview will retain its existing card treatment and become a responsive grid. It will display the four new values: due date, study name, study ID, and UR number. Missing values use the established em dash fallback. Date-only values are rendered without timezone conversion.

The list will expose the same information without creating an excessively wide set of one-line fields:

- A Study column groups study name and study ID into a clear primary/secondary treatment.
- UR Number and Due Date receive dedicated columns.
- Existing identity, status, type, accreditation, and reporting columns remain available.
- The search prompt calls out request form ID, alias, study name, study ID, and UR number because the backend search covers model fields.

No new filter parameters will be invented. The generated list operation currently supports only search, ordering, and pagination.

## Editing

The edit dialog will remove controls and payload properties for backend-managed `requestFormId` and `type`. Study name, study ID, and UR number remain visible in the overview rather than appearing as disabled form controls.

The dialog will add an optional native date input for `dueDate`. Clearing the input sends `null`; selecting a date sends the unchanged `YYYY-MM-DD` value. The remaining editable fields continue to follow the existing form patterns. Client validation will reject incomplete named links so an empty key cannot silently become an object property.

Success continues to refresh the case detail and state queries, close the dialog, and show a toast. API failures keep the dialog open and show the existing failure toast.

## Timeline and statuses

Case state events will derive their timeline timestamp from `eventDate` and optional `eventTime`, never from the removed `eventAt` field. A focused cases utility will normalize these values:

- When time is present, compose a sortable ISO-like timestamp anchored to the application display timezone.
- When time is absent, preserve the backend calendar date and mark the event as date-only so the UI does not display an invented time.
- If a malformed or unexpectedly absent event date is received, fall back to `createdAt` so the timeline remains usable.

The shared timeline will accept optional date-only precision while continuing to sort on a normalized timestamp. Existing consumers retain date-time rendering by default.

Status visuals will add WGTS tumour sample received, WGTS germline sample received, CTTSO sample received, and all samples received. The retired `sample_received` mapping will be removed. Labels will match backend terminology and reuse the existing pill palette.

Manual state creation will submit the selected state and case as before. The backend supplies the default event date when the user does not enter one.

## Manual case creation

Manual case creation is unavailable until the backend restores collection `POST` support. To preserve future work:

- Comment out the create hook in the API module with a restoration note.
- Comment out the create action, modal state, modal rendering, and related imports in the cases information drawer with a matching explanation.
- Keep `AddCaseModal.tsx` in the repository, but remove it from active exports/import paths if necessary for type safety against the absent request schema.

Users will see only the supported REDCap import action, avoiding an API error path.

## Testing

Tests will be written before each behavior change and will cover:

- Case event timestamp normalization with and without `eventTime`, plus malformed-date fallback.
- Date-only timeline formatting and sorting compatibility.
- Complete status visual coverage with the new values and no retired status.
- Edit form submission containing only writable fields, including a `dueDate` value and `null` when cleared.
- Overview/list rendering of the new case fields and fallbacks at the most stable component boundary available.
- The cases information drawer no longer rendering manual case creation while retaining REDCap import.

Focused tests will run during development. Final verification will run the cases tests, shared timeline tests, TypeScript checking, linting for changed files or the full project, and a production build when the environment permits it.

## Compatibility and non-goals

- Existing cases may temporarily have fewer timeline states after migration; the UI treats an empty timeline as valid and does not synthesize deleted states.
- REDCap due-date derivation remains backend behavior; the frontend only displays and optionally overrides the resulting date.
- This change does not create new list filter APIs, restore deleted historical states, or add a replacement manual-create route.
