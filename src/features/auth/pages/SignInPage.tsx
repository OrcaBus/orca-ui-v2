import { Navigate } from 'react-router';
import { Database, Loader2, UserIcon } from 'lucide-react';
import { useAuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

function Copyright() {
  return (
    <p className='text-xs text-slate-400 dark:text-slate-500'>
      &copy; {new Date().getFullYear()}{' '}
      <a
        href='https://umccr.org'
        className='underline decoration-slate-400/40 underline-offset-2 transition-colors hover:text-slate-300 dark:hover:text-slate-400'
        target='_blank'
        rel='noreferrer'
      >
        UMCCR
      </a>
      {' \u00B7 '}University of Melbourne Centre for Cancer Research
    </p>
  );
}

export function SignInPage() {
  const { isAuthenticated, isLoading, signInWithGoogle } = useAuthContext();

  if (isAuthenticated) {
    return <Navigate replace to='/' />;
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950'>
      {/* Background layers */}
      <div
        className='absolute inset-0'
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 80% 60% at 20% 100%, rgba(15, 80, 160, 0.35), transparent)',
            'radial-gradient(ellipse 60% 50% at 80% 0%, rgba(6, 40, 100, 0.4), transparent)',
            'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(30, 60, 120, 0.15), transparent)',
          ].join(', '),
        }}
      />
      <div
        className='absolute inset-0 opacity-[0.03]'
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30h60M30 0v60' stroke='%23fff' stroke-width='.5' fill='none'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Content */}
      <div className='relative z-10 mx-auto w-full max-w-md px-6'>
        {/* Logo + branding */}
        <div className='mb-8 flex flex-col items-center gap-4'>
          <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30'>
            <Database className='h-7 w-7 text-white' />
          </div>
          <div className='text-center'>
            <h1 className='text-2xl font-bold tracking-tight text-white'>Orcabus</h1>
            <p className='mt-1 text-xs font-medium tracking-widest text-slate-400 uppercase'>
              UMCCR LIMS Portal
            </p>
          </div>
        </div>

        {/* Sign-in card */}
        <Card className='border-slate-800/60 bg-slate-900/70 shadow-2xl shadow-black/40 backdrop-blur-xl'>
          <CardContent className='space-y-6 p-8'>
            <div className='space-y-2 text-center'>
              <h2 className='text-lg font-semibold text-white'>Welcome back</h2>
              <p className='text-sm leading-relaxed text-slate-400'>
                Sign in with your institutional UMCCR account to access the LIMS portal.
              </p>
            </div>

            <Button
              onClick={() => {
                void signInWithGoogle();
              }}
              disabled={isLoading}
              size='lg'
              className='w-full gap-3 border border-slate-700 bg-white/7 py-5 text-sm font-medium text-white shadow-sm transition-all hover:bg-white/12 focus-visible:ring-blue-500/40 disabled:opacity-60'
            >
              {isLoading ? (
                <Loader2 className='h-5 w-5 animate-spin' />
              ) : (
                <UserIcon className='h-5 w-5' />
              )}
              {isLoading ? 'Redirecting…' : 'Sign in with UMCCR account'}
            </Button>

            <div className='flex items-center gap-3'>
              <div className='h-px flex-1 bg-slate-800' />
              <span className='text-[11px] font-medium tracking-wider text-slate-600 uppercase'>
                Secure UMCCR SSO
              </span>
              <div className='h-px flex-1 bg-slate-800' />
            </div>

            <p className='text-center text-xs leading-relaxed text-slate-500'>
              Access is restricted to authorised UMCCR personnel. By signing in you agree to the
              organisation&apos;s data governance policies.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='mt-8 flex flex-col items-center gap-3'>
          <img
            src='/assets/logo/uomlogo.png'
            alt='University of Melbourne'
            className='h-8 opacity-60 brightness-200 grayscale transition-opacity hover:opacity-80'
          />
          <Copyright />
        </div>
      </div>
    </div>
  );
}
