import { describe, expect, it } from 'vitest';
import { sleep } from '../async';

describe('sleep', () => {
  it('resolves after at least the requested timeout', async () => {
    const start = Date.now();
    await sleep(20);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(15);
  });

  it('resolves immediately when timeout is omitted', async () => {
    await expect(sleep()).resolves.toBeUndefined();
  });
});
