'use client';

import { createContext, useCallback, useContext, useState, type ComponentProps } from 'react';

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled?: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextValue>({
  open: false,
  setOpen: () => {},
});

function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled,
  children,
  ...props
}: ComponentProps<'div'> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (value: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <CollapsibleContext.Provider value={{ open, setOpen, disabled }}>
      <div
        data-slot='collapsible'
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

function CollapsibleTrigger({ children, onClick, ...props }: ComponentProps<'button'>) {
  const { open, setOpen, disabled } = useContext(CollapsibleContext);

  return (
    <button
      type='button'
      data-slot='collapsible-trigger'
      data-state={open ? 'open' : 'closed'}
      aria-expanded={open}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        setOpen(!open);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function CollapsibleContent({ children, ...props }: ComponentProps<'div'>) {
  const { open } = useContext(CollapsibleContext);

  if (!open) return null;

  return (
    <div data-slot='collapsible-content' data-state={open ? 'open' : 'closed'} {...props}>
      {children}
    </div>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
