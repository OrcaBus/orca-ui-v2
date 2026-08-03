import { composeDisplayZoneDateTime, formatCalendarDate } from '@/utils/timeFormat';

type CaseStateTimelineTimestamp = {
  timestamp: string;
  timestampPrecision?: 'date';
};

export function getCaseStateTimelineTimestamp(
  eventDate: string | null | undefined,
  eventTime: string | null | undefined,
  createdAt: string
): CaseStateTimelineTimestamp {
  if (!eventDate || formatCalendarDate(eventDate) === eventDate) {
    return { timestamp: createdAt };
  }

  if (!eventTime) {
    return { timestamp: eventDate, timestampPrecision: 'date' };
  }

  const timestamp = composeDisplayZoneDateTime(eventDate, eventTime);
  return timestamp ? { timestamp } : { timestamp: eventDate, timestampPrecision: 'date' };
}
