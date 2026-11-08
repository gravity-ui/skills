import {Card, Flex, Text} from '@gravity-ui/uikit';

import type {Order} from '../data/orders';
import {formatMoneyCompact} from '../utils/format';

interface KpiTilesProps {
  orders: Order[];
}

interface Tile {
  label: string;
  value: string;
  hint: string;
}

export function KpiTiles({orders}: KpiTilesProps) {
  const total = orders.length;
  const cancelled = orders.filter((order) => order.status === 'cancelled').length;
  const awaiting = orders.filter(
    (order) => order.status === 'new' || order.status === 'processing',
  ).length;
  const revenue = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.amount, 0);
  const cancelRate = total === 0 ? 0 : cancelled / total;

  const tiles: Tile[] = [
    {label: 'Всего заказов', value: String(total), hint: 'За последние 30 дней'},
    {label: 'Выручка без отмен', value: formatMoneyCompact(revenue), hint: 'Сумма неотменённых заказов'},
    {label: 'Ждут обработки', value: String(awaiting), hint: 'Статусы «Новый» и «В обработке»'},
    {label: 'Доля отмен', value: `${(cancelRate * 100).toFixed(1)}%`, hint: `${cancelled} заказов отменено`},
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--g-spacing-4)',
      }}
    >
      {tiles.map((tile) => (
        <Card key={tile.label} view="outlined" size="l" spacing={{p: 4}}>
          <Flex direction="column" gap={1}>
            <Text variant="body-1" color="secondary">
              {tile.label}
            </Text>
            <Text variant="header-1">{tile.value}</Text>
            <Text variant="caption-1" color="hint">
              {tile.hint}
            </Text>
          </Flex>
        </Card>
      ))}
    </div>
  );
}
