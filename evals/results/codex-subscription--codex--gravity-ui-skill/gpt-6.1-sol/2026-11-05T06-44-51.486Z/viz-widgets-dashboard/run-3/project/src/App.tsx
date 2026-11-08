import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {DashKit, type Config, type PluginWidgetProps} from '@gravity-ui/dashkit';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {Button, Icon, Text, Select, DropdownMenu, Modal, TextInput, Table, configure} from '@gravity-ui/uikit';
import {LayoutCellsLarge, ChartLine, ChartColumn, Gear, CircleQuestion, Bell, Plus, Calendar, ChevronDown, Grip, Persons, ShoppingBag, ArrowUpRight, ArrowDownRight, Globe, Check, Xmark, Sliders, Layers, Target, ArrowDownToLine, ArrowRight, ArrowRotateLeft, Magnifier, Sun, Moon, CircleDollar, Folder} from '@gravity-ui/icons';
import './styles.css';

configure({lang: 'ru'});

type WidgetKind = 'revenue' | 'visitors' | 'orders' | 'conversion' | 'revenue-chart' | 'sources' | 'pages' | 'goal' | 'activity';
const catalog: {kind: WidgetKind; title: string; description: string; icon: typeof ChartLine; category: string}[] = [
  {kind: 'revenue', title: 'Общая выручка', description: 'Доход и динамика за выбранный период', icon: CircleDollar, category: 'Показатели'},
  {kind: 'visitors', title: 'Посетители', description: 'Уникальные посетители вашего сайта', icon: Persons, category: 'Показатели'},
  {kind: 'orders', title: 'Заказы', description: 'Количество оформленных заказов', icon: ShoppingBag, category: 'Показатели'},
  {kind: 'conversion', title: 'Конверсия', description: 'Доля посетителей, совершивших покупку', icon: ChartLine, category: 'Показатели'},
  {kind: 'revenue-chart', title: 'Динамика выручки', description: 'Выручка в сравнении с прошлым периодом', icon: ChartColumn, category: 'Графики'},
  {kind: 'sources', title: 'Источники трафика', description: 'Откуда приходят ваши посетители', icon: Globe, category: 'Графики'},
  {kind: 'pages', title: 'Популярные страницы', description: 'Страницы с наибольшим числом просмотров', icon: Layers, category: 'Таблицы'},
  {kind: 'goal', title: 'Цель месяца', description: 'Прогресс выполнения плана по выручке', icon: Target, category: 'Показатели'},
  {kind: 'activity', title: 'Последние события', description: 'Новые заказы и обновления магазина', icon: Bell, category: 'Списки'},
];
const initialConfig: Config = {
  salt: 'pulse', counter: 8, aliases: {}, connections: [],
  items: catalog.slice(0, 8).map((widget, i) => ({id: widget.kind, type: 'pulse-widget', namespace: 'default', data: {kind: widget.kind}, orderId: i})),
  layout: [
    {i:'revenue', x:0, y:0, w:3, h:5}, {i:'visitors', x:3, y:0, w:3, h:5},
    {i:'orders', x:6, y:0, w:3, h:5}, {i:'conversion', x:9, y:0, w:3, h:5},
    {i:'revenue-chart', x:0, y:5, w:8, h:11}, {i:'sources', x:8, y:5, w:4, h:11},
    {i:'pages', x:0, y:16, w:8, h:10}, {i:'goal', x:8, y:16, w:4, h:10},
  ],
};
const money = (n: number) => Math.round(n).toLocaleString('ru-RU');
const DashboardContext = createContext({period: '30', edit: false, target: 1500000, remove: (_id: string) => {}, notify: (_message: string) => {}, openDetail: (_detail: string) => {}});

function WidgetHeader({title, id, extra}: {title: string; id: string; extra?: React.ReactNode}) {
  const {edit, remove, openDetail} = useContext(DashboardContext);
  return <div className="widget-header"><div className="widget-title widget-drag"><Icon data={Grip} size={16}/><Text variant="subheader-2">{title}</Text></div><div className="widget-actions">{extra}<DropdownMenu defaultSwitcherProps={{view:'flat', size:'s', 'aria-label': `Действия: ${title}`}} items={[
    {text:'Подробнее', action: () => openDetail(title)},
    {text:'Удалить виджет', action:() => remove(id), theme:'danger'},
  ]}/>{edit && <span className="edit-indicator" title="Перетащите за заголовок"/>}</div></div>;
}

