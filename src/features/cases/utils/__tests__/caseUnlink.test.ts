import { describe, expect, it, vi } from 'vitest';
import {
  buildCaseUnlinkRequest,
  submitCaseUnlink,
  type CaseUnlinkMutation,
  type CaseUnlinkTarget,
} from '../caseUnlink';

const target: CaseUnlinkTarget = { type: 'library', orcabusId: 'lib.01TEST', label: 'L2400001' };

describe('buildCaseUnlinkRequest', () => {
  it.each([
    { type: 'library', orcabusId: 'lib.01TEST', label: 'L2400001' },
    { type: 'workflow run', orcabusId: 'wfr.01TEST', label: 'Alignment run' },
  ] satisfies CaseUnlinkTarget[])('builds the unlink path for a $type', (target) => {
    expect(buildCaseUnlinkRequest('cas.01TEST', target)).toEqual({
      params: { path: { orcabusId: 'cas.01TEST', externalEntityOrcabusId: target.orcabusId } },
    });
  });

  it('does not mutate without both case and target context', () => {
    const mutate = vi.fn<CaseUnlinkMutation>();
    expect(
      submitCaseUnlink({
        caseOrcabusId: undefined,
        target,
        mutate,
        onSuccess: vi.fn(),
        onError: vi.fn(),
      })
    ).toBe(false);
    expect(
      submitCaseUnlink({
        caseOrcabusId: 'cas.01TEST',
        target: null,
        mutate,
        onSuccess: vi.fn(),
        onError: vi.fn(),
      })
    ).toBe(false);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('keeps success and error effects behind mutation callbacks', () => {
    const mutate = vi.fn<CaseUnlinkMutation>();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    expect(
      submitCaseUnlink({ caseOrcabusId: 'cas.01TEST', target, mutate, onSuccess, onError })
    ).toBe(true);
    const callbacks = mutate.mock.calls[0][1];
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    callbacks.onError();
    expect(onError).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
    callbacks.onSuccess();
    expect(onSuccess).toHaveBeenCalledWith(target);
  });

  it('allows retry after an error callback', () => {
    const mutate = vi.fn<CaseUnlinkMutation>();
    const options = {
      caseOrcabusId: 'cas.01TEST',
      target,
      mutate,
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };
    submitCaseUnlink(options);
    mutate.mock.calls[0][1].onError();
    submitCaseUnlink(options);
    expect(mutate).toHaveBeenCalledTimes(2);
  });
});
