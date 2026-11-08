import { useMemo, useState } from 'react';
import {
  Button,
  Pagination,
  Table,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';
import './App.css';

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Активен' | 'Приглашён' | 'Неактивен';
  lastActive: string;
  joined: string;
};
type SortState = { column: string; order: 'asc' | 'desc' }[];

const members: Member[] = [
  { id: 'm-01', name: 'Анна Смирнова', email: 'anna.smirnova@northstar.io', role: 'Администратор', status: 'Активен', lastActive: 'Сейчас', joined: '12 мая 2023' },
  { id: 'm-02', name: 'Михаил Волков', email: 'm.volkov@northstar.io', role: 'Разработчик', status: 'Активен', lastActive: '5 минут назад', joined: '18 мая 2023' },
  { id: 'm-03', name: 'Елена Кузнецова', email: 'elena.k@northstar.io', role: 'Дизайнер', status: 'Активен', lastActive: 'Сегодня, 10:42', joined: '24 мая 2023' },
  { id: 'm-04', name: 'Дмитрий Орлов', email: 'd.orlov@northstar.io', role: 'Аналитик', status: 'Приглашён', lastActive: '—', joined: 'Вчера' },
  { id: 'm-05', name: 'Ольга Петрова', email: 'olga.p@northstar.io', role: 'Разработчик', status: 'Активен', lastActive: 'Сегодня, 09:18', joined: '2 июн. 2023' },
  { id: 'm-06', name: 'Алексей Морозов', email: 'alex.m@northstar.io', role: 'Менеджер', status: 'Неактивен', lastActive: '3 дня назад', joined: '7 июн. 2023' },
  { id: 'm-07', name: 'Мария Лебедева', email: 'm.lebedeva@northstar.io', role: 'Дизайнер', status: 'Активен', lastActive: 'Вчера, 18:30', joined: '14 июн. 2023' },
  { id: 'm-08', name: 'Иван Соколов', email: 'ivan.s@northstar.io', role: 'Разработчик', status: 'Активен', lastActive: 'Вчера, 16:04', joined: '19 июн. 2023' },
  { id: 'm-09', name: 'София Новикова', email: 's.novikova@northstar.io', role: 'Аналитик', status: 'Приглашён', lastActive: '—', joined: '21 июн. 2023' },
  { id: 'm-10', name: 'Кирилл Фёдоров', email: 'k.fedorov@northstar.io', role: 'Разработчик', status: 'Активен', lastActive: 'Понедельник, 12:15', joined: '4 июл. 2023' },
  { id: 'm-11', name: 'Виктория Павлова', email: 'v.pavlova@northstar.io', role: 'Менеджер', status: 'Активен', lastActive: 'Понедельник, 11:02', joined: '10 июл. 2023' },
  { id: 'm-12', name: 'Павел Семёнов', email: 'p.semenov@northstar.io', role: 'Аналитик', status: 'Неактивен', lastActive: '2 недели назад', joined: '15 июл. 2023' },
  { id: 'm-13', name: 'Алина Захарова', email: 'a.zakharova@northstar.io', role: 'Дизайнер', status: 'Активен', lastActive: 'Сегодня, 08:51', joined: '20 июл. 2023' },
  { id: 'm-14', name: 'Никита Васильев', email: 'n.vasiliev@northstar.io', role: 'Разработчик', status: 'Активен', lastActive: 'Сегодня, 08:22', joined: '1 авг. 2023' },
  { id: 'm-15', name: 'Дарья Михайлова', email: 'd.mikhailova@northstar.io', role: 'Менеджер', status: 'Приглашён', lastActive: '—', joined: '8 авг. 2023' },
  { id: 'm-16', name: 'Роман Андреев', email: 'r.andreev@northstar.io', role: 'Разработчик', status: 'Активен', lastActive: 'Вчера, 19:46', joined: '11 авг. 2023' },
  { id: 'm-17', name: 'Полина Григорьева', email: 'p.grigorieva@northstar.io', role: 'Аналитик', status: 'Активен', lastActive: 'Вчера, 17:20', joined: '17 авг. 2023' },
  { id: 'm-18', name: 'Артём Николаев', email: 'a.nikolaev@northstar.io', role: 'Разработчик', status: 'Неактивен', lastActive: '8 дней назад', joined: '22 авг. 2023' },
];

const sortableText = (a: Member, b: Member, key: keyof Member) =>
  String(a[key]).localeCompare(String(b[key]), 'ru');

