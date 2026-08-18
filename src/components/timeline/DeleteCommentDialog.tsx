import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { TimelineDialogFrame } from '@/components/timeline/TimelineDialogFrame';
import { Button } from '@/components/ui/Button';

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
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type='button' variant='destructive' onClick={() => void handleDelete()}>
            Delete
          </Button>
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
