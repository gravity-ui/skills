import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {Label, Table, Text} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

export interface TableWidgetData {
  title: string;
}

type OrderStatus = 'paid' | 'pending' | 'failed';

interface OrderRow {
  id: string;
  customer: string;
  amount: number;
  status: OrderStatus;
}

const STATUS_LABEL: Record<OrderStatus, {text: string; theme: 'success' | 'warning' | 'danger'}> = {
  paid: {text: 'Оплачен', theme: 'success'},
  pending: {text: 'Ожидает', theme: 'warning'},
  failed: {text: 'Ошибка', theme: 'danger'},
};

const ROWS: OrderRow[] = [
  {id: 'A-1042', customer: 'ООО «Вектор»', amount: 128_400, status: 'paid'},
  {id: 'A-1041', customer: 'ИП Смирнова', amount: 18_900, status: 'pending'},
  {id: 'A-1040', customer: 'АО «Север»', amount: 342_000, status: 'paid'},
  {id: 'A-1039', customer: 'ООО «Прайм»', amount: 56_300, status: 'failed'},
  {id: 'A-1038', customer: 'ООО «Атлас»', amount: 74_250, status: 'paid'},
  {id: 'A-1037', customer: 'ИП Козлов', amount: 9_990, status: 'pending'},
  {id: 'A-1036', customer: 'ООО «Орион»', amount: 210_000, status: 'paid'},
];

const COLUMNS: TableColumnConfig<OrderRow>[] = [
  {id: 'id', name: 'Заказ', width: 90},
  {id: 'customer', name: 'Клиент'},
  {
    id: 'amount',
    name: 'Сумма',
    align: 'end',
    template: (row) => (
      <Text variant="body-1" whiteSpace="nowrap">
        {row.amount.toLocaleString('ru-RU')} ₽
      </Text>
    ),
  },
  {
    id: 'status',
    name: 'Статус',
    template: (row) => (
      <Label theme={STATUS_LABEL[row.status].theme} size="xs">
        {STATUS_LABEL[row.status].text}
      </Label>
    ),
  },
];

export function TableWidget(props: PluginWidgetProps) {
  const data = props.data as unknown as TableWidgetData;

  return (
    <WidgetFrame title={data.title}>
      <Table<OrderRow>
        data={ROWS}
        columns={COLUMNS}
        getRowId="id"
        width="max"
        emptyMessage="Нет заказов"
      />
    </WidgetFrame>
  );
}
