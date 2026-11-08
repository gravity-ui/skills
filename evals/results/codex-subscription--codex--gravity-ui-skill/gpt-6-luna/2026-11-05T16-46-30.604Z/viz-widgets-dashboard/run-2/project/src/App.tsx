import {useCallback, useMemo, useState} from 'react';
import {Button} from '@gravity-ui/uikit';
import {DashKit, type DashKitProps} from '@gravity-ui/dashkit';
import './App.css';

function Glyph({children}: {children: React.ReactNode}) { return <span className="glyph" aria-hidden="true">{children}</span>; }

const points = [30, 25, 28, 20, 24, 17, 20, 12, 16, 11, 14, 7, 11, 5, 9, 4, 7, 2];

function Sparkline({color = 'currentColor', fill = false}: {color?: string; fill?: boolean}) {
  const path = points.map((y, i) => `${i === 0 ? 'M' : 'L'} ${(i / (points.length - 1)) * 320} ${y * 3}`).join(' ');
  return <svg className="sparkline" viewBox="0 0 320 100" preserveAspectRatio="none" aria-hidden="true">
    {fill && <path d={`${path} L 320 100 L 0 100 Z`} fill="url(#chart-fill)" />}
    {fill && <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".2"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>}
    <path d={path} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function Widget({data}: {data: Record<string, unknown>}) {
  const type = String(data.kind);
  if (type === 'metric') {
    return <section className="widget metric-widget"><div className="widget-label">{String(data.label)}</div><div className="metric-value">{String(data.value)}</div><div className="metric-bottom"><span className="change-positive">↗ {String(data.change)}</span><span className="period-label">vs. прошлый месяц</span></div><div className="metric-spark"><Sparkline color="var(--g-color-line-brand)" /></div></section>;
  }
  if (type === 'revenue') {
    return <section className="widget chart-widget"><header className="widget-heading"><div><div className="widget-title">Выручка</div><div className="widget-subtitle">Динамика за последние 30 дней</div></div><Button view="flat" size="s" aria-label="Дополнительные действия"><Glyph>···</Glyph></Button></header><div className="chart-summary"><strong>₽ 2 840 600</strong><span className="change-positive">↗ 12,8%</span></div><div className="chart-legend"><span><i className="legend-dot legend-purple"/>Этот период</span><span><i className="legend-dot legend-gray"/>Прошлый период</span></div><div className="chart-main"><div className="chart-y-labels"><span>3 млн</span><span>2 млн</span><span>1 млн</span><span>0</span></div><div className="chart-plot"><div className="chart-gridlines"><i/><i/><i/><i/></div><Sparkline color="var(--g-color-line-brand)" fill/><svg className="comparison-line" viewBox="0 0 320 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 74 L20 69 L40 78 L60 58 L80 67 L100 61 L120 73 L140 54 L160 61 L180 44 L200 52 L220 62 L240 43 L260 50 L280 37 L300 46 L320 28" fill="none" stroke="var(--g-color-line-generic)" strokeWidth="2" strokeDasharray="5 5"/></svg><div className="chart-x-labels"><span>1 окт</span><span>8 окт</span><span>15 окт</span><span>22 окт</span><span>30 окт</span></div></div></div></section>;
  }
  if (type === 'channels') {
    const channels = [['Прямые переходы', '42,8%', 'bar-purple'], ['Органический поиск', '31,2%', 'bar-blue'], ['Социальные сети', '18,6%', 'bar-green'], ['Реферальные', '7,4%', 'bar-orange']];
    return <section className="widget channels-widget"><header className="widget-heading"><div><div className="widget-title">Источники трафика</div><div className="widget-subtitle">Распределение посетителей</div></div><Button view="flat" size="s" aria-label="Дополнительные действия"><Glyph>···</Glyph></Button></header><div className="donut-area"><div className="donut"><div className="donut-center"><strong>24 891</strong><span>посетителей</span></div></div></div><div className="channel-list">{channels.map(([name, value, klass]) => <div className="channel-row" key={name}><span className={`channel-mark ${klass}`} /><span className="channel-name">{name}</span><strong>{value}</strong></div>)}</div></section>;
  }
  if (type === 'activity') {
    const rows = [['Новый заказ', 'Заказ #4829 · Анна Смирнова', '2 мин назад', 'activity-purple'], ['Оплата получена', '₽ 12 400 · Заказ #4827', '18 мин назад', 'activity-green'], ['Новый пользователь', 'Михаил Козлов зарегистрировался', '42 мин назад', 'activity-blue'], ['Возврат оформлен', 'Заказ #4812 · ₽ 3 200', '1 час назад', 'activity-orange']];
    return <section className="widget activity-widget"><header className="widget-heading"><div><div className="widget-title">Последние события</div><div className="widget-subtitle">Что происходит в магазине</div></div><Button view="flat" size="s" aria-label="Дополнительные действия"><Glyph>···</Glyph></Button></header><div className="activity-list">{rows.map(([title, detail, time, color]) => <div className="activity-row" key={title}><span className={`activity-icon ${color}`}>{title === 'Оплата получена' ? '₽' : title === 'Новый заказ' ? '+' : title === 'Возврат оформлен' ? '↩' : '·'}</span><div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div><time>{time}</time></div>)}</div><Button view="flat" size="s" className="all-activity">Все события <Glyph>↗</Glyph></Button></section>;
  }
  return <section className="widget orders-widget"><header className="widget-heading"><div><div className="widget-title">Заказы по дням</div><div className="widget-subtitle">Количество заказов за неделю</div></div><Button view="flat" size="s" aria-label="Дополнительные действия"><Glyph>···</Glyph></Button></header><div className="bar-chart">{[['Пн', 46], ['Вт', 68], ['Ср', 54], ['Чт', 82], ['Пт', 62], ['Сб', 95], ['Вс', 72]].map(([day, height]) => <div className="bar-column" key={day}><span style={{height: `${height}%`}}/><small>{day}</small></div>)}</div><div className="orders-footnote"><strong>1 284</strong><span>заказов за неделю</span><span className="change-positive">↗ 8,4%</span></div></section>;
}

const initialConfig: DashKitProps['config'] = {
  salt: 'commerce-dashboard', counter: 6,
  items: [
    ...[['sales','Продажи','₽ 8,42 млн','14,2%'],['orders','Заказы','1 284','8,4%'],['average','Средний чек','₽ 6 558','5,1%'],['conversion','Конверсия','3,62%','0,8%']].map(([id,label,value,change]) => ({id,data:{kind:'metric',label,value,change},type:'commerce-widget',namespace:'default'})),
    ...[['revenue','revenue'],['channels','channels'],['activity','activity'],['orders-chart','orders']].map(([id,kind]) => ({id,data:{kind},type:'commerce-widget',namespace:'default'})),
  ],
  layout: [
    {i:'sales',x:0,y:0,w:6,h:3},{i:'orders',x:6,y:0,w:6,h:3},{i:'average',x:12,y:0,w:6,h:3},{i:'conversion',x:18,y:0,w:6,h:3},
    {i:'revenue',x:0,y:3,w:14,h:8},{i:'channels',x:14,y:3,w:10,h:8},
    {i:'activity',x:0,y:11,w:14,h:7},{i:'orders-chart',x:14,y:11,w:10,h:7},
  ], aliases:{},connections:[],
};

DashKit.setSettings({gridLayout:{cols:{lg:24,md:16,sm:8,xs:4,xxs:2},breakpoints:{lg:1200,md:996,sm:768,xs:480,xxs:0},rowHeight:46,margin:[16,16],containerPadding:[0,0]}});
DashKit.registerPlugins({type:'commerce-widget',defaultLayout:{w:6,h:4},renderer:(props) => <Widget data={props.data} />});

export function App() {
  const [config,setConfig]=useState(initialConfig);
  const [editing,setEditing]=useState(false);
  const [period,setPeriod]=useState('Последние 30 дней');
  const onChange=useCallback(({config:next}: {config:DashKitProps['config']})=>setConfig(next),[]);
  const addWidget=useCallback(()=>{
    const id=`widget-${config.counter}`;
    const nextY=config.layout.reduce((bottom,item)=>Math.max(bottom,item.y+item.h),0);
    setConfig({...config,counter:config.counter+1,items:[...config.items,{id,data:{kind:'activity'},type:'commerce-widget',namespace:'default'}],layout:[...config.layout,{i:id,x:0,y:nextY,w:12,h:7}]});
    setEditing(true);
  },[config]);
  const props=useMemo(()=>({config,editMode:editing,onChange}),[config,editing,onChange]);
  return <main className="dashboard-shell"><header className="topbar"><div className="brand"><div className="brand-mark">n</div><span>northstar</span><span className="brand-divider"/><span className="brand-area">Аналитика</span></div><div className="topbar-right"><span className="live-status"><i/>Все системы работают</span><Button view="flat" size="m" aria-label="Настройки"><Glyph>⚙</Glyph></Button><div className="user-avatar">АС</div></div></header>
  <div className="page-content"><div className="breadcrumbs"><span>Рабочее пространство</span><b>/</b><strong>Обзор</strong></div><section className="page-heading"><div><div className="eyebrow">СРЕДА, 5 НОЯБРЯ 2026</div><h1>Обзор</h1><p>Доброе утро! Вот что происходит с вашим магазином.</p></div><div className="heading-actions"><Button view="outlined" size="l" onClick={()=>setEditing(!editing)}><Glyph>{editing?"⠿":"⚙"}</Glyph>{editing?'Готово':'Настроить'}</Button><Button view="action" size="l" onClick={addWidget}><Glyph>＋</Glyph>Добавить виджет</Button></div></section>
  <div className="dashboard-toolbar"><div className="toolbar-left"><span className="dashboard-name">Общий обзор</span><span className="saved-indicator"><i/>Сохранено</span></div><div className="toolbar-right"><Button view="outlined" size="m" onClick={()=>setPeriod(period==='Последние 30 дней'?'Эта неделя':'Последние 30 дней')}>{period}<span className="chevron">⌄</span></Button><Button view="flat" size="m" aria-label="Фильтры"><Glyph>☷</Glyph></Button></div></div>
  <div className={editing?'dashboard-grid is-editing':'dashboard-grid'}><DashKit {...props} defaultGlobalParams={{}} globalParams={{}} itemsStateAndParams={{}} settings={{autoupdateInterval:0,silentLoading:false}} context={{}} onItemEdit={()=>{}} onDrop={()=>{}} /></div>
  </div></main>;
}
