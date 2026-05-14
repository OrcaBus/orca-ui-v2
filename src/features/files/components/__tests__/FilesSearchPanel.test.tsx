import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FilesAdvancedFilterFields } from '../FilesSearchPanel';
import { appendKeyPattern, removeKeyPattern } from '../../utils/keyPatterns';

describe('key pattern helpers', () => {
  it('appends trimmed key patterns without duplicating existing items', () => {
    expect(appendKeyPattern(['*.html'], ' */bclconvert-interop-qc/* ')).toEqual([
      '*.html',
      '*/bclconvert-interop-qc/*',
    ]);
    expect(appendKeyPattern(['*.html'], '*.html')).toEqual(['*.html']);
    expect(appendKeyPattern(['*.html'], '   ')).toEqual(['*.html']);
  });

  it('removes a key pattern by index', () => {
    expect(removeKeyPattern(['*.html', '*.bam', '*.pdf'], 1)).toEqual(['*.html', '*.pdf']);
  });
});

describe('FilesAdvancedFilterFields', () => {
  it('places bucket and portal run ID on the first row, with S3 key pattern below them', () => {
    const html = renderToStaticMarkup(
      <FilesAdvancedFilterFields
        tempValues={{
          portalRunId: '',
          buckets: [],
          keys: [],
          keyDraft: '',
          keyOp: 'and',
        }}
        setTempValues={vi.fn()}
        inputClass='input-class'
        labelClass='label-class'
      />
    );

    const bucketIndex = html.indexOf('Bucket Name');
    const portalRunIdIndex = html.indexOf('Portal Run ID');
    const s3KeyIndex = html.indexOf('S3 Key Pattern');

    expect(html).toContain('md:grid-cols-2');
    expect(bucketIndex).toBeGreaterThan(-1);
    expect(portalRunIdIndex).toBeGreaterThan(bucketIndex);
    expect(s3KeyIndex).toBeGreaterThan(portalRunIdIndex);
  });

  it('renders existing S3 key patterns as pill tags inside the key field', () => {
    const html = renderToStaticMarkup(
      <FilesAdvancedFilterFields
        tempValues={{
          portalRunId: '',
          buckets: [],
          keys: ['*.html', '*/oncoanalyser-wgts-dna-rna/*'],
          keyDraft: '',
          keyOp: 'and',
        }}
        setTempValues={vi.fn()}
        inputClass='input-class'
        labelClass='label-class'
      />
    );

    expect(html).toContain('*.html');
    expect(html).toContain('*/oncoanalyser-wgts-dna-rna/*');
    expect(html).toContain('Enter S3 key pattern');
  });
});
