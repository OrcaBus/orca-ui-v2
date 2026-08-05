import { useState, type ReactNode } from 'react';
import { Database, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { DialogFrame, type DialogFrameSize } from '@/components/modals/DialogFrame';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { cn } from '@/utils/cn';

export interface ModelViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schemaUrl: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  size?: DialogFrameSize;
  sourceLabel?: string;
  previewSummary?: ReactNode;
  backgroundNotice?: ReactNode;
}

export function ModelViewDialog({
  isOpen,
  onClose,
  schemaUrl,
  title,
  description,
  icon,
  size = 'full',
  sourceLabel = 'Open source',
  previewSummary = 'SVG preview of the current backend schema.',
  backgroundNotice = 'Some hosts block embedded frame previews. This dialog uses image preview mode for compatibility.',
}: ModelViewDialogProps) {
  // Schema diagrams range from ~520px to ~1830px wide, so the preview fits the
  // stage by default and only scrolls at natural size when the user opts in.
  const [isActualSize, setIsActualSize] = useState(false);

  const handleClose = () => {
    setIsActualSize(false);
    onClose();
  };

  const altText = typeof title === 'string' ? title : 'Backend model schema';

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      icon={icon ?? <Database className='h-5 w-5' />}
      size={size}
      // Bound the panel to the viewport (the frame adds p-4 around it) and lay it
      // out as a column so only the preview stage absorbs the leftover height.
      panelClassName='flex max-h-[calc(100dvh-2rem)] flex-col'
      bodyClassName='flex min-h-0 flex-col space-y-0 p-0'
    >
      <div className='flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-[#2d3540] dark:bg-[#1e252e]'>
        <p className='min-w-0 truncate text-sm text-slate-600 dark:text-[#9dabb9]'>
          {previewSummary}
        </p>

        <div className='flex shrink-0 items-center gap-3'>
          <button
            type='button'
            onClick={() => setIsActualSize((current) => !current)}
            aria-pressed={isActualSize}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-2 py-1',
              'text-xs font-medium text-slate-600 transition-colors',
              'hover:bg-neutral-100 hover:text-slate-900',
              'focus:ring-2 focus:ring-blue-500 focus:outline-none',
              'dark:border-[#2d3540] dark:text-[#9dabb9] dark:hover:bg-[#111418] dark:hover:text-slate-100'
            )}
          >
            {isActualSize ? (
              <Minimize2 className='h-3.5 w-3.5' />
            ) : (
              <Maximize2 className='h-3.5 w-3.5' />
            )}
            {isActualSize ? 'Fit to window' : 'Actual size'}
          </button>

          <a
            href={schemaUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400'
          >
            {sourceLabel}
            <ExternalLink className='h-4 w-4' />
          </a>
        </div>
      </div>

      {/* basis-[70vh] is the preferred stage height; min-h-0 lets it shrink
          instead of pushing the panel past its max-height on short viewports. */}
      <div
        className={cn(
          'relative min-h-0 basis-[70vh] bg-white dark:bg-[#111418]',
          isActualSize ? 'overflow-auto' : 'overflow-hidden'
        )}
      >
        {isActualSize ? (
          // min-w-max keeps the centred diagram from overflowing past the
          // scroll container's start edge, which would make it unreachable.
          <a
            href={schemaUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='flex min-h-full min-w-max items-center justify-center p-3'
          >
            <ImageWithFallback src={schemaUrl} alt={altText} className='block max-w-none' />
          </a>
        ) : (
          // Absolute inset-0 gives the image a definite box in both axes, so
          // object-contain can scale the diagram down to fit rather than clip.
          <a
            href={schemaUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='absolute inset-0 flex items-center justify-center p-3'
          >
            <ImageWithFallback
              src={schemaUrl}
              alt={altText}
              className='block h-full w-full object-contain'
            />
          </a>
        )}
      </div>

      <div className='shrink-0 border-t border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-[#2d3540] dark:bg-[#1e252e]'>
        <p className='text-xs text-slate-500 dark:text-[#9dabb9]'>{backgroundNotice}</p>
      </div>
    </DialogFrame>
  );
}
