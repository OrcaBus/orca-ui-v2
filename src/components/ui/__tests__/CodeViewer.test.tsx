import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CodeViewer } from '../CodeViewer';

describe('CodeViewer', () => {
  it('formats JSON code with viewer metadata and an accessible copy action', () => {
    const html = renderToStaticMarkup(
      <CodeViewer
        code='{"experimentName":"Run 001","enabled":true}'
        language='json'
        title='SampleSheet JSON'
      />
    );

    expect(html).toContain('SampleSheet JSON');
    expect(html).toContain('JSON');
    expect(html).toContain('4 lines');
    expect(html).toContain('aria-label="JSON code viewer"');
    expect(html).toContain('aria-label="Copy SampleSheet JSON to clipboard"');
    expect(html).toContain('language-json');
    expect(html).toContain('text-green-300');
    expect(html).toContain('text-sky-300');
  });

  it('can hide the header while keeping only the code content visible', () => {
    const html = renderToStaticMarkup(
      <CodeViewer
        code='{"visible":true}'
        language='json'
        title='Hidden Header'
        showHeader={false}
      />
    );

    expect(html).not.toContain('Hidden Header');
    expect(html).not.toContain('Copy Hidden Header to clipboard');
    expect(html).not.toContain('3 lines');
    expect(html).toContain('language-json');
    expect(html).toContain('visible');
  });

  it('renders JavaScript with semantic language class and editor-style token colors', () => {
    const html = renderToStaticMarkup(
      <CodeViewer
        code={'function calculateTotal(price, tax) {\n  return price + tax;\n}'}
        language='javascript'
        title='Calculator'
      />
    );

    expect(html).toContain('language-javascript');
    expect(html).toContain('text-violet-300');
    expect(html).toContain('function');
  });
});
