'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

type AccordionType = 'single' | 'multiple';

interface AccordionContextValue {
  type: AccordionType;
  openItems: string[];
  toggleItem: (value: string) => void;
  collapsible?: boolean;
}

const AccordionContext = createContext<AccordionContextValue>({
  type: 'single',
  openItems: [],
  toggleItem: () => {},
});

interface AccordionBaseProps extends ComponentProps<'div'> {
  collapsible?: boolean;
}

interface AccordionSingleProps extends AccordionBaseProps {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

function Accordion({
  type = 'single',
  value: controlledValue,
  defaultValue,
  onValueChange,
  collapsible = false,
  className,
  children,
  ...props
}: AccordionProps) {
  const [internalValue, setInternalValue] = useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const openItems = useMemo(
    () =>
      controlledValue !== undefined
        ? Array.isArray(controlledValue)
          ? controlledValue
          : controlledValue
            ? [controlledValue]
            : []
        : internalValue,
    [controlledValue, internalValue]
  );

  const toggleItem = useCallback(
    (itemValue: string) => {
      if (type === 'single') {
        let newItems: string[];
        if (openItems.includes(itemValue)) {
          newItems = collapsible ? [] : [itemValue];
        } else {
          newItems = [itemValue];
        }
        if (controlledValue === undefined) setInternalValue(newItems);
        (onValueChange as ((v: string) => void) | undefined)?.(newItems[0] ?? '');
      } else {
        const newItems = openItems.includes(itemValue)
          ? openItems.filter((v) => v !== itemValue)
          : [...openItems, itemValue];
        if (controlledValue === undefined) setInternalValue(newItems);
        (onValueChange as ((v: string[]) => void) | undefined)?.(newItems);
      }
    },
    [type, openItems, collapsible, controlledValue, onValueChange]
  );

  return (
    <AccordionContext.Provider value={{ type, openItems, toggleItem, collapsible }}>
      <div data-slot='accordion' className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

const AccordionItemContext = createContext<{
  value: string;
  isOpen: boolean;
}>({
  value: '',
  isOpen: false,
});

function AccordionItem({
  className,
  value,
  children,
  ...props
}: ComponentProps<'div'> & { value: string }) {
  const { openItems } = useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div
        data-slot='accordion-item'
        data-state={isOpen ? 'open' : 'closed'}
        className={cn('border-b last:border-b-0', className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

function AccordionTrigger({ className, children, ...props }: ComponentProps<'button'>) {
  const { toggleItem } = useContext(AccordionContext);
  const { value, isOpen } = useContext(AccordionItemContext);

  return (
    <div className='flex'>
      <button
        type='button'
        data-slot='accordion-trigger'
        data-state={isOpen ? 'open' : 'closed'}
        aria-expanded={isOpen}
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className
        )}
        onClick={() => toggleItem(value)}
        {...props}
      >
        {children}
        <ChevronDownIcon className='text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200' />
      </button>
    </div>
  );
}

function AccordionContent({ className, children, ...props }: ComponentProps<'div'>) {
  const { isOpen } = useContext(AccordionItemContext);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      // This state update is necessary to mount the content for the opening animation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      data-slot='accordion-content'
      data-state={isOpen ? 'open' : 'closed'}
      className='data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm'
      role='region'
      onAnimationEnd={() => {
        if (!isOpen) setShouldRender(false);
      }}
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
