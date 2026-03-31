import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export function SSCheckerBreadcrumb() {
  return (
    <div className='mb-4'>
      <Link
        to='/tools'
        className='inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to Tools
      </Link>
    </div>
  );
}
