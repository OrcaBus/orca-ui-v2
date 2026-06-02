import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './router';
import { Toaster } from '@/components/ui/Sonner';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { ThemeProvider } from '@/context/ThemeProvider';
import { AuthProvider } from '@/context/AmplifyAuthProvider';
import { ReactQueryClientProvider } from '@/context/QueryClientProvider';
import { EnvironmentProvider } from '@/context/EnvironmentProvider';
import { NotificationProvider } from '@/context/NotificationProvider';
import { SkeletonTheme } from 'react-loading-skeleton';
import { AppShellProvider } from '@/context/AppShellProvider';

export default function App() {
  return (
    <ThemeProvider>
      <SkeletonTheme baseColor='var(--skeleton-base)' highlightColor='var(--skeleton-highlight)'>
        <AuthProvider>
          <ReactQueryClientProvider>
            <EnvironmentProvider>
              <NotificationProvider>
                <AppShellProvider>
                  <Suspense
                    fallback={<SpinnerWithText className='min-h-screen' text='Loading page…' />}
                  >
                    <RouterProvider router={router} />
                  </Suspense>
                </AppShellProvider>
              </NotificationProvider>
            </EnvironmentProvider>
          </ReactQueryClientProvider>
        </AuthProvider>
        <Toaster position='top-right' richColors />
      </SkeletonTheme>
    </ThemeProvider>
  );
}
