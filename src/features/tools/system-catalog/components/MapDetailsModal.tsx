import { Pencil, Calendar, User, Tag, NotebookText, Box, Trash2 } from 'lucide-react';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PillTag } from '@/components/ui/PillTag';
import { Button } from '@/components/ui/Button';
import type { MapSummary } from '../data/dynamodb-schema';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface MapDetailsModalProps {
  map: MapSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function MapDetailsModal({
  map,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isDeleting = false,
}: MapDetailsModalProps) {
  return (
    <DialogFrame
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={map.name}
      description={map.description}
      titleAdornment={<StatusBadge status={map.status} />}
      size='md'
      footer={
        <>
          <Button
            type='button'
            variant='outline'
            onClick={onDelete}
            disabled={isDeleting}
            className='border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10'
          >
            <Trash2 />
            {isDeleting ? 'Archiving…' : 'Archive Map'}
          </Button>
          <Button
            type='button'
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
          >
            <Pencil />
            Edit Map
          </Button>
        </>
      }
    >
      <div className='grid gap-4 text-sm'>
        {/* People */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1e252e]'>
              <User className='text-muted-foreground h-4 w-4' />
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>Created by</p>
              <p className='font-medium text-slate-900 dark:text-white'>{map.createdBy}</p>
            </div>
          </div>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1e252e]'>
              <User className='text-muted-foreground h-4 w-4' />
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>Updated by</p>
              <p className='font-medium text-slate-900 dark:text-white'>{map.updatedBy}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1e252e]'>
              <Calendar className='text-muted-foreground h-4 w-4' />
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>Created</p>
              <p className='font-medium text-slate-900 dark:text-white'>
                {formatDate(map.createdAt)}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1e252e]'>
              <Calendar className='text-muted-foreground h-4 w-4' />
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>Updated</p>
              <p className='font-medium text-slate-900 dark:text-white'>
                {formatDate(map.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className='flex gap-4'>
          <div className='flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-[#111418]'>
            <Box className='h-4 w-4 text-slate-400 dark:text-[#9dabb9]' />
            <span className='font-semibold text-slate-900 dark:text-white'>{map.nodeCount}</span>
            <span className='text-muted-foreground'>nodes</span>
          </div>
          <div className='flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-[#111418]'>
            <NotebookText className='h-4 w-4 text-slate-400 dark:text-[#9dabb9]' />
            <span className='font-semibold text-slate-900 dark:text-white'>{map.edgeCount}</span>
            <span className='text-muted-foreground'>edges</span>
          </div>
        </div>

        {/* Tags */}
        {Object.keys(map.tags).length > 0 && (
          <div className='flex items-start gap-2.5'>
            <Tag className='mt-1 h-4 w-4 shrink-0 text-slate-400 dark:text-[#9dabb9]' />
            <div className='flex flex-wrap gap-1.5'>
              {Object.entries(map.tags).map(([key, value]) => (
                <PillTag key={key} variant='neutral'>
                  {key}: {value}
                </PillTag>
              ))}
            </div>
          </div>
        )}
      </div>
    </DialogFrame>
  );
}
