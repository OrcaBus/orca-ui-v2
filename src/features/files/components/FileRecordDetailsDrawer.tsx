import { useCallback, useState } from 'react';
import { Check, Copy, Download, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { getFileTypeBadgeStyle, formatBytes, getFilename, getFileExtension } from '@/utils/files';
import { formatTableDate } from '@/utils/timeFormat';
import { Spinner } from '@/components/ui/Spinner';
import { type S3Record, useFilePresignedURLModel } from '../api/files.api';
import { FilePathSegments } from './FilePathSegments';

export interface FileRecordDetailsDrawerProps {
  file: S3Record;
  onClose: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className='mb-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500'>
      {children}
    </h3>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-4 border-b border-neutral-100 py-2 last:border-0 dark:border-neutral-800'>
      <span className='mt-0.5 shrink-0 text-xs text-neutral-500 dark:text-neutral-400'>
        {label}
      </span>
      <span className='text-right text-xs font-medium break-all text-neutral-900 dark:text-neutral-100'>
        {children}
      </span>
    </div>
  );
}

function BoolBadge({ value }: { value: boolean }) {
  return value ? (
    <span className='inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'>
      Yes
    </span>
  ) : (
    <span className='inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'>
      No
    </span>
  );
}

export function FileRecordDetailsDrawer({ file, onClose }: FileRecordDetailsDrawerProps) {
  const [copiedS3UriId, setCopiedS3UriId] = useState<string | null>(null);
  const [copiedPresignId, setCopiedPresignId] = useState<string | null>(null);

  const ext = getFileExtension(file.key);
  const filename = getFilename(file.key);
  const dir = file.key.includes('/') ? file.key.substring(0, file.key.lastIndexOf('/') + 1) : '';
  const attributes =
    file.attributes != null &&
    typeof file.attributes === 'object' &&
    !Array.isArray(file.attributes)
      ? (file.attributes as Record<string, unknown>)
      : null;

  const handleCopyS3Uri = useCallback(() => {
    const s3uri = `s3://${file.bucket}/${file.key}`;
    void navigator.clipboard.writeText(s3uri).then(() => {
      toast.success('S3 URI copied to clipboard');
      setCopiedS3UriId(file.s3ObjectId);
      setTimeout(() => setCopiedS3UriId(null), 2000);
    });
  }, [file]);

  const {
    data: url,
    isLoading,
    refetch,
  } = useFilePresignedURLModel({
    params: { path: { id: file.s3ObjectId }, query: { responseContentDisposition: 'attachment' } },
    reactQuery: { enabled: false },
  });

  const handleDownload = useCallback(async () => {
    if (url) {
      window.open(url, '_blank');
      return;
    }
    const result = await refetch();
    if (result.data) {
      window.open(result.data, '_blank');
    } else if (result.error) {
      toast.error('Unable to generate download link', {
        description: result.error instanceof Error ? result.error.message : undefined,
      });
    }
  }, [url, refetch]);

  const handleCopyPresignUrl = useCallback(async () => {
    const target = url ?? (await refetch()).data;
    if (!target) {
      toast.error('Unable to generate presigned URL');
      return;
    }
    void navigator.clipboard.writeText(target).then(() => {
      toast.success('Presigned URL copied to clipboard');
      setCopiedPresignId(file.s3ObjectId);
      setTimeout(() => setCopiedPresignId(null), 2000);
    });
  }, [url, refetch, file.s3ObjectId]);

  return (
    <DrawerFrame
      isOpen={true}
      onClose={onClose}
      title={filename}
      subtitle={<span className='font-mono text-xs'>{file.s3ObjectId}</span>}
      size='md'
      closeLabel='Close file details'
    >
      <div className='space-y-6'>
        {/* File Info */}
        <div>
          <SectionTitle>File Info</SectionTitle>
          <InfoRow label='Name'>
            <span className='font-mono'>{filename}</span>
          </InfoRow>
          <InfoRow label='Type'>
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${getFileTypeBadgeStyle(ext)}`}
            >
              {ext}
            </span>
          </InfoRow>
          <InfoRow label='Size'>{file.size != null ? formatBytes(file.size) : '—'}</InfoRow>
          <InfoRow label='S3 Object ID'>
            <span className='font-mono text-[11px]'>{file.s3ObjectId}</span>
          </InfoRow>
        </div>

        {/* S3 Location */}
        <div>
          <SectionTitle>S3 Location</SectionTitle>
          <div className='mb-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50'>
            <div className='mb-1.5 flex items-center justify-between'>
              <span className='text-[10px] font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500'>
                S3 Path
              </span>
              <button
                type='button'
                onClick={handleCopyS3Uri}
                className='flex items-center gap-1 text-[11px] text-blue-600 hover:underline dark:text-blue-400'
              >
                {copiedS3UriId === file.s3ObjectId ? (
                  <>
                    <Check className='h-3 w-3' />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className='h-3 w-3' />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className='font-mono text-[11px] break-all text-neutral-800 dark:text-neutral-200'>
              s3://{file.bucket}/{file.key}
            </p>
          </div>
          <InfoRow label='Bucket'>
            <span className='font-mono'>{file.bucket}</span>
          </InfoRow>
          {dir && (
            <InfoRow label='Directory'>
              <FilePathSegments path={dir} />
            </InfoRow>
          )}
          <InfoRow label='Version ID'>
            <span className='font-mono text-[11px]'>{file.versionId}</span>
          </InfoRow>
        </div>

        {/* Storage Details */}
        {(file.storageClass || file.archiveStatus || file.eTag || file.sha256) && (
          <div>
            <SectionTitle>Storage Details</SectionTitle>
            {file.storageClass && <InfoRow label='Storage Class'>{file.storageClass}</InfoRow>}
            {file.archiveStatus && <InfoRow label='Archive Status'>{file.archiveStatus}</InfoRow>}
            {file.eTag && (
              <InfoRow label='ETag'>
                <span className='font-mono text-[11px]'>{file.eTag}</span>
              </InfoRow>
            )}
            {file.sha256 && (
              <InfoRow label='SHA-256'>
                <span className='font-mono text-[11px]'>{file.sha256}</span>
              </InfoRow>
            )}
          </div>
        )}

        {/* Event Information */}
        <div>
          <SectionTitle>Event Information</SectionTitle>
          <InfoRow label='Event Type'>{file.eventType}</InfoRow>
          <InfoRow label='Reason'>{file.reason}</InfoRow>
          {file.eventTime && (
            <InfoRow label='Event Time'>{formatTableDate(file.eventTime)}</InfoRow>
          )}
          {file.lastModifiedDate && (
            <InfoRow label='Last Modified'>{formatTableDate(file.lastModifiedDate)}</InfoRow>
          )}
          {file.ingestId && (
            <InfoRow label='Ingest ID'>
              <span className='font-mono text-[11px]'>{file.ingestId}</span>
            </InfoRow>
          )}
          {file.sequencer && (
            <InfoRow label='Sequencer'>
              <span className='font-mono text-[11px]'>{file.sequencer}</span>
            </InfoRow>
          )}
          <InfoRow label='Duplicate Events'>{file.numberDuplicateEvents}</InfoRow>
          <InfoRow label='Reordered'>{file.numberReordered}</InfoRow>
        </div>

        {/* Status */}
        <div>
          <SectionTitle>Status</SectionTitle>
          <InfoRow label='Current State'>
            <BoolBadge value={file.isCurrentState} />
          </InfoRow>
          <InfoRow label='Accessible'>
            <BoolBadge value={file.isAccessible} />
          </InfoRow>
          <InfoRow label='Delete Marker'>
            <BoolBadge value={file.isDeleteMarker} />
          </InfoRow>
          {file.deletedDate && (
            <InfoRow label='Deleted Date'>{formatTableDate(file.deletedDate)}</InfoRow>
          )}
          {file.deletedSequencer && (
            <InfoRow label='Deleted Sequencer'>
              <span className='font-mono text-[11px]'>{file.deletedSequencer}</span>
            </InfoRow>
          )}
        </div>

        {/* Attributes */}
        {attributes && Object.keys(attributes).length > 0 && (
          <div>
            <SectionTitle>Attributes</SectionTitle>
            {Object.entries(attributes).map(([k, v]) => (
              <InfoRow key={k} label={k}>
                <span className='font-mono text-[11px]'>{String(v)}</span>
              </InfoRow>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className='space-y-2.5 border-t border-neutral-200 pt-6 dark:border-neutral-700'>
          <button
            type='button'
            disabled={isLoading}
            onClick={() => void handleDownload()}
            className='flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? <Spinner className='h-4 w-4' /> : <Download className='h-4 w-4' />}
            Download
          </button>
          <button
            type='button'
            disabled={isLoading}
            onClick={() => void handleCopyPresignUrl()}
            className='flex w-full items-center justify-center gap-2 rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
          >
            {copiedPresignId === file.s3ObjectId ? (
              <>
                <Check className='h-4 w-4 text-green-600' />
                Presigned URL Copied!
              </>
            ) : isLoading ? (
              <>
                <Spinner className='h-4 w-4' />
                Generating link…
              </>
            ) : (
              <>
                <LinkIcon className='h-4 w-4' />
                Copy Presigned Download Link
              </>
            )}
          </button>
        </div>
      </div>
    </DrawerFrame>
  );
}
