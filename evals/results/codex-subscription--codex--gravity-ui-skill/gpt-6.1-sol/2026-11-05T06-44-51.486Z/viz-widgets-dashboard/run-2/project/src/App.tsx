import React, {useEffect, useMemo, useState} from 'react';
import {Button, Icon, Text, Select, DropdownMenu, Modal, TextInput, Table, configure} from '@gravity-ui/uikit';
import {AsideHeader} from '@gravity-ui/navigation';
import {DashKit, type DashKitProps, type PluginWidgetProps} from '@gravity-ui/dashkit';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {LayoutCells, ChartColumn, ChartLine, Plus, Gear, Bell, Magnifier, ArrowUpRight, ArrowDownToLine, Grip, Calendar, Xmark, ChevronDown, Persons, CircleQuestion, Check, Pencil, Sliders, ArrowRight, CircleCheck, Globe, Layers3Diagonal, ArrowsRotateRight, Target, CreditCard, ShoppingBag, CircleDollar} from '@gravity-ui/icons';
import './styles.css';

configure({lang: 'ru'});
type Config = DashKitProps['config'];
type Kind = 'revenue' | 'users' | 'orders' | 'conversion' | 'trend' | 'sources' | 'activity' | 'transactions' | 'goal';
const catalog: {kind: Kind; title: string; description: string; icon: typeof ChartLine; w: number; h: number}[] = [
  {kind:'revenue',title:'Общая выручка',description:'Выручка и изменение к прошлому периоду',icon:CircleDollar,w:3,h:5},
  {kind:'users',title:'Пользователи',description:'Аудитория вашего продукта',icon:Persons,w:3,h:5},
  {kind:'orders',title:'Заказы',description:'Количество оформленных заказов',icon:ShoppingBag,w:3,h:5},
  {kind:'conversion',title:'Конверсия',description:'Доля посетителей, совершивших покупку',icon:Target,w:3,h:5},
  {kind:'trend',title:'Динамика выручки',description:'Сравнение выручки по периодам',icon:ChartLine,w:8,h:12},
  {kind:'sources',title:'Источники трафика',description:'Откуда приходят ваши посетители',icon:Globe,w:4,h:12},
  {kind:'activity',title:'Активность пользователей',description:'Посещаемость по дням недели',icon:ChartColumn,w:4,h:11},
  {kind:'transactions',title:'Последние операции',description:'Новые платежи и их статусы',icon:CreditCard,w:5,h:11},
  {kind:'goal',title:'Цель месяца',description:'Прогресс на пути к вашей цели',icon:Target,w:3,h:11},
];
const initialConfig: Config = {
  salt:'orbit',counter:9,aliases:{},connections:[],
  items:catalog.map((x,i)=>({id:x.kind,type:'orbit-widget',namespace:'default',data:{kind:x.kind},orderId:i})),
  layout:[
    ...['revenue','users','orders','conversion'].map((i,x)=>({i,x:x*3,y:0,w:3,h:5,minW:2,minH:5})),
    {i:'trend',x:0,y:5,w:8,h:12,minW:4,minH:10},
    {i:'sources',x:8,y:5,w:4,h:12,minW:3,minH:10},
    {i:'activity',x:0,y:17,w:4,h:11,minW:3,minH:9},
    {i:'transactions',x:4,y:17,w:5,h:11,minW:4,minH:9},
    {i:'goal',x:9,y:17,w:3,h:11,minW:3,minH:9},
  ],
};
const money=(n:number)=>new Intl.NumberFormat('ru-RU').format(Math.round(n));
const palette=['var(--g-color-text-brand)','var(--g-color-base-utility-medium)','var(--g-color-base-info-heavy)','var(--g-color-base-generic-medium)'];
const rawTrend=[32,36,33,29,38,49,46,41,47,40,54,65,60,55,66,53,47,65,72,64,71,69,83,75,68,79,87,81,92,88];
const oldTrend=[23,27,25,24,31,29,35,27,32,30,35,39,32,37,33,39,35,41,39,46,40,46,43,40,47,44,49,46,51,48];
const transactions=[
  {name:'Анна Смирнова',initials:'АС',email:'anna.s@mail.ru',amount:4900,status:'Оплачено',time:'2 мин назад',tone:'purple'},
  {name:'Михаил Козлов',initials:'МК',email:'m.kozlov@gmail.com',amount:12500,status:'Оплачено',time:'15 мин назад',tone:'blue'},
  {name:'Елена Волкова',initials:'ЕВ',email:'elena.v@mail.ru',amount:2400,status:'В обработке',time:'32 мин назад',tone:'peach'},
  {name:'Дмитрий Соколов',initials:'ДС',email:'d.sokolov@gmail.com',amount:8900,status:'Оплачено',time:'48 мин назад',tone:'green'},
];
function Glyph({data,size=18}:{data:typeof Plus;size?:number}){return <Icon data={data} size={size}/>;}
function Widget({id,data,context,editMode}:PluginWidgetProps){
  const kind=data.kind as Kind;
  const {period,section,remove,openTransactions,mobile,move}=context;
  const factor=(period==='7' ? .28 : period==='90' ? 2.73 : 1)*(section==='Продажи'?1.12:section==='Маркетинг'?.86:1);
  const spec=catalog.find(x=>x.kind===kind)!;
  const isMetric=['revenue','users','orders','conversion'].includes(kind);
  const [unit,setUnit]=useState('day');
  const metricValues: Record<string,string>={revenue:money(1245800*factor)+' ₽',users:money(24892*factor),orders:money(1842*factor),conversion:(3.64+(factor-1)*.12).toFixed(2).replace('.',',')+'%'};
  const changes:Record<string,string>={revenue:'12,8',users:'8,2',orders:'16,4',conversion:'2,1'};
  const trendData=useMemo<ChartData>(()=>({
    chart:{margin:{top:12,right:8,bottom:8,left:0}},legend:{enabled:false},
    series:{data:[
      {type:'area',name:'Текущий период',color:palette[0],fillColor:'var(--g-color-base-selection)',opacity:.8,lineWidth:2.5,marker:{enabled:false},data:rawTrend.filter((_,i)=>unit==='day'||i%3===0).map((y,i)=>({x:i,y:Math.round(y*factor)}))},
      {type:'line',name:'Прошлый период',color:'var(--g-color-base-utility-medium)',lineWidth:2,dashStyle:'Dash',marker:{enabled:false},interpolation:{type:'monotone'},data:oldTrend.filter((_,i)=>unit==='day'||i%3===0).map((y,i)=>({x:i,y:Math.round(y*factor)}))},
    ]},
    xAxis:{type:'category',categories:rawTrend.filter((_,i)=>unit==='day'||i%3===0).map((_,i)=>`${unit==='day'?i+1:i*3+1} окт`),ticks:{values:unit==='day'?[0,5,10,15,20,25,29]:[0,2,4,6,8,9]},labels:{style:{fontSize:'10px'},autoRotation:false},grid:{enabled:false}},
    yAxis:[{min:0,max:Math.ceil(100*factor),ticks:{pixelInterval:50},labels:{style:{fontSize:'10px'}},grid:{enabled:true}}],
  }),[factor,unit]);
  const donutData:ChartData={chart:{margin:{top:0,bottom:0,left:0,right:0}},legend:{enabled:false},colors:palette,series:{data:[{type:'pie',innerRadius:'76%',borderWidth:4,borderColor:'var(--g-color-base-background)',dataLabels:{enabled:false},data:[{name:'Прямые переходы',value:42},{name:'Поисковые системы',value:28},{name:'Социальные сети',value:18},{name:'Другие',value:12}]}]}};
  const barData:ChartData={chart:{margin:{top:8,bottom:4,left:0,right:0}},legend:{enabled:false},series:{data:[{type:'bar-x',name:'Пользователи',color:palette[0],borderRadius:4,barMaxWidth:24,data:[42,59,47,70,55,86,65].map((y,x)=>({x,y:Math.round(y*factor),color:x===5?palette[0]:'var(--g-color-base-utility-light)'}))}]},xAxis:{type:'category',categories:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],grid:{enabled:false}},yAxis:[{min:0,grid:{enabled:true},ticks:{pixelInterval:48},labels:{style:{fontSize:'10px'}}}]};
  const widgetMenu=<DropdownMenu defaultSwitcherProps={{view:'flat',size:'s','aria-label':`Меню: ${spec.title}`}} items={[...(mobile?[{text:'Переместить выше',action:()=>move(id,-1)},{text:'Переместить ниже',action:()=>move(id,1)}]:[]),{text:'Удалить виджет',action:()=>remove(id),theme:'danger'}]}/>;
  return <article className={`widget ${isMetric?'metric':''} widget-${kind} ${editMode?'widget-editable':''}`}>
    <div className="widget-heading">
      <div className="widget-drag" title={editMode?'Перетащите виджет':'Включите режим настройки'}><span className={isMetric?'metric-label':'widget-title'}>{spec.title}</span>{editMode&&<Glyph data={Grip} size={14}/>}</div>
      {isMetric&&!context.editing ? <span className={`metric-icon metric-icon-${kind}`}><Glyph data={spec.icon} size={17}/></span> : widgetMenu}
    </div>
    {isMetric ? <><div className="metric-main"><Text variant="display-1">{metricValues[kind]}</Text><div className={`mini-bars mini-${kind}`} aria-hidden="true">{[28,45,36,57,46,63,54,79,70,93].map((v,i)=><i key={i} style={{height:`${kind==='conversion'?v*.75+15:v}%`}}/>)}</div></div><div className="metric-bottom"><span className="positive"><Glyph data={ArrowUpRight} size={13}/>{changes[kind]}%</span><span>к прошлому периоду</span></div></> : null}
    {kind==='trend'&&<><div className="trend-summary"><Text variant="display-1">{money(1245800*factor)} <span className="currency">₽</span></Text><span className="positive"><Glyph data={ArrowUpRight} size={13}/>12,8%</span><div className="chart-segment"><Button size="s" view={unit==='day'?'normal':'flat'} onClick={()=>setUnit('day')}>По дням</Button><Button size="s" view={unit==='week'?'normal':'flat'} onClick={()=>setUnit('week')}>По неделям</Button></div></div><div className="chart-legend"><span><i/>Текущий период</span><span><i className="previous"/>Прошлый период</span></div><div className="revenue-chart"><Chart data={trendData}/></div></>}
    {kind==='sources'&&<><div className="donut-wrap"><Chart data={donutData}/><div className="donut-label"><strong>{money(24892*factor)}</strong><span>посетителей</span></div></div><div className="source-legend">{['Прямые переходы','Поисковые системы','Социальные сети','Другие'].map((s,i)=><div key={s}><i style={{background:palette[i]}}/><span>{s}</span><b>{[42,28,18,12][i]}%</b></div>)}</div></>}
    {kind==='activity'&&<><div className="activity-description">Посетители за последнюю неделю</div><div className="activity-value"><Text variant="header-1">{money(6248*factor)}</Text><span className="positive">+8,2% <Glyph data={ArrowUpRight} size={13}/></span></div><div className="activity-chart"><Chart data={barData}/></div></>}
    {kind==='transactions'&&<><div className="transaction-list">{transactions.map(t=><div className="transaction" key={t.name}><span className={`avatar avatar-${t.tone}`}>{t.initials}</span><div className="transaction-person"><strong>{t.name}</strong><span>{t.time}</span></div><div className="transaction-amount"><strong>+{money(t.amount)} ₽</strong><span className={t.status==='Оплачено'?'paid':'pending'}>{t.status}</span></div></div>)}</div><Button className="all-transactions" view="flat" size="s" onClick={openTransactions}>Все операции <Glyph data={ArrowRight} size={14}/></Button></>}
    {kind==='goal'&&<><span className="goal-description">Выручка · Октябрь 2025</span><div className="goal-ring"><Chart data={{...donutData,colors:[palette[0],'var(--g-color-base-generic)'],series:{data:[{type:'pie',innerRadius:'85%',borderWidth:0,dataLabels:{enabled:false},data:[{name:'Достигнуто',value:Math.min(100,Math.round(83*factor))},{name:'Осталось',value:Math.max(0,100-Math.round(83*factor))}]}]}}}/><div className="goal-ring-label"><strong>{Math.min(100,Math.round(83*factor))}<small>%</small></strong><span>цель достигнута</span></div></div><div className="goal-numbers"><strong>{money(1245800*factor)} ₽</strong><span>из 1 500 000 ₽</span></div><div className="goal-note"><span>✦</span> {factor>=1?'Отличный темп! Так держать':'Каждый шаг приближает к цели'}</div></>}
  </article>;
}
DashKit.setSettings({gridLayout:{cols:12,rowHeight:8,margin:[20,20],containerPadding:[0,0],compactType:'vertical'},isMobile:window.innerWidth<760});
const widgetPlugin={type:'orbit-widget',defaultLayout:{w:4,h:11,minW:2,minH:5},renderer:(props:PluginWidgetProps)=><Widget {...props}/>};
if(import.meta.hot?.data.orbitPluginRegistered){DashKit.reloadPlugins(widgetPlugin);}else{DashKit.registerPlugins(widgetPlugin);if(import.meta.hot)import.meta.hot.data.orbitPluginRegistered=true;}

