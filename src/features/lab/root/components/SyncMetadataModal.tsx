import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useCallback, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Eye,
  FileSpreadsheet,
  Link,
  Loader2,
  RefreshCw,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Controller, useForm, useWatch, type Control, type FieldErrors } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { DialogFrame, type DialogFrameSize } from '@/components/modals/DialogFrame';
import { cn } from '@/utils/cn';
import {
  useMutationPreviewGsheetRecords,
  useMutationSyncCustomCsv,
  useMutationSyncGsheet,
  type SyncGSheetRequestType,
} from '../../shared/api/lab.api';
import {
  buildSyncYears,
  hasGsheetRanges,
  isValidGsheetRangeInput,
  resolveGsheetPreviewRanges,
  sanitizeGsheetRanges,
  formatErrorMessage,
  formatResponse,
} from '../../library/utils/syncMetadata';

type SyncSource = 'gsheet' | 'presigned-csv';
type SyncStep = 'source' | 'configure' | 'review' | 'success';
interface SyncMetadataFormValues {
  syncType: SyncSource;
  year: string;
  ranges: string;
  presignedUrl: string;
  reason: string;
}

function getSyncMetadataDefaultValues(syncType: SyncSource = 'gsheet'): SyncMetadataFormValues {
  return {
    syncType,
    year: '',
    ranges: '',
    presignedUrl: '',
    reason: '',
  };
}

function canPreviewGsheetConfiguration(value: SyncMetadataFormValues): boolean {
  if (value.syncType !== 'gsheet' || value.year.trim().length === 0) {
    return false;
  }

  return !hasGsheetRanges(value.ranges) || isValidGsheetRangeInput(value.ranges);
}

function canSyncGsheetDirectly(value: SyncMetadataFormValues): boolean {
  return (
    value.syncType === 'gsheet' && value.year.trim().length > 0 && !hasGsheetRanges(value.ranges)
  );
}

function canSyncPresignedCsvConfiguration(value: SyncMetadataFormValues): boolean {
  if (value.syncType !== 'presigned-csv') return false;
  try {
    new URL(value.presignedUrl.trim());
    return true;
  } catch {
    return false;
  }
}

interface SyncMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SourceOption {
  value: SyncSource;
  label: string;
  description: string;
  icon: LucideIcon;
}

const sourceOptions: SourceOption[] = [
  {
    value: 'gsheet',
    label: 'Google Tracking Sheet',
    description: 'Preview a sample, review specific ranges, or sync a full year tab.',
    icon: FileSpreadsheet,
  },
  {
    value: 'presigned-csv',
    label: 'Presigned CSV file',
    description: 'Trigger metadata sync from a custom CSV presigned URL.',
    icon: Link,
  },
];

const syncMetadataSchema = z
  .object({
    syncType: z.enum(['gsheet', 'presigned-csv']),
    year: z.string(),
    ranges: z.string(),
    presignedUrl: z.string(),
    reason: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.syncType !== 'presigned-csv' && value.year.trim().length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['year'],
        message: 'Year is required',
      });
    }

    if (
      value.syncType === 'gsheet' &&
      hasGsheetRanges(value.ranges) &&
      !isValidGsheetRangeInput(value.ranges)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['ranges'],
        message: 'Use START:END, a row number, or comma-separated ranges',
      });
    }

    if (value.syncType === 'presigned-csv') {
      const presignedUrl = value.presignedUrl.trim();
      if (presignedUrl.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['presignedUrl'],
          message: 'CSV presigned URL is required',
        });
        return;
      }

      try {
        new URL(presignedUrl);
      } catch {
        ctx.addIssue({
          code: 'custom',
          path: ['presignedUrl'],
          message: 'Enter a valid presigned URL',
        });
      }
    }
  });

function getStepLabels(syncType: SyncSource) {
  return syncType === 'gsheet'
    ? ['Source', 'Configure', 'Review', 'Complete']
    : ['Source', 'Configure', 'Complete'];
}

