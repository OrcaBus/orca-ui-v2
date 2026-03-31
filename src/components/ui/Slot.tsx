import { Children, cloneElement, forwardRef, isValidElement } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import { composeRefs } from './compose-refs';

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...slotProps };

  for (const key in childProps) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    if (
      /^on[A-Z]/.test(key) &&
      typeof slotValue === 'function' &&
      typeof childValue === 'function'
    ) {
      result[key] = (...args: unknown[]) => {
        (childValue as (...a: unknown[]) => void)(...args);
        (slotValue as (...a: unknown[]) => void)(...args);
      };
    } else if (key === 'style') {
      result[key] = {
        ...(slotValue as object),
        ...(childValue as object),
      };
    } else if (key === 'className') {
      result[key] = [slotValue, childValue].filter(Boolean).join(' ');
    } else {
      result[key] = childValue !== undefined ? childValue : slotValue;
    }
  }

  return result;
}

const Slot = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { children?: ReactNode }>(
  (props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childArray = Children.toArray(children);

    if (childArray.length === 0) return null;
    if (childArray.length > 1) {
      throw new Error('Slot expects a single child element');
    }

    const child = childArray[0];
    if (!isValidElement(child)) return child as ReactNode;

    const childRef = (child as unknown as { ref?: Ref<unknown> }).ref;

    return cloneElement(
      child as ReactElement,
      {
        ...mergeProps(slotProps as Record<string, unknown>, child.props as Record<string, unknown>),
        ref: forwardedRef ? composeRefs(forwardedRef, childRef) : childRef,
      } as Record<string, unknown>
    );
  }
);

Slot.displayName = 'Slot';

export { Slot };
