import { describe, expect, it } from 'vitest';
import toolsRoutes from '../routes';

describe('tools routes', () => {
  it('registers Deployment Pulse at /tools/deploy-status', () => {
    expect(toolsRoutes.path).toBe('/tools');
    expect(toolsRoutes.children?.some((route) => route.path === 'deploy-status')).toBe(true);
  });
});