function getStepIndex(step: SyncStep, syncType: SyncSource) {
  if (step === 'source') return 0;
  if (step === 'configure') return 1;
  if (step === 'review') return 2;
  return syncType === 'gsheet' ? 3 : 2;
}

function getDialogSize(step: SyncStep): DialogFrameSize {
  return step === 'review' ? 'full' : 'xl';
}

export function SyncMetadataModal({ isOpen, onClose }: SyncMetadataModalProps) {
  const [step, setStep] = useState<SyncStep>('source');
  const [gsheetSyncPayload, setGsheetSyncPayload] = useState<SyncGSheetRequestType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const {
    control,
    getValues,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<SyncMetadataFormValues>({
    resolver: zodResolver(syncMetadataSchema),
    defaultValues: getSyncMetadataDefaultValues(),
    mode: 'onChange',
  });

  const {
    data: previewRecords,
    status: previewStatus,
    mutateAsync: previewGsheetRecords,
    reset: resetPreviewMutation,
  } = useMutationPreviewGsheetRecords();
  const {
    status: syncGsheetStatus,
    mutateAsync: syncGsheet,
    reset: resetSyncGsheetMutation,
  } = useMutationSyncGsheet();
  const {
    status: syncCsvStatus,
    mutateAsync: syncCsv,
    reset: resetSyncCsvMutation,
  } = useMutationSyncCustomCsv();

  const isSyncing = syncGsheetStatus === 'pending' || syncCsvStatus === 'pending';
  const isPendingPreviewGsheet = step === 'configure' && previewStatus === 'pending';
  const isBusy = isPendingPreviewGsheet || isSyncing;
  const previewRecordCount = previewRecords?.values?.length ?? 0;
  const hasPreviewData = Boolean(previewRecords?.columns?.length && previewRecords.values.length);

  const syncType = useWatch({ control, name: 'syncType' }) ?? 'gsheet';
  const watchedConfiguration = useWatch({ control });
  const years = useMemo(() => buildSyncYears(), []);
  const currentConfiguration: SyncMetadataFormValues = {
    syncType,
    year: watchedConfiguration.year ?? '',
    ranges: watchedConfiguration.ranges ?? '',
    presignedUrl: watchedConfiguration.presignedUrl ?? '',
    reason: watchedConfiguration.reason ?? '',
  };

  const resetMutationStates = useCallback(() => {
    resetPreviewMutation();
    resetSyncGsheetMutation();
    resetSyncCsvMutation();
    setGsheetSyncPayload(null);
    setMutationError(null);
  }, [resetPreviewMutation, resetSyncCsvMutation, resetSyncGsheetMutation]);

  const handleClose = () => {
    if (isBusy) return;
    reset(getSyncMetadataDefaultValues());
    resetMutationStates();
    setStep('source');
    setSuccessMessage(null);
    onClose();
  };

  const handleSourceSelect = (value: SyncSource) => {
    reset(getSyncMetadataDefaultValues(value));
    resetMutationStates();
  };

  const handleConfigureBack = () => {
    setMutationError(null);
    setStep('source');
  };

  const handleReviewBack = () => {
    setMutationError(null);
    setStep('configure');
  };

  const handleSuccessClose = () => {
    handleClose();
  };

  const handleMutationError = (error: unknown, fallbackMessage: string) => {
    const message = formatErrorMessage(error);
    setMutationError(message);
    toast.error(fallbackMessage);
  };

  const syncTrackingGsheet = async (payload: SyncGSheetRequestType) => {
    try {
      const response = await syncGsheet({ body: payload });
      setSuccessMessage(formatResponse(response));
      setStep('success');
      toast.success('Metadata sync triggered');
    } catch (error) {
      handleMutationError(error, 'Failed to trigger Google tracking sheet sync');
    }
  };

  const syncPresignedCsv = async (values: SyncMetadataFormValues) => {
    const reason = values.reason.trim();

    try {
      const response = await syncCsv({
        body: {
          presignedUrl: values.presignedUrl.trim(),
          reason: reason || undefined,
        },
      });
      setSuccessMessage(formatResponse(response));
      setStep('success');
      toast.success('Metadata sync triggered');
    } catch (error) {
      handleMutationError(error, 'Failed to trigger presigned CSV sync');
    }
  };

  const previewGsheetRange = async () => {
    const isValid = await trigger(['syncType', 'year', 'ranges']);
    const values = getValues();

    if (!isValid || !canPreviewGsheetConfiguration(values)) {
      return;
    }

    const hasTypedRanges = hasGsheetRanges(values.ranges);
    const payload = {
      year: values.year,
      ranges: resolveGsheetPreviewRanges(values.ranges),
    };
    setGsheetSyncPayload(null);

    try {
      await previewGsheetRecords({ body: payload });
      setGsheetSyncPayload(
        hasTypedRanges
          ? {
              year: values.year,
              ranges: sanitizeGsheetRanges(values.ranges),
            }
          : {
              year: values.year,
            }
      );
      setStep('review');
    } catch (error) {
      handleMutationError(error, 'Failed to preview Google Sheet records');
    }
  };

  const handlePresignedCsvSyncSubmit = async (values: SyncMetadataFormValues) => {
    setMutationError(null);
    await syncPresignedCsv(values);
  };

  const handleDirectGsheetSyncSubmit = async (values: SyncMetadataFormValues) => {
    setMutationError(null);
    await syncTrackingGsheet({ year: values.year });
  };

  const handleConfirmRangeGsheetSyncSubmit = async (values: SyncMetadataFormValues) => {
    const ranges = values.ranges.trim();
    const payload =
      gsheetSyncPayload ??
      (hasGsheetRanges(ranges)
        ? {
            year: values.year,
            ranges: sanitizeGsheetRanges(ranges),
          }
        : {
            year: values.year,
          });

    setMutationError(null);

    await syncTrackingGsheet(payload);
  };

  const selectedSource =
    sourceOptions.find((option) => option.value === syncType) ?? sourceOptions[0];
  const stepLabels = getStepLabels(syncType);
  const activeStepIndex = getStepIndex(step, syncType);
  const isPreviewFullYearGsheet =
    step === 'review' && syncType === 'gsheet' && !gsheetSyncPayload?.ranges;
  const dialogTitle = step === 'review' ? 'Sync Confirmation' : 'Sync Metadata';
  const dialogDescription =
    step === 'review'
      ? hasPreviewData
        ? isPreviewFullYearGsheet
          ? `Review the full year and confirm to sync to metadata.`
          : `Found ${previewRecordCount} record(s) in the specified ranges. Review and confirm to sync these records to metadata.`
        : 'No data available to sync.'
      : 'Choose a metadata source, configure the sync, and trigger the metadata update.';

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={handleClose}
      title={dialogTitle}
      description={dialogDescription}
      icon={<Database className='h-5 w-5' />}
      size={getDialogSize(step)}
      panelClassName={cn(step === 'review' && 'sm:max-w-6xl')}
      footer={
        <SyncModalFooter
          step={step}
          configuration={currentConfiguration}
          hasPreviewData={hasPreviewData}
          isBusy={isBusy}
          isPendingPreviewGsheet={isPendingPreviewGsheet}
          isSyncing={isSyncing}
          onCancel={handleClose}
          onContinue={() => setStep('configure')}
          onBack={step === 'review' ? handleReviewBack : handleConfigureBack}
          previewGsheetRange={() => void previewGsheetRange()}
          onDirectGsheetSync={() => void handleSubmit(handleDirectGsheetSyncSubmit)()}
          onConfirmRangeGsheetSync={() => void handleSubmit(handleConfirmRangeGsheetSyncSubmit)()}
          onPresignedCsvSync={() => void handleSubmit(handlePresignedCsvSyncSubmit)()}
        />
      }
    >
      <form id='sync-metadata-form' className='space-y-5'>
        <Stepper labels={stepLabels} activeIndex={activeStepIndex} />

        {mutationError && (
          <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'>
            {mutationError}
          </div>
        )}

        {step === 'source' && (
          <SourceStep value={syncType} onChange={handleSourceSelect} disabled={isBusy} />
        )}

        {step === 'configure' && (
          <ConfigureStep
            selectedSource={selectedSource}
            syncType={syncType}
            control={control}
            errors={errors}
            years={years}
            isBusy={isBusy}
            isPendingPreviewGsheet={isPendingPreviewGsheet}
            isSyncing={isSyncing}
          />
        )}

        {step === 'review' && (
          <ReviewStep
            previewData={previewRecords}
            isSyncing={isSyncing}
            isPendingPreviewGsheet={false}
          />
        )}

        {step === 'success' && (
          <SuccessStep successMessage={successMessage} onClose={handleSuccessClose} />
        )}
      </form>
    </DialogFrame>
  );
}

