import {useMemo, useState} from 'react';
import type {ComponentType} from 'react';
import {Button, Pagination, Table, Text, withTableSelection, withTableSorting} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableDataItem, TableProps} from '@gravity-ui/uikit';
import './App.css';

type Customer = TableDataItem & {
    id: string;
    name: string;
    email: string;
    company: string;
    plan: string;
    status: 'Активен' | 'Ожидает' | 'Приостановлен';
    amount: number;
    joined: string;
};

const customers: Customer[] = [
    {id: 'CU-2048', name: 'Александр Морозов', email: 'a.morozov@northstar.ru', company: 'Northstar', plan: 'Бизнес', status: 'Активен', amount: 24800, joined: '12 окт. 2025'},
    {id: 'CU-2047', name: 'Екатерина Волкова', email: 'e.volkova@orbit.io', company: 'Orbit Studio', plan: 'Команда', status: 'Активен', amount: 16400, joined: '11 окт. 2025'},
    {id: 'CU-2046', name: 'Михаил Соколов', email: 'm.sokolov@terra.tech', company: 'Terra Tech', plan: 'Бизнес', status: 'Ожидает', amount: 24800, joined: '10 окт. 2025'},
    {id: 'CU-2045', name: 'Анна Кузнецова', email: 'a.kuznetsova@mono.co', company: 'Mono', plan: 'Старт', status: 'Активен', amount: 8200, joined: '09 окт. 2025'},
    {id: 'CU-2044', name: 'Дмитрий Орлов', email: 'd.orlov@northstar.ru', company: 'Northstar', plan: 'Команда', status: 'Приостановлен', amount: 16400, joined: '08 окт. 2025'},
    {id: 'CU-2043', name: 'Мария Лебедева', email: 'm.lebedeva@formlab.design', company: 'Formlab', plan: 'Бизнес', status: 'Активен', amount: 24800, joined: '07 окт. 2025'},
    {id: 'CU-2042', name: 'Илья Павлов', email: 'i.pavlov@orbit.io', company: 'Orbit Studio', plan: 'Старт', status: 'Активен', amount: 8200, joined: '06 окт. 2025'},
    {id: 'CU-2041', name: 'София Новикова', email: 's.novikova@terra.tech', company: 'Terra Tech', plan: 'Команда', status: 'Ожидает', amount: 16400, joined: '05 окт. 2025'},
    {id: 'CU-2040', name: 'Артём Фёдоров', email: 'a.fedorov@mono.co', company: 'Mono', plan: 'Бизнес', status: 'Активен', amount: 24800, joined: '04 окт. 2025'},
    {id: 'CU-2039', name: 'Полина Смирнова', email: 'p.smirnova@formlab.design', company: 'Formlab', plan: 'Старт', status: 'Активен', amount: 8200, joined: '03 окт. 2025'},
    {id: 'CU-2038', name: 'Кирилл Егоров', email: 'k.egorov@northstar.ru', company: 'Northstar', plan: 'Команда', status: 'Приостановлен', amount: 16400, joined: '02 окт. 2025'},
    {id: 'CU-2037', name: 'Виктория Белова', email: 'v.belova@orbit.io', company: 'Orbit Studio', plan: 'Бизнес', status: 'Активен', amount: 24800, joined: '01 окт. 2025'},
    {id: 'CU-2036', name: 'Никита Захаров', email: 'n.zakharov@terra.tech', company: 'Terra Tech', plan: 'Старт', status: 'Ожидает', amount: 8200, joined: '30 сент. 2025'},
    {id: 'CU-2035', name: 'Алина Васильева', email: 'a.vasilyeva@mono.co', company: 'Mono', plan: 'Команда', status: 'Активен', amount: 16400, joined: '29 сент. 2025'},
    {id: 'CU-2034', name: 'Роман Михайлов', email: 'r.mikhailov@formlab.design', company: 'Formlab', plan: 'Бизнес', status: 'Активен', amount: 24800, joined: '28 сент. 2025'},
    {id: 'CU-2033', name: 'Дарья Павлова', email: 'd.pavlova@northstar.ru', company: 'Northstar', plan: 'Старт', status: 'Приостановлен', amount: 8200, joined: '27 сент. 2025'},
    {id: 'CU-2032', name: 'Максим Семёнов', email: 'm.semenov@orbit.io', company: 'Orbit Studio', plan: 'Команда', status: 'Активен', amount: 16400, joined: '26 сент. 2025'},
    {id: 'CU-2031', name: 'Елена Григорьева', email: 'e.grigorieva@terra.tech', company: 'Terra Tech', plan: 'Бизнес', status: 'Ожидает', amount: 24800, joined: '25 сент. 2025'},
    {id: 'CU-2030', name: 'Павел Николаев', email: 'p.nikolaev@mono.co', company: 'Mono', plan: 'Старт', status: 'Активен', amount: 8200, joined: '24 сент. 2025'},
    {id: 'CU-2029', name: 'Ольга Андреева', email: 'o.andreeva@formlab.design', company: 'Formlab', plan: 'Команда', status: 'Активен', amount: 16400, joined: '23 сент. 2025'},
    {id: 'CU-2028', name: 'Тимур Васильев', email: 't.vasilyev@northstar.ru', company: 'Northstar', plan: 'Бизнес', status: 'Приостановлен', amount: 24800, joined: '22 сент. 2025'},
    {id: 'CU-2027', name: 'Ксения Романова', email: 'k.romanova@orbit.io', company: 'Orbit Studio', plan: 'Старт', status: 'Активен', amount: 8200, joined: '21 сент. 2025'},
    {id: 'CU-2026', name: 'Глеб Козлов', email: 'g.kozlov@terra.tech', company: 'Terra Tech', plan: 'Команда', status: 'Активен', amount: 16400, joined: '20 сент. 2025'},
    {id: 'CU-2025', name: 'Анастасия Ильина', email: 'a.ilina@mono.co', company: 'Mono', plan: 'Бизнес', status: 'Ожидает', amount: 24800, joined: '19 сент. 2025'},
    {id: 'CU-2024', name: 'Сергей Захаров', email: 's.zakharov@formlab.design', company: 'Formlab', plan: 'Старт', status: 'Активен', amount: 8200, joined: '18 сент. 2025'},
    {id: 'CU-2023', name: 'Вера Крылова', email: 'v.krylova@northstar.ru', company: 'Northstar', plan: 'Команда', status: 'Активен', amount: 16400, joined: '17 сент. 2025'},
    {id: 'CU-2022', name: 'Борис Данилов', email: 'b.danilov@orbit.io', company: 'Orbit Studio', plan: 'Бизнес', status: 'Приостановлен', amount: 24800, joined: '16 сент. 2025'},
    {id: 'CU-2021', name: 'Лидия Макарова', email: 'l.makarova@terra.tech', company: 'Terra Tech', plan: 'Старт', status: 'Активен', amount: 8200, joined: '15 сент. 2025'},
    {id: 'CU-2020', name: 'Ярослав Никитин', email: 'ya.nikitin@mono.co', company: 'Mono', plan: 'Команда', status: 'Ожидает', amount: 16400, joined: '14 сент. 2025'},
    {id: 'CU-2019', name: 'Таисия Алексеева', email: 't.alekseeva@formlab.design', company: 'Formlab', plan: 'Бизнес', status: 'Активен', amount: 24800, joined: '13 сент. 2025'},
];

