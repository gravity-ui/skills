// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, configure } from '@gravity-ui/uikit';

import { App } from './App';
import { LANGUAGE_STORAGE_KEY } from './i18n';

function renderApp() {
  return render(
    <ThemeProvider theme="light">
      <App />
    </ThemeProvider>,
  );
}

describe('App language switching', () => {
  beforeEach(() => {
    window.localStorage.clear();
    configure({ lang: 'en', fallbackLang: 'en' });
    document.documentElement.lang = '';
  });

  afterEach(() => {
    cleanup();
  });

  it('renders in English by default and switches to Russian', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Language switcher demo');
    expect(document.documentElement.lang).toBe('en');
    // Built-in Gravity UI string (Pagination "Next" button).
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();

    await user.click(screen.getByRole('radio', { name: 'Русский' }));

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Демонстрация переключения языка');
    expect(screen.getByText('Текущий язык: Русский')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Следующая' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Русский' })).toHaveProperty('checked', true);
    expect(document.documentElement.lang).toBe('ru');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru');
  });

  it('switches back to English', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('radio', { name: 'Русский' }));
    await user.click(screen.getByRole('radio', { name: 'English' }));

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Language switcher demo');
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('restores the saved language on start', () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ru');
    renderApp();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Демонстрация переключения языка');
    const switcher = screen.getByRole('radiogroup');
    expect(within(switcher).getByRole('radio', { name: 'Русский' })).toHaveProperty('checked', true);
    expect(screen.getByRole('button', { name: 'Следующая' })).toBeTruthy();
  });
});
