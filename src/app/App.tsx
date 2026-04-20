import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './router';
import { Toaster } from '@/components/ui/Sonner';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AmplifyAuthContext';
import { ReactQueryClientProvider } from '@/context/QueryClientContext';
import { EnvironmentProvider } from '@/context/EnvironmentContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { SkeletonTheme } from 'react-loading-skeleton';

export default function App() {
  return (
    <ThemeProvider>
      <SkeletonTheme baseColor='var(--skeleton-base)' highlightColor='var(--skeleton-highlight)'>
        <AuthProvider>
          <ReactQueryClientProvider>
            <EnvironmentProvider>
              <NotificationProvider>
                <Suspense
                  fallback={<SpinnerWithText className='min-h-screen' text='Loading page…' />}
                >
                  <RouterProvider router={router} />
                </Suspense>
              </NotificationProvider>
            </EnvironmentProvider>
          </ReactQueryClientProvider>
        </AuthProvider>
        <Toaster position='top-right' richColors />
      </SkeletonTheme>
    </ThemeProvider>
  );
}
