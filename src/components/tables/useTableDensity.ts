import { useLocalStorage } from '../../hooks/useLocalStorage';
import { TABLE_DENSITY_STORAGE_KEY } from '@/utils/storage-keys';

export type TableDensity = 'comfortable' | 'compact';

/**
 * Shared, persisted density preference for every DataTable/ExpandableTable
 * instance in the app. Density is a personal "I like dense tables"
 * preference, not something that varies meaningfully per table the way
 * column visibility does — so unlike column-visibility persistence, this
 * isn't opt-in per table, and both table primitives read/write the same
 * localStorage key.
 */
export function useTableDensity(): [TableDensity, (next: TableDensity) => void] {
  const [density, setDensity] = useLocalStorage<TableDensity>(TABLE_DENSITY_STORAGE_KEY, 'compact');
  return [density, setDensity];
}