function readConfig():Config {try {const raw=JSON.parse(localStorage.getItem('orbit-layout-v1')||'null');return raw&&Array.isArray(raw.items)&&Array.isArray(raw.layout)&&raw.items.every((x:any)=>x.type==='orbit-widget'&&catalog.some(c=>c.kind===x.data?.kind))?raw:structuredClone(initialConfig);}catch{return structuredClone(initialConfig);}}

export function App(){
  const [compact,setCompact]=useState(window.innerWidth<1080);
  const [config,setConfig]=useState<Config>(readConfig);
  const [editing,setEditing]=useState(false);
  const [period,setPeriod]=useState('30');
  const [section,setSection]=useState('Обзор');
  const [modal,setModal]=useState<string|null>(null);
  const [query,setQuery]=useState('');
  const [toast,setToast]=useState('');
  const [mobile,setMobile]=useState(window.innerWidth<760);
  const [savedAt,setSavedAt]=useState('Все изменения сохранены');
  
  useEffect(()=>{const resize=()=>{const m=window.innerWidth<760;setMobile(m);DashKit.setSettings({isMobile:m});if(window.innerWidth<1080)setCompact(true);};window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
  useEffect(()=>{try{localStorage.setItem('orbit-layout-v1',JSON.stringify(config));setSavedAt('Все изменения сохранены');}catch{setSavedAt('Не удалось сохранить в браузере');}},[config]);
  useEffect(()=>{if(!toast)return;const timeout=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(timeout);},[toast]);
  const notify=(message:string)=>setToast(message);
  const remove=(id:string)=>{setConfig(c=>DashKit.removeItem({id,config:c,itemsStateAndParams:{__meta__:{queue:[],version:1}}}).config);};
  const addWidget=(kind:Kind)=>{const item=catalog.find(x=>x.kind===kind)!;setConfig(c=>DashKit.setItem({config:c,item:{type:'orbit-widget',namespace:'default',data:{kind},orderId:Math.max(-1,...c.items.map(x=>x.orderId??0))+1,layout:{x:0,y:Math.max(0,...c.layout.map(l=>l.y+l.h)),w:item.w,h:item.h}}}));notify(`Виджет «${item.title}» добавлен`);};
  const exportCsv=()=>{const rows=['Имя,Email,Сумма,Статус',...transactions.map(t=>`${t.name},${t.email},${t.amount},${t.status}`)];const url=URL.createObjectURL(new Blob(['\ufeff'+rows.join('\n')],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download=`orbit-operations-${period}-days.csv`;a.click();URL.revokeObjectURL(url);notify('Данные экспортированы в CSV');};
  const move=(id:string,direction:number)=>setConfig(c=>{const ordered=[...c.items].sort((a,b)=>(a.orderId??0)-(b.orderId??0));const from=ordered.findIndex(x=>x.id===id);const to=from+direction;if(to<0||to>=ordered.length)return c;[ordered[from],ordered[to]]=[ordered[to],ordered[from]];return ordered.reduce((next,item,index)=>DashKit.setItem({config:next,item:{...item,orderId:index}}),c);});
  const context={period,section,remove,mobile,move,editing,openTransactions:()=>setModal('transactions')};
  const catalogContent=<><div className="modal-title"><div><Text variant="header-1">Добавить виджет</Text><p>Ваш дашборд, ваши правила. Выберите нужные данные.</p></div><Button view="flat" onClick={()=>setModal(null)} aria-label="Закрыть"><Glyph data={Xmark}/></Button></div><TextInput size="l" placeholder="Найти виджет…" value={query} onUpdate={setQuery} startContent={<Glyph data={Magnifier}/>} hasClear/><div className="catalog-grid">{catalog.filter(x=>(x.title+' '+x.description).toLowerCase().includes(query.toLowerCase())).map(x=><div className="catalog-card" key={x.kind}><span className="catalog-icon"><Glyph data={x.icon} size={22}/></span><strong>{x.title}</strong><p>{x.description}</p><Button view="outlined" size="m" onClick={()=>addWidget(x.kind)}><Glyph data={Plus} size={14}/> Добавить</Button></div>)}</div>{!catalog.some(x=>(x.title+' '+x.description).toLowerCase().includes(query.toLowerCase()))&&<div className="empty-search"><Glyph data={Magnifier} size={30}/><Text variant="subheader-2">Ничего не найдено</Text><p>Попробуйте другое название виджета.</p></div>}</>;
  const renderContent=()=> <div className="app-content">
    <header className="topbar"><div className="breadcrumbs">Рабочее пространство <span>/</span> <strong>Дашборды</strong></div><div className="topbar-right"><span className="live-label"><i/>Данные обновлены</span><span className="topbar-divider"/><Button view="flat" size="m" onClick={()=>setModal('notifications')} aria-label="Уведомления"><span className="notification-icon"><Glyph data={Bell}/><i/></span></Button><DropdownMenu renderSwitcher={props=><Button {...props} className="profile-button" view="flat" aria-label="Профиль"><span className="avatar avatar-purple">АК</span></Button>} items={[{text:'Александр Ким · Личный кабинет',action:()=>setModal('profile')},{text:'Настройки пространства',action:()=>setModal('settings')}]}/></div></header>
    <main className="main-content">
      <div className="page-heading"><div><div className="eyebrow">ВАШ БИЗНЕС В ОДНОМ МЕСТЕ</div><div className="title-row"><Text variant="display-2">Мой дашборд</Text><span className="personal-label">Личный</span></div><p>Главное о вашем бизнесе — так, как удобно вам.</p></div><div className="heading-actions"><Button size="l" view="outlined" onClick={exportCsv}><Glyph data={ArrowDownToLine} size={16}/><span>Экспорт</span></Button><Button size="l" view="action" onClick={()=>{setQuery('');setModal('catalog');}}><Glyph data={Plus} size={17}/>Добавить виджет</Button></div></div>
      <div className="dashboard-toolbar"><div className="dashboard-tabs">{['Обзор','Продажи','Маркетинг'].map(t=><Button key={t} className={section===t?'dashboard-tab active':'dashboard-tab'} view="flat" onClick={()=>setSection(t)}>{t==='Обзор'&&<Glyph data={LayoutCells} size={15}/>} {t}</Button>)}</div><div className="filter-actions"><span className="date-select"><Glyph data={Calendar} size={15}/><Select size="m" value={[period]} onUpdate={v=>setPeriod(v[0])} options={[{value:'7',content:'Последние 7 дней'},{value:'30',content:'Последние 30 дней'},{value:'90',content:'Последние 90 дней'}]} aria-label="Период аналитики"/></span><span className="toolbar-divider"/><Button className={editing?'edit-button editing':'edit-button'} size="m" view={editing?'action':'flat'} onClick={()=>{setEditing(!editing);if(editing)notify('Расположение виджетов сохранено');}}><Glyph data={editing?Check:Sliders} size={15}/>{editing?'Готово':'Настроить'}</Button></div></div>
      <div className={`layout-hint ${editing?'layout-hint-editing':''}`}><span><Glyph data={editing?Grip:LayoutCells} size={14}/>{editing?(mobile?'Меняйте порядок виджетов через меню «⋯» в заголовке.':'Перетаскивайте виджеты за заголовок и меняйте размер за нижний правый угол.'):'Всё на своих местах. Настройте расположение виджетов под себя.'}</span>{editing?<Button size="xs" view="flat" onClick={()=>{setConfig(structuredClone(initialConfig));notify('Исходная раскладка восстановлена');}}><Glyph data={ArrowsRotateRight} size={12}/>Сбросить</Button>:<span className="autosave"><Glyph data={CircleCheck} size={13}/>{savedAt}</span>}</div>
      {config.items.length?<div className={`dashboard-grid ${editing?'is-editing':''}`}><DashKit key={String(mobile)} config={config} editMode={editing&&!mobile} noOverlay draggableHandleClassName="widget-drag" overlayMenuItems={[]} context={context} onChange={({config:next})=>setConfig(next)}/></div>:<div className="empty-dashboard"><span className="catalog-icon"><Glyph data={LayoutCells} size={32}/></span><Text variant="header-1">Место для ваших идей</Text><p>Добавьте первый виджет и создайте свой дашборд.</p><Button view="action" size="l" onClick={()=>setModal('catalog')}><Glyph data={Plus}/>Добавить виджет</Button></div>}
      <footer className="dashboard-footer"><span><i/>Демо-данные · Обновляются каждые 5 минут</span><span>Сделано для вашего фокуса <span className="footer-star">✦</span></span></footer>
    </main>
  </div>;
  return <><AsideHeader className="orbit-shell" compact={compact} onChangeCompact={setCompact} hideCollapseButton headerDecoration={false} hideSectionDividers logo={{text:'orbit',icon:Layers3Diagonal,iconSize:29,textSize:28,iconClassName:'brand-logo',onClick:()=>{setSection('Обзор');window.scrollTo(0,0);}}} aboveMenuContent={<div className={`sidebar-intro ${compact?'compact':''}`}>{!compact&&<><Button className="workspace-picker" view="outlined" size="l" width="max" onClick={()=>setModal('workspace')}><span className="workspace-icon">S</span><span className="workspace-name">Studio workspace<span>Pro-план</span></span><Glyph data={ChevronDown} size={14}/></Button><div className="nav-section-label">РАБОЧЕЕ ПРОСТРАНСТВО</div></>}</div>} menuItems={[
    {id:'dashboards',title:'Дашборды',icon:LayoutCells,current:true,rightAdornment:!compact?<span className="nav-count">3</span>:undefined,onItemClick:()=>{setSection('Обзор');setModal(null);}},
    {id:'reports',title:'Отчёты',icon:ChartColumn,onItemClick:()=>setModal('reports')},
    {id:'widgets',title:'Библиотека виджетов',icon:Layers3Diagonal,onItemClick:()=>{setQuery('');setModal('catalog');}},
    {id:'team',title:'Команда',icon:Persons,onItemClick:()=>setModal('team')},
  ]} renderFooter={()=> <div className="sidebar-footer">{!compact&&<div className="upgrade-card"><span className="upgrade-spark">✦</span><strong>Больше возможностей</strong><p>Все данные и команда<br/>в одном пространстве.</p><Button view="outlined" width="max" onClick={()=>setModal('plan')}>Ваш план Pro <Glyph data={ArrowUpRight} size={14}/></Button></div>}<Button view="flat" className="sidebar-bottom-button" onClick={()=>setModal('settings')}><Glyph data={Gear}/>{!compact&&'Настройки'}</Button><Button view="flat" className="sidebar-bottom-button" onClick={()=>setModal('help')}><Glyph data={CircleQuestion}/>{!compact&&'Помощь и поддержка'}</Button>{!compact&&<div className="sidebar-account"><span className="avatar avatar-purple">АК</span><span><strong>Александр Ким</strong><small>Личное пространство</small></span><Button view="flat" size="xs" onClick={()=>setCompact(true)} aria-label="Свернуть меню"><Glyph data={ChevronDown} size={14}/></Button></div>}</div>} renderContent={renderContent}/>
    <Modal open={modal!==null} onClose={()=>setModal(null)} contentClassName={`app-modal ${modal==='catalog'?'catalog-modal':''}`} aria-label="Панель дашборда">
      {modal==='catalog'?catalogContent:<><div className="modal-title"><Text variant="header-1">{({transactions:'Все операции',notifications:'Уведомления',settings:'Настройки дашборда',help:'Всё под вашим контролем',team:'Ваша команда',reports:'Отчёты',workspace:'Studio workspace',profile:'Ваш профиль',plan:'Ваш план — Pro'} as Record<string,string>)[modal||'']}</Text><Button view="flat" onClick={()=>setModal(null)} aria-label="Закрыть"><Glyph data={Xmark}/></Button></div>
        {modal==='transactions'&&<><div className="modal-description">Последние платежи вашего магазина</div><div className="table-scroll"><Table data={transactions} columns={[{id:'name',name:'Клиент'},{id:'amount',name:'Сумма',template:t=>money(t.amount)+' ₽',align:'end'},{id:'status',name:'Статус',template:t=><span className={t.status==='Оплачено'?'paid':'pending'}>{t.status}</span>},{id:'time',name:'Время'}]}/></div><div className="modal-actions"><Button view="action" onClick={exportCsv}><Glyph data={ArrowDownToLine}/>Скачать CSV</Button></div></>}
        {modal==='notifications'&&<div className="notification-card"><span className="catalog-icon"><Glyph data={CircleCheck} size={24}/></span><div><strong>Вы на 83% ближе к цели</strong><p>Выручка в октябре достигла 1 245 800 ₽. Продолжайте в том же темпе!</p><small>Сегодня, 10:42</small></div></div>}
        {modal==='settings'&&<><p>Расположение виджетов автоматически сохраняется в этом браузере.</p><div className="setting-row"><div><strong>Настроить расположение</strong><p>Перемещение и изменение размера виджетов</p></div><Button view="action" onClick={()=>{setEditing(true);setModal(null);}}>Настроить</Button></div><div className="setting-row"><div><strong>Восстановить дашборд</strong><p>Вернуть все 9 виджетов и исходную сетку</p></div><Button view="outlined" onClick={()=>{setConfig(structuredClone(initialConfig));notify('Дашборд восстановлен');setModal(null);}}>Сбросить</Button></div></>}
        {modal==='help'&&<div className="help-content">{[['1','Добавьте важное','Выберите графики и показатели в библиотеке виджетов.'],['2','Расположите по-своему','Нажмите «Настроить», перетаскивайте виджеты за заголовок. Потяните за нижний правый угол, чтобы изменить размер.'],['3','Следите за результатами','Выберите период, переключайте разделы и экспортируйте операции в CSV. Изменения сетки сохраняются автоматически.']].map(([n,t,d])=><div className="help-step" key={n}><span className="workspace-icon">{n}</span><div><strong>{t}</strong><p>{d}</p></div></div>)}</div>}
        {(modal==='team'||modal==='profile')&&<div className="member-card"><span className="avatar avatar-purple">АК</span><div><strong>Александр Ким</strong><p>alex.kim@studio.team</p></div><span className="personal-label">Владелец</span></div>}
        {modal==='reports'&&<><p>Сводка по вашему бизнесу за выбранный период — {period} дней.</p><div className="report-card"><Glyph data={ChartColumn} size={30}/><div><strong>Отчёт по операциям</strong><p>Платежи, клиенты и статусы заказов · CSV</p></div><Button view="action" onClick={exportCsv}>Скачать</Button></div></>}
        {modal==='workspace'&&<div className="member-card"><span className="workspace-icon">S</span><div><strong>Studio workspace</strong><p>Ваше активное рабочее пространство</p></div><Glyph data={Check}/></div>}
        {modal==='plan'&&<><div className="plan-label">PRO</div><Text variant="display-1">Пространство для роста</Text><p>Ваш тариф активен. Неограниченные виджеты, персональная сетка, аналитика и экспорт данных уже доступны.</p><div className="plan-features">{['Неограниченное количество виджетов','Гибкая сетка и сохранение раскладки','Экспорт отчётов в CSV'].map(t=><p key={t}><Glyph data={CircleCheck}/> {t}</p>)}</div></>}
      </>}
    </Modal>{toast&&<div className="toast" role="status"><Glyph data={CircleCheck} size={18}/>{toast}<Button size="xs" view="flat" onClick={()=>setToast('')} aria-label="Скрыть уведомление"><Glyph data={Xmark} size={13}/></Button></div>}
  </>;
}
