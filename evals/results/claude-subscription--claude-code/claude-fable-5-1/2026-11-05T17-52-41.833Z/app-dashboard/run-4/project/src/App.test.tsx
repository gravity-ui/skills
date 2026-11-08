import { ThemeProvider } from '@gravity-ui/uikit';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { generateOrders } from './data/orders';

describe('App', () => {
  it('renders navigation sections and the grouped orders table', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme="light">
        <App />
      </ThemeProvider>,
    );
    for (const title of ['Главная', 'Пользователи', 'Заказы', 'Настройки']) {
      expect(html).toContain(title);
    }
    // Default view is grouped by status: every non-empty status group renders a header.
    const statuses = new Set(generateOrders(60).map((o) => o.status));
    expect(statuses.size).toBeGreaterThan(1);
    expect(html).toContain('Группировать по статусу');
    expect(html).toContain('Сумма');
    expect(html).toContain('Клиент');
    expect(html).toContain('g-table__selection-checkbox');
  });
});
