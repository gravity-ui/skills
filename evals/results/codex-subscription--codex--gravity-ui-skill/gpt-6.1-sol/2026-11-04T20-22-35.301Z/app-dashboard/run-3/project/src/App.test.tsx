import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {App} from './App';

describe('admin dashboard integration', () => {
  beforeEach(() => {
    const originalError = console.error;
    vi.spyOn(console, 'error').mockImplementation((message, ...args) => {
      if (String(message).includes('useLayoutEffect does nothing on the server')) return;
      originalError(message, ...args);
    });
  });
  afterEach(() => vi.restoreAllMocks());
  for (const theme of ['light', 'dark'] as const) {
    it(`renders navigation, grouped orders and controls in ${theme} theme`, () => {
      const markup = renderToStaticMarkup(<ThemeProvider theme={theme}><App /></ThemeProvider>);
      for (const label of ['orbit', 'Заказы', 'Анна Смирнова', '#1048', 'В обработке', 'В доставке', 'Выполнен', 'Создать заказ', 'Настроить колонки', 'Следующая страница']) {
        expect(markup.includes(label), `Missing dashboard content: ${label}`).toBe(true);
      }
      expect(markup.match(/class="group-content"/g)).toHaveLength(3);
      expect(markup.match(/class="customer-name"/g)).toHaveLength(8);
      expect(markup).not.toContain('undefined');
    });
  }
});
