import { Monitor, Moon, Settings, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTheme } from '@/context/theme-context';
import { DialogFrame } from '@/components/modals/DialogFrame';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSettingsModal({ isOpen, onClose }: ThemeSettingsModalProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Theme Preferences'
      description='Choose how your application looks'
      icon={<Settings className='h-4 w-4' />}
      size='sm'
    >
      <div className='space-y-2'>
        {/* Light */}
        <ThemeOption
          label='Light'
          description='Light theme for bright environments'
          active={theme === 'light'}
          onClick={() => setTheme('light')}
          icon={
            <Sun
              className={`h-5 w-5 ${theme === 'light' ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-[#9dabb9]'}`}
            />
          }
          iconBg={
            theme === 'light' ? 'bg-white dark:bg-[#1e252e]' : 'bg-neutral-100 dark:bg-[#1e252e]'
          }
        />
        {/* Dark */}
        <ThemeOption
          label='Dark'
          description='Dark theme for low-light environments'
          active={theme === 'dark'}
          onClick={() => setTheme('dark')}
          icon={
            <Moon
              className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-neutral-600 dark:text-[#9dabb9]'}`}
            />
          }
          iconBg={
            theme === 'dark'
              ? 'bg-neutral-800 dark:bg-[#101922]'
              : 'bg-neutral-100 dark:bg-[#1e252e]'
          }
        />
        {/* System */}
        <ThemeOption
          label='System'
          description='Follows your system preferences'
          active={theme === 'system'}
          onClick={() => setTheme('system')}
          icon={
            <Monitor
              className={`h-5 w-5 ${theme === 'system' ? 'text-white' : 'text-neutral-600 dark:text-[#9dabb9]'}`}
            />
          }
          iconBg={theme === 'system' ? 'bg-primary' : 'bg-neutral-100 dark:bg-[#1e252e]'}
        />
      </div>
    </DialogFrame>
  );
}

function ThemeOption({
  label,
  description,
  active,
  onClick,
  icon,
  iconBg,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  iconBg: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 transition-all ${
        active
          ? 'border-primary bg-primary/10'
          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:bg-[#1e252e]'
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div className='flex-1 text-left'>
        <div className='text-[13px] font-medium text-slate-900 dark:text-white'>{label}</div>
        <div className='text-caption text-muted-foreground'>{description}</div>
      </div>
      {active && (
        <div className='bg-primary flex h-5 w-5 items-center justify-center rounded-full'>
          <svg
            className='text-primary-foreground h-3 w-3'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
          </svg>
        </div>
      )}
    </button>
  );
}
