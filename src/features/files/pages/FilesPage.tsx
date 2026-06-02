import { useMemo } from 'react';
import { useAppShellHeader } from '@/context/app-shell-context';
import { FilesInfoDrawer, FilesSearchPanel, FilesTable } from '../components';
import { FileText } from 'lucide-react';
import { useFilesPageQueryParams } from '../hooks/useFilesPageQueryParams';

export function FilesPage() {
  const { isInfoDrawerOpen, openInfoDrawer, closeInfoDrawer } = useFilesPageQueryParams();

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title: 'Files',
      icon: <FileText className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer]
  );

  useAppShellHeader(headerConfig);

  return (
    <>
      <div className='p-6'>
        <FilesSearchPanel />

        <FilesTable />
      </div>

      <FilesInfoDrawer isOpen={isInfoDrawerOpen} onClose={closeInfoDrawer} />
    </>
  );
}
