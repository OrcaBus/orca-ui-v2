import { describe, expect, it } from 'vitest';
import routeRegistry from '../route-registry';

describe('routeRegistry', () => {
  it('attaches a custom error element to every registered feature route', () => {
    expect(routeRegistry.length).toBeGreaterThan(0);

    for (const route of routeRegistry) {
      expect(route.path).toBeDefined();
      expect(route.errorElement).toBeDefined();
    }
  });
});
