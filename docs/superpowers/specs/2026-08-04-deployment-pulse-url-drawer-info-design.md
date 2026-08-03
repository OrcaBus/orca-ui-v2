# Deployment Pulse URL Drawer and Info Drawer Design

## Objective

Upgrade Deployment Pulse so a stack event drawer is controlled solely by the `stack_id` URL query parameter, and add a service information drawer that follows the existing tools-page conventions.

## URL State

The stack table continues to use `page` and `rowsPerPage` for server pagination. Opening a stack adds `stack_id=<external-stack-id>` without changing either pagination parameter. Closing the events drawer removes only `stack_id`.

The service information drawer uses the existing `info=true` convention. Stack details and service information are mutually exclusive: opening either drawer removes the other drawer's query parameter. This prevents overlapping modal drawers while preserving stack-table pagination.

Event pagination remains local React state and is never written to the URL.

## Component Ownership and Data Flow

`DeploymentStacksTable` owns the stack-details interaction, matching the structure used by `WorkflowTypesTable`:

1. A feature hook reads and updates `stack_id`.
2. Stack-name and details buttons write the row's external `stackId` to the URL.
3. The table renders `StackEventsDrawer` using only the URL-derived stack ID.
4. The drawer opens whenever `stack_id` is present.
5. The drawer's events query is enabled only when `stack_id` is present and sends that exact value as the `{stack_id}` path parameter.

The drawer must not depend on the selected registry row or on that row being present in the current server-paginated response. Its title and content use the stack ID and event response data. Event page resets to `1` when the stack ID changes or the drawer closes. The selected event page size remains local while the Deployment Pulse page remains mounted.

`DeploymentPulsePage` owns the service information interaction. It adds the app-shell information action and renders `DeployStatusInfoDrawer` using the shared `info=true` convention.

## Deploy Status Information Drawer

The information drawer uses `DrawerFrame` with the Deployment Pulse activity icon and a medium width. It contains:

- A concise description of Deployment Pulse.
- An explanation that CloudFormation stack lifecycle events are delivered through EventBridge and used to maintain deployment status, version, and history.
- Short usage guidance explaining the stack table, status/version columns, and stack event drawer.

The drawer is informational only and adds no new API calls or actions.

## Error and Loading Behavior

Existing registry and summary behavior remains unchanged. The events request begins only after a non-empty `stack_id` exists. Event loading, empty, error, retry, refresh, and server-pagination behavior remains inside the drawer.

A URL stack ID that is not on the current table page still opens the drawer and requests its events. If the API rejects or cannot find the identifier, the existing drawer error state and retry action are shown.

## Testing

Tests will verify:

- Opening either stack action adds `stack_id` while preserving `page` and `rowsPerPage`.
- The URL-derived `stack_id` alone opens the drawer and supplies the events API path parameter.
- The drawer does not require a registry row from the current page.
- Closing removes `stack_id`; switching IDs and closing reset the event page to `1`; event page size stays local.
- Event pagination does not add URL parameters.
- Opening the information drawer uses `info=true` and clears `stack_id`; opening a stack clears `info`.
- The Deployment Pulse header exposes the information action and renders the new information drawer.
- Existing deployment table, status mapping, route, and launcher tests continue to pass.

## Out of Scope

- Changing the `/tools/deploy-status` route shape.
- Adding an individual stack-detail endpoint.
- Putting event pagination in the URL.
- Changing the stack registry, summary join, status mapping, or backend APIs.
