// ---------------------------------------------------------------------------
// Centralised localStorage key names.
// All app-owned keys share the `orcabus:` namespace prefix. The useLocalStorage
// hook automatically appends a `:v1` version suffix, so define base keys only.
// ---------------------------------------------------------------------------

/** Shared namespace prefix for all app-owned localStorage keys. */
export const STORAGE_PREFIX = 'orcabus';

/** User theme preference ('light' | 'dark' | 'system'). */
export const THEME_STORAGE_KEY = `${STORAGE_PREFIX}:theme`;

/** ISO timestamp of when workflow notifications were last viewed. */
export const NOTIFICATIONS_LAST_VIEWED_AT_STORAGE_KEY = `${STORAGE_PREFIX}:workflow-notifications:last-viewed-at`;

/** Last authenticated route (path + query + hash) for redirect-after-login. */
export const LAST_VISITED_PAGE_STORAGE_KEY = `${STORAGE_PREFIX}:last-visited-page`;

/** Table row density ('comfortable' | 'compact') — a single global
 * preference shared by every DataTable/ExpandableTable instance, not a
 * per-table setting (unlike column visibility, which genuinely varies by
 * table). See components/tables/useTableDensity.ts. */
export const TABLE_DENSITY_STORAGE_KEY = `${STORAGE_PREFIX}:table-density`;

// Note: the per-table settings key builder (getDataTableSettingsStorageKey)
// lives in components/tables/DataTable.tsx and builds from STORAGE_PREFIX.
