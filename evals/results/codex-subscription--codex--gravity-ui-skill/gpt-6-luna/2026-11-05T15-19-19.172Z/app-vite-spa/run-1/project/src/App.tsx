import {useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {ChartColumn, ChartPie, Gear, House, Sun} from '@gravity-ui/icons';
import {Button, Card, Switch, Text, ThemeProvider} from '@gravity-ui/uikit';
import './app.css';

type Page = 'overview' | 'reports' | 'settings';

const pageCopy: Record<Page, {title: string; eyebrow: string; description: string}> = {
  overview: {title: 'Обзор', eyebrow: 'СРЕДА, 5 НОЯБРЯ', description: 'Коротко о том, что происходит в вашем пространстве.'},
  reports: {title: 'Отчёты', eyebrow: 'АНАЛИТИКА', description: 'Следите за динамикой и находите новые точки роста.'},
  settings: {title: 'Настройки', eyebrow: 'ПРОСТРАНСТВО', description: 'Настройте внешний вид приложения под себя.'},
};

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [page, setPage] = useState<Page>('overview');
  const [compact, setCompact] = useState(false);
  const copy = pageCopy[page];

  const menuItems = [
    {id: 'overview', title: 'Обзор', icon: House, current: page === 'overview', onItemClick: () => setPage('overview')},
    {id: 'reports', title: 'Отчёты', icon: ChartColumn, current: page === 'reports', onItemClick: () => setPage('reports')},
    {id: 'settings', title: 'Настройки', icon: Gear, current: page === 'settings', onItemClick: () => setPage('settings')},
  ];

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        className="app-shell"
        logo={{text: 'northstar', href: '#overview'}}
        compact={compact}
        onChangeCompact={setCompact}
        menuItems={menuItems}
        renderContent={() => (
          <main className="workspace">
            <header className="topbar">
              <div className="breadcrumb"><span>Рабочее пространство</span><span className="breadcrumb-sep">/</span><strong>{copy.title}</strong></div>
              <div className="topbar-right"><span className="live-dot" /> Все системы в норме <span className="avatar">А</span></div>
            </header>
            <div className="page-content">
              <div className="page-heading">
                <div><Text variant="caption-2" className="eyebrow">{copy.eyebrow}</Text><Text variant="header-1">{copy.title}</Text><Text variant="body-1" color="secondary">{copy.description}</Text></div>
                <Button view="outlined" size="l">Последние 30 дней <span className="button-caret">⌄</span></Button>
              </div>

              {page === 'overview' && <Overview />}
              {page === 'reports' && <Reports />}
              {page === 'settings' && <section className="settings-grid">
                <Card className="settings-card" view="filled"><div className="card-inner"><div className="setting-icon"><Sun width={18} height={18}/></div><Text variant="subheader-2">Внешний вид</Text><Text variant="body-2" color="secondary">Выберите оформление интерфейса.</Text><div className="theme-choice"><div><Text variant="body-2">Тёмная тема</Text><Text variant="caption-2" color="secondary">Комфортнее при слабом освещении</Text></div><Switch checked={theme === 'dark'} onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')} /></div></div></Card>
                <Card className="settings-card" view="filled"><div className="card-inner"><div className="setting-icon"><Gear width={18} height={18}/></div><Text variant="subheader-2">Ваше пространство</Text><Text variant="body-2" color="secondary">Основные параметры аккаунта и команды.</Text><Button view="flat" className="settings-action">Управление пространством <span>↗</span></Button></div></Card>
              </section>}
              <footer className="page-footer">Синхронизировано только что <span>·</span> Northstar Analytics</footer>
            </div>
          </main>
        )}
      />
    </ThemeProvider>
  );
}

