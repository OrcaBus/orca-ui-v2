import { Dialog, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import type { AddCustomStateFormData } from './timeline.type';

const addCustomStateSchema = z.object({
  stateName: z.string().min(1, 'State name is required'),
  timestamp: z.string().min(1, 'Timestamp is required'),
  comment: z.string().max(2000, 'Comment must be less than 2000 characters'),
});

interface AddCustomStateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddCustomStateFormData) => Promise<void>;
  availableStates: Array<{ value: string; label: string }>;
}

export function AddCustomStateDialog({
  isOpen,
  onClose,
  onSubmit,
  availableStates,
}: AddCustomStateDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCustomStateFormData>({
    resolver: zodResolver(addCustomStateSchema),
    defaultValues: {
      stateName: '',
      timestamp: new Date().toISOString().slice(0, 16), // Format for datetime-local input
      comment: '',
    },
  });

  const handleFormSubmit = async (data: AddCustomStateFormData) => {
    try {
      await onSubmit(data);
      toast.success('Custom state added successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error('Failed to add custom state');
      console.error('Error adding custom state:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className='relative z-50'>
      {/* Backdrop */}
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

      {/* Full-screen container */}
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
            {/* Header */}
            <div className='flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800'>
              <DialogTitle className='font-semibold text-neutral-900 dark:text-neutral-100'>
                Add Custom State
              </DialogTitle>
              <button
                onClick={handleClose}
                className='rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
              className='space-y-4 p-6'
            >
              {/* State Name */}
              <div>
                <label
                  htmlFor='stateName'
                  className='mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300'
                >
                  State Name <span className='text-red-500'>*</span>
                </label>
                <select
                  id='stateName'
                  {...register('stateName')}
                  className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:ring-blue-600'
                >
                  <option value=''>Select a state...</option>
                  {availableStates.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {errors.stateName && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.stateName.message}
                  </p>
                )}
              </div>

              {/* Timestamp */}
              <div>
                <label
                  htmlFor='timestamp'
                  className='mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300'
                >
                  Timestamp <span className='text-red-500'>*</span>
                </label>
                <input
                  id='timestamp'
                  type='datetime-local'
                  {...register('timestamp')}
                  className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:ring-blue-600'
                />
                {errors.timestamp && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.timestamp.message}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label
                  htmlFor='comment'
                  className='mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300'
                >
                  Comment
                </label>
                <textarea
                  id='comment'
                  rows={4}
                  {...register('comment')}
                  placeholder='Add an optional note or explanation for this state...'
                  className='w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:ring-blue-600'
                />
                {errors.comment && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.comment.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className='flex items-center justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={handleClose}
                  className='px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700'
                >
                  {isSubmitting ? 'Adding...' : 'Add State'}
                </button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  );
}
