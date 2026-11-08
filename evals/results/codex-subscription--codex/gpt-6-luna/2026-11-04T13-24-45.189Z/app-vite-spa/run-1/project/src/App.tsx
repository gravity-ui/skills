import { useEffect, useState } from 'react';
import './App.css';

type Page = 'overview' | 'activity' | 'goals';

const transactions = [
  { name: 'Перекрёсток', detail: 'Продукты · сегодня, 14:32', amount: '− 2 480 ₽', icon: '🛍️', kind: 'expense' },
  { name: 'Зарплата', detail: 'Доход · сегодня, 09:15', amount: '+ 86 000 ₽', icon: '↗', kind: 'income' },
  { name: 'Яндекс Go', detail: 'Транспорт · вчера, 20:48', amount: '− 640 ₽', icon: '🚕', kind: 'expense' },
  { name: 'Кофемания', detail: 'Кафе · вчера, 11:20', amount: '− 890 ₽', icon: '☕', kind: 'expense' },
  { name: 'Подписка на музыку', detail: 'Подписки · 2 ноября', amount: '− 299 ₽', icon: '♫', kind: 'expense' },
];

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'overview', label: 'Обзор', icon: 'grid' },
  { id: 'activity', label: 'Операции', icon: 'list' },
  { id: 'goals', label: 'Цели', icon: 'target' },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  if (name === 'grid') return <svg {...common}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>;
  if (name === 'list') return <svg {...common}><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".75" fill="currentColor"/><circle cx="4" cy="12" r=".75" fill="currentColor"/><circle cx="4" cy="18" r=".75" fill="currentColor"/></svg>;
  if (name === 'target') return <svg {...common}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".7" fill="currentColor"/></svg>;
  if (name === 'sun') return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>;
  if (name === 'moon') return <svg {...common}><path d="M20.3 15.3A8.5 8.5 0 0 1 8.7 3.7 8.7 8.7 0 1 0 20.3 15.3Z"/></svg>;
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6"/></svg>;
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
  if (name === 'chevron') return <svg {...common}><path d="m9 18 6-6-6-6"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 1.5"/></svg>;
}

