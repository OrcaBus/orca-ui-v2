import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { useCaseAddUserModel } from '../api/cases.api';

// ─── schema ───────────────────────────────────────────────────────────────────

const addUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .check(z.email({ error: 'Enter a valid email address' })),
  description: z.string(),
});

type FormValues = z.infer<typeof addUserSchema>;

const DEFAULT_VALUES: FormValues = { email: '', description: '' };

// ─── styles ───────────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm ' +
  'focus:ring-2 focus:ring-blue-500 focus:outline-none ' +
  'dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]';

const labelCls = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300';

const errorCls = 'text-sm font-medium text-red-500 dark:text-red-400';

// ─── component ────────────────────────────────────────────────────────────────

export interface CaseDetailsAddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CaseDetailsAddUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CaseDetailsAddUserModalProps) {
  const { caseOrcabusId } = useParams<{ caseOrcabusId: string }>();

  const addUserMutation = useCaseAddUserModel();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) reset(DEFAULT_VALUES);
  }, [isOpen, reset]);

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const handleFormSubmit = async (values: FormValues) => {
    if (!caseOrcabusId) return;
    try {
      await addUserMutation.mutateAsync({
        params: { path: { orcabusId: caseOrcabusId } },
        body: {
          email: values.email,
          description: values.description.trim() || undefined,
        },
      });
      toast.success(`User ${values.email} added to case`);
      onSuccess();
      handleClose();
    } catch {
      toast.error('Failed to add user');
    }
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={handleClose}
      title='Add User to Case'
      description='Grant a user access to this case by their email address.'
      icon={<UserPlus className='h-5 w-5' />}
      size='sm'
      footer={
        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={handleClose}
            className={cn(
              'cursor-pointer rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors',
              'hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50',
              'focus:ring-2 focus:ring-blue-500 focus:outline-none',
              'dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
            )}
          >
            Cancel
          </button>
          <button
            type='submit'
            form='add-user-form'
            disabled={isSubmitting}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors',
              'hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:bg-[#137fec] dark:hover:bg-blue-600'
            )}
          >
            <UserPlus className='h-4 w-4' />
            {isSubmitting ? 'Adding…' : 'Add User'}
          </button>
        </div>
      }
    >
      <form
        id='add-user-form'
        onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
        className='space-y-4'
      >
        <div className='space-y-1.5'>
          <label htmlFor='add-user-email' className={labelCls}>
            Email <span className='text-red-500'>*</span>
          </label>
          <input
            id='add-user-email'
            type='email'
            placeholder='user@example.com'
            aria-invalid={!!errors.email}
            {...register('email')}
            className={inputCls}
          />
          {errors.email && <p className={errorCls}>{errors.email.message}</p>}
        </div>

        <div className='space-y-1.5'>
          <label htmlFor='add-user-description' className={labelCls}>
            Description
          </label>
          <input
            id='add-user-description'
            type='text'
            placeholder='e.g. Case Owner, Case Manager'
            aria-invalid={!!errors.description}
            {...register('description')}
            className={inputCls}
          />
          {errors.description && <p className={errorCls}>{errors.description.message}</p>}
        </div>
      </form>
    </DialogFrame>
  );
}
