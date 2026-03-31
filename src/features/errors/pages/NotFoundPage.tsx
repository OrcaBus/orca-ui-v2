import { Link } from 'react-router';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#101922]'>
      <div className='mx-auto max-w-md px-6 text-center'>
        <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#1e252e]'>
          <FileQuestion className='h-8 w-8 text-slate-400 dark:text-[#9dabb9]' />
        </div>

        <p className='text-sm font-semibold tracking-widest text-blue-600 uppercase dark:text-[#137fec]'>
          404
        </p>
        <h1 className='mt-2 text-2xl font-bold text-slate-900 dark:text-white'>Page not found</h1>
        <p className='mt-3 text-sm leading-relaxed text-slate-500 dark:text-[#9dabb9]'>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className='mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
          <Button asChild>
            <Link to='/'>
              <ArrowLeft className='h-4 w-4' />
              Back to home
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link to='/auth/signin'>Go to sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
