import { Pencil, Calendar, User, Tag, GitBranch, Box } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/modals/dialog';
import { Badge } from '@/components/ui/Badge';
import type { DiagramSummary } from '../data/diagrams';

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> =
  {
    active: { variant: 'success', label: 'Active' },
    draft: { variant: 'warning', label: 'Draft' },
    archived: { variant: 'neutral', label: 'Archived' },
  };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface DiagramDetailsModalProps {
  diagram: DiagramSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function DiagramDetailsModal({
  diagram,
  open,
  onOpenChange,
  onEdit,
}: DiagramDetailsModalProps) {
  const badge = STATUS_BADGE[diagram.status] ?? STATUS_BADGE.draft;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!bg-white !shadow-2xl sm:max-w-lg dark:!bg-[#111418]'>
        <DialogHeader>
          <div className='flex items-center gap-2.5'>
            <DialogTitle className='text-lg'>{diagram.name}</DialogTitle>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          <DialogDescription className='leading-relaxed'>{diagram.description}</DialogDescription>
        </DialogHeader>

        <div className='-mx-6 border-t border-slate-100 dark:border-[#2d3540]' />

        <div className='grid gap-4 text-sm'>
          {/* People */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex items-center gap-2.5'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1e252e]'>
                <User className='h-4 w-4 text-slate-500 dark:text-[#6b7a8d]' />
              </div>
              <div>
                <p className='text-xs text-slate-500 dark:text-[#6b7a8d]'>Created by</p>
                <p className='font-medium text-slate-900 dark:text-white'>{diagram.createdBy}</p>
              </div>
            </div>
            <div className='flex items-center gap-2.5'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1e252e]'>
                <User className='h-4 w-4 text-slate-500 dark:text-[#6b7a8d]' />
              </div>
              <div>
                <p className='text-xs text-slate-500 dark:text-[#6b7a8d]'>Updated by</p>
                <p className='font-medium text-slate-900 dark:text-white'>{diagram.updatedBy}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex items-center gap-2.5'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1e252e]'>
                <Calendar className='h-4 w-4 text-slate-500 dark:text-[#6b7a8d]' />
              </div>
              <div>
                <p className='text-xs text-slate-500 dark:text-[#6b7a8d]'>Created</p>
                <p className='font-medium text-slate-900 dark:text-white'>
                  {formatDate(diagram.createdAt)}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2.5'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1e252e]'>
                <Calendar className='h-4 w-4 text-slate-500 dark:text-[#6b7a8d]' />
              </div>
              <div>
                <p className='text-xs text-slate-500 dark:text-[#6b7a8d]'>Updated</p>
                <p className='font-medium text-slate-900 dark:text-white'>
                  {formatDate(diagram.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className='flex gap-4'>
            <div className='flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-[#1a2029]'>
              <Box className='h-4 w-4 text-slate-400 dark:text-[#6b7a8d]' />
              <span className='font-semibold text-slate-900 dark:text-white'>
                {diagram.nodeCount}
              </span>
              <span className='text-slate-500 dark:text-[#6b7a8d]'>nodes</span>
            </div>
            <div className='flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-[#1a2029]'>
              <GitBranch className='h-4 w-4 text-slate-400 dark:text-[#6b7a8d]' />
              <span className='font-semibold text-slate-900 dark:text-white'>
                {diagram.edgeCount}
              </span>
              <span className='text-slate-500 dark:text-[#6b7a8d]'>edges</span>
            </div>
          </div>

          {/* Tags */}
          {Object.keys(diagram.tags).length > 0 && (
            <div className='flex items-start gap-2.5'>
              <Tag className='mt-1 h-4 w-4 shrink-0 text-slate-400 dark:text-[#6b7a8d]' />
              <div className='flex flex-wrap gap-1.5'>
                {Object.entries(diagram.tags).map(([key, value]) => (
                  <span
                    key={key}
                    className='rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9]'
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Edit button */}
        <div className='-mx-6 mt-2 -mb-6 flex justify-end rounded-b-lg border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-[#2d3540] dark:bg-[#0d1117]'>
          <button
            type='button'
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
            className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          >
            <Pencil className='h-3.5 w-3.5' />
            Edit Diagram
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
