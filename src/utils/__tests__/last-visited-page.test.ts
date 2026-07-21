import { describe, expect, it } from 'vitest';
import { isRestorablePath } from '../last-visited-page';

describe('isRestorablePath', () => {
  it('accepts in-app router-relative paths (incl. query and hash)', () => {
    expect(isRestorablePath('/')).toBe(true);
    expect(isRestorablePath('/files')).toBe(true);
    expect(isRestorablePath('/files?bucket=test&page=2')).toBe(true);
    expect(isRestorablePath('/runs/workflow-runs/WF008#tab')).toBe(true);
  });

  it('rejects empty / null / undefined', () => {
    expect(isRestorablePath(null)).toBe(false);
    expect(isRestorablePath(undefined)).toBe(false);
    expect(isRestorablePath('')).toBe(false);
  });

  it('rejects protocol-relative and absolute URLs (open-redirect guard)', () => {
    expect(isRestorablePath('//evil.com')).toBe(false);
    expect(isRestorablePath('https://evil.com')).toBe(false);
    expect(isRestorablePath('http://evil.com/path')).toBe(false);
    expect(isRestorablePath('files')).toBe(false);
  });

  it('rejects auth routes (would trap the user on sign-in)', () => {
    expect(isRestorablePath('/auth')).toBe(false);
    expect(isRestorablePath('/auth/signin')).toBe(false);
  });
});
