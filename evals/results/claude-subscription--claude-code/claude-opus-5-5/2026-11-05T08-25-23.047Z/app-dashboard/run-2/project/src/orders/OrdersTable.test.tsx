import { ThemeProvider } from '@gravity-ui/uikit';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { generateOrders } from './data';
import { buildRows } from './logic';
import { DEFAULT_COLUMN_ORDER, OrdersTable, pluralOrders, type ColumnId } from './OrdersTable';

const orders = generateOrders(50);
const noop = () => {};

function render(opts: { grouped: boolean; selected?: string[]; columnOrder?: ColumnId[] }) {
    const rows = buildRows(orders, opts.grouped, new Set());
    return renderToStaticMarkup(
        <ThemeProvider theme="light">
            <OrdersTable
                orders={orders}
                rows={rows}
                columnOrder={opts.columnOrder ?? DEFAULT_COLUMN_ORDER}
                onColumnOrderChange={noop}
                selected={new Set(opts.selected)}
                onSelectionChange={noop}
                onToggleGroup={noop}
                announce={noop}
            />
        </ThemeProvider>,
    );
}

const headTitles = (html: string) =>
    [...html.matchAll(/aria-label="Переместить колонку «([^»]+)»"/g)].map((m) => m[1]);

describe('OrdersTable', () => {
    it('renders headers in the given order, all draggable', () => {
        const order: ColumnId[] = ['total', ...DEFAULT_COLUMN_ORDER.filter((id) => id !== 'total')];
        const html = render({ grouped: false, columnOrder: order });
        expect(headTitles(html)[0]).toBe('Сумма');
        expect(html.match(/<th[^>]*draggable="true"/g)).toHaveLength(DEFAULT_COLUMN_ORDER.length);
        expect(html.match(/class="orders__row/g)).toHaveLength(50);
    });

    it('renders one header row per status when grouped', () => {
        const html = render({ grouped: true });
        const statuses = new Set(orders.map((o) => o.status));
        expect(html.match(/class="orders__group"/g)).toHaveLength(statuses.size);
        expect(html).toContain(`colSpan="${DEFAULT_COLUMN_ORDER.length + 1}"`);
    });

    it('marks selected rows and sets the header checkbox to indeterminate', () => {
        const html = render({ grouped: false, selected: [orders[0].id, orders[1].id] });
        expect(html.match(/orders__row_selected/g)).toHaveLength(2);
        expect(html).toMatch(/g-checkbox_indeterminate/);
    });
});

describe('pluralOrders', () => {
    it.each([
        [1, '1 заказ'],
        [3, '3 заказа'],
        [5, '5 заказов'],
        [11, '11 заказов'],
        [21, '21 заказ'],
        [112, '112 заказов'],
        [122, '122 заказа'],
    ])('%i → %s', (n, expected) => expect(pluralOrders(n)).toBe(expected));
});
