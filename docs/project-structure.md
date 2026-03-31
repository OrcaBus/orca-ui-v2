# Project Structure

## Purpose

This document defines the project structure for the frontend codebase.

The goals are to:

- keep shared UI separate from business/domain features
- make files easy to locate and maintain
- support scalability for a medium-to-large React + TypeScript application

---

## Recommended Project Structure

```text
src/
  api/
    client.ts
    auth-middleware.ts
    types/
      workflows.openapi.d.ts
      files.openapi.d.ts

  app/
    App.tsx
    main.tsx
    styles/
      globals.css
    router/
      index.tsx
      route-registry.tsx

  assets/
    images/
    icons/

  components/
    ui/
      Button.tsx
      InputField.tsx
      Badge.tsx
      Table.tsx
      Modal.tsx
      Drawer.tsx
    layout/
      Container.tsx
      Grid.tsx
      PageHeader.tsx
    navigation/
      Header.tsx
      NavBar.tsx
      Sidebar.tsx

  features/
    workflows/
      api/
        workflows.api.ts
      components/
        WorkflowRunDetailsPanel.tsx
        WorkflowRunsTable.tsx
        WorkflowRunsTimeline.tsx
      context/
        WorkflowRunsContext.tsx
      hooks/
        useWorkflowRunFilters.ts
        useWorkflowRuns.ts
      pages/
        WorkflowRunDetailsPage.tsx
        WorkflowRunsPage.tsx
        AnalysisRunDetailsPage.tsx
        AnalysisRunsPage.tsx
      types/
        workflow-run.types.ts
        analysis-run.types.ts
      utils/
        mapWorkflowRun.ts
      routes.tsx

    files/
      api/
        files.api.ts
      components/
        FilesTable.tsx
      pages/
        FilesPage.tsx
      types/
        file.types.ts
      routes.tsx

  context/
    ThemeContext.tsx
    UserContext.tsx

  hooks/
    useAuth.ts
    useDebounce.ts
    useDialog.ts
    useQueryParams.ts

  stories/
    assets/
    Button.stories.tsx

  utils/
    calculateTotal.ts
    formatDate.ts
    object.ts
    string.ts
```

---

## Guidance

### 1. Use `app/` for application bootstrapping

Use `app/` to group root-level application wiring such as:

- `App.tsx`
- `main.tsx`
- router setup
- top-level provider composition

This is a good pattern for medium or large applications because it separates:

- app bootstrapping
- business/domain features
- shared reusable code

It is not mandatory. A smaller project can still keep `App.tsx`, `main.tsx`, and `router/` directly under `src/`. However, once the application grows, `app/` usually makes the structure easier to understand.

### 2. Use `styles/globals.css` for global styles

- `globals.css` describes the file's purpose directly
- a `styles/` folder gives styling files a dedicated place
- it scales better if you later add tokens, themes, or utility styles

Example:

```text
src/
  styles/
    globals.css
```

This file can contain:

- CSS reset or base styles
- typography defaults
- global layout rules
- theme variables if needed

Import it from `main.tsx`.

### 3. Use `features/` for domain ownership

Feature folders should group all code that belongs to the same business domain.

Examples:

- `features/workflows`
- `features/files`
- `features/libraries`

Each feature can contain:

- API functions
- components
- hooks
- pages
- context
- types
- utilities
- routes

This keeps related code together and makes the codebase easier to scale.

### 4. Keep `/components` for shared components only

The `/components` folder should contain only generic, reusable components shared across multiple features.

Examples:

- `components/ui/Button.tsx`
- `components/ui/Table.tsx`
- `components/layout/PageHeader.tsx`

Do not place feature-specific components here if they are only used by one domain.

Examples that should stay inside a feature:

- `features/workflows/components/WorkflowRunsTable.tsx`
- `features/workflows/components/WorkflowRunsTimeline.tsx`

### 5. Keep shared hooks separate from feature hooks

Root `/hooks` should contain only hooks reused across multiple features.

Examples:

- `useAuth.ts`
- `useDialog.ts`
- `useDebounce.ts`

Feature-specific hooks should stay inside their own feature folder.

Examples:

- `features/workflows/hooks/useWorkflowRuns.ts`
- `features/workflows/hooks/useWorkflowRunFilters.ts`

### 6. Use `/api` in two levels

Use root `/api` for app-wide shared API code.

Examples:

- `api/client.ts`
- `api/auth-middleware.ts`

Use feature-level `/api` folders for domain-specific API functions.

Examples:

- `features/workflows/api/workflows.api.ts`
- `features/files/api/files.api.ts`

Use `api/types/` for generated OpenAPI schema types only.

Examples:

- `api/types/workflows.openapi.d.ts`
- `api/types/files.openapi.d.ts`

This keeps generated API contract types close to the API layer while remaining separate from hand-written feature types.

---

## Generated OpenAPI Types

Generated OpenAPI types should be written to:

```text
src/api/types/
```

Use the naming pattern:

```text
<domain>.openapi.d.ts
```

Examples:

- `workflows.openapi.d.ts`
- `files.openapi.d.ts`
- `sequence-runs.openapi.d.ts`

This makes it clear that these files are:

- generated
- sourced from the OpenAPI schema
- part of the API contract layer
- not hand-written feature types

Example command:

```bash
npx openapi-typescript ./openapi.json -o ./src/api/types/workflows.openapi.d.ts
```

Keep `api/types/` for generated OpenAPI schema files only.

---

## Handling Sub-features Within a Feature

For features that contain multiple independent sub-features, use the following pattern:

```text
features/
  parent-feature/
    pages/
    shared/
    sub-feature-a/
    sub-feature-b/
```

This is the recommended structure when:

- the parent feature represents one domain or page area
- each sub-feature is functionally independent
- the sub-features still share some local layout, components, hooks, types, or utilities

### Reason of this pattern

This structure keeps the code organized at the correct level of ownership:

- `pages/` contains the parent feature page entry
- `sub-feature-a/` and `sub-feature-b/` contain independent sub-feature code
- `shared/` contains code shared only within the parent feature

This avoids two common problems:

- putting everything into one flat folder and losing clear ownership
- pushing feature-local shared code too early into global shared folders like `components/` or `utils/`

### Recommended usage

Use `shared/` inside the parent feature for things such as:

- layout components used by sibling sub-features
- local reusable components
- local hooks
- local types
- local utilities

If something is only reused inside the parent feature, keep it in the parent feature's `shared/` folder.

Only move it to a root shared folder such as `components/`, `hooks/`, `utils/`, or `types/` when it is reused across multiple top-level features.

### Example

```text
src/
  features/
    tools/
      pages/
        ToolsPage.tsx
      shared/
        components/
          ToolCard.tsx
          ToolGrid.tsx
          ToolsIntro.tsx
        types/
          tool.types.ts
      ss-checker/
        components/
          SSCheckerCard.tsx
          SSCheckerLauncher.tsx
        hooks/
          useSSChecker.ts
      workflow-diagram/
        components/
          WorkflowDiagramCard.tsx
          WorkflowDiagramLauncher.tsx
        hooks/
          useWorkflowDiagram.ts
```