function Stepper({ labels, activeIndex }: { labels: string[]; activeIndex: number }) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {labels.map((label, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;

        return (
          <div key={label} className='flex items-center gap-2'>
            <div
              className={cn(
                'flex h-7 min-w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                isActive && 'border-primary bg-primary text-primary-foreground',
                isComplete &&
                  'border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-500',
                !isActive &&
                  !isComplete &&
                  'border-neutral-300 bg-white text-neutral-500 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9]'
              )}
            >
              {isComplete ? <CheckCircle2 className='h-4 w-4' /> : index + 1}
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                isActive
                  ? 'text-neutral-900 dark:text-slate-100'
                  : 'text-neutral-500 dark:text-[#9dabb9]'
              )}
            >
              {label}
            </span>
            {index < labels.length - 1 && (
              <div className='hidden h-px w-6 bg-neutral-200 sm:block dark:bg-[#2d3540]' />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SourceStep({
  value,
  onChange,
  disabled,
}: {
  value: SyncSource;
  onChange: (value: SyncSource) => void;
  disabled: boolean;
}) {
  return (
    <div className='grid gap-3 md:grid-cols-2'>
      {sourceOptions.map((option) => {
        const Icon = option.icon;
        const checked = option.value === value;

        return (
          <Button
            variant='ghost'
            key={option.value}
            type='button'
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              'focus:ring-ring block h-auto min-h-36 w-full rounded-lg border p-4 text-left whitespace-normal transition-all focus:ring-2 focus:outline-none',
              checked
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-[#3d4550] dark:hover:bg-[#1e252e]',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <div className='flex h-full flex-col gap-3'>
              <div className='flex items-start justify-between gap-2'>
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md',
                    checked
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-[#1e252e] dark:text-[#9dabb9]'
                  )}
                >
                  <Icon className='h-5 w-5' />
                </div>
                <span
                  className={cn(
                    'mt-1 h-4 w-4 rounded-full border',
                    checked
                      ? 'border-primary bg-primary ring-primary/20 ring-2'
                      : 'border-neutral-300 dark:border-[#3d4550]'
                  )}
                  aria-hidden
                />
              </div>
              <div className='space-y-1'>
                <h3 className='text-sm font-semibold text-neutral-900 dark:text-slate-100'>
                  {option.label}
                </h3>
                <p className='text-xs leading-5 text-neutral-500 dark:text-[#9dabb9]'>
                  {option.description}
                </p>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}

function ConfigureStep({
  selectedSource,
  syncType,
  control,
  errors,
  years,
  isBusy,
  isPendingPreviewGsheet,
  isSyncing,
}: {
  selectedSource: SourceOption;
  syncType: SyncSource;
  control: Control<SyncMetadataFormValues>;
  errors: FieldErrors<SyncMetadataFormValues>;
  years: number[];
  isBusy: boolean;
  isPendingPreviewGsheet: boolean;
  isSyncing: boolean;
}) {
  const Icon = selectedSource.icon;

  return (
    <div className='space-y-5'>
      <div className='rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-[#2d3540] dark:bg-[#1e252e]'>
        <div className='flex items-start gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-[#137fec]/10 dark:text-[#137fec]'>
            <Icon className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-sm font-semibold text-neutral-900 dark:text-slate-100'>
              {selectedSource.label}
            </h3>
            <p className='mt-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>
              {selectedSource.description}
            </p>
          </div>
        </div>
      </div>

      {syncType !== 'presigned-csv' && (
        <Controller
          control={control}
          name='year'
          render={({ field }) => (
            <div className='space-y-2'>
              <label
                htmlFor='sync-metadata-year'
                className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
              >
                Year
              </label>
              <p className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                Select the Google Sheet tab year to sync from.
              </p>
              <Select
                id='sync-metadata-year'
                aria-invalid={!!errors.year}
                aria-describedby={errors.year ? 'sync-metadata-year-error' : undefined}
                {...field}
                disabled={isBusy}
                className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
              >
                <option value='' disabled>
                  Select year
                </option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
              {errors.year && (
                <p id='sync-metadata-year-error' className='text-destructive text-sm font-medium'>
                  {errors.year.message}
                </p>
              )}
            </div>
          )}
        />
      )}

      {syncType === 'gsheet' && (
        <Controller
          control={control}
          name='ranges'
          render={({ field }) => (
            <div className='space-y-2'>
              <label
                htmlFor='sync-metadata-ranges'
                className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
              >
                Ranges
                <span className='ml-1 text-xs font-normal text-neutral-500 dark:text-[#9dabb9]'>
                  optional
                </span>
              </label>
              <p className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                Use{' '}
                <span className='font-mono font-semibold text-blue-600 dark:text-blue-400'>
                  START:END
                </span>
                , a single row number, or comma-separated ranges.
              </p>
              <p className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                Leave blank to preview rows <span className='font-mono font-semibold'>0:10</span> or
                sync the full year directly. Examples:{' '}
                <span className='font-mono font-semibold'>20:30</span> or{' '}
                <span className='font-mono font-semibold'>20:30,40:50,60</span>
              </p>
              <Input
                id='sync-metadata-ranges'
                aria-invalid={!!errors.ranges}
                aria-describedby={errors.ranges ? 'sync-metadata-ranges-error' : undefined}
                {...field}
                disabled={isBusy}
                placeholder='Optional, e.g. 20:30'
                className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
              />
              {errors.ranges && (
                <p id='sync-metadata-ranges-error' className='text-destructive text-sm font-medium'>
                  {errors.ranges.message}
                </p>
              )}
              {isPendingPreviewGsheet && (
                <InlineLoadingText text='Loading Google Sheet records...' />
              )}
            </div>
          )}
        />
      )}

      {syncType === 'presigned-csv' && (
        <>
          <Controller
            control={control}
            name='presignedUrl'
            render={({ field }) => (
              <div className='space-y-2'>
                <label
                  htmlFor='sync-metadata-presigned-url'
                  className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
                >
                  CSV Presigned URL
                </label>
                <p className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                  Provide a presigned URL for a metadata CSV file.
                </p>
                <Input
                  id='sync-metadata-presigned-url'
                  aria-invalid={!!errors.presignedUrl}
                  aria-describedby={
                    errors.presignedUrl ? 'sync-metadata-presigned-url-error' : undefined
                  }
                  {...field}
                  disabled={isBusy}
                  placeholder='https://...'
                  className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
                />
                {errors.presignedUrl && (
                  <p
                    id='sync-metadata-presigned-url-error'
                    className='text-destructive text-sm font-medium'
                  >
                    {errors.presignedUrl.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            control={control}
            name='reason'
            render={({ field }) => (
              <div className='space-y-2'>
                <label
                  htmlFor='sync-metadata-reason'
                  className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
                >
                  Reason
                </label>
                <p className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                  Optional reason or comment for the sync.
                </p>
                <Input
                  id='sync-metadata-reason'
                  aria-invalid={!!errors.reason}
                  aria-describedby={errors.reason ? 'sync-metadata-reason-error' : undefined}
                  {...field}
                  disabled={isBusy}
                  placeholder='Enter reason (optional)'
                  className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
                />
                {errors.reason && (
                  <p
                    id='sync-metadata-reason-error'
                    className='text-destructive text-sm font-medium'
                  >
                    {errors.reason.message}
                  </p>
                )}
              </div>
            )}
          />
        </>
      )}

      {syncType === 'presigned-csv' && isSyncing && <InlineLoadingText text='Triggering sync...' />}
    </div>
  );
}

function ReviewStep({
  previewData,
  isSyncing,
  isPendingPreviewGsheet,
}: {
  previewData?: { columns: string[]; values: string[][] };
  isSyncing: boolean;
  isPendingPreviewGsheet: boolean;
}) {
  if (isPendingPreviewGsheet || !previewData) {
    return (
      <div className='flex min-h-80 items-center justify-center p-6'>
        <InlineLoadingText text='Loading metadata records...' />
      </div>
    );
  }

  if (!previewData.columns.length || !previewData.values.length) {
    return (
      <div>
        <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'>
          No data found for the specified ranges.
        </div>
      </div>
    );
  }

  return (
    <div>
      {isSyncing && (
        <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-[#137fec]/30 dark:bg-[#137fec]/10 dark:text-blue-200'>
          <InlineLoadingText text='Syncing records to metadata...' />
        </div>
      )}
      <div className='max-h-[60vh] overflow-auto rounded-lg border border-neutral-200 dark:border-[#2d3540]'>
        <table className='min-w-full divide-y divide-neutral-200 dark:divide-[#2d3540]'>
          <thead className='sticky top-0 z-10 bg-neutral-50 dark:bg-[#1e252e]'>
            <tr>
              {previewData.columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  scope='col'
                  className='px-4 py-3 text-left text-xs font-semibold tracking-wide text-neutral-700 uppercase dark:text-slate-200'
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-neutral-200 bg-white dark:divide-[#2d3540] dark:bg-[#111418]'>
            {previewData.values.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className='transition-colors hover:bg-neutral-50 dark:hover:bg-[#1e252e]'
              >
                {previewData.columns.map((column, cellIndex) => (
                  <td
                    key={`${column}-${rowIndex}-${cellIndex}`}
                    className='px-4 py-3 text-sm whitespace-nowrap text-neutral-800 dark:text-slate-100'
                  >
                    {row[cellIndex] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuccessStep({
  successMessage,
  onClose,
}: {
  successMessage: string | null;
  onClose: () => void;
}) {
  return (
    <div className='relative rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300' />
          <div className='min-w-0 space-y-2'>
            <div className='wrap-break-words text-sm leading-6'>
              {successMessage ?? 'Metadata sync triggered successfully.'}
            </div>
            <p className='text-xs text-emerald-700 italic dark:text-emerald-300'>
              *sync may take up to 15 minutes
            </p>
          </div>
        </div>
        <Button
          variant='ghost'
          type='button'
          onClick={onClose}
          className='rounded-md p-1 text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-emerald-300 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-100'
          aria-label='Close success message'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

function InlineLoadingText({ text }: { text: string }) {
  return (
    <div className='flex items-center gap-2 text-sm text-neutral-500 dark:text-[#9dabb9]'>
      <Loader2 className='h-4 w-4 animate-spin' />
      <span>{text}</span>
    </div>
  );
}

function SyncModalFooter({
  step,
  configuration,
  hasPreviewData,
  isBusy,
  isPendingPreviewGsheet,
  isSyncing,
  onCancel,
  onContinue,
  onBack,
  previewGsheetRange,
  onDirectGsheetSync,
  onConfirmRangeGsheetSync,
  onPresignedCsvSync,
}: {
  step: SyncStep;
  configuration: SyncMetadataFormValues;
  hasPreviewData: boolean;
  isBusy: boolean;
  isPendingPreviewGsheet: boolean;
  isSyncing: boolean;
  onCancel: () => void;
  onContinue: () => void;
  onBack: () => void;
  previewGsheetRange: () => void;
  onDirectGsheetSync: () => void;
  onConfirmRangeGsheetSync: () => void;
  onPresignedCsvSync: () => void;
}) {
  const syncType = configuration.syncType;
  const gsheetHasRanges = syncType === 'gsheet' && hasGsheetRanges(configuration.ranges);
  const canPreviewGsheet = canPreviewGsheetConfiguration(configuration);
  const canSyncGsheetDirectlyFromConfig = canSyncGsheetDirectly(configuration);
  const canSyncPresignedCsv = canSyncPresignedCsvConfiguration(configuration);

  if (step === 'success') {
    return (
      <Button variant='ghost' type='button' onClick={onCancel} className={secondaryButtonClassName}>
        Close
      </Button>
    );
  }

  if (step === 'source') {
    return (
      <>
        <Button
          variant='ghost'
          type='button'
          onClick={onCancel}
          disabled={isBusy}
          className={secondaryButtonClassName}
        >
          Cancel
        </Button>
        <Button
          variant='ghost'
          type='button'
          onClick={onContinue}
          disabled={isBusy}
          className={primaryButtonClassName}
        >
          Continue
        </Button>
      </>
    );
  }

  if (step === 'review') {
    return (
      <>
        <Button
          variant='ghost'
          type='button'
          onClick={onCancel}
          disabled={isBusy}
          className={secondaryButtonClassName}
        >
          Cancel
        </Button>
        <Button
          variant='ghost'
          type='button'
          onClick={onBack}
          disabled={isBusy}
          className={secondaryButtonClassName}
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <Button
          variant='ghost'
          type='button'
          onClick={onConfirmRangeGsheetSync}
          disabled={isSyncing || !hasPreviewData}
          className={successButtonClassName}
        >
          {isSyncing ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <RefreshCw className='h-4 w-4' />
          )}
          {isSyncing ? 'Syncing...' : 'Confirm & Sync'}
        </Button>
      </>
    );
  }

  if (syncType === 'gsheet') {
    return (
      <>
        <Button
          variant='ghost'
          type='button'
          onClick={onBack}
          disabled={isBusy}
          className={secondaryButtonClassName}
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <Button
          variant='ghost'
          type='button'
          onClick={previewGsheetRange}
          disabled={isBusy || !canPreviewGsheet}
          className={primaryButtonClassName}
        >
          {isPendingPreviewGsheet ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Eye className='h-4 w-4' />
          )}
          {isPendingPreviewGsheet
            ? 'Previewing...'
            : gsheetHasRanges
              ? 'Preview Records'
              : 'Preview First 10 Rows'}
        </Button>
        {!gsheetHasRanges && (
          <Button
            variant='ghost'
            type='button'
            onClick={onDirectGsheetSync}
            disabled={isBusy || !canSyncGsheetDirectlyFromConfig}
            className={successButtonClassName}
          >
            {isSyncing ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <RefreshCw className='h-4 w-4' />
            )}
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant='ghost'
        type='button'
        onClick={onBack}
        disabled={isBusy}
        className={secondaryButtonClassName}
      >
        <ArrowLeft className='h-4 w-4' />
        Back
      </Button>
      <Button
        variant='ghost'
        type='button'
        onClick={onPresignedCsvSync}
        disabled={isBusy || !canSyncPresignedCsv}
        className={successButtonClassName}
      >
        {isSyncing ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <RefreshCw className='h-4 w-4' />
        )}
        {isSyncing ? 'Syncing...' : 'Sync'}
      </Button>
    </>
  );
}

const secondaryButtonClassName = cn(
  'inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors',
  'hover:bg-neutral-50 focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  'dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
);

const primaryButtonClassName = cn(
  'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors',
  'hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
);

const successButtonClassName = cn(
  'inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors',
  'hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  'dark:bg-emerald-500 dark:hover:bg-emerald-600'
);