const sparkData = [[9,13,10,19,15,18,14,27,23,29,25,35,31,39,42], [16,13,18,12,22,18,24,19,29,25,27,34,30,40,38], [13,17,15,19,17,24,21,26,23,32,28,34,31,39,45], [25,22,29,24,31,26,29,24,34,29,33,28,36,31,34]];
function Sparkline({index}: {index: number}) {
 const chart: ChartData = useMemo(() => ({series: {data: [{type:'area', name:'Динамика', color:'var(--g-color-text-brand)', lineWidth:1.8, fillColor:'var(--g-color-base-selection)', opacity:0.7, data:sparkData[index].map((y,x)=>({x,y}))}]}, legend:{enabled:false}, xAxis:{visible:false}, yAxis:[{visible:false}], chart:{margin:{left:0,right:0,top:4,bottom:0}}, tooltip:{enabled:false}}),[index]);
 return <div className="sparkline"><Chart data={chart}/></div>;
}
function Metric({kind,id}: {kind: string;id:string}) {
 const {period,edit,remove} = useContext(DashboardContext);
 const multiplier = period === '7' ? 0.26 : period === '90' ? 2.78 : 1;
 const metrics = [
   {kind:'revenue', title:'Общая выручка', value:`${money(1245800*multiplier)} ₽`, growth:'12,8%', icon:CircleDollar},
   {kind:'visitors', title:'Посетители', value:money(24862*multiplier), growth:'8,2%', icon:Persons},
   {kind:'orders', title:'Заказы', value:money(1429*multiplier), growth:'16,4%', icon:ShoppingBag},
   {kind:'conversion', title:'Конверсия', value:'5,75%', growth:'0,6%', icon:ChartLine},
 ];
 const index=metrics.findIndex(x=>x.kind===kind); const metric=metrics[index];
 return <section className={`widget metric metric-${index}`}>
   <div className="metric-heading widget-drag"><span className="metric-icon"><Icon data={metric.icon} size={17}/></span><span>{metric.title}</span><span className="metric-handle"><Icon data={Grip} size={15}/></span>{edit && <Button className="dashkit_draggable_cancel" view="flat" size="s" onClick={()=>remove(id)} aria-label="Удалить виджет"><Icon data={Xmark} size={14}/></Button>}</div>
   <Text variant="display-1" className="metric-value">{metric.value}</Text>
   <div className="metric-bottom"><div><span className="growth"><Icon data={ArrowUpRight} size={12}/>{metric.growth}</span><span className="comparison"> к прошлому периоду</span></div><Sparkline index={index}/></div>
 </section>;
}
function RevenueChart({id}: {id:string}) {
 const {period}=useContext(DashboardContext); const [mode,setMode]=useState('days');
 const factor=period==='7' ? .26 : period==='90' ? 2.78 : 1;
 const values=[32,37,35,30,48,45,39,53,43,42,62,57,46,50,68,64,56,74,68,63,80,72,68,92,85,77,94,88,101,96];
 const series= mode==='weeks' ? [38,47,60,73,91] : values;
 const chart: ChartData = useMemo(()=>({
  series:{data:[
    {type:'line', name:'Прошлый период', color:'var(--g-color-line-complementary)', lineWidth:1.6, dashStyle:'Dash', data:series.map((y,x)=>({x,y:Math.round((y*.67+Math.sin(x)*8)*factor)}))},
    {type:'area', name:'Текущий период', color:'var(--g-color-text-brand)', fillColor:'var(--g-color-base-selection)', opacity:0.85, lineWidth:2.5, data:series.map((y,x)=>({x,y:y*factor}))},
  ]}, legend:{enabled:false},
  xAxis:{type:'category', categories:series.map((_,i)=>mode==='weeks'?`${i+1} нед.`:`${i+1} окт.`), grid:{enabled:false}, lineVisible:false, ticks:{values:mode==='weeks'?[0,1,2,3,4]:[0,4,9,14,19,24,29]}, labels:{style:{fontSize:'11px'}}},
  yAxis:[{min:0, max:Math.ceil(120*factor), lineVisible:false, ticks:{interval:48}, labels:{style:{fontSize:'11px'}}, title:{text:''}}],
  chart:{margin:{top:16,right:8,left:0,bottom:0}},
 }),[period, mode]);
 return <section className="widget revenue-widget"><WidgetHeader title="Динамика выручки" id={id} extra={<Select size="s" value={[mode]} onUpdate={v=>setMode(v[0])} options={[{value:'days',content:'По дням'},{value:'weeks',content:'По неделям'}]} aria-label="Группировка графика"/>}/>
  <div className="revenue-summary"><Text variant="display-1">{money(1245800*factor)} <span className="currency">₽</span></Text><span className="growth"><Icon data={ArrowUpRight} size={13}/>12,8%</span><span className="muted">за {period} дней</span></div>
  <div className="chart-meta"><span>тыс. ₽</span><div className="chart-legend"><span><i className="legend-dot"/>Текущий период</span><span><i className="legend-dot previous"/>Прошлый период</span></div></div>
  <div className="revenue-chart"><Chart data={chart}/></div>
 </section>;
}
const channels=[{name:'Органический поиск',value:42,color:'var(--g-color-text-brand)'},{name:'Прямые переходы',value:28,color:'var(--g-color-text-positive)'},{name:'Социальные сети',value:18,color:'var(--g-color-base-warning-heavy)'},{name:'Другие',value:12,color:'var(--g-color-line-generic-accent)'}];
function Sources({id}: {id:string}) {
 const {period}=useContext(DashboardContext);
 const data: ChartData=useMemo(()=>({series:{data:[{type:'pie',innerRadius:'77%',borderWidth:3,borderRadius:2,dataLabels:{enabled:false},data:channels.map(x=>({name:x.name,value:x.value,color:x.color}))}]}, legend:{enabled:false}, chart:{margin:{top:0,bottom:0,right:0,left:0}}}),[]);
 return <section className="widget sources-widget"><WidgetHeader title="Источники трафика" id={id}/><div className="donut-wrap"><Chart data={data}/><div className="donut-center"><Text variant="header-1">{money(24862*(period==='7'?.26:period==='90'?2.78:1))}</Text><span>посетителя</span></div></div><div className="channel-list">{channels.map(channel=><div key={channel.name}><span><i style={{background:channel.color}}/>{channel.name}</span><strong>{channel.value}%</strong></div>)}</div></section>;
}
const pageRows=[{page:'/',name:'Главная страница',visits:'8 942',users:'6 214',bounce:'24,5%',trend:'+12,8%'},{page:'/catalog',name:'Каталог',visits:'6 328',users:'4 852',bounce:'18,2%',trend:'+8,4%'},{page:'/catalog/new',name:'Новинки',visits:'4 156',users:'3 109',bounce:'21,8%',trend:'+16,2%'},{page:'/about',name:'О компании',visits:'2 847',users:'2 364',bounce:'32,1%',trend:'−2,1%'},{page:'/contacts',name:'Контакты',visits:'1 589',users:'1 204',bounce:'28,4%',trend:'+5,7%'}];
function Pages({id}: {id:string}) {
 const {openDetail}=useContext(DashboardContext);
 return <section className="widget pages-widget"><WidgetHeader title="Популярные страницы" id={id} extra={<Button view="flat" size="s" onClick={()=>openDetail('Все страницы')} className="subtle-link">Все страницы<Icon data={ArrowRight} size={13}/></Button>}/><div className="pages-table"><Table data={pageRows.slice(0,4)} width="max" columns={[
 {id:'page',name:'Страница',template:row=><div className="page-name"><span>{row.page}</span><small>{row.name}</small></div>},
 {id:'visits',name:'Просмотры',align:'right'}, {id:'users',name:'Посетители',align:'right'},
 {id:'trend',name:'Динамика',align:'right',template:row=><span className={row.trend.startsWith('−')?'negative':'positive'}><Icon data={row.trend.startsWith('−')?ArrowDownRight:ArrowUpRight} size={13}/>{row.trend}</span>},
 ]}/></div><div className="widget-bottom"><span className="muted">Топ-4 из 24 страниц</span><span className="muted">Обновлено только что</span></div></section>;
}
function Goal({id}: {id:string}) {
 const {openDetail,target}=useContext(DashboardContext);
 const percentage=Math.round(1245800/target*100);
 return <section className="widget goal-widget"><WidgetHeader title="Цель месяца" id={id}/><div className="goal-label"><span className="goal-icon"><Icon data={Target} size={20}/></span><div><Text variant="subheader-2">План по выручке</Text><span className="muted">Октябрь 2026</span></div><span className="goal-percentage">{percentage}<span>%</span></span></div><div className="goal-progress"><span style={{width:`${Math.min(100,percentage)}%`}}/></div><div className="goal-numbers"><strong>1 245 800 ₽</strong><span>из {money(target)} ₽</span></div><div className="goal-insight"><span className="insight-icon">✦</span><div><strong>Отличный темп!</strong><p>Вы на 12% опережаете план.<br/>Продолжайте в том же духе.</p></div></div><Button view="flat" size="s" className="goal-button" onClick={()=>openDetail('Настройка цели')}>Посмотреть цель<Icon data={ArrowUpRight} size={13}/></Button></section>;
}
function Activity({id}: {id:string}) {return <section className="widget"><WidgetHeader title="Последние события" id={id}/><div className="activity-list">{[['Новый заказ #10429','Оплачен · 12 450 ₽','2 минуты назад'],['Новый подписчик','Мария К. подписалась на рассылку','15 минут назад'],['Цель почти достигнута','Выполнено 83% месячного плана','32 минуты назад']].map(([title,subtitle,time])=><div key={title}><span className="activity-dot"/><div><strong>{title}</strong><p>{subtitle}</p><small>{time}</small></div></div>)}</div></section>}
function Widget({id,data}: PluginWidgetProps) {
 const kind=data.kind as WidgetKind;
 if(['revenue','visitors','orders','conversion'].includes(kind))return <Metric kind={kind} id={id}/>;
 if(kind==='revenue-chart')return <RevenueChart id={id}/>;
 if(kind==='sources')return <Sources id={id}/>;
 if(kind==='pages')return <Pages id={id}/>;
 if(kind==='goal')return <Goal id={id}/>;
 return <Activity id={id}/>;
}
DashKit.setSettings({gridLayout:{cols:12,rowHeight:12,margin:[20,20],containerPadding:[0,0],compactType:'vertical'},isMobile:false});
DashKit.registerPlugins({type:'pulse-widget',defaultLayout:{w:4,h:10,minW:2,minH:4},renderer:Widget});

