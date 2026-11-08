import { test, expect } from 'vitest';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '@gravity-ui/uikit';
import { App } from '../App';
import { generateOrders, STATUS_ORDER } from '../orders';

test('dashboard renders sidebar, stat tiles and grouped orders table', () => {
  const html = renderToString(
    <ThemeProvider theme="light">
      <App />
    </ThemeProvider>,
  );
  for (const s of ['Главная', 'Пользователи', 'Заказы', 'Настройки']) expect(html).toContain(s);
  for (const h of ['№ заказа', 'Клиент', 'Дата', 'Статус', 'Сумма', 'Город']) expect(html).toContain(h);
  expect(html).toContain('orders-table__group-row');
  expect(html).toContain('data-column-id="customer"');
  expect(html).toContain('Группировать по статусу');
  const groupRows = html.match(/orders-table__group-row/g)!.length;
  expect(groupRows).toBe(STATUS_ORDER.length);
  const orders = generateOrders();
  expect(html).toContain(orders[0].id);
  expect((html.match(/orders-table__row[ "]/g) || []).length).toBe(orders.length);
});
