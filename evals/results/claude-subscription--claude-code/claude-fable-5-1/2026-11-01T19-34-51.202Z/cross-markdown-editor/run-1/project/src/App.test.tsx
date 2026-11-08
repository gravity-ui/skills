import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider } from '@gravity-ui/uikit';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App form', () => {
  it('renders title input, markdown textarea and live preview', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme="light">
        <App />
      </ThemeProvider>,
    );
    expect(html).toContain('<form');
    expect(html).toMatch(/<input [^>]*name="title"/);
    expect(html).toMatch(/<textarea [^>]*name="description"/);
    // предпросмотр начального текста уже отформатирован
    expect(html).toContain('<h1');
    expect(html).toContain('<strong>жирным</strong>');
    expect(html).toContain('<ol');
    expect(html).toContain('<blockquote');
    expect(html).toContain('<pre');
  });
});
