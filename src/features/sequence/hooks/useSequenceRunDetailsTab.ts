import { useMemo, useCallback } from 'react';
import { useQueryParams } from '../../../hooks/useQueryParams';

export enum SequenceRunDetailsTabValues {
  Timeline = 'timeline',
  SampleSheets = 'samplesheets',
  RelatedLibraries = 'related-libraries',
}

export const SEQUENCE_RUN_DETAILS_TAB_VALUES = Object.values(SequenceRunDetailsTabValues);
export type SequenceRunDetailsTabId = SequenceRunDetailsTabValues;

function parseTabParam(value: string | undefined): SequenceRunDetailsTabValues {
  if (value && SEQUENCE_RUN_DETAILS_TAB_VALUES.includes(value as SequenceRunDetailsTabValues)) {
    return value as SequenceRunDetailsTabValues;
  }
  return SequenceRunDetailsTabValues.Timeline;
}

/**
 * Controls the sequence run details page tab via URL query param `tab`.
 * - ?tab=timeline (or no param) → Timeline
 * - ?tab=samplesheets → Sample Sheets
 * - ?tab=libraries → Related Libraries
 */
export function useSequenceRunDetailsTab() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const tabParam = getParam('tab');
  const activeTab = useMemo(() => parseTabParam(tabParam), [tabParam]);
  const setActiveTab = useCallback(
    (id: string) => {
      const tab = parseTabParam(id);
      setParams({ tab: tab === SequenceRunDetailsTabValues.Timeline ? undefined : tab });
    },
    [setParams]
  );
  return { activeTab, setActiveTab };
}
