import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { TimelineDialogFrame } from '@/components/timeline/TimelineDialogFrame';

export interface DeleteCommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  commentPreview?: string;
  title?: string;
}

export function DeleteCommentDialog({
  isOpen,
  onClose,
  onDelete,
  commentPreview,
  title = 'Delete Comment',
}: DeleteCommentDialogProps) {
  const handleDelete = async () => {
    try {
      await onDelete();
      toast.success('Comment deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <TimelineDialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<Trash2 className='h-5 w-5' />}
      footer={
        <>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={() => void handleDelete()}
            className='rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none dark:bg-red-600 dark:hover:bg-red-700'
          >
            Delete
          </button>
        </>
      }
    >
      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'>
          <AlertTriangle className='h-5 w-5' />
        </div>
        <div className='min-w-0'>
          <p className='text-sm text-neutral-800 dark:text-neutral-200'>
            This comment will be permanently deleted.
          </p>
          {commentPreview && (
            <p className='mt-2 line-clamp-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300'>
              {commentPreview}
            </p>
          )}
        </div>
      </div>
    </TimelineDialogFrame>
  );
}
