import { Dialog, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

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
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      <TransitionChild
        enter='ease-out duration-200'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='ease-in duration-150'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <div className='fixed inset-0 bg-black/30 dark:bg-black/50' aria-hidden='true' />
      </TransitionChild>

      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <TransitionChild
          enter='ease-out duration-200'
          enterFrom='opacity-0 scale-95'
          enterTo='opacity-100 scale-100'
          leave='ease-in duration-150'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-95'
        >
          <DialogPanel className='w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-neutral-900'>
            <div className='flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800'>
              <DialogTitle className='font-semibold text-neutral-900 dark:text-neutral-100'>
                {title}
              </DialogTitle>
              <button
                onClick={onClose}
                className='rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <div className='space-y-4 p-6'>
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

              <div className='flex items-center justify-end gap-3 pt-2'>
                <button
                  type='button'
                  onClick={onClose}
                  className='px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={() => void handleDelete()}
                  className='rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
                >
                  Delete
                </button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  );
}
