import {useMemo, useState} from 'react';
import {Button, Pagination, Table, Text, withTableSelection, withTableSorting} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';
import './App.css';

type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  amount: number;
  status: string;
};

const orders: Order[] = [
  {id: 'ORD-1048', customer: 'Анна Смирнова', email: 'anna.smirnova@mail.ru', date: '12 мая 2024', amount: 12800, status: 'Оплачен'},
  {id: 'ORD-1047', customer: 'Михаил Волков', email: 'm.volkov@gmail.com', date: '12 мая 2024', amount: 7450, status: 'В обработке'},
  {id: 'ORD-1046', customer: 'Елена Кузнецова', email: 'e.kuznetsova@yandex.ru', date: '11 мая 2024', amount: 23400, status: 'Оплачен'},
  {id: 'ORD-1045', customer: 'Дмитрий Соколов', email: 'dsokolov@mail.ru', date: '11 мая 2024', amount: 5600, status: 'Отправлен'},
  {id: 'ORD-1044', customer: 'Ольга Попова', email: 'olga.popova@gmail.com', date: '10 мая 2024', amount: 18900, status: 'Оплачен'},
  {id: 'ORD-1043', customer: 'Артём Лебедев', email: 'artem.lebedev@mail.ru', date: '10 мая 2024', amount: 3200, status: 'Отменён'},
  {id: 'ORD-1042', customer: 'Мария Новикова', email: 'm.novikova@yandex.ru', date: '9 мая 2024', amount: 9700, status: 'В обработке'},
  {id: 'ORD-1041', customer: 'Иван Морозов', email: 'ivan.morozov@gmail.com', date: '9 мая 2024', amount: 15400, status: 'Отправлен'},
  {id: 'ORD-1040', customer: 'Наталья Фёдорова', email: 'n.fedorova@mail.ru', date: '8 мая 2024', amount: 6800, status: 'Оплачен'},
  {id: 'ORD-1039', customer: 'Сергей Павлов', email: 'sergey.pavlov@yandex.ru', date: '8 мая 2024', amount: 11200, status: 'Оплачен'},
  {id: 'ORD-1038', customer: 'Татьяна Семёнова', email: 't.semenova@gmail.com', date: '7 мая 2024', amount: 4300, status: 'В обработке'},
  {id: 'ORD-1037', customer: 'Алексей Егоров', email: 'a.egorov@mail.ru', date: '7 мая 2024', amount: 22100, status: 'Отправлен'},
  {id: 'ORD-1036', customer: 'Ирина Павлова', email: 'irina.pavlova@yandex.ru', date: '6 мая 2024', amount: 8300, status: 'Оплачен'},
  {id: 'ORD-1035', customer: 'Павел Козлов', email: 'p.kozlov@gmail.com', date: '6 мая 2024', amount: 14200, status: 'Отменён'},
  {id: 'ORD-1034', customer: 'Екатерина Орлова', email: 'e.orlova@mail.ru', date: '5 мая 2024', amount: 9100, status: 'Оплачен'},
];

const columns: TableColumnConfig<Order>[] = [
  {id: 'id', name: 'Заказ', width: 140, meta: {sort: true}},
  {id: 'customer', name: 'Покупатель', width: '30%', meta: {sort: true}},
  {id: 'date', name: 'Дата', width: 160, meta: {sort: true}},
  {id: 'amount', name: 'Сумма', width: 140, align: 'right' as const, meta: {sort: true}, template: (row: Order) => `${row.amount.toLocaleString('ru-RU')} ₽`},
  {id: 'status', name: 'Статус', width: 170, meta: {sort: true}, template: (row: Order) => <span className={`status status_${row.status === 'Оплачен' ? 'paid' : row.status === 'Отправлен' ? 'sent' : row.status === 'Отменён' ? 'cancelled' : 'pending'}`}>{row.status}</span>},
];

const SelectableSortableTable = withTableSelection(withTableSorting(Table<Order>));

export function App() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const pageData = useMemo(() => orders.slice((page - 1) * pageSize, page * pageSize), [page, pageSize]);

  const updatePage = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  return (
    <main className="page-shell">
      <section className="content">
        <div className="breadcrumbs">Рабочее пространство <span>/</span> Продажи</div>
        <header className="page-header">
          <div>
            <Text variant="header-1">Заказы</Text>
            <Text className="subtitle" variant="body-1">Управляйте заказами и следите за их статусом</Text>
          </div>
          <Button view="action" size="l">Новый заказ</Button>
        </header>

        <section className="table-card" aria-label="Список заказов">
          <div className="table-toolbar">
            <div className="table-heading">
              <Text variant="subheader-2">Все заказы</Text>
              <span className="count">{orders.length}</span>
            </div>
            <div className="toolbar-actions">
              {selectedIds.length > 0 && <Text className="selection-label" variant="body-2">Выбрано: {selectedIds.length}</Text>}
              <Button view="outlined" size="m" onClick={() => setSelectedIds([])} disabled={!selectedIds.length}>Снять выделение</Button>
            </div>
          </div>
          <div className="table-scroll">
            <SelectableSortableTable
              data={pageData}
              columns={columns}
              getRowId="id"
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              defaultSortState={[{column: 'date', order: 'desc'}]}
              emptyMessage="Заказов пока нет"
              edgePadding={false}
            />
          </div>
          <footer className="table-footer">
            <Text variant="body-2" className="range-label">Показано {Math.min((page - 1) * pageSize + 1, orders.length)}–{Math.min(page * pageSize, orders.length)} из {orders.length}</Text>
            <Pagination page={page} pageSize={pageSize} total={orders.length} onUpdate={updatePage} pageSizeOptions={[8, 12, 20]} size="s" />
          </footer>
        </section>
        <div className="footnote">Последнее обновление: сегодня, 14:32</div>
      </section>
    </main>
  );
}
