// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { FileMoreActionsDropdown, FileMoreActionsMenuItem } from '../FileMoreActionsDropdown';
import type { S3Record } from '../../api/files.api';

vi.mock('../../api/files.api', () => ({
  useFilePresignedURLModel: () => ({
    data: undefined,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

describe('FileMoreActionsMenuItem', () => {
  it('aligns its icon and label to the left edge', () => {
    const html = renderToStaticMarkup(
      <FileMoreActionsMenuItem icon={<span>icon</span>} label='View details' onClick={vi.fn()} />
    );

    expect(html).toContain('justify-start');
    expect(html).toContain('rounded-none');
    expect(html).toContain('text-left');
    expect(html).toContain('flex-1');
  });

  it('opens a fixed-width menu with vertically stacked actions', () => {
    render(
      <FileMoreActionsDropdown
        s3Record={
          {
            s3ObjectId: 'file-1',
            bucket: 'test-bucket',
            key: 'results/sample.bam',
          } as S3Record
        }
        onViewDetails={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTitle('More actions'));

    const firstMenuItem = screen.getByText('Copy S3 URI').closest('button');
    const menu = firstMenuItem?.parentElement;

    expect(menu?.classList.contains('w-56')).toBe(true);
    expect(menu?.classList.contains('flex')).toBe(true);
    expect(menu?.classList.contains('flex-col')).toBe(true);
    expect(menu?.classList.contains('min-w-52')).toBe(false);
  });
});
