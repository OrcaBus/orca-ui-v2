import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Link, isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { resolveApiErrorDetails, type ApiErrorKind } from '@/api/api-error-details';
import { Button } from '@/components/ui/Button';

interface RouteErrorFallbackPageProps {
  featureName?: string;
}

const routeErrorLabels: Record<ApiErrorKind, string> = {
  network: 'Connection failed',
  forbidden: 'Access denied',
  server: 'Server error',
  unavailable: 'Service unavailable',
  generic: 'Something went wrong',
};

function hasMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

function getRouteErrorDisplayValue(error: unknown): unknown {
  if (!isRouteErrorResponse(error)) return error;

  const data: unknown = error.data;
  const message =
    typeof data === 'string' ? data : hasMessage(data) ? data.message : error.statusText;

  return {
    status: error.status,
    message,
  };
}

export function RouteErrorFallbackPage({ featureName }: RouteErrorFallbackPageProps) {
  const rawError = useRouteError();
  const error = getRouteErrorDisplayValue(rawError);
  const { kind } = resolveApiErrorDetails(error);
  const navigate = useNavigate();
  const pageLabel = featureName ? `${featureName} Page` : 'this page';

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-10'>
      <section className='w-full max-w-2xl'>
        <div className='mb-5 text-center'>
          <p className='text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-[#9dabb9]'>
            Page recovery
          </p>
          <h1 className='mt-2 text-2xl font-semibold text-slate-950 dark:text-white'>
            Unable to load {pageLabel}
          </h1>
          <p className='text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-6'>
            The rest of the portal is still available. You can retry this page later.
          </p>
        </div>

        <ApiErrorState title={routeErrorLabels[kind]} error={error} />

        <div className='mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row'>
          <Button type='button' onClick={handleReload}>
            <RefreshCw className='h-4 w-4' />
            Reload page
          </Button>
          <Button type='button' variant='outline' onClick={() => void navigate(-1)}>
            <ArrowLeft className='h-4 w-4' />
            Go back
          </Button>
          <Button asChild variant='ghost'>
            <Link to='/cases'>
              <Home className='h-4 w-4' />
              Cases
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
