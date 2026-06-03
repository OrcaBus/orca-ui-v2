import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PayloadJsonView } from '../PayloadViewerDialog';

describe('PayloadJsonView', () => {
  it('renders formatted JSON through CodeViewer without the CodeViewer header', () => {
    const html = renderToStaticMarkup(
      <PayloadJsonView formattedJson='{"data":{"eventCode":"ICA_EXEC_028"}}' />
    );

    expect(html).toContain('language-json');
    expect(html).toContain('eventCode');
    expect(html).not.toContain('Copy payload JSON to clipboard');
    expect(html).not.toContain('Payload JSON');
  });
});
