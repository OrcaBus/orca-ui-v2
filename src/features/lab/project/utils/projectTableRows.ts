import type { ProjectDetailType } from '../../shared/api/lab.api';

const EMPTY_TABLE_VALUE = '-';

export interface ProjectContactRow {
  contactId: string;
  name: string;
}

function toDisplayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_TABLE_VALUE;

  const displayValue = String(value).trim();
  return displayValue || EMPTY_TABLE_VALUE;
}

export function createProjectContactRows(project: ProjectDetailType): ProjectContactRow[] {
  return project.contactSet.map((contact) => ({
    contactId: toDisplayValue(contact.contactId),
    name: toDisplayValue(contact.name),
  }));
}

export function joinProjectTableValues(values: string[]): string {
  return values.filter((value) => value !== EMPTY_TABLE_VALUE).join(', ');
}
