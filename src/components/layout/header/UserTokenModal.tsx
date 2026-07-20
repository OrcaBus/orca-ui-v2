import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Check, Clipboard, Key, ShieldAlert } from 'lucide-react';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { formatDetailDate } from '@/utils/timeFormat';
import { toast } from 'sonner';

type UserTokenModalProps = { isOpen: boolean; onClose: () => void };

export function UserTokenModal({ isOpen, onClose }: UserTokenModalProps) {
  const [jwtData, setJWTData] = useState({ token: '', expires: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Only fetch the JWT while the modal is open (it stays mounted when closed).
    if (!isOpen) return;
    let cancel = false;
    const fetchToken = async () => {
      setIsLoading(true);
      try {
        const session = await fetchAuthSession({ forceRefresh: true });
        const token = session.tokens?.idToken;
        if (!token) throw new Error('Cannot retrieve JWT token.');
        const exp = token.payload.exp;
        if (!exp) throw new Error('Cannot read token expiration.');

        if (cancel) return;
        setJWTData({
          token: token.toString(),
          expires: formatDetailDate(new Date(Number(exp) * 1000).toISOString()),
        });
      } catch (error) {
        toast.error('Failed to fetch JWT token: ' + String(error));
      } finally {
        if (!cancel) setIsLoading(false);
      }
    };

    void fetchToken();
    return () => {
      cancel = true;
    };
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jwtData.token);
      setCopied(true);
      toast.success('JWT copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy JWT: ' + String(error));
    }
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title='JSON Web Token (JWT)'
      icon={<Key className='h-4 w-4' />}
      size='lg'
      footer={
        <Button onClick={() => void handleCopy()} disabled={isLoading || !jwtData.token}>
          {copied ? <Check className='h-4 w-4' /> : <Clipboard className='h-4 w-4' />}
          {copied ? 'Copied!' : 'Copy Token to Clipboard'}
        </Button>
      }
    >
      {isLoading ? (
        <div className='flex h-40 items-center justify-center'>
          <SpinnerWithText text='Fetching fresh JWT…' />
        </div>
      ) : (
        <div className='space-y-5'>
          {/* Security notice */}
          <div className='flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-50/50 p-4 dark:border-yellow-400/20 dark:bg-yellow-900/20'>
            <ShieldAlert className='mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400' />
            <div className='text-sm text-yellow-700 dark:text-yellow-300'>
              <p className='font-medium'>Security Notice</p>
              <p className='mt-1'>
                This is your personal access token (PAT). Do not share it with any third party.
              </p>
            </div>
          </div>

          {/* Expiry */}
          <div className='space-y-1.5'>
            <p className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>Expires</p>
            <div className='rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200'>
              {jwtData.expires}
            </div>
          </div>

          {/* Token */}
          <div className='space-y-1.5'>
            <p className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>Token</p>
            <div className='relative rounded-md border border-neutral-200 bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e]'>
              <div className='max-h-28 overflow-y-auto px-3 py-2 pr-10'>
                <code className='font-mono text-xs break-all text-neutral-900 dark:text-slate-200'>
                  {jwtData.token}
                </code>
              </div>
              <button
                type='button'
                onClick={() => void handleCopy()}
                className='absolute top-2 right-2 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-[#2d3540] dark:hover:text-slate-200'
                aria-label='Copy token'
              >
                {copied ? (
                  <Check className='h-4 w-4 text-green-500' />
                ) : (
                  <Clipboard className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogFrame>
  );
}
