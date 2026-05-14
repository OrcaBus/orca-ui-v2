import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FilesBucketSelect } from '../FilesBucketSelect';

describe('FilesBucketSelect', () => {
  it('collapses multiple selected buckets into a count summary', () => {
    const html = renderToStaticMarkup(
      <FilesBucketSelect
        values={[
          'archive-prod-analysis-503977275616-ap-southeast-2',
          'archive-prod-fastq-503977275616-ap-southeast-2',
        ]}
        onChange={vi.fn()}
      />
    );

    expect(html).toContain('2 selected');
    expect(html).not.toContain('archive-prod-analysis-503977275616-ap-southeast-2');
    expect(html).not.toContain('archive-prod-fastq-503977275616-ap-southeast-2');
  });
});
