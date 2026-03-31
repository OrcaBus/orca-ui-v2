import { PillTag } from './PillTag';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className='border-b border-neutral-200 dark:border-neutral-700'>
      <div className='flex gap-1'>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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
