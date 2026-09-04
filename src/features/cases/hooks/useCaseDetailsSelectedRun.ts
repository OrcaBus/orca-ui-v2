import { useCallback } from 'react';
import { useQueryParams } from '../../../hooks/useQueryParams';

/** URL query param key holding the Files_Tab's currently-selected workflow run. */
export const CASE_DETAILS_SELECTED_RUN_PARAM = 'portalRunId';

/**
 * Controls the currently-selected workflow run for the Files tab via a second,
 * independent URL query param (`portalRunId`), orthogonal to the `tab` param
 * managed by {@link useCaseDetailsTab}.
 *
 * The two params are separate keys in the same query string, so clearing/changing
 * the tab does not implicitly clear the run selection or vice versa. Setting a new
 * selection pushes a fresh browser-history entry (`historyReplace: false`) so browser
 * back/forward navigation between runs works. The value is read synchronously from
 * the current search params, so it is available on initial render with no effect/flash.
 *
 * - `selectedPortalRunId` — the selected run's `portalRunId`, or `null` when none.
 * - `setSelectedPortalRunId` — set (or clear, with `null`) the selection.
 */
export function useCaseDetailsSelectedRun() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const selectedPortalRunId = getParam(CASE_DETAILS_SELECTED_RUN_PARAM) ?? null;

  const setSelectedPortalRunId = useCallback(
    (portalRunId: string | null) => {
      setParams(
        { [CASE_DETAILS_SELECTED_RUN_PARAM]: portalRunId ?? undefined },
        { historyReplace: false }
      );
    },
    [setParams]
  );

  return { selectedPortalRunId, setSelectedPortalRunId };
}
