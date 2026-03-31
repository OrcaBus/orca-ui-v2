# Naming Convention

## Purpose

This document defines naming conventions for the frontend codebase.

The goals are to:

- keep naming predictable across components, hooks, routes, API, types, and utilities
- improve readability and consistency across the project

---

## Naming Conventions

### Folder Names

Use **lowercase kebab-case** for folder names.

Good examples:

- `workflow-runs`
- `analysis-runs`
- `route-registry`

Avoid:

- `WorkflowRuns`
- `AnalysisRuns`
- `Pages`

This avoids case-sensitivity issues and keeps folder names visually consistent.

---

### React Component Files

Use **PascalCase** for files that define React components.

Good examples:

- `Button.tsx`
- `InputField.tsx`
- `WorkflowRunsTable.tsx`
- `WorkflowRunDetailsPage.tsx`
- `ConfirmationModal.tsx`

Avoid:

- `button.tsx`
- `workflowRunsTable.tsx`

Use component names that describe what the component is.

Prefer:

- `WorkflowRunsTable`
- `WorkflowRunDetailsPanel`
- `PageHeader`

Avoid vague names such as:

- `InfoBox`
- `MainThing`
- `DataView`

---

### Hook Files

Use **camelCase** and always start with `use`.

Good examples:

- `useAuth.ts`
- `useDialog.ts`
- `useQueryParams.ts`
- `useWorkflowRuns.ts`
- `useWorkflowRunFilters.ts`

Avoid:

- `authHook.ts`
- `workflowHook.ts`
- `mainLogic.ts`

Hook names should describe behavior.

Prefer:

- `useCurrentUser`
- `useWorkflowRuns`
- `useDebounce`

Avoid generic names like:

- `useData`
- `useMain`

---

### Utility Files

Use **camelCase** and make the name describe the action or purpose.

Good examples:

- `formatDate.ts`
- `mapWorkflowRun.ts`
- `buildSearchParams.ts`

Avoid vague names such as:

- `helpers.ts`
- `common.ts`
- `utils.ts`

A utility name should tell the reader what it does immediately.

---

### Type Files

Use `.types.ts` for normal hand-written app type modules.

Good examples:

- `workflow-run.types.ts`
- `analysis-run.types.ts`
- `file.types.ts`
- `common.types.ts`

Use `.d.ts` for declaration-style generated or environment type files such as:

- `workflows.openapi.d.ts`
- `files.openapi.d.ts`
- `vite-env.d.ts`

---

### Exported Type Names

Use **PascalCase** for exported types and interfaces.

```ts
export interface WorkflowRun {
  id: string;
  status: WorkflowRunStatus;
}

export type WorkflowRunStatus = 'queued' | 'running' | 'completed' | 'failed';
```

Avoid:

```ts
export interface workflowRun {}
export type workflow_run_status = string;
```

---

### API Files

Use `.api.ts` suffix.

Good examples:

- `workflows.api.ts`
- `files.api.ts`
- `sequence-runs.api.ts`

Example:

```ts
// workflows.api.ts
export async function getWorkflowRuns() {}
export async function getWorkflowRunById(id: string) {}
```

---

### Context Files

Use **PascalCase** for React context files.

Good examples:

- `ThemeContext.tsx`
- `UserContext.tsx`
- `WorkflowRunsContext.tsx`

Avoid keeping duplicate naming styles like:

- `theme-context.ts`
- `ThemeContext.tsx`

Choose one convention and keep it consistent.

Recommended for React context files:

- `ThemeContext.tsx`
- `UserContext.tsx`

---

### Route Files

Use lowercase names for route config files.

Good examples:

- `routes.tsx`
- `route-registry.ts`
- `index.tsx`

Avoid:

- `Routes.tsx`
- `RouterConfig.tsx`

---

### Storybook Files

Match the component name and use `.stories.tsx`.

Good examples:

- `Button.stories.tsx`
- `WorkflowRunsTable.stories.tsx`

---

### Test Files

Match the file under test and use `.test.ts` or `.test.tsx`.

Good examples:

- `Button.test.tsx`
- `useAuth.test.ts`
- `formatDate.test.ts`

---

### Constants

Use **UPPER_SNAKE_CASE** for exported constants.

```ts
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_RETRY_COUNT = 3;
```

For small file-local constants, camelCase is also acceptable if the team prefers it.

---
