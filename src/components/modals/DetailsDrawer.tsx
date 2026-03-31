import { X } from 'lucide-react';
import { useEffect } from 'react';

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export function DetailsDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'lg',
}: DetailsDrawerProps) {
  const widths = {
    md: 'w-[400px]',
    lg: 'w-[480px]',
    xl: 'w-[600px]',
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 z-40 bg-black/20 transition-opacity' onClick={onClose} />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 ${widths[width]} z-50 flex flex-col border-l border-neutral-200 bg-white shadow-xl`}
      >
        {/* Header */}
        <div className='flex items-start justify-between border-b border-neutral-200 px-6 py-4'>
          <div className='min-w-0 flex-1'>
            <h2 className='truncate font-semibold text-neutral-900'>{title}</h2>
            {subtitle && <p className='mt-0.5 text-sm text-neutral-600'>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className='ml-4 flex-shrink-0 rounded p-1 transition-colors hover:bg-neutral-100'
          >
            <X className='h-5 w-5 text-neutral-500' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>{children}</div>

        {/* Footer */}
        {footer && (
          <div className='border-t border-neutral-200 bg-neutral-50 px-6 py-4'>{footer}</div>
        )}
      </div>
    </>
  );
}

export function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='mb-6'>
      <h3 className='mb-3 text-xs font-medium tracking-wide text-neutral-700 uppercase'>{title}</h3>
      <div className='space-y-3'>{children}</div>
    </div>
  );
}

export function DrawerRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-4'>
      <span className='flex-shrink-0 text-sm text-neutral-600'>{label}</span>
      <span className='text-right text-sm font-medium text-neutral-900'>{value}</span>
    </div>
  );
}

export function DrawerCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 ${className}`}
    >
      {children}
    </div>
  );
}
