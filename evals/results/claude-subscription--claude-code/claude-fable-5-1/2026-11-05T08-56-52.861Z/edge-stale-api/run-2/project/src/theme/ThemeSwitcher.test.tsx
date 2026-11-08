import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider } from '@gravity-ui/uikit';

import { AppThemeProvider, ThemeSwitcher } from './index';

describe('ThemeSwitcher', () => {
  it('рендерит выключенный Switch для светлой темы', () => {
    const html = renderToStaticMarkup(
      <AppThemeProvider defaultTheme="light">
        <ThemeSwitcher />
      </AppThemeProvider>,
    );
    expect(html).toContain('data-qa="theme-switcher"');
    expect(html).toContain('Светлая тема');
    expect(html).not.toMatch(/checked=""/);
  });

  it('рендерит включённый Switch для тёмной темы', () => {
    const html = renderToStaticMarkup(
      <AppThemeProvider defaultTheme="dark">
        <ThemeSwitcher />
      </AppThemeProvider>,
    );
    expect(html).toContain('Тёмная тема');
    expect(html).toMatch(/checked=""/);
  });

  it('работает вложенно во внешний ThemeProvider (scoped-режим uikit)', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme="light">
        <AppThemeProvider defaultTheme="dark">
          <ThemeSwitcher />
        </AppThemeProvider>
      </ThemeProvider>,
    );
    expect(html).toContain('g-root_theme_dark');
    expect(html).toContain('Тёмная тема');
  });

  it('бросает понятную ошибку вне AppThemeProvider', () => {
    expect(() =>
      renderToStaticMarkup(
        <ThemeProvider theme="light">
          <ThemeSwitcher />
        </ThemeProvider>,
      ),
    ).toThrow(/AppThemeProvider/);
  });
});
