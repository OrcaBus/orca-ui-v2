import { describe, expect, it } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  it('joins plain class names', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('merges conflicting tailwind utilities', () => {
    expect(cn('p-2', 'p-4', 'text-sm', 'text-lg')).toBe('p-4 text-lg');
  });

  it('ignores falsy values', () => {
    const isHidden = false;
    expect(cn('base', isHidden && 'hidden', null, undefined, '')).toBe('base');
  });
});
