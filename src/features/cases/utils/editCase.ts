import { z } from 'zod';
import type { PatchedCaseDetailRequestModel } from '../api/cases.api';

export const editCaseSchema = z.object({
  studyType: z.enum(['clinical', 'research']),
  isReportRequired: z.boolean(),
  isNataAccredited: z.boolean(),
  dueDate: z.string(),
  alias: z.array(z.object({ value: z.string() })),
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
    studyType: values.studyType,
    isReportRequired: values.isReportRequired,
    isNataAccredited: values.isNataAccredited,
    dueDate: values.dueDate || null,
    alias: values.alias.map(({ value }) => value.trim()).filter(Boolean),
    links: Object.fromEntries(
      values.links.map(({ key, value }) => [key.trim(), value.trim()] as const)
    ),
    description: values.description.trim() || null,
  };
}
