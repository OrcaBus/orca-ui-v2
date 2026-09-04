export type CaseUnlinkEntityType = 'library' | 'sample' | 'workflow run' | 'sequence run';

export interface CaseUnlinkTarget {
  type: CaseUnlinkEntityType;
  orcabusId: string;
  label: string;
}

export function buildCaseUnlinkRequest(caseOrcabusId: string, target: CaseUnlinkTarget) {
  return {
    params: { path: { orcabusId: caseOrcabusId, externalEntityOrcabusId: target.orcabusId } },
  } as const;
}

type CaseUnlinkRequest = ReturnType<typeof buildCaseUnlinkRequest>;

interface CaseUnlinkMutationCallbacks {
  onSuccess: () => void;
  onError: () => void;
}

export type CaseUnlinkMutation = (
  request: CaseUnlinkRequest,
  callbacks: CaseUnlinkMutationCallbacks
) => void;

interface SubmitCaseUnlinkOptions {
  caseOrcabusId: string | undefined;
  target: CaseUnlinkTarget | null;
  mutate: CaseUnlinkMutation;
  onSuccess: (target: CaseUnlinkTarget) => void;
  onError: () => void;
}

export function submitCaseUnlink({
  caseOrcabusId,
  target,
  mutate,
  onSuccess,
  onError,
}: SubmitCaseUnlinkOptions): boolean {
  if (!caseOrcabusId || !target) return false;

  mutate(buildCaseUnlinkRequest(caseOrcabusId, target), {
    onSuccess: () => onSuccess(target),
    onError,
  });
  return true;
}
