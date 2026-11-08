import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from './App';

describe('App', () => {
  it('renders the full dashboard tree without crashing', () => {
    const html = renderToString(<App />);
    expect(html).toContain('Product overview');
    expect(html).toContain('Key metrics');
    expect(html).toContain('Traffic');
    expect(html).toContain('Signups by plan');
    expect(html).toContain('Revenue by channel');
    expect(html).toContain('Traffic sources');
    expect(html).toContain('Usage &amp; limits');
  });
});
