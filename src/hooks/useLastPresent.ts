import { useState } from 'react';

/**
 * Returns the most recent non-null/undefined value it has been given.
 *
 * Why this exists: our drawers and dialogs stay **mounted** and animate open/closed
 * purely via an `isOpen` prop (see `DrawerFrame` / `DialogFrame`), which is what lets
 * Headless UI play both the enter and exit transitions. Their *content*, though, is
 * driven by a selected item that the parent clears the moment it closes, e.g.
 *
 *   const close = () => { setIsOpen(false); setSelectedFile(null); };
 *
 * If the component read `selectedFile` directly, the content (and title) would blank
 * out *while the panel is still animating away* — you'd watch an empty panel slide or
 * fade out. `useLastPresent` remembers the last real value so the panel keeps showing
 * its content through the exit transition, while the parent stays free to null its
 * state immediately on close.
 *
 * The retained value is only ever visible during the close animation (it's hidden once
 * the panel is fully closed) and is replaced on the next open, so there is no staleness
 * a user can observe.
 *
 * @example
 *   function DetailsDrawer({ item, isOpen, onClose }: Props) {
 *     const shown = useLastPresent(item); // survives `item` -> null on close
 *     return (
 *       <DrawerFrame isOpen={isOpen} onClose={onClose} title={shown?.name ?? ''}>
 *         {shown && <DetailsBody item={shown} />}
 *       </DrawerFrame>
 *     );
 *   }
 */
export function useLastPresent<T>(value: T | null | undefined): T | null {
  const [lastPresent, setLastPresent] = useState<T | null>(value ?? null);

  if (value != null && value !== lastPresent) {
    // React's supported "adjust state while rendering" pattern: update the retained
    // value synchronously when a new one arrives, no effect required.
    setLastPresent(value);
  }

  return value ?? lastPresent;
}
