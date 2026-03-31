import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Search } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form/form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

const CASE_TYPES = [
  { value: 'clinical', label: 'Clinical' },
  { value: 'research', label: 'Research' },
  { value: 'validation', label: 'Validation' },
  { value: 'qc', label: 'QC' },
] as const;

const addCaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  alias: z.string(),
  description: z.string(),
  caseType: z.string().min(1, 'Type is required'),
  linkedLibraryIds: z.array(z.string()),
});

export type AddCaseFormValues = z.infer<typeof addCaseSchema>;

export interface LibraryOption {
  id: string;
  name: string;
}

interface AddCaseModalProps {
  isOpen: boolean;
  libraries: LibraryOption[];
  onClose: () => void;
  onSubmit: (values: AddCaseFormValues) => void;
}

const defaultValues: AddCaseFormValues = {
  title: '',
  alias: '',
  description: '',
  caseType: '',
  linkedLibraryIds: [],
};

export function AddCaseModal({ isOpen, libraries, onClose, onSubmit }: AddCaseModalProps) {
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');

  const form = useForm<AddCaseFormValues>({
    resolver: zodResolver(addCaseSchema),
    defaultValues,
    mode: 'onChange',
  });

  const handleClose = () => {
    form.reset(defaultValues);
    setLibrarySearchQuery('');
    onClose();
  };

  const handleFormSubmit = (values: AddCaseFormValues) => {
    onSubmit(values);
    handleClose();
  };

  const linkedLibraryIds =
    useWatch({
      control: form.control,
      name: 'linkedLibraryIds',
      defaultValue: [],
    }) ?? [];

  const toggleLibrary = (libraryId: string) => {
    const current = form.getValues('linkedLibraryIds') ?? [];
    if (current.includes(libraryId)) {
      form.setValue(
        'linkedLibraryIds',
        current.filter((id) => id !== libraryId),
        { shouldValidate: true }
      );
    } else {
      form.setValue('linkedLibraryIds', [...current, libraryId], {
        shouldValidate: true,
      });
      setLibrarySearchQuery('');
    }
  };

  const filteredLibraries = librarySearchQuery.trim()
    ? libraries.filter(
        (lib) =>
          lib.name.toLowerCase().includes(librarySearchQuery.toLowerCase()) &&
          !linkedLibraryIds.includes(lib.id)
      )
    : [];

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={handleClose} />

      <div className='relative w-full max-w-lg rounded-xl border border-transparent bg-white shadow-2xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <div className='border-b border-neutral-200 px-6 pt-6 pb-4 dark:border-[#2d3540]'>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 dark:text-slate-100'>
                Add New Case
              </h2>
              <p className='mt-0.5 text-sm text-neutral-500 dark:text-[#9dabb9]'>
                Enter case details manually to register in LIMS.
              </p>
            </div>
            <button
              type='button'
              onClick={handleClose}
              className='rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-slate-100'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        <div className='px-6 py-5'>
          <Form {...form}>
            <form onSubmit={(e) => void form.handleSubmit(handleFormSubmit)(e)}>
              <div className='mb-5 grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title <span className='text-red-500 dark:text-red-400'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='e.g. Lung Cancer Study 2024'
                          className='rounded-lg border-neutral-300 shadow-sm dark:border-[#2d3540] dark:bg-[#1e252e] dark:focus:border-[#137fec] dark:focus:ring-[#137fec]'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='alias'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alias</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Internal ID (Optional)'
                          className='rounded-lg border-neutral-300 shadow-sm dark:border-[#2d3540] dark:bg-[#1e252e] dark:focus:border-[#137fec] dark:focus:ring-[#137fec]'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='mb-5'>
                <FormField
                  control={form.control}
                  name='caseType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Type <span className='text-red-500 dark:text-red-400'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          placeholder='Select case type'
                          options={[...CASE_TYPES]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='mb-5'>
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='Enter detailed description regarding the study goals, methodology or special handling requirements...'
                          rows={4}
                          className='min-h-0 resize-none rounded-lg border-neutral-300 shadow-sm dark:border-[#2d3540] dark:bg-[#1e252e] dark:focus:border-[#137fec] dark:focus:ring-[#137fec]'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='mb-6'>
                <FormField
                  control={form.control}
                  name='linkedLibraryIds'
                  render={() => (
                    <FormItem>
                      <div className='mb-1.5 flex items-center justify-between'>
                        <FormLabel>Initial Linked Libraries</FormLabel>
                        <span className='text-xs text-neutral-400 dark:text-[#9dabb9]'>
                          Optional
                        </span>
                      </div>
                      <FormControl>
                        <div className='overflow-hidden rounded-lg border border-neutral-300 bg-white dark:border-[#2d3540] dark:bg-[#1e252e]'>
                          <div className='relative'>
                            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]' />
                            <input
                              type='text'
                              value={librarySearchQuery}
                              onChange={(e) => setLibrarySearchQuery(e.target.value)}
                              placeholder='Search by Library ID...'
                              className='w-full border-b border-neutral-200 bg-transparent py-2.5 pr-3 pl-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:border-[#2d3540] dark:bg-transparent dark:text-slate-100 dark:placeholder:text-[#9dabb9]'
                            />
                          </div>
                          <div className='min-h-12 px-3 py-2.5'>
                            {linkedLibraryIds.length > 0 && (
                              <div className='mb-2 flex flex-wrap gap-2'>
                                {linkedLibraryIds.map((libId) => {
                                  const lib = libraries.find((l) => l.id === libId);
                                  return (
                                    <span
                                      key={libId}
                                      className='inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:border-[#2d3540] dark:bg-[#2d3540] dark:text-slate-200'
                                    >
                                      {lib?.name ?? libId}
                                      <button
                                        type='button'
                                        onClick={() => toggleLibrary(libId)}
                                        className='text-neutral-400 transition-colors hover:text-neutral-600 dark:text-[#9dabb9] dark:hover:text-slate-100'
                                      >
                                        <X className='h-3 w-3' />
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            {librarySearchQuery.trim() ? (
                              <div className='space-y-1'>
                                {filteredLibraries.slice(0, 5).map((lib) => (
                                  <button
                                    key={lib.id}
                                    type='button'
                                    onClick={() => toggleLibrary(lib.id)}
                                    className='w-full rounded px-2 py-1.5 text-left font-mono text-sm text-neutral-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400'
                                  >
                                    {lib.name}
                                  </button>
                                ))}
                                {filteredLibraries.length === 0 && (
                                  <p className='py-1 text-xs text-neutral-400 dark:text-[#9dabb9]'>
                                    No matching libraries
                                  </p>
                                )}
                              </div>
                            ) : (
                              linkedLibraryIds.length === 0 && (
                                <p className='text-center text-sm text-blue-500 dark:text-blue-400'>
                                  Search to add libraries
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex items-center justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-[#2d3540]'>
                <button
                  type='button'
                  onClick={handleClose}
                  className='rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#2d3540] dark:text-slate-200 dark:hover:bg-[#2d3540]/80'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
                >
                  Create Case
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