const columns: TableColumnConfig<Customer>[] = [
    {id: 'name', name: 'КЛИЕНТ', template: (row) => <div className="customer-cell"><span className="customer-avatar">{row.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span className="customer-copy"><span className="customer-name">{row.name}</span><span className="customer-email">{row.email}</span></span></div>, width: '26%'},
    {id: 'company', name: 'КОМПАНИЯ', width: '15%'},
    {id: 'plan', name: 'ТАРИФ', width: '13%'},
    {id: 'status', name: 'СТАТУС', template: (row) => <span className={`status-pill status-${row.status === 'Активен' ? 'active' : row.status === 'Ожидает' ? 'pending' : 'paused'}`}><span />{row.status}</span>, width: '15%'},
    {id: 'amount', name: 'ОПЛАТА / МЕС.', template: (row) => `${row.amount.toLocaleString('ru-RU')} ₽`, align: 'end', width: '15%'},
    {id: 'joined', name: 'ДАТА ДОБАВЛЕНИЯ', width: '16%'},
];

const CustomerTable = Table as ComponentType<TableProps<Customer>>;
const SelectableTable = withTableSelection(withTableSorting(CustomerTable));

export function App() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortState, setSortState] = useState<{column: string; order: 'asc' | 'desc'}[]>([{column: 'joined', order: 'desc'}]);
    const sortedCustomers = useMemo(() => {
        const activeSort = sortState[0];
        if (!activeSort) return customers;
        const {column, order} = activeSort;
        const direction = order === 'asc' ? 1 : -1;
        return [...customers].sort((left, right) => {
            const leftValue = column === 'joined' ? Number(left.id.slice(3)) : left[column];
            const rightValue = column === 'joined' ? Number(right.id.slice(3)) : right[column];
            const comparison = typeof leftValue === 'number' && typeof rightValue === 'number'
                ? leftValue - rightValue
                : String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'ru');
            return comparison * direction;
        });
    }, [sortState]);
    const pageData = useMemo(() => sortedCustomers.slice((page - 1) * pageSize, page * pageSize), [page, pageSize, sortedCustomers]);
    const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

    return <main className="page-shell">
        <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">n</span><span>northstar<span className="brand-dot">.</span></span></a><div className="topbar-right"><span className="workspace-label">Рабочее пространство</span><span className="workspace-avatar">N</span><span className="workspace-name">Northstar</span><span className="chevron">⌄</span></div></header>
        <section className="content" id="top">
            <div className="breadcrumb">Рабочее пространство <span>/</span> Клиенты</div>
            <div className="page-heading"><div><Text variant="header-1">Клиенты</Text><Text className="page-description" variant="body-2">Управляйте клиентами, подписками и платежами</Text></div><Button view="action" size="l" onClick={() => undefined}>＋&nbsp; Добавить клиента</Button></div>
            <section className="stats-grid" aria-label="Сводка по клиентам">
                <article className="stat-card"><span className="stat-label">Всего клиентов</span><div className="stat-value">1 284 <span className="stat-trend">↗ 12,8%</span></div><span className="stat-footnote">по сравнению с прошлым месяцем</span></article>
                <article className="stat-card"><span className="stat-label">Активные подписки</span><div className="stat-value">1 096 <span className="stat-trend">↗ 8,2%</span></div><span className="stat-footnote">85,4% от всех клиентов</span></article>
                <article className="stat-card"><span className="stat-label">Ежемесячный доход</span><div className="stat-value">{formatCurrency(2486400)} <span className="stat-trend">↗ 16,4%</span></div><span className="stat-footnote">регулярные платежи</span></article>
            </section>
            <section className="table-card">
                <div className="table-card-heading"><div><Text variant="subheader-2">Все клиенты</Text><span className="result-count">{customers.length} записей</span></div><div className="table-actions"><span className="last-updated"><span className="sync-dot"/>Обновлено только что</span><Button view="outlined" size="m">Фильтры <span className="filter-count">2</span></Button><Button view="outlined" size="m">Экспорт</Button></div></div>
                {selectedIds.length > 0 && <div className="selection-bar"><span>Выбрано: <b>{selectedIds.length}</b></span><Button view="flat" size="s" onClick={() => setSelectedIds([])}>Снять выделение</Button></div>}
                <div className="table-scroll"><SelectableTable data={pageData} columns={columns} getRowId="id" selectedIds={selectedIds} onSelectionChange={setSelectedIds} sortState={sortState} onSortStateChange={(next) => {setSortState(next); setPage(1);}} disableDataSorting emptyMessage="Клиентов пока нет" edgePadding={false}/></div>
                <footer className="table-footer"><span className="range-label">Показано <b>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, customers.length)}</b> из <b>{customers.length}</b> клиентов</span><Pagination page={page} pageSize={pageSize} total={customers.length} pageSizeOptions={[8, 16, 24]} onUpdate={(nextPage, nextPageSize) => {setPage(nextPage); setPageSize(nextPageSize);}}/></footer>
            </section>
            <div className="page-note">Данные обновляются автоматически <span>·</span> Последняя синхронизация сегодня, 10:42</div>
        </section>
    </main>;
}