function loadLayout(): Config {
 try {const data=localStorage.getItem('pulse-layout-v1');if(data){const parsed=JSON.parse(data);if(Array.isArray(parsed.items)&&Array.isArray(parsed.layout)&&parsed.items.every((i:{type:string})=>i.type==='pulse-widget'))return parsed;}}catch{/* Default layout is available if browser storage is unavailable. */}
 return structuredClone(initialConfig);
}
export function App({theme, setTheme}: {theme: 'light' | 'dark'; setTheme: (theme: 'light' | 'dark') => void}) {
 const [config,setConfig]=useState<Config>(loadLayout);
 const [edit,setEdit]=useState(false); const [compact,setCompact]=useState(window.innerWidth<1100);
 const [period,setPeriod]=useState('30'); const [tab,setTab]=useState('overview');
 const [library,setLibrary]=useState(false);const [search,setSearch]=useState('');const [category,setCategory]=useState('Все');
 const [detail,setDetail]=useState('');const [toast,setToast]=useState('');const [notice,setNotice]=useState(false);
 const [saved,setSaved]=useState(true);
 const [target,setTarget]=useState(()=>{try{return Number(localStorage.getItem('pulse-target'))||1500000;}catch{return 1500000;}});
 const [goal,setGoal]=useState(String(target));
 useEffect(()=>{try{localStorage.setItem('pulse-layout-v1',JSON.stringify(config));setSaved(true);}catch{setSaved(false);}},[config]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(timer);},[toast]);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setEdit(false);setLibrary(false);}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[]);
 const notify=(message:string)=>setToast(message);
 const remove=(id:string)=>{setConfig(c=>DashKit.removeItem({id,config:c,itemsStateAndParams:{}}).config);notify('Виджет удалён. Его можно вернуть из библиотеки.');};
 const addWidget=(kind:WidgetKind)=>{const item=catalog.find(w=>w.kind===kind)!;const metric=['revenue','visitors','orders','conversion'].includes(kind);setConfig(c=>DashKit.setItem({config:c,item:{type:'pulse-widget',data:{kind},namespace:'default',layout:{x:0,y:Math.max(0,...c.layout.map(l=>l.y+l.h)),w:metric?3:kind==='revenue-chart'||kind==='pages'?8:4,h:metric?5:11}}}));notify(`Виджет «${item.title}» добавлен`);};
 const exportData=()=>{const factor=period==='7'?.26:period==='90'?2.78:1;const blob=new Blob(['\uFEFFОтчёт Pulse;Studio Store\nПериод;'+period+' дней\nВыручка;'+money(1245800*factor)+' ₽\nПосетители;'+money(24862*factor)+'\nЗаказы;'+money(1429*factor)+'\nКонверсия;5,75%\n\nСтраница;Просмотры;Посетители;Динамика\n'+pageRows.map(p=>`${p.page};${p.visits};${p.users};${p.trend}`).join('\n')],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`pulse-report-${period}-days.csv`;a.click();URL.revokeObjectURL(url);notify('Отчёт сохранён в CSV');};
 const shownConfig=useMemo(()=>{if(tab==='overview')return config;const allowed=tab==='sales'?['revenue','orders','conversion','revenue-chart','goal']:['visitors','sources','pages','conversion'];const items=config.items.filter(i=>allowed.includes(String(i.data.kind)));return {...config,items,layout:config.layout.filter(l=>items.some(i=>i.id===l.i))};},[config,tab]);
 const shownWidgets=catalog.filter(w=>(category==='Все'||category===w.category)&&w.title.toLowerCase().includes(search.toLowerCase()));
 const handleLayout=({config:next}:{config:Config})=>{if(!edit)return;if(tab==='overview')setConfig(next);else setConfig(c=>({...c,layout:c.layout.map(l=>next.layout.find(n=>n.i===l.i)||l)}));};
 const currentPeriod=period==='7'?'25–31 октября 2026':period==='90'?'1 августа – 31 октября 2026':'1–31 октября 2026';
 const mainContent=<div className="app-content">
   <header className="topbar"><div className="breadcrumb"><Icon data={LayoutCellsLarge} size={15}/><span>Рабочее пространство</span><span className="breadcrumb-slash">/</span><strong>Дашборды</strong></div><div className="topbar-right"><span className="live-status"><i/>Все системы работают</span><div className="notification-wrap"><Button view="flat" size="m" onClick={()=>setNotice(!notice)} aria-label="Уведомления"><Icon data={Bell} size={18}/><span className="notification-dot"/></Button>{notice&&<div className="notifications-panel"><Text variant="subheader-2">Уведомления</Text><p><span className="positive">●</span> Данные успешно обновлены</p><small className="muted">Все источники синхронизированы · только что</small><p>Вы достигли 83% цели месяца</p><Button size="s" view="flat" onClick={()=>setNotice(false)}>Отметить прочитанными</Button></div>}</div><span className="top-divider"/><Button view="flat" className="profile-button" onClick={()=>setDetail('Профиль')}><span className="avatar">АК</span><span>Александр</span><Icon data={ChevronDown} size={12}/></Button></div></header>
   <main className="dashboard-main">
    <div className="page-heading"><div><div className="eyebrow">ВАШ БИЗНЕС В ЦИФРАХ</div><div className="page-title"><Text variant="display-1">Обзор бизнеса</Text><span className="dashboard-badge">Мой дашборд</span></div><p className="page-description">Всё важное в одном месте. Настройте пространство под себя.</p></div><div className="heading-actions"><Button view="outlined" size="l" onClick={exportData}><Icon data={ArrowDownToLine} size={16}/>Экспорт</Button><Button view="action" size="l" onClick={()=>setLibrary(true)}><Icon data={Plus} size={17}/>Добавить виджет</Button></div></div>
    <div className="dashboard-toolbar"><div className="dashboard-tabs">{[['overview','Обзор'],['sales','Продажи'],['audience','Аудитория']].map(([id,name])=><Button key={id} view="flat" className={`dashboard-tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{name}{id==='overview'&&<span className="tab-count">{config.items.length}</span>}</Button>)}</div><div className="toolbar-actions"><span className="date-icon"><Icon data={Calendar} size={15}/></span><Select className="date-select" size="m" value={[period]} onUpdate={v=>setPeriod(v[0])} options={[{value:'7',content:'Последние 7 дней'},{value:'30',content:'Последние 30 дней'},{value:'90',content:'Последние 90 дней'}]} aria-label="Период аналитики"/><Button size="m" view={edit?'outlined-action':'outlined'} selected={edit} onClick={()=>setEdit(!edit)}><Icon data={edit?Check:Sliders} size={15}/>{edit?'Готово':'Настроить'}</Button><DropdownMenu defaultSwitcherProps={{view:'flat','aria-label':'Настройки дашборда'}} items={[{text:'Сбросить расположение',action:()=>{setConfig(structuredClone(initialConfig));setTab('overview');notify('Исходное расположение восстановлено');}},{text:theme==='dark'?'Светлая тема':'Тёмная тема',action:()=>setTheme(theme==='dark'?'light':'dark')}]}/></div></div>
    <div className="dashboard-subline"><div className="period-caption">{currentPeriod}<span>по сравнению с предыдущим периодом</span></div><span className="save-status"><Icon data={Check} size={13}/>{saved?'Все изменения сохранены':'Сохранение недоступно'}</span></div>
    {edit&&<div className="edit-banner"><Icon data={Grip} size={18}/><div><strong>Ваш дашборд — ваши правила.</strong> Перетаскивайте виджеты за заголовок, меняйте размер за нижний угол.</div><Button view="flat" size="s" onClick={()=>{setConfig(structuredClone(initialConfig));notify('Исходное расположение восстановлено');}}><Icon data={ArrowRotateLeft} size={14}/>Сбросить</Button></div>}
    <DashboardContext.Provider value={{period,edit,target,remove,notify,openDetail:setDetail}}><div className={`dashboard-grid ${edit?'is-editing':''}`}><DashKit config={shownConfig} editMode={edit} noOverlay draggableHandleClassName="widget-drag" onChange={handleLayout}/></div></DashboardContext.Provider>
    {shownConfig.items.length===0&&<div className="empty-state"><Icon data={LayoutCellsLarge} size={40}/><Text variant="header-1">Место для ваших идей</Text><p>Добавьте первый виджет и соберите свой дашборд.</p><Button view="action" size="l" onClick={()=>setLibrary(true)}><Icon data={Plus} size={16}/>Добавить виджет</Button></div>}
    <div className="dashboard-footer"><span><span className="small-status"/>Демо-данные · обновлено только что</span><span>Создано с вниманием к вашим данным<span className="footer-mark">✦</span></span></div>
   </main>
  </div>;
 return <><AsideHeader className="pulse-shell" compact={compact} onChangeCompact={setCompact} hideSectionDividers logo={{text:()=> <span className="brand-name">pulse<span className="brand-dot">.</span></span>, icon:ChartColumn,iconSize:30,iconClassName:'brand-icon',href:'#',onClick:()=>{setTab('overview');setDetail('');}}} aboveMenuContent={!compact?<div className="workspace-switch"><Button view="outlined" width="max" size="l" onClick={()=>setDetail('Рабочее пространство')}><span className="workspace-avatar">S</span><span className="workspace-name">Studio Store<small>Рабочее пространство</small></span><Icon data={ChevronDown} size={13}/></Button><div className="nav-section-label">РАБОЧЕЕ ПРОСТРАНСТВО</div></div>:null} menuItems={[
 {id:'dashboards',title:'Дашборды',icon:LayoutCellsLarge,current:true,onItemClick:()=>{setTab('overview');setDetail('');}},
 {id:'analytics',title:'Аналитика',icon:ChartLine,onItemClick:()=>{setTab('sales');}},
 {id:'reports',title:'Отчёты',icon:Folder,rightAdornment:!compact?<span className="nav-badge">4</span>:null,onItemClick:()=>setDetail('Отчёты')},
 {id:'sources',title:'Источники данных',icon:Layers,onItemClick:()=>setDetail('Источники данных')},
 {id:'team',title:'Команда',icon:Persons,onItemClick:()=>setDetail('Команда')},
 ]} renderFooter={()=> <div className="sidebar-footer">{!compact&&<div className="upgrade-card"><span className="upgrade-star">✦</span><Text variant="subheader-2">Больше возможностей</Text><p>Все ваши данные.<br/>Без ограничений.</p><Button view="outlined" size="m" width="max" onClick={()=>setDetail('Pulse Pro')}>Попробовать Pro<Icon data={ArrowUpRight} size={14}/></Button></div>}<Button view="flat" width="max" className="footer-nav" onClick={()=>setDetail('Настройки')}><Icon data={Gear} size={18}/>{!compact&&'Настройки'}</Button><Button view="flat" width="max" className="footer-nav" onClick={()=>setDetail('Помощь и поддержка')}><Icon data={CircleQuestion} size={18}/>{!compact&&'Помощь и поддержка'}</Button>{!compact&&<div className="sidebar-user"><span className="avatar">АК</span><div><strong>Александр К.</strong><small>Личный аккаунт</small></div><span className="online-dot"/></div>}</div>} renderContent={()=>mainContent}/>
 <Modal open={library} onClose={()=>setLibrary(false)} aria-label="Библиотека виджетов" contentClassName="widget-library"><div className="modal-heading"><div><div className="eyebrow">СОБЕРИТЕ СВОЮ КАРТИНУ</div><Text variant="header-1">Добавить виджет</Text></div><Button view="flat" onClick={()=>setLibrary(false)} aria-label="Закрыть"><Icon data={Xmark} size={20}/></Button></div><p className="muted">Выберите, какие данные вы хотите видеть на дашборде.</p><TextInput size="l" placeholder="Найти виджет…" value={search} onUpdate={setSearch} startContent={<Icon data={Magnifier} size={16}/>} hasClear aria-label="Найти виджет"/><div className="library-tabs">{['Все','Показатели','Графики','Таблицы','Списки'].map(c=><Button size="s" key={c} view={category===c?'normal':'flat'} selected={category===c} onClick={()=>setCategory(c)}>{c}</Button>)}</div><div className="library-grid">{shownWidgets.map(widget=><div className="library-card" key={widget.kind}><span className="library-icon"><Icon data={widget.icon} size={22}/></span><Text variant="subheader-2">{widget.title}</Text><p>{widget.description}</p><Button size="m" view="outlined" onClick={()=>addWidget(widget.kind)}><Icon data={Plus} size={14}/>Добавить</Button></div>)}</div>{shownWidgets.length===0&&<div className="library-empty">Ничего не найдено. Попробуйте другое название.</div>}<div className="modal-footer"><span className="muted">Виджеты можно добавить несколько раз</span><Button view="action" size="l" onClick={()=>setLibrary(false)}>Готово</Button></div></Modal>
 <Modal open={Boolean(detail)} onClose={()=>setDetail('')} aria-label={detail} contentClassName="detail-modal"><div className="modal-heading"><Text variant="header-1">{detail}</Text><Button view="flat" onClick={()=>setDetail('')} aria-label="Закрыть"><Icon data={Xmark} size={18}/></Button></div>
 {detail==='Настройки'?<><p className="muted">Сделайте Pulse удобным для себя.</p><div className="settings-row"><span>Тема интерфейса</span><Button view="outlined" onClick={()=>setTheme(theme==='dark'?'light':'dark')}><Icon data={theme==='dark'?Sun:Moon} size={16}/>{theme==='dark'?'Светлая':'Тёмная'}</Button></div><div className="settings-row"><span>Расположение виджетов</span><Button view="outlined" onClick={()=>{setConfig(structuredClone(initialConfig));notify('Расположение сброшено');}}>Сбросить</Button></div></>:detail==='Настройка цели'?<><p className="muted">План по выручке на октябрь 2026</p><label className="field-label">Целевая выручка, ₽</label><TextInput size="l" type="number" value={goal} onUpdate={setGoal}/><Button className="detail-cta" view="action" size="l" disabled={Number(goal)<=0} onClick={()=>{setTarget(Number(goal));try{localStorage.setItem('pulse-target',goal);}catch{}notify(`Цель ${money(Number(goal))} ₽ сохранена`);setDetail('');}}>Сохранить цель</Button></>:detail==='Отчёты'?<><p className="muted">Отчёт за {currentPeriod.toLowerCase()}. Скачайте данные о популярных страницах для дальнейшего анализа.</p>{['Выручка и продажи','Аудитория сайта','Источники трафика','Популярные страницы'].map((r,i)=><div className="report-row" key={r}><Icon data={Folder} size={18}/><span>{r}</span><span className="muted">{i===3?'CSV':'В дашборде'}</span><Button view="flat" onClick={i===3?exportData:()=>{setTab(i===0?'sales':'audience');setDetail('');}}><Icon data={i===3?ArrowDownToLine:ArrowRight} size={16}/></Button></div>)}</>:detail==='Источники данных'?<><p className="muted">Подключённые источники Studio Store</p>{[['Веб-аналитика','Посетители, страницы и конверсии'],['Магазин','Заказы и выручка']].map(([name,desc])=><div className="connection" key={name}><span className="library-icon"><Icon data={Globe} size={22}/></span><div><strong>{name}</strong><p>{desc}</p></div><span className="connection-status"><i/>Подключён</span></div>)}<p className="muted">Демонстрационные данные · синхронизация в реальном приложении подключается к вашему API.</p></>:detail==='Все страницы'||detail==='Популярные страницы'?<Table data={pageRows} width="max" columns={[{id:'page',name:'Страница'},{id:'visits',name:'Просмотры'},{id:'users',name:'Посетители'},{id:'bounce',name:'Отказы'}]}/>:detail==='Помощь и поддержка'?<><p>Создайте дашборд, который подходит именно вам.</p><div className="help-step"><strong>1. Добавьте виджеты</strong><p>Нажмите «Добавить виджет» и выберите нужные показатели.</p></div><div className="help-step"><strong>2. Настройте расположение</strong><p>Нажмите «Настроить», перетаскивайте виджеты за заголовок. Меняйте их размер за нижний правый угол.</p></div><div className="help-step"><strong>3. Возвращайтесь к своим данным</strong><p>Раскладка автоматически сохраняется в этом браузере.</p></div></>:detail==='Команда'?<><p className="muted">Участники рабочего пространства Studio Store</p><div className="connection"><span className="avatar">АК</span><div><strong>Александр К.</strong><p>alexander@studiostore.ru</p></div><span className="dashboard-badge">Владелец</span></div><p className="muted">Вы используете личное рабочее пространство.</p></>:detail==='Профиль'||detail==='Рабочее пространство'?<><div className="profile-detail"><span className="avatar large-avatar">АК</span><Text variant="header-2">Александр К.</Text><p className="muted">alexander@studiostore.ru</p></div><div className="settings-row"><span>Рабочее пространство</span><strong>Studio Store</strong></div><div className="settings-row"><span>План</span><span>Личный</span></div></>:detail==='Pulse Pro'?<><p className="muted">Ещё больше возможностей для вашей команды.</p>{['Неограниченное количество дашбордов','Совместная работа с командой','Расширенная история данных','Автоматические отчёты'].map(t=><p className="pro-feature" key={t}><Icon data={Check} size={17}/>{t}</p>)}<Button view="action" size="l" className="detail-cta" onClick={()=>{notify('Вы в списке ожидания Pulse Pro');setDetail('');}}>Записаться в список ожидания</Button></>:<><p className="muted">{currentPeriod} · Studio Store</p><div className="detail-metric"><Text variant="display-2">{detail==='Источники трафика'||detail==='Посетители'?money(24862*(period==='7'?.26:period==='90'?2.78:1)):detail==='Цель месяца'?`${Math.round(1245800/target*100)}%`:detail==='Заказы'?money(1429*(period==='7'?.26:period==='90'?2.78:1)):detail==='Конверсия'?'5,75%':`${money(1245800*(period==='7'?.26:period==='90'?2.78:1))} ₽`}</Text><span className="growth"><Icon data={ArrowUpRight} size={16}/>12,8% к прошлому периоду</span></div><p>Данные за выбранный период доступны в виджетах дашборда.</p><Button view="outlined" onClick={exportData}><Icon data={ArrowDownToLine} size={16}/>Экспортировать данные</Button></>}
 </Modal>
 {toast&&<div className="toast" role="status"><span className="toast-icon"><Icon data={Check} size={16}/></span>{toast}<Button size="s" view="flat" onClick={()=>setToast('')} aria-label="Закрыть уведомление"><Icon data={Xmark} size={14}/></Button></div>}
 </>;
}
