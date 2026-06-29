import type { ProjectDetailType } from '../../shared/api/lab.api';
import { toDisplayValue } from '../../shared/utils';

export interface ProjectContactRow {
  contactId: string;
  name: string;
}

export function createProjectContactRows(project: ProjectDetailType): ProjectContactRow[] {
  return project.contactSet.map((contact) => ({
    contactId: toDisplayValue(contact.contactId),
    name: toDisplayValue(contact.name),
  }));
}
