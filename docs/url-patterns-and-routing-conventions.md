# URL Patterns and Routing Conventions

**Applies to:** Frontend UI routing across all modules  
**Purpose:** Provide a single, predictable standard for URL design, route definition, and URL generation across the application.

---

## 1. Goals

This standard is designed to ensure:

- **Predictable URLs** across all modules
- **Consistent deep linking** for users and internal tools
- **Single source of truth** for route definitions and URL builders
- **Low-friction navigation** between list, detail, and sub-view pages
- **Safer refactoring** when modules evolve
- **Clear rules** for adding new routes in future development

---

## 2. Core principles

### 2.1 URLs are part of the product API

UI URLs should be treated as a stable interface, not just an implementation detail.

A good URL should be:

- readable
- predictable
- stable over time
- easy to generate programmatically
- easy to understand when shared externally

### 2.2 Prefer resource-oriented routing

Routes should reflect resources and views of those resources, not internal implementation details.

Prefer:

- `/workflows/workflow-runs`
- `/sequence/instrument-runs/:instrumentRunId/sample-sheet`

Avoid:

- route names based on component names
- mixed singular/plural without reason
- inconsistent abbreviations
- opaque or ad hoc path shapes

### 2.3 One concept should have one naming style

The same concept must not appear in multiple styles across modules.

For example, if the chosen segment is `workflow-runs`, do not also use:

- `workflowRuns`
- `workflowruns`

### 2.4 Route structure should reflect information hierarchy

Use a consistent pattern:

- **module**
- **resource list**
- **resource detail**
- **resource sub-view**

Example:

- `/lab/libraries`
- `/lab/libraries/:libraryOrcabusId`
- `/lab/libraries/:libraryOrcabusId/overview`

### 2.5 Route params should be meaningful

Parameter names should clearly indicate the entity they identify.

Prefer:

- `:libraryOrcabusId`
- `:workflowRunOrcabusId`
- `:instrumentRunId`
- `:caseOrcabusId`

Avoid generic params like:

- `:id`

unless the route is extremely local and not reused.

---

## 3. Chosen global standard

### 3.1 Path segment style: **kebab-case**

All static URL path segments must use **kebab-case**.

Examples:

- `workflow-runs`
- `analysis-runs`
- `sample-sheet`
- `workflow-types`

This applies to:

- module sub-paths
- resource names
- sub-view names
- special route prefixes

Do not use:

- camelCase
- PascalCase
- lowercase concatenation
- underscores

#### Why kebab-case

Kebab-case is the most readable in URLs and is the most widely understood URL segment style. It also avoids ambiguity in multi-word segments.

### 3.2 Route param naming: **entity-specific camelCase ending in `Id`**

All route parameters must use **descriptive camelCase** names ending in `Id`.

Examples:

- `:libraryOrcabusId`
- `:workflowRunOrcabusId`
- `:analysisRunOrcabusId`
- `:caseOrcabusId`
- `:instrumentRunId`
- `:portalRunId`

Do not use:

- `:id`
- `:orcabusId` across unrelated entities
- inconsistent aliases for the same concept

#### Rule

If the route identifies a resource, the param name should say **which resource** it refers to.

#### OrcabusId vs external IDs

Params ending in `OrcabusId` refer to identity IDs that originate from the **internal OrcaBus system** (e.g. `:libraryOrcabusId`, `:workflowRunOrcabusId`, `:caseOrcabusId`).  
Params that do **not** end in `OrcabusId` (e.g. `:portalRunId`, `:instrumentRunId`) refer to IDs that originate from **external systems** and are not OrcaBus-native identifiers.

### 3.3 Resource naming: **plural resource segments**

Collection/list pages should use plural nouns.

Examples:

- `/libraries`
- `/workflow-runs`
- `/analysis-runs`
- `/workflow-types`
- `/cases`

Detail routes are nested under the same plural resource:

- `/workflow-runs/:workflowRunOrcabusId`
- `/cases/:caseOrcabusId`

This keeps list and detail routes aligned.

### 3.4 Canonical detail route structure

Default structure for a resource:

- **List page**  
  `/module/resource`
- **Detail page**  
  `/module/resource/:resourceId`
- **Detail sub-view**  
  `/module/resource/:resourceId/:subView`

Examples:

- `/lab/libraries`
- `/lab/libraries/:libraryOrcabusId`
- `/lab/libraries/:libraryOrcabusId/overview`

- `/workflows/workflow-runs`
- `/workflows/workflow-runs/:workflowRunOrcabusId`
- `/workflows/workflow-runs/:workflowRunOrcabusId/overview`

- `/sequence/instrument-runs`
- `/sequence/instrument-runs/:instrumentRunId`
- `/sequence/instrument-runs/:instrumentRunId/sample-sheet`

---
