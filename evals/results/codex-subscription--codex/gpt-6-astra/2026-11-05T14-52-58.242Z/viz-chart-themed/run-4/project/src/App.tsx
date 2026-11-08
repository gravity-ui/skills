import {useEffect, useState} from 'react';
import {ThemeProvider, useThemeType} from '@gravity-ui/uikit';
import './styles.css';

type IconName = 'grid'|'chart'|'file'|'settings'|'arrow'|'chevron'|'calendar'|'download'|'sun'|'moon'|'help'|'close'|'check';
function Icon({name, size=20}: {name: IconName; size?:number}) {
  const paths: Record<IconName, React.ReactNode> = {
    grid:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    chart:<><path d="M4 3v17h17M7 14l4-5 4 3 5-7"/></>,file:<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5"/></>,
    settings:<><path d="m9 3-1 3-3 1 1 4-2 3 3 3 3-1 3 2 3-2 3-1-1-4 2-3-3-3-3 1-2-3z"/><circle cx="12" cy="11" r="3"/></>,arrow:<path d="M6 16 17 5M7 5h10v10"/>,chevron:<path d="m9 5 7 7-7 7"/>,calendar:<><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18"/></>,download:<><path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/></>,sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,moon:<path d="M20.8 13A9 9 0 0 1 11 3a9 9 0 1 0 9.8 10Z"/>,help:<><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01"/></>,close:<path d="m6 6 12 12M6 18 18 6"/>,check:<path d="m5 12 4 4L19 6"/>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
const current = [820,1050,920,1380,1210,1590,1460,1320,1710,1620,2050,1840,1770,2210,2040,2300,2110,1950,2380,2230,2660,2470,2580,2260,2720,2600,2980,2780,3150,2940];
const previous = [650,720,690,840,800,1010,920,1050,890,1110,1040,1280,1170,1300,1210,1440,1300,1510,1430,1600,1450,1720,1620,1770,1590,1850,1720,1960,1830,2100];
const fmt = (n:number) => new Intl.NumberFormat('ru-RU').format(n);
function smooth(points: number[][]) {
  return points.map((p,i) => {if(!i)return `M ${p[0]} ${p[1]}`; const a=points[i-1], before=points[i-2]||a, after=points[i+1]||p;return `C ${a[0]+(p[0]-before[0])/6} ${a[1]+(p[1]-before[1])/6},${p[0]-(after[0]-a[0])/6} ${p[1]-(after[1]-a[1])/6},${p[0]} ${p[1]}`;}).join(' ');
}
export function App(){
 const inherited = useThemeType();
 const [theme,setTheme]=useState<'light'|'dark'>(inherited);
 useEffect(()=>setTheme(inherited),[inherited]);
 return <ThemeProvider theme={theme}><Dashboard theme={theme} setTheme={setTheme}/></ThemeProvider>;
}
function Dashboard({theme,setTheme}:{theme:'light'|'dark';setTheme:(t:'light'|'dark')=>void}) {
 const [period,setPeriod]=useState(30), [metric,setMetric]=useState('Посетители'), [visible,setVisible]=useState([true,true]), [hover,setHover]=useState<number|null>(null), [page,setPage]=useState('Аналитика'), [modal,setModal]=useState<'help'|'settings'|null>(null);
 const values=current.slice(-period).map(n=>metric==='Просмотры'?Math.round(n*2.6):metric==='Конверсия'?n/500:n);
 const old=previous.slice(-period).map(n=>metric==='Просмотры'?Math.round(n*2.6):metric==='Конверсия'?n/500:n);
 const max=metric==='Просмотры'?10000:metric==='Конверсия'?8:4000;
 const unit=(n:number)=>metric==='Конверсия'?`${n.toFixed(2)}%`:fmt(n);
 const points=values.map((v,i)=>[60+i*920/(values.length-1),290-v/max*260]);
 const oldpoints=old.map((v,i)=>[60+i*920/(old.length-1),290-v/max*260]);
 const total=values.reduce((a,b)=>a+b,0), oldtotal=old.reduce((a,b)=>a+b,0);
 const visitorTotal=current.slice(-period).reduce((a,b)=>a+b,0);
 const visitorPrevious=previous.slice(-period).reduce((a,b)=>a+b,0);
 const growth='+'+((visitorTotal/visitorPrevious-1)*100).toFixed(1).replace('.',',')+'%';
 const exportData=()=>{const csv='Дата;'+metric+';Предыдущий период\n'+values.map((v,i)=>`${31-values.length+i} октября 2024;${v};${old[i]}`).join('\n'); const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='pulse-analytics.csv';a.click();URL.revokeObjectURL(url);};
 return <div className={`app ${theme}`}>
  <aside className="sidebar">
   <a className="brand" href="#" onClick={e=>{e.preventDefault();setPage('Обзор');}}><span className="brand-mark"><svg width="25" height="25" viewBox="0 0 25 25"><path d="m3 14 5-1 3-8 4 15 3-8h4" stroke="white" strokeWidth="2.4" fill="none" strokeLinejoin="round" strokeLinecap="round"/></svg></span>pulse<span className="brand-dot">.</span></a>
   <div className="workspace"><span className="workspace-avatar">S</span><div><strong>Студия</strong><small>Рабочее пространство</small></div><span className="workspace-chevron">⌄</span></div>
   <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
   <nav>{(['Обзор','Аналитика','Отчёты'] as const).map((name,i)=><button key={name} className={page===name?'nav-item selected':'nav-item'} onClick={()=>setPage(name)}><Icon name={(['grid','chart','file'] as const)[i]}/>{name}{name==='Аналитика'&&<span className="nav-dot"/>}</button>)}<button className="nav-item" onClick={()=>setModal('settings')}><Icon name="settings"/>Настройки</button></nav>
   <div className="sidebar-bottom"><div className="theme-label">Оформление</div><div className="theme-switch">{(['light','dark'] as const).map((t,i)=><button key={t} className={theme===t?'active':''} onClick={()=>setTheme(t)} aria-pressed={theme===t}><Icon size={16} name={i?'moon':'sun'}/>{i?'Тёмная':'Светлая'}</button>)}</div><button className="help-button" onClick={()=>setModal('help')}><Icon name="help"/>Помощь и поддержка<Icon name="arrow" size={15}/></button><div className="profile"><div className="avatar">АК</div><div><strong>Александр К.</strong><small>Личный аккаунт</small></div><span className="online"/></div></div>
  </aside>
  <div className="main-wrap"><header className="topbar"><div className="breadcrumb">Рабочее пространство <Icon name="chevron" size={13}/><span>{page}</span></div><div className="live"><span/>Все системы работают</div></header>
  <main><div className="page-heading"><div><div className="eyebrow">ВАШИ ДАННЫЕ. ЯСНАЯ КАРТИНА.</div><h1>{page}</h1><p>Следите за динамикой и находите новые точки роста.</p></div><button className="button export" onClick={exportData}><Icon name="download" size={17}/>Экспорт данных</button></div>
   <div className="toolbar"><div className="tabs">{[7,14,30].map(n=><button key={n} className={period===n?'active':''} onClick={()=>{setPeriod(n);setHover(null);}}>{n} дней</button>)}</div><div className="date-range"><Icon name="calendar" size={17}/>{31-period}–30 октября 2024<span className="date-divider"/> <span>UTC +3</span></div></div>
   <div className="stats">
    {[{label:'Посетители',value:fmt(current.slice(-period).reduce((a,b)=>a+b,0)),growth,desc:'Уникальные пользователи',spark:[20,26,23,38,29,39,34,50,43,57,52,63]}, {label:'Просмотры',value:fmt(current.slice(-period).reduce((a,b)=>a+Math.round(b*2.6),0)),growth,desc:'Просмотры страниц',spark:[18,28,24,30,25,36,33,42,40,47,44,56]}, {label:'Конверсия',value:(visitorTotal/period/500).toFixed(2).replace('.',',')+'%',growth,desc:'Доля целевых действий',spark:[24,28,26,34,30,32,39,36,42,38,46,49]}].map((s,i)=><button className={`stat-card ${metric===s.label?'chosen':''}`} key={s.label} onClick={()=>setMetric(s.label)}><div className="stat-title">{s.label}<span className="info" title={s.desc}>i</span></div><div className="stat-value">{s.value}<svg className={`spark spark-${i}`} viewBox="0 0 120 70"><path d={smooth(s.spark.map((v,j)=>[j*10,70-v]))} fill="none" stroke="currentColor" strokeWidth="2.3"/></svg></div><div className="stat-bottom"><span><Icon name="arrow" size={12}/>{s.growth}</span> к предыдущему периоду</div></button>)}
   </div>
   <section className="chart-card"><div className="chart-heading"><div><h2>{page==='Отчёты'?'Данные за период':'Динамика посещаемости'}<span className="badge">В реальном времени</span></h2><p>{page==='Отчёты'?'Детализация показателей по дням':'Как меняется активность вашей аудитории'}</p></div><select value={metric} onChange={e=>setMetric(e.target.value)} aria-label="Показатель графика"><option>Посетители</option><option>Просмотры</option><option>Конверсия</option></select></div>
   <div className="chart-legend">{['Текущий период','Предыдущий период'].map((s,i)=><button key={s} onClick={()=>setVisible(v=>v.map((b,j)=>j===i?!b:b))} className={!visible[i]?'muted':''} aria-pressed={visible[i]}><span className={`legend-line line-${i}`}/>{s}</button>)}<span className="chart-unit">{metric==='Конверсия'?'Проценты':metric==='Просмотры'?'Просмотры страниц':'Количество посетителей'}</span></div>
   {page==='Отчёты'?<div className="table-scroll"><table><thead><tr><th>Дата</th><th>{metric}</th><th>Предыдущий период</th><th>Изменение</th></tr></thead><tbody>{values.map((v,i)=><tr key={i}><td>{31-values.length+i} октября 2024</td><td>{unit(v)}</td><td>{unit(old[i])}</td><td className="positive">+{((v/old[i]-1)*100).toFixed(1)}%</td></tr>)}</tbody></table></div>:<div className="plot" onMouseLeave={()=>setHover(null)}>
    <svg className="line-chart" viewBox="0 0 1010 337" role="img" aria-label={`${metric}: график за ${period} дней, текущий и предыдущий периоды`}>
     <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8460ed" stopOpacity=".14"/><stop offset="100%" stopColor="#8460ed" stopOpacity=".005"/></linearGradient></defs>
     {[0,1,2,3,4].map(i=><g key={i}><line className="grid-line" x1="60" x2="980" y1={30+i*65} y2={30+i*65}/><text className="axis-label" x="42" y={35+i*65} textAnchor="end">{fmt(max-i*max/4)}</text></g>)}
     {visible[0]&&<path d={`${smooth(points)} L 980 290 L 60 290 Z`} fill="url(#area)"/>}
     {visible[1]&&<path d={smooth(oldpoints)} className="previous-path" fill="none" strokeWidth="2.5" strokeDasharray="6 6"/>}
     {visible[0]&&<path d={smooth(points)} stroke="#8961ec" fill="none" strokeWidth="3" strokeLinecap="round"/>}
     {values.map((_,i)=> (i===0||i===values.length-1||i%(period===30?5:period===14?3:1)===0)&&<text className="axis-label" key={i} x={points[i][0]} y="322" textAnchor="middle">{String(31-values.length+i).padStart(2,'0')} окт.</text>)}
     {hover!==null&&<g><line className="hover-line" x1={points[hover][0]} x2={points[hover][0]} y1="30" y2="290"/>{visible[0]&&<circle cx={points[hover][0]} cy={points[hover][1]} r="5" fill="#8961ec" stroke="var(--card)" strokeWidth="3"/>}{visible[1]&&<circle cx={oldpoints[hover][0]} cy={oldpoints[hover][1]} r="4" fill="var(--previous)"/>}</g>}
     {points.map((p,i)=><rect key={i} x={p[0]-920/(values.length-1)/2} y="15" width={920/(values.length-1)} height="280" fill="transparent" onMouseEnter={()=>setHover(i)} onFocus={()=>setHover(i)} onBlur={()=>setHover(null)} tabIndex={0} aria-label={`${31-values.length+i} октября: ${unit(values[i])}, предыдущий период: ${unit(old[i])}`}/>)}
    </svg>{hover!==null&&<div className="tooltip" style={{left:`${Math.min(78,Math.max(8,points[hover][0]/1010*100))}%`}}><strong>{31-values.length+hover} октября 2024</strong>{visible[0]&&<div><span className="tooltip-dot"/>Текущий <b>{unit(values[hover])}</b></div>}{visible[1]&&<div><span className="tooltip-dot old"/>Предыдущий <b>{unit(old[hover])}</b></div>}</div>}
   </div>}
   <div className="chart-footer"><span><span className="status-dot"/>Демонстрационные данные</span><span>Обновлено сегодня, 12:30 <span className="footer-divider">|</span> Шаг: 1 день</span></div></section>
   <div className="insight"><div className="insight-icon"><Icon name="chart" size={22}/></div><div><h3>Хороший темп!</h3><p>{metric==='Конверсия'?'Средняя конверсия':metric==='Посетители'?'Количество посетителей':'Количество просмотров'} за выбранный период {metric==='Конверсия'?'выросла':'выросло'} на <strong>{((total/oldtotal-1)*100).toFixed(1).replace('.',',')}%</strong> по сравнению с предыдущим. Продолжайте в том же духе.</p></div><span className="insight-tag">Позитивная динамика <Icon name="arrow" size={14}/></span></div>
   <footer className="page-footer"><span>© 2024 Pulse. Все данные под контролем.</span><span><span className="tiny-dot"/>Ваша аналитика — в вашей теме</span></footer>
  </main></div>
  {modal&&<div className="modal-backdrop" onClick={()=>setModal(null)}><section className="modal" role="dialog" aria-modal="true" aria-label={modal==='help'?'Помощь':'Настройки'} onClick={e=>e.stopPropagation()}><button className="modal-close" aria-label="Закрыть" onClick={()=>setModal(null)}><Icon name="close"/></button><h2>{modal==='help'?'Как работать с аналитикой':'Настройки оформления'}</h2>{modal==='help'?<><p>Выберите период и показатель, чтобы изучить динамику. Наведите курсор на график или используйте Tab для просмотра значений.</p><p>Нажмите на легенду, чтобы скрыть или показать линию. В разделе «Отчёты» доступны данные по дням, а кнопка «Экспорт данных» сохранит их в CSV.</p></>:<><p>Тема применяется ко всему интерфейсу, включая график.</p><div className="theme-switch">{(['light','dark'] as const).map(t=><button className={theme===t?'active':''} key={t} onClick={()=>setTheme(t)}>{t==='light'?'Светлая':'Тёмная'}</button>)}</div></>}</section></div>}
 </div>;
}
