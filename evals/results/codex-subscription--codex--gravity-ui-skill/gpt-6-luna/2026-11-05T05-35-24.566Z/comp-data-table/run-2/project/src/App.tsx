import {useMemo, useState} from 'react';
import {
  Button,
  Label,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
  type TableColumnConfig,
} from '@gravity-ui/uikit';

import './App.css';

type Payment = {
  id: string;
  customer: string;
  email: string;
  date: string;
  amount: number;
  status: 'Оплачен' | 'В обработке' | 'Возврат';
};

const payments: Payment[] = [
  {id: 'INV-2048', customer: 'Анна Смирнова', email: 'anna.smirnova@mail.ru', date: '2026-10-28', amount: 12800, status: 'Оплачен'},
  {id: 'INV-2047', customer: 'Михаил Козлов', email: 'm.kozlov@mail.ru', date: '2026-10-27', amount: 5400, status: 'В обработке'},
  {id: 'INV-2046', customer: 'Екатерина Волкова', email: 'e.volkova@mail.ru', date: '2026-10-26', amount: 23600, status: 'Оплачен'},
  {id: 'INV-2045', customer: 'Дмитрий Соколов', email: 'd.sokolov@mail.ru', date: '2026-10-25', amount: 8900, status: 'Возврат'},
  {id: 'INV-2044', customer: 'Ольга Морозова', email: 'o.morozova@mail.ru', date: '2026-10-24', amount: 15400, status: 'Оплачен'},
  {id: 'INV-2043', customer: 'Александр Петров', email: 'a.petrov@mail.ru', date: '2026-10-23', amount: 7200, status: 'Оплачен'},
  {id: 'INV-2042', customer: 'Мария Новикова', email: 'm.novikova@mail.ru', date: '2026-10-22', amount: 19800, status: 'В обработке'},
  {id: 'INV-2041', customer: 'Иван Фёдоров', email: 'i.fedorov@mail.ru', date: '2026-10-21', amount: 4600, status: 'Оплачен'},
  {id: 'INV-2040', customer: 'Наталья Павлова', email: 'n.pavlova@mail.ru', date: '2026-10-20', amount: 31200, status: 'Возврат'},
  {id: 'INV-2039', customer: 'Сергей Васильев', email: 's.vasiliev@mail.ru', date: '2026-10-19', amount: 11200, status: 'Оплачен'},
  {id: 'INV-2038', customer: 'Татьяна Белова', email: 't.belova@mail.ru', date: '2026-10-18', amount: 6700, status: 'В обработке'},
  {id: 'INV-2037', customer: 'Павел Орлов', email: 'p.orlov@mail.ru', date: '2026-10-17', amount: 17400, status: 'Оплачен'},
];

const statusTheme: Record<Payment['status'], 'success' | 'warning' | 'danger'> = {
  Оплачен: 'success',
  'В обработке': 'warning',
  Возврат: 'danger',
};

const columns: TableColumnConfig<Payment>[] = [
  {
    id: 'id',
    name: 'Платёж',
    width: '20%',
    meta: {sort: true},
    template: (payment) => <Text variant="body-2" className="payment-table__invoice">{payment.id}</Text>,
  },
  {
    id: 'customer',
    name: 'Клиент',
    width: '28%',
    meta: {sort: true},
    template: (payment) => (
      <div className="payment-table__customer">
        <Text variant="body-2">{payment.customer}</Text>
        <Text variant="caption-2" color="secondary">{payment.email}</Text>
      </div>
    ),
  },
  {
    id: 'date',
    name: 'Дата',
    width: '18%',
    meta: {sort: true, defaultSortOrder: 'desc'},
    template: (payment) => new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(`${payment.date}T00:00:00`)),
  },
  {
    id: 'amount',
    name: 'Сумма',
    width: '16%',
    align: 'right',
    meta: {sort: true, defaultSortOrder: 'desc'},
    template: (payment) => new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0}).format(payment.amount),
  },
  {
    id: 'status',
    name: 'Статус',
    width: '18%',
    meta: {sort: true},
    template: (payment) => <Label theme={statusTheme[payment.status]} size="s">{payment.status}</Label>,
  },
];

const SelectableSortableTable = withTableSelection(withTableSorting(Table<Payment>));

export function App() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<Array<{column: string; order: 'asc' | 'desc'}>>([
    {column: 'date', order: 'desc'},
  ]);

  const sortedPayments = useMemo(() => {
    const sort = sortState[0];
    if (!sort) {
      return payments;
    }
    const {column, order} = sort;

    return [...payments].sort((first, second) => {
      const firstValue = first[column as keyof Payment];
      const secondValue = second[column as keyof Payment];
      const comparison = typeof firstValue === 'number' && typeof secondValue === 'number'
        ? firstValue - secondValue
        : String(firstValue).localeCompare(String(secondValue), 'ru');
      return order === 'asc' ? comparison : -comparison;
    });
  }, [sortState]);

  const pagePayments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedPayments.slice(start, start + pageSize);
  }, [page, pageSize, sortedPayments]);

  const selectedCount = selectedIds.length;

  return (
    <main className="payments-page">
      <header className="payments-page__header">
        <div>
          <Text variant="header-2" as="h1">Платежи</Text>
          <Text variant="body-2" color="secondary">Управляйте платежами и отслеживайте их статус</Text>
        </div>
        <Button view="action" size="l">Скачать отчёт</Button>
      </header>

      <section className="payments-card" aria-label="Список платежей">
        <div className="payments-card__top">
          <div>
            <Text variant="subheader-2" as="h2">Все платежи</Text>
            <Text variant="body-1" color="secondary">{payments.length} операций за последний месяц</Text>
          </div>
          {selectedCount > 0 && (
            <div className="payments-selection" aria-live="polite">
              <Text variant="body-1">Выбрано: {selectedCount}</Text>
              <Button view="flat" size="m" onClick={() => setSelectedIds([])}>Снять выделение</Button>
            </div>
          )}
        </div>

        <div className="payments-table-wrap">
          <SelectableSortableTable
            className="payment-table"
            data={pagePayments}
            columns={columns}
            getRowDescriptor={(payment) => ({id: payment.id})}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            sortState={sortState}
            onSortStateChange={(nextSortState) => {
              setSortState(nextSortState);
              setPage(1);
            }}
            emptyMessage="Платежей пока нет"
          />
        </div>

        <footer className="payments-card__footer">
          <Text variant="body-1" color="secondary">
            Показано {Math.min((page - 1) * pageSize + 1, payments.length)}–{Math.min(page * pageSize, payments.length)} из {payments.length}
          </Text>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={payments.length}
            pageSizeOptions={[5, 10, 20]}
            showInput={false}
            onUpdate={(nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            }}
          />
        </footer>
      </section>
    </main>
  );
}
