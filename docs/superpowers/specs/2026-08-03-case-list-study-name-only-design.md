# Case List Study Name-Only Design

## Goal

Show only the case study name in the case list while keeping the study ID available on the case detail page.

## Design

- Keep the existing `Study` list column and its `study_name` API sorting behavior.
- Remove the secondary `studyId` line from the Study cell in `CasesListTable`.
- Do not change the case detail overview, where Study ID remains a read-only display field.
- Preserve the existing em-dash fallback for an empty study name.

## Testing

- Update the case-list component test to assert that the study name remains visible and the study ID is absent.
- Update the empty-value assertion so the Study cell expects only the study-name fallback.
- Retain the existing case-detail test that verifies Study ID remains visible there.

## Out of Scope

- Removing `studyId` from API types or case models.
- Changing search behavior or backend-managed field handling.
- Changing the Study column label or sorting field.
