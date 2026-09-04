import { z } from 'zod';
import type { PatchedCaseDetailRequestModel } from '../api/cases.api';

export const editCaseSchema = z.object({
  dueDate: z.string(),
  links: z.array(
    z.object({
      key: z.string().trim().min(1, 'Link name is required'),
      value: z.url('Enter a valid URL'),
    })
  ),
  description: z.string(),
});

export type EditCaseFormValues = z.infer<typeof editCaseSchema>;

export function buildCaseUpdateRequest(values: EditCaseFormValues): PatchedCaseDetailRequestModel {
  return {
    dueDate: values.dueDate || null,
    links: Object.fromEntries(
      values.links.map(({ key, value }) => [key.trim(), value.trim()] as const)
    ),
    description: values.description.trim() || null,
  };
}