const columns: TableColumnConfig<Member>[] = [
  {
    id: 'name',
    name: 'Участник',
    width: '30%',
    meta: { sort: (a: Member, b: Member) => sortableText(a, b, 'name'), defaultSortOrder: 'asc' },
    template: (member) => (
      <div className="member-cell">
        <span className={`member-avatar member-avatar--${Number(member.id.slice(-2)) % 5}`} aria-hidden="true">
          {member.name.split(' ').map((part) => part[0]).join('')}
        </span>
        <span className="member-copy">
          <span className="member-name">{member.name}</span>
          <span className="member-email">{member.email}</span>
        </span>
      </div>
    ),
  },
  { id: 'role', name: 'Роль', width: '19%', meta: { sort: (a: Member, b: Member) => sortableText(a, b, 'role') } },
  {
    id: 'status',
    name: 'Статус',
    width: '15%',
    meta: { sort: (a: Member, b: Member) => sortableText(a, b, 'status') },
    template: (member) => <span className={`member-status member-status--${member.status === 'Активен' ? 'active' : member.status === 'Приглашён' ? 'pending' : 'inactive'}`}><i />{member.status}</span>,
  },
  { id: 'lastActive', name: 'Последняя активность', width: '21%', meta: { sort: (a: Member, b: Member) => sortableText(a, b, 'lastActive') } },
  { id: 'joined', name: 'Добавлен', width: '15%', meta: { sort: (a: Member, b: Member) => sortableText(a, b, 'joined') } },
];

const SelectableSortableTable = withTableSelection(withTableSorting(Table<Member>));

export function App() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<SortState>([{ column: 'name', order: 'asc' }]);

  const sortedMembers = useMemo(() => {
    if (sortState.length === 0) return members;
    const [{ column, order }] = sortState;
    return [...members].sort((a, b) => {
      const result = sortableText(a, b, column as keyof Member);
      return order === 'asc' ? result : -result;
    });
  }, [sortState]);
  const pageMembers = sortedMembers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="workspace">
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark">n</span><span>northstar</span></div>
        <div className="topbar-right"><span className="workspace-label">Рабочее пространство</span><span className="topbar-avatar">АС</span></div>
      </header>

      <div className="page-shell">
        <div className="breadcrumbs"><span>Настройки</span><span className="breadcrumb-divider">/</span><span>Команда</span></div>
        <section className="page-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> УПРАВЛЕНИЕ ДОСТУПОМ</div>
            <h1>Участники команды</h1>
            <p className="page-description">Управляйте доступом и ролями участников рабочего пространства.</p>
          </div>
          <Button view="action" size="l" onClick={() => undefined}>+ Пригласить участника</Button>
        </section>

        <section className="overview" aria-label="Сводка по команде">
          <div className="overview-icon overview-icon--team"><span>✳</span></div>
          <div className="overview-stat"><span className="overview-label">Всего участников</span><strong>{members.length}</strong></div>
          <div className="overview-divider" />
          <div className="overview-stat"><span className="overview-label">Активных</span><strong>{members.filter((member) => member.status === 'Активен').length}<span className="stat-unit"> человек</span></strong></div>
          <div className="overview-divider" />
          <div className="overview-stat"><span className="overview-label">Ожидают приглашения</span><strong>{members.filter((member) => member.status === 'Приглашён').length}<span className="stat-unit"> человека</span></strong></div>
          <div className="overview-decoration" aria-hidden="true"><span /><span /><span /></div>
        </section>

        <section className="table-card" aria-label="Список участников команды">
          <div className="table-card-header">
            <div>
              <h2>Все участники <span className="count-chip">{members.length}</span></h2>
              <p>Список людей с доступом к вашему пространству</p>
            </div>
            <div className="table-actions">
              {selectedIds.length > 0 && <span className="selection-note">Выбрано: {selectedIds.length}</span>}
              <Button view="outlined" size="m" onClick={() => setSelectedIds([])} disabled={selectedIds.length === 0}>Снять выделение</Button>
            </div>
          </div>
          <div className="table-scroll">
            <SelectableSortableTable
              data={pageMembers}
              columns={columns}
              getRowId="id"
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              sortState={sortState}
              onSortStateChange={(nextSort) => {
                setSortState(nextSort as SortState);
              }}
              disableDataSorting
              className="members-table"
              emptyMessage="Участников пока нет"
            />
          </div>
          <footer className="table-footer">
            <span className="range-label">Показано <strong>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, members.length)}</strong> из <strong>{members.length}</strong> участников</span>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={members.length}
              pageSizeOptions={[6, 12, 18]}
              showInput={false}
              onUpdate={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          </footer>
        </section>
        <p className="page-footnote"><span className="footnote-icon">i</span> Изменения ролей и доступов вступают в силу сразу.</p>
      </div>
    </main>
  );
}
