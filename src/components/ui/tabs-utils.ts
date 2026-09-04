/**
 * Id helpers for wiring `Tabs` tab buttons to consumer-rendered tab panels.
 *
 * `Tabs` renders the tab buttons (with `role="tab"` and `aria-controls`), but
 * consumers render their own panel content. To make the panel accessible, wrap
 * the active tab's content in an element using {@link getTabPanelId} for its
 * `id` and {@link getTabId} for its `aria-labelledby`, passing the same
 * `idPrefix` given to `Tabs`:
 *
 * ```tsx
 * <div
 *   role="tabpanel"
 *   id={getTabPanelId(idPrefix, activeTab)}
 *   aria-labelledby={getTabId(idPrefix, activeTab)}
 *   tabIndex={0}
 * >
 *   {content}
 * </div>
 * ```
 */

/**
 * Builds the DOM id for a tab button. Pair with `role="tab"`.
 */
export function getTabId(idPrefix: string, tabId: string): string {
  return `${idPrefix}-tab-${tabId}`;
}

/**
 * Builds the DOM id for a tab panel. Pair with `role="tabpanel"` and set
 * `aria-labelledby` to {@link getTabId} for the same tab.
 */
export function getTabPanelId(idPrefix: string, tabId: string): string {
  return `${idPrefix}-panel-${tabId}`;
}
