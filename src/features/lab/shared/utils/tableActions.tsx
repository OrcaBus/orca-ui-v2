import { Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  type DataTableActionContext,
  type DataTableToolbarAction,
} from '@/components/tables/DataTable';
import { downloadTableAsCsv } from '@/utils/csv';

/**
 * Shared "Download to CSV" toolbar action for lab tables. Exports the active
 * selection when a partial selection exists, otherwise the full dataset, and
 * surfaces the outcome via a toast.
 *
 * @param filename - CSV filename prefix (e.g. `'individuals'`, `'subjects'`).
 */
export function createCsvDownloadAction<T>(filename: string): DataTableToolbarAction<T> {
  return {
    id: 'download-csv',
    label: 'Download to CSV',
    icon: <Download className='h-4 w-4' />,
    onClick: (ctx: DataTableActionContext<T>) => {
      const hasPartialSelection =
        ctx.selectedRows.length > 0 && ctx.selectedRows.length < ctx.data.length;
      const rows = hasPartialSelection ? ctx.selectedRows : ctx.data;

      if (rows.length === 0) {
        toast.warning('No data to export');
        return;
      }

      downloadTableAsCsv(rows, ctx.visibleColumns, filename);
      toast.success(
        hasPartialSelection
          ? `Exported ${rows.length} selected row(s) to CSV`
          : `Exported all ${rows.length} row(s) to CSV`
      );
    },
  };
}
