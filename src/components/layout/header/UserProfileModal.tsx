import { Mail, ShieldCheck, ShieldAlert, Fingerprint, Globe, User, Users } from 'lucide-react';
import type { FetchUserAttributesOutput } from 'aws-amplify/auth';
import { getUsername } from '@/utils/string';
import { DialogFrame } from '@/components/modals/DialogFrame';

interface Identity {
  dateCreated?: string;
  userId?: string;
  providerName?: string;
  providerType?: string;
  issuer?: string | null;
  primary?: string;
}

interface UserProfileModalProps {
  user: FetchUserAttributesOutput;
  groups?: string[];
  isOpen: boolean;
  onClose: () => void;
}

function parseIdentities(raw: string | undefined): Identity[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Identity[];
  } catch {
    return [];
  }
}

function formatDate(timestamp: string | undefined): string {
  if (!timestamp) return '—';
  const ms = Number(timestamp);
  if (isNaN(ms)) return timestamp;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ms));
}

function IdentityRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className='flex items-baseline justify-between gap-4 px-4 py-2'>
      <p className='text-caption shrink-0 text-slate-400 dark:text-neutral-500'>{label}</p>
      <p
        className={`min-w-0 truncate text-right text-[12px] text-slate-700 dark:text-slate-300 ${mono ? 'font-mono' : ''}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

export function UserProfileModal({ user, groups = [], isOpen, onClose }: UserProfileModalProps) {
  const userName = user.name || getUsername(user.email as string);
  const userEmail = user.email ?? '';
  const isEmailVerified = user.email_verified === 'true';
  const sub = user.sub ?? '';
  const identities = parseIdentities(user.identities);
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title={userName}
      description={userEmail}
      icon={
        <div className='flex h-5 w-5 items-center justify-center'>
          {initials ? (
            <span className='text-xs font-semibold'>{initials}</span>
          ) : (
            <User className='h-4 w-4 text-slate-400 dark:text-[#9dabb9]' />
          )}
        </div>
      }
      size='sm'
    >
      <div className='space-y-4'>
        {/* Info rows */}
        <div className='rounded-lg border border-slate-200 dark:border-[#2d3540]'>
          {/* Email */}
          <div className='flex items-start gap-3 border-b border-slate-100 px-4 py-3 dark:border-[#2d3540]'>
            <Mail className='mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-[#9dabb9]' />
            <div className='min-w-0 flex-1'>
              <p className='text-caption font-medium tracking-wider text-slate-400 uppercase dark:text-neutral-500'>
                Email
              </p>
              <p className='mt-0.5 text-[13px] text-slate-800 dark:text-slate-200'>
                {userEmail || '—'}
              </p>
            </div>
            <span
              className={`text-caption inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                isEmailVerified
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
              }`}
            >
              {isEmailVerified ? (
                <ShieldCheck className='h-3 w-3' />
              ) : (
                <ShieldAlert className='h-3 w-3' />
              )}
              {isEmailVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>

          {/* Subject / User ID */}
          <div className='flex items-start gap-3 px-4 py-3'>
            <Fingerprint className='mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-[#9dabb9]' />
            <div className='min-w-0 flex-1'>
              <p className='text-caption font-medium tracking-wider text-slate-400 uppercase dark:text-neutral-500'>
                User ID
              </p>
              <p className='text-caption mt-0.5 font-mono break-all text-slate-600 dark:text-slate-300'>
                {sub || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Groups */}
        {groups.length > 0 && (
          <div>
            <p className='mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-neutral-500'>
              Groups
            </p>
            <div className='flex items-start gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-[#2d3540]'>
              <Users className='mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-[#9dabb9]' />
              <div className='flex min-w-0 flex-1 flex-wrap gap-1.5'>
                {groups.map((g) => (
                  <span
                    key={g}
                    className='inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-[#2d3540] dark:text-slate-300'
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Identity providers */}
        {identities.length > 0 && (
          <div>
            <p className='text-caption mb-2 font-semibold tracking-wider text-slate-400 uppercase dark:text-neutral-500'>
              Connected Accounts
            </p>
            <div className='space-y-2'>
              {identities.map((id, i) => (
                <div key={i} className='rounded-lg border border-slate-200 dark:border-[#2d3540]'>
                  {/* Provider header */}
                  <div className='flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-[#2d3540]'>
                    <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#2d3540]'>
                      <Globe className='text-muted-foreground h-3.5 w-3.5' />
                    </div>
                    <p className='flex-1 text-[13px] font-medium text-slate-800 dark:text-slate-200'>
                      {id.providerName ?? id.providerType ?? 'Unknown'}
                    </p>
                    {id.primary === 'true' && (
                      <span className='text-caption shrink-0 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600 dark:bg-[#137fec]/10 dark:text-[#137fec]'>
                        Primary
                      </span>
                    )}
                  </div>
                  {/* Provider fields */}
                  <div className='divide-y divide-slate-100 dark:divide-[#2d3540]'>
                    {id.providerType && id.providerType !== id.providerName && (
                      <IdentityRow label='Provider Type' value={id.providerType} />
                    )}
                    {id.userId && <IdentityRow label='User ID' value={id.userId} mono />}
                    {id.issuer && <IdentityRow label='Issuer' value={id.issuer} mono />}
                    {id.dateCreated && (
                      <IdentityRow label='Date Created' value={formatDate(id.dateCreated)} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DialogFrame>
  );
}
