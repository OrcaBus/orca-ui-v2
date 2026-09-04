import { useRef, type KeyboardEvent } from 'react';

import { PillTag } from './PillTag';
import { getTabId, getTabPanelId } from './tabs-utils';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /**
   * Optional prefix used to build stable DOM ids for each tab button and its
   * associated panel. Defaults to `'tabs'`. Consumers that render their own
   * tab panels should pass the same prefix and use `getTabId` / `getTabPanelId`
   * from `./tabs-utils` so `aria-controls` (on the tab) and `aria-labelledby`
   * (on the panel) line up.
   */
  idPrefix?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, idPrefix = 'tabs' }: TabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const target = tabRefs.current[index];
    target?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = tabs.length - 1;

    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault();
        focusTab(index === lastIndex ? 0 : index + 1);
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        focusTab(index === 0 ? lastIndex : index - 1);
        break;
      }
      case 'Home': {
        event.preventDefault();
        focusTab(0);
        break;
      }
      case 'End': {
        event.preventDefault();
        focusTab(lastIndex);
        break;
      }
      // Enter/Space activation is handled natively by the button's onClick,
      // so no explicit key handling is required here.
      default:
        break;
    }
  };

  return (
    <div className='border-b border-neutral-200 dark:border-neutral-700'>
      <div role='tablist' className='flex gap-1'>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              role='tab'
              id={getTabId(idPrefix, tab.id)}
              aria-selected={isActive}
              aria-controls={getTabPanelId(idPrefix, tab.id)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`group relative flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <PillTag variant={isActive ? 'blue' : 'neutral'} size='sm'>
                  {tab.count}
                </PillTag>
              )}
              {/* Active underline bar */}
              <span
                className={`absolute right-0 bottom-0 left-0 h-0.5 rounded-full transition-colors ${
                  isActive
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : 'bg-transparent group-hover:bg-neutral-300 dark:group-hover:bg-neutral-600'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
