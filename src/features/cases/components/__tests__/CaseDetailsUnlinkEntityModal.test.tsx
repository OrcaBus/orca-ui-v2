// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseDetailsUnlinkEntityModal } from '../CaseDetailsUnlinkEntityModal';

afterEach(cleanup);

describe('CaseDetailsUnlinkEntityModal', () => {
  it('requires an explicit confirmation before invoking unlink', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CaseDetailsUnlinkEntityModal
        isOpen
        target={{ type: 'library', orcabusId: 'lib.01TEST', label: 'L2400001' }}
        isPending={false}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole('heading', { name: 'Unlink Library' })).toBeTruthy();
    expect(screen.getByText(/will not delete the library/i)).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Confirm unlink library L2400001' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('disables dismissal and actions while unlinking', () => {
    render(
      <CaseDetailsUnlinkEntityModal
        isOpen
        target={{ type: 'workflow run', orcabusId: 'wfr.01TEST', label: 'Alignment run' }}
        isPending
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Close dialog' }).matches(':disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Cancel' }).matches(':disabled')).toBe(true);
    expect(
      screen
        .getByRole('button', { name: 'Confirm unlink workflow run Alignment run' })
        .matches(':disabled')
    ).toBe(true);
    expect(screen.getByText('Unlinking…')).toBeTruthy();
  });
});
