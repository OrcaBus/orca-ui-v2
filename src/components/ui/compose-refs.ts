import type { MutableRefObject, Ref } from 'react';

/** Merge multiple refs (callback refs or RefObjects) into a single callback ref */
export function composeRefs(
  ...refs: Array<Ref<unknown> | null | undefined>
): (node: unknown) => void {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref != null) {
        (ref as MutableRefObject<unknown>).current = node;
      }
    });
  };
}