function App() {
  const [page, setPage] = useState<Page>('overview');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem('finch-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });

  useEffect(() => {
    try { localStorage.setItem('finch-theme', theme); } catch { /* storage may be unavailable */ }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light');
  const pageTitle = page === 'overview' ? 'Обзор' : page === 'activity' ? 'Операции' : 'Мои цели';

  return (
    <div className={`app-shell theme-${theme}`}>
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); setPage('overview'); }}>
          <span className="brand-mark"><span /></span><span>finch<span className="brand-dot">.</span></span>
        </a>

        <div className="workspace-label">ЛИЧНЫЙ КАБИНЕТ</div>
        <nav className="main-nav" aria-label="Главная навигация">
          {navItems.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
            <Icon name={item.icon} /><span>{item.label}</span>{item.id === 'activity' && <span className="nav-count">12</span>}
          </button>)}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-spark">✦</div><strong>Планы на будущее</strong><p>Маленькие шаги ведут к большим целям.</p><button onClick={() => setPage('goals')}>Мои цели <Icon name="arrow" size={15} /></button></div>
          <button className="profile"><span className="avatar">А</span><span className="profile-copy"><strong>Анастасия</strong><small>Личный аккаунт</small></span><span className="profile-more">···</span></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb"><span>Мои финансы</span><Icon name="chevron" size={14} /><strong>{pageTitle}</strong></div><div className="top-actions"><span className="today-label">Среда, 4 ноября</span><button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={17} /><span>{theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}</span></button></div></header>

        <div className="page-content">
          {page === 'overview' && <Overview onNavigate={setPage} />}
          {page === 'activity' && <Activity />}
          {page === 'goals' && <Goals />}
        </div>
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Overview({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return <>
    <PageHeading eyebrow="ВАШИ ФИНАНСЫ · НОЯБРЬ 2026" title="Добрый день, Анастасия 👋" description="Вот как выглядят ваши финансы в этом месяце." action={<button className="primary-button" onClick={() => onNavigate('activity')}><Icon name="plus" size={17} /> Добавить операцию</button>} />

    <section className="summary-grid" aria-label="Сводка за месяц">
      <article className="summary-card balance-card"><div className="card-topline"><span>Общий баланс</span><span className="card-icon balance-icon">◈</span></div><div className="summary-value">₽ 124 580<span className="kopecks">.00</span></div><div className="card-foot"><span className="positive-pill">↗ 8,4%</span><span>к прошлому месяцу</span></div><div className="balance-sparkline"><svg viewBox="0 0 220 48" preserveAspectRatio="none"><path d="M0 39 C18 35 20 30 37 33 S58 23 71 27 S93 17 111 23 S131 16 146 18 S164 7 180 14 S199 7 220 3"/><path className="spark-fill" d="M0 39 C18 35 20 30 37 33 S58 23 71 27 S93 17 111 23 S131 16 146 18 S164 7 180 14 S199 7 220 3 V48 H0Z"/></svg></div></article>
      <article className="summary-card"><div className="card-topline"><span>Доходы</span><span className="card-icon income-icon">↘</span></div><div className="summary-value">₽ 98 000</div><div className="card-foot"><span className="positive-pill">↗ 12,2%</span><span>к прошлому месяцу</span></div><div className="mini-bars income-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
      <article className="summary-card"><div className="card-topline"><span>Расходы</span><span className="card-icon expense-icon">↗</span></div><div className="summary-value">₽ 34 280</div><div className="card-foot"><span className="neutral-pill">↘ 3,1%</span><span>к прошлому месяцу</span></div><div className="mini-bars expense-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
    </section>

    <section className="content-grid">
      <article className="panel spending-panel"><div className="panel-heading"><div><h2>Расходы по категориям</h2><p>Куда уходят ваши деньги</p></div><button className="select-button">Этот месяц <span>⌄</span></button></div><div className="spending-content"><div className="donut-wrap"><div className="donut"><div className="donut-center"><strong>₽34 280</strong><span>всего</span></div></div></div><div className="legend-list"><div className="legend-row"><span className="legend-dot dot-home"/><span>Дом и счета</span><strong>₽ 14 200</strong><small>41%</small></div><div className="legend-row"><span className="legend-dot dot-food"/><span>Продукты</span><strong>₽ 9 480</strong><small>28%</small></div><div className="legend-row"><span className="legend-dot dot-life"/><span>Образ жизни</span><strong>₽ 6 100</strong><small>18%</small></div><div className="legend-row"><span className="legend-dot dot-other"/><span>Другое</span><strong>₽ 4 500</strong><small>13%</small></div></div></div></article>
      <article className="panel goals-panel"><div className="panel-heading"><div><h2>Цели накоплений</h2><p>Вы уже на верном пути</p></div><button className="icon-button" aria-label="Все цели" onClick={() => onNavigate('goals')}><Icon name="arrow" size={17} /></button></div><GoalProgress title="Поездка в Японию" current="₽ 86 000" total="₽ 150 000" percent={57} color="green" emoji="✈"/><GoalProgress title="Новый ноутбук" current="₽ 42 500" total="₽ 80 000" percent={53} color="purple" emoji="⌘"/><button className="text-link" onClick={() => onNavigate('goals')}>Все цели <Icon name="arrow" size={15} /></button></article>
    </section>

    <section className="panel transactions-panel"><div className="panel-heading"><div><h2>Последние операции</h2><p>Ваши недавние движения по счёту</p></div><button className="text-link" onClick={() => onNavigate('activity')}>Все операции <Icon name="arrow" size={15} /></button></div><TransactionTable compact /></section>
  </>;
}

function GoalProgress({ title, current, total, percent, color, emoji }: { title: string; current: string; total: string; percent: number; color: string; emoji: string }) {
  return <div className="goal-progress"><div className={`goal-emoji ${color}`}>{emoji}</div><div className="goal-info"><div className="goal-title-row"><strong>{title}</strong><span>{percent}%</span></div><div className="progress-track"><i className={color} style={{ width: `${percent}%` }} /></div><div className="goal-numbers"><strong>{current}</strong><span>из {total}</span></div></div></div>;
}

function Activity() {
  const [filter, setFilter] = useState('Все операции');
  return <><PageHeading eyebrow="ВАШИ ФИНАНСЫ · НОЯБРЬ 2026" title="Операции" description="Все движения по вашему счёту в одном месте." action={<button className="primary-button"><Icon name="plus" size={17} /> Добавить операцию</button>} /><section className="panel activity-panel"><div className="activity-toolbar"><div className="filter-tabs">{['Все операции', 'Доходы', 'Расходы'].map((label) => <button key={label} className={filter === label ? 'selected' : ''} onClick={() => setFilter(label)}>{label}</button>)}</div><button className="select-button">⌕ <span>Поиск</span></button></div><TransactionTable filter={filter} /><div className="table-footer"><span>Показано 5 из 12 операций</span><button className="select-button">Загрузить ещё <span>↓</span></button></div></section></>;
}

function TransactionTable({ compact = false, filter = 'Все операции' }: { compact?: boolean; filter?: string }) {
  const filtered = transactions.filter((item) => filter === 'Все операции' || (filter === 'Доходы' ? item.kind === 'income' : item.kind === 'expense'));
  return <div className="transaction-list"><div className="transaction-head"><span>ОПЕРАЦИЯ</span><span>КАТЕГОРИЯ</span><span>ДАТА</span><span>СУММА</span></div>{(compact ? filtered.slice(0, 4) : filtered).map((item) => <div className="transaction-row" key={item.name}><div className="transaction-name"><span className={`transaction-icon ${item.kind}`}>{item.icon}</span><strong>{item.name}</strong></div><span className="transaction-category">{item.detail.split(' · ')[0]}</span><span className="transaction-date">{item.detail.split(' · ')[1]}</span><strong className={`transaction-amount ${item.kind}`}>{item.amount}</strong></div>)}</div>;
}

function Goals() {
  return <><PageHeading eyebrow="ВАШИ ФИНАНСЫ · НОЯБРЬ 2026" title="Мои цели" description="Большие мечты начинаются с небольших накоплений." action={<button className="primary-button"><Icon name="plus" size={17} /> Новая цель</button>} /><section className="goal-summary-banner"><div className="goal-banner-mark">✦</div><div><strong>Вы накопили ₽ 128 500</strong><span>на все цели вместе · отличный темп!</span></div><div className="banner-progress"><div className="progress-track"><i style={{ width: '48%' }} /></div><small>48% от общей суммы</small></div></section><div className="goals-grid"><GoalCard title="Поездка в Японию" emoji="✈" current="₽ 86 000" total="₽ 150 000" percent={57} color="green" note="Вылет в апреле 2027"/><GoalCard title="Новый ноутбук" emoji="⌘" current="₽ 42 500" total="₽ 80 000" percent={53} color="purple" note="До конца этого года"/><GoalCard title="Подушка безопасности" emoji="☂" current="₽ 0" total="₽ 100 000" percent={0} color="yellow" note="Когда-нибудь пригодится" add/></div></>;
}

function GoalCard({ title, emoji, current, total, percent, color, note, add = false }: { title: string; emoji: string; current: string; total: string; percent: number; color: string; note: string; add?: boolean }) {
  return <article className={`goal-card ${add ? 'new-goal' : ''}`}><div className={`goal-card-emoji ${color}`}>{emoji}</div><h2>{title}</h2><p>{note}</p><div className="goal-card-progress"><div className="goal-title-row"><span>Накоплено</span><strong>{percent}%</strong></div><div className="progress-track"><i className={color} style={{ width: `${percent}%` }} /></div><div className="goal-numbers"><strong>{current}</strong><span>из {total}</span></div></div>{add ? <button className="text-link">Создать цель <Icon name="arrow" size={15} /></button> : <button className="goal-add-button"><Icon name="plus" size={16} /> Добавить деньги</button>}</article>;
}

export { App };
