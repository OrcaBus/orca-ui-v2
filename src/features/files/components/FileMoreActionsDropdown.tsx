import { useCallback, useEffect, useRef, useState } from 'react';
import { AlignJustify, Check, Copy, ExternalLink, Info, Link } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/Spinner';
import { isFileDownloadable } from '@/utils/files';
import { type S3Record, useFilePresignedURLModel } from '../api/files.api';

interface Props {
  s3Record: S3Record;
  onViewDetails: () => void;
}

function MenuItem({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
    >
      <span className='shrink-0 text-neutral-400 dark:text-neutral-500'>{icon}</span>
      {label}
    </button>
  );
}

export function FileMoreActionsDropdown({ s3Record, onViewDetails }: Props) {
  const { s3ObjectId, key: s3Key, bucket } = s3Record;
  const [isOpen, setIsOpen] = useState(false);
  const [copiedS3Uri, setCopiedS3Uri] = useState(false);
  const [copiedPresign, setCopiedPresign] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDownloadable = isFileDownloadable(s3Key);

  // Close on outside click / Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const {
    data: inlineUrl,
    isLoading: isInlineLoading,
    isFetching: isInlineFetching,
    refetch: refetchInline,
  } = useFilePresignedURLModel({
    params: { path: { id: s3ObjectId }, query: { responseContentDisposition: 'inline' } },
    reactQuery: { enabled: false },
  });

  const {
    data: attachUrl,
    isLoading: isAttachLoading,
    isFetching: isAttachFetching,
    refetch: refetchAttach,
  } = useFilePresignedURLModel({
    params: { path: { id: s3ObjectId }, query: { responseContentDisposition: 'attachment' } },
    reactQuery: { enabled: false },
  });

  const handleOpenInTab = useCallback(async () => {
    setIsOpen(false);
    const url = inlineUrl ?? (await refetchInline()).data;
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Unable to open file in browser tab');
    }
  }, [inlineUrl, refetchInline]);

  const handleCopyPresign = useCallback(async () => {
    const url = attachUrl ?? (await refetchAttach()).data;
    if (!url) {
      toast.error('Unable to generate presigned URL');
      return;
    }
    void navigator.clipboard.writeText(url).then(() => {
      toast.success('Presigned URL copied to clipboard');
      setCopiedPresign(true);
      setTimeout(() => setCopiedPresign(false), 2000);
      setIsOpen(false);
    });
  }, [attachUrl, refetchAttach]);

  const handleCopyS3Uri = useCallback(() => {
    const s3uri = `s3://${bucket}/${s3Key}`;
    void navigator.clipboard.writeText(s3uri).then(() => {
      toast.success('S3 URI copied to clipboard');
      setCopiedS3Uri(true);
      setTimeout(() => setCopiedS3Uri(false), 2000);
      setIsOpen(false);
    });
  }, [bucket, s3Key]);

  const isPendingInline = isInlineLoading || isInlineFetching;
  const isPendingAttach = isAttachLoading || isAttachFetching;

  return (
    <div ref={dropdownRef} className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen((o) => !o)}
        className='rounded p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-[#2d3540]'
        title='More actions'
        aria-haspopup='true'
        aria-expanded={isOpen}
      >
        <AlignJustify className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
      </button>

      {isOpen && (
        <div className='absolute top-full right-0 z-50 mt-1 min-w-52 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-[#2d3540] dark:bg-[#1e252e]'>
          {isDownloadable && (
            <MenuItem
              icon={
                isPendingInline ? (
                  <Spinner className='h-4 w-4' />
                ) : (
                  <ExternalLink className='h-4 w-4' />
                )
              }
              label='Open in browser tab'
              onClick={() => void handleOpenInTab()}
              disabled={isPendingInline}
            />
          )}
          {isDownloadable && (
            <MenuItem
              icon={
                isPendingAttach ? (
                  <Spinner className='h-4 w-4' />
                ) : copiedPresign ? (
                  <Check className='h-4 w-4 text-green-600' />
                ) : (
                  <Link className='h-4 w-4' />
                )
              }
              label='Generate download link'
              onClick={() => void handleCopyPresign()}
              disabled={isPendingAttach}
            />
          )}
          <MenuItem
            icon={
              copiedS3Uri ? (
                <Check className='h-4 w-4 text-green-600' />
              ) : (
                <Copy className='h-4 w-4' />
              )
            }
            label='Copy S3 URI'
            onClick={handleCopyS3Uri}
          />
          <MenuItem
            icon={<Info className='h-4 w-4' />}
            label='View record details'
            onClick={() => {
              setIsOpen(false);
              onViewDetails();
            }}
          />
        </div>
      )}
    </div>
  );
}
