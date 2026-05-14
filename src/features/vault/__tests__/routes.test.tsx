import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { EnvironmentContextValue } from '@/context/environment-context';
import { VaultRoute } from '../routes';

type VaultRouteElement = ReactElement<{ featureName?: string }>;

const useEnvironmentMock = vi.fn<() => EnvironmentContextValue>();

vi.mock('@/context/environment-context', () => ({
  useEnvironment: () => useEnvironmentMock(),
}));

function renderVaultRoute() {
  return VaultRoute() as VaultRouteElement;
}

describe('VaultRoute', () => {
  it('renders VaultPage in dev', () => {
    useEnvironmentMock.mockReturnValue({ environment: 'dev', label: 'Dev' });

    const element = renderVaultRoute();

    expect(element.props.featureName).toBeUndefined();
  });

  it.each([
    { environment: 'stg', label: 'Staging' },
    { environment: 'prod', label: 'Prod' },
  ] satisfies EnvironmentContextValue[])(
    'renders the under-development page in $environment',
    (environmentContext) => {
      useEnvironmentMock.mockReturnValue(environmentContext);

      const element = renderVaultRoute();

      expect(element.props.featureName).toBe('Vault');
    }
  );
});