function Overview() {
  return <>
    <section className="metric-grid">
      <Metric title="Активные пользователи" value="12 486" change="↑ 12,8%" note="к предыдущему периоду" trend="up" />
      <Metric title="Конверсия" value="4,82%" change="↑ 0,6%" note="к предыдущему периоду" trend="up" />
      <Metric title="Средний чек" value="₽ 3 240" change="↓ 2,1%" note="к предыдущему периоду" trend="down" />
    </section>
    <section className="content-grid">
      <Card className="chart-card" view="filled"><div className="card-inner"><div className="section-title"><div><Text variant="subheader-2">Активность</Text><Text variant="caption-2" color="secondary">Посещения за последние 7 дней</Text></div><span className="chart-legend"><i/> Посещения</span></div><div className="chart-area"><div className="chart-ylabels"><span>8k</span><span>6k</span><span>4k</span><span>2k</span><span>0</span></div><div className="chart-plot"><div className="chart-gridlines"><i/><i/><i/><i/><i/></div><svg viewBox="0 0 720 190" preserveAspectRatio="none" aria-label="График посещений"><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--g-color-base-brand)" stopOpacity=".22"/><stop offset="100%" stopColor="var(--g-color-base-brand)" stopOpacity="0"/></linearGradient></defs><path className="chart-fill" d="M0 144 C35 137 46 118 82 126 S130 154 165 119 S222 104 247 111 S295 72 330 89 S373 115 412 78 S463 69 496 80 S542 57 578 66 S625 38 661 52 S700 25 720 30 V190 H0Z"/><path className="chart-line" d="M0 144 C35 137 46 118 82 126 S130 154 165 119 S222 104 247 111 S295 72 330 89 S373 115 412 78 S463 69 496 80 S542 57 578 66 S625 38 661 52 S700 25 720 30"/></svg><div className="chart-xlabels"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div></div></div></div></Card>
      <Card className="source-card" view="filled"><div className="card-inner"><div className="section-title"><div><Text variant="subheader-2">Источники</Text><Text variant="caption-2" color="secondary">Каналы трафика</Text></div><ChartPie width={18} height={18} className="muted-icon"/></div><div className="source-list"><Source name="Прямые переходы" value="42%" width="42%"/><Source name="Поиск" value="31%" width="31%"/><Source name="Социальные сети" value="18%" width="18%"/><Source name="Рекомендации" value="9%" width="9%"/></div><Button view="flat" className="source-link">Подробный отчёт <span>→</span></Button></div></Card>
    </section>
    <section className="insight-banner"><div className="insight-symbol">✳</div><div><Text variant="subheader-2">Хорошая неделя!</Text><Text variant="body-2" color="secondary">Активность выросла на 12,8% — больше всего новых пользователей пришло из поиска.</Text></div><Button view="flat">Посмотреть детали <span>→</span></Button></section>
  </>;
}

function Reports() {
  return <section className="reports-grid"><Card className="report-card" view="filled"><div className="card-inner"><div className="report-mark"><ChartColumn width={20} height={20}/></div><Text variant="subheader-2">Аудитория</Text><Text variant="body-2" color="secondary">Рост, вовлечённость и поведение пользователей.</Text><Button view="flat">Открыть отчёт <span>→</span></Button></div></Card><Card className="report-card" view="filled"><div className="card-inner"><div className="report-mark"><ChartPie width={20} height={20}/></div><Text variant="subheader-2">Источники трафика</Text><Text variant="body-2" color="secondary">Откуда приходят ваши посетители.</Text><Button view="flat">Открыть отчёт <span>→</span></Button></div></Card><Card className="report-card" view="filled"><div className="card-inner"><div className="report-mark"><span>₽</span></div><Text variant="subheader-2">Доход и конверсия</Text><Text variant="body-2" color="secondary">Ключевые финансовые показатели.</Text><Button view="flat">Открыть отчёт <span>→</span></Button></div></Card></section>;
}

function Metric({title, value, change, note, trend}: {title: string; value: string; change: string; note: string; trend: 'up' | 'down'}) {
  return <Card className="metric-card" view="filled"><div className="card-inner"><Text variant="body-2" color="secondary">{title}</Text><Text variant="display-4" className="metric-value">{value}</Text><div className="metric-foot"><span className={`metric-change ${trend}`}>{change}</span><Text variant="caption-2" color="secondary">{note}</Text></div></div></Card>;
}

function Source({name, value, width}: {name: string; value: string; width: string}) {
  return <div className="source-row"><div className="source-top"><Text variant="body-2">{name}</Text><Text variant="body-2" color="secondary">{value}</Text></div><div className="source-track"><i style={{width}}/></div></div>;
}
