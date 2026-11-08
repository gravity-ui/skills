import {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {DashKit, type DashKitProps, type PluginWidgetProps} from '@gravity-ui/dashkit';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {Button, Icon, Text, Select, Modal, TextInput, DropdownMenu, Table, configure} from '@gravity-ui/uikit';
import {LayoutCellsLarge, ChartLine, ChartPie, FileText, Database, Gear, CircleQuestion, Plus, ChevronDown, ChevronRight, ArrowUpRight, ArrowDownToLine, ArrowRotateRight, Bell, Magnifier, Check, Xmark, Grip, Sliders, Calendar, Persons, ShoppingBag, Wallet, Target, CircleInfo, ArrowDownRight} from '@gravity-ui/icons';
import './styles.css';

configure({lang: 'ru'});
DashKit.setSettings({gridLayout: {cols: 36, rowHeight: 8, margin: [16, 16], containerPadding: [0, 0], compactType: 'vertical'}});
type Config = DashKitProps['config'];
type Kind = 'revenue' | 'orders' | 'visitors' | 'conversion' | 'revenue-chart' | 'traffic' | 'recent' | 'goal';
const catalog: {kind: Kind; title: string; description: string; icon: typeof ChartLine}[] = [
  {kind:'revenue',title:'Выручка',description:'Общая выручка и динамика роста',icon:Wallet},
  {kind:'orders',title:'Заказы',description:'Количество заказов за период',icon:ShoppingBag},
  {kind:'visitors',title:'Посетители',description:'Уникальные посетители вашего сайта',icon:Persons},
  {kind:'conversion',title:'Конверсия',description:'Доля посетителей, совершивших покупку',icon:Target},
  {kind:'revenue-chart',title:'Динамика выручки',description:'Выручка по дням и сравнение периодов',icon:ChartLine},
  {kind:'traffic',title:'Источники трафика',description:'Откуда приходят ваши посетители',icon:ChartPie},
  {kind:'recent',title:'Последние заказы',description:'Покупатели, суммы и статусы заказов',icon:FileText},
  {kind:'goal',title:'Цель на месяц',description:'Прогресс выполнения плана продаж',icon:Target},
];
const initialConfig: Config = {
  salt: 'metric', counter: 8, aliases: {}, connections: [],
  items: catalog.map((c,i)=>({id: c.kind, type:'metric-widget', namespace:'default', data:{kind:c.kind}, orderId:i})),
  layout: [
    ...['revenue','orders','visitors','conversion'].map((i,n)=>({i,x:n*9,y:0,w:9,h:7,minW:7,minH:7})),
    {i:'revenue-chart',x:0,y:7,w:24,h:15,minW:12,minH:12},
    {i:'traffic',x:24,y:7,w:12,h:15,minW:10,minH:13},
    {i:'recent',x:0,y:22,w:24,h:13,minW:12,minH:10},
    {i:'goal',x:24,y:22,w:12,h:13,minW:10,minH:11},
  ],
};
const storageKey='metric-dashboard-v1';
function loadConfig(): Config {
  try {const data=JSON.parse(localStorage.getItem(storageKey)||'null'); if(data && Array.isArray(data.items) && Array.isArray(data.layout) && data.items.every((i: {data?:{kind:Kind}})=>catalog.some(c=>c.kind===i.data?.kind))) return data;} catch { /* Start with a fresh dashboard when browser storage is unavailable. */ }
  return structuredClone(initialConfig);
}
const businessData = [
  {id:'#1048',name:'Александр Иванов',initials:'АИ',product:'Подписка Pro',date:'30 июн, 14:32',amount:12900,status:'Оплачен',tone:'mint'},
  {id:'#1047',name:'Мария Смирнова',initials:'МС',product:'Подписка Team',date:'30 июн, 14:18',amount:24900,status:'Оплачен',tone:'lavender'},
  {id:'#1046',name:'Дмитрий Козлов',initials:'ДК',product:'Подписка Pro',date:'30 июн, 13:56',amount:12900,status:'В обработке',tone:'sand'},
  {id:'#1045',name:'Анна Петрова',initials:'АП',product:'Подписка Starter',date:'30 июн, 13:41',amount:4900,status:'Оплачен',tone:'blue'},
  {id:'#1044',name:'Иван Соколов',initials:'ИС',product:'Подписка Pro',date:'30 июн, 13:20',amount:12900,status:'Оплачен',tone:'mint'},
];
const format=(n:number)=>Math.round(n).toLocaleString('ru-RU');
const trend=[22,27,25,35,29,31,42,36,39,48,43,52,50,42,46,61,54,62,60,74,66,70,79,72,86,79,88,83,92,96];
const DashboardContext=createContext({period:'30',compare:true,editing:false,remove:(_id:string)=>{},duplicate:(_id:string)=>{},details:(_name:string)=>{}});
const color='var(--g-color-text-brand)';
function Sparkline({index=0}: {index?:number}) {
  const data: ChartData={chart:{margin:{top:4,right:0,bottom:0,left:0}},legend:{enabled:false},tooltip:{enabled:false},xAxis:{visible:false},yAxis:[{visible:false}],series:{data:[{type:'area',name:'Динамика',color,fillColor:'var(--g-color-base-selection)',opacity:0.6,data:trend.slice(index,index+22).map((y,x)=>({x,y:y+(x%4)*5})),lineWidth:1.8}]}};
  return <div className="sparkline"><Chart data={data}/></div>;
}
function Widget({id, data}: PluginWidgetProps) {
  const ctx=useContext(DashboardContext);
  const kind=data.kind as Kind;
  const spec=catalog.find(c=>c.kind===kind)!;
  const factor=ctx.period==='7'?0.26:ctx.period==='90'?2.84:1;
  const [chartView,setChartView]=useState('days');
  const statIndex=['revenue','orders','visitors','conversion'].indexOf(kind);
  const changes=['12,8','8,2','16,4','2,1'];
  const values=[`${format(1245800*factor)} ₽`,format(384*factor),format(24680*factor),'3,24 %'];
  const menu=<DropdownMenu size="s" defaultSwitcherProps={{view:'flat', 'aria-label':`Действия: ${spec.title}`}} items={[{text:'Подробнее',action:()=>ctx.details(spec.title)},{text:'Дублировать виджет',action:()=>ctx.duplicate(id)},{text:'Удалить виджет',theme:'danger',action:()=>ctx.remove(id)}]}/>;
  const handle=<span className="widget-handle" title={ctx.editing?'Перетащите виджет':'Нажмите «Настроить», чтобы переместить'}><Icon data={Grip} size={14}/></span>;
  return <article className={`widget ${statIndex>=0?'stat-widget':''} ${kind==='goal'?'goal-widget':''}`}>
    <div className="widget-heading"><div className="widget-title">{handle}<span>{spec.title}</span>{statIndex>=0&&<Icon data={CircleInfo} size={13}/>}</div>{menu}</div>
    {statIndex>=0 ? <><div className="stat-content"><div className="stat-value">{values[statIndex]}</div><Sparkline index={statIndex*2}/></div><div className="stat-footer"><span className="positive"><Icon data={ArrowUpRight} size={12}/>{changes[statIndex]}%</span><span>к прошлому периоду</span></div></>:null}
    {kind==='revenue-chart'&&<><div className="chart-subhead"><span className="muted">Выручка за период, тыс. ₽</span><div className="segmented">{[['days','По дням'],['weeks','По неделям']].map(([value,label])=><Button key={value} size="s" view={chartView===value?'raised':'flat-secondary'} onClick={()=>setChartView(value)}>{label}</Button>)}</div></div><div className="chart-legend"><span><i className="dot brand"/>Текущий период</span>{ctx.compare&&<span><i className="dot previous"/>Предыдущий период</span>}</div><div className="revenue-plot"><Chart data={{chart:{margin:{top:12,right:12,bottom:4,left:0}},legend:{enabled:false},xAxis:{type:'category',categories:chartView==='days'?Array.from({length:30},(_,i)=>`${i+1} июн`):['1–7 июн','8–14 июн','15–21 июн','22–30 июн'],ticks:{pixelInterval:95}},yAxis:[{min:0,max:120*factor, ticks:{pixelInterval:48},labels:{style:{fontSize:'10px'}},grid:{enabled:true}}],series:{data:[...(ctx.compare?[{type:'line' as const,name:'Предыдущий период',color:'var(--g-color-chart-comparison)',dashStyle:'Dash' as const,lineWidth:2,data:(chartView==='days'?trend.map((v,i)=>v*0.67+Math.sin(i)*7):[30,40,52,63]).map((y,x)=>({x,y:y*factor}))}]:[]),{type:'area',name:'Текущий период',color,fillColor:'var(--g-color-base-selection)',opacity:0.55,lineWidth:2.5,data:(chartView==='days'?trend.map((v,i)=>v+Math.sin(i*1.6)*12):[35,49,63,87]).map((y,x)=>({x,y:y*factor}))}]}}}/></div></>}
    {kind==='traffic'&&<><div className="muted widget-subtitle">Распределение посетителей</div><div className="donut-wrap"><Chart data={{chart:{margin:{top:0,right:0,bottom:0,left:0}},legend:{enabled:false},series:{data:[{type:'pie',innerRadius:'76%',radius:'95%',borderWidth:4,borderColor:'var(--g-color-base-background)',dataLabels:{enabled:false},data:[{name:'Прямые переходы',value:42,color:'var(--g-color-chart-one)'},{name:'Поиск',value:32,color:'var(--g-color-chart-two)'},{name:'Социальные сети',value:18,color:'var(--g-color-chart-three)'},{name:'Другие',value:8,color:'var(--g-color-chart-four)'}]}]}}}/><div className="donut-center"><strong>{format(24680*factor)}</strong><span>посетителей</span></div></div><div className="traffic-legend">{[['Прямые переходы','42','one'],['Поиск','32','two'],['Социальные сети','18','three'],['Другие','8','four']].map(([name,percent,tone])=><div key={name}><span><i className={`dot chart-${tone}`}/>{name}</span><strong>{percent}%</strong></div>)}</div></>}
    {kind==='recent'&&<><div className="orders-subhead"><span className="muted">Последние покупки ваших клиентов</span><Button view="flat" size="s" onClick={()=>ctx.details('Все заказы')}>Все заказы <Icon data={ChevronRight} size={12}/></Button></div><div className="orders-table"><Table edgePadding data={businessData.slice(0,4)} columns={[{id:'name',name:'Клиент',template:item=><div className="customer"><span className={`mini-avatar ${item.tone}`}>{item.initials}</span><div>{item.name}<small>{item.product}</small></div></div>},{id:'date',name:'Дата',className:'muted'},{id:'amount',name:'Сумма',template:item=><strong className="amount">{format(item.amount)} ₽</strong>},{id:'status',name:'Статус',template:item=><span className={`status ${item.status==='Оплачен'?'paid':'pending'}`}><i/>{item.status}</span>}]} width="max" onRowClick={item=>ctx.details(`Заказ ${item.id}`)}/></div></>}
    {kind==='goal'&&<><div className="goal-intro"><div className="goal-icon"><Icon data={Target} size={22}/></div><span>План по выручке<small>Июнь 2025</small></span><span className="goal-percentage">83<span>%</span></span></div><div className="goal-track"><div/></div><div className="goal-numbers"><strong>1 245 800 ₽</strong><span>из 1 500 000 ₽</span></div><div className="goal-message"><span className="goal-spark">✧</span><div>Отличный темп!<p>До цели осталось 254 200 ₽.<br/>Продолжайте в том же духе.</p></div></div><div className="goal-bottom"><span className="positive"><Icon data={ArrowUpRight} size={13}/> На 12,8% выше прошлого месяца</span></div></>}
  </article>;
}
DashKit.registerPlugins({type:'metric-widget',defaultLayout:{w:12,h:13,minW:7,minH:7},renderer:(props: PluginWidgetProps)=><Widget {...props}/>});

function BrandIcon(){return <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor"><rect x="2" y="13" width="6" height="13" rx="2"/><rect x="11" y="6" width="6" height="20" rx="2"/><rect x="20" y="2" width="6" height="24" rx="2"/></svg>}
export function App() {
  const [config,setConfig]=useState<Config>(loadConfig);
  const [editing,setEditing]=useState(false);
  const snapshot=useRef(config);
  const [period,setPeriod]=useState('30');
  const [compare,setCompare]=useState(true);
  const [compact,setCompact]=useState(window.innerWidth<1000);
  const [small,setSmall]=useState(window.innerWidth<700);
  const [modal,setModal]=useState('');
  const [query,setQuery]=useState('');
  const [toast,setToast]=useState('');
  const [saveError,setSaveError]=useState(false);
  const [activeNav,setActiveNav]=useState('dashboard');
  const [updated,setUpdated]=useState('только что');
  useEffect(()=>{const onResize=()=>{setSmall(window.innerWidth<700); if(window.innerWidth<1000)setCompact(true)};window.addEventListener('resize',onResize);return()=>window.removeEventListener('resize',onResize)},[]);
  useEffect(()=>{if(!editing)try{localStorage.setItem(storageKey,JSON.stringify(config));setSaveError(false)}catch{setSaveError(true)}},[config,editing]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(timer)},[toast]);
  const notify=(message:string)=>setToast(message);
  const edit=()=>{snapshot.current=structuredClone(config);setEditing(true)};
  const remove=(id:string)=>{setConfig(c=>({...c,items:c.items.filter(i=>i.id!==id),layout:c.layout.filter(i=>i.i!==id)}));notify('Виджет удалён. Вернуть его можно в каталоге.')};
  const add=(kind:Kind)=>{
    const meta=initialConfig.layout.find(l=>l.i===kind)!;
    const id=`${kind}-${Date.now()}`;
    setConfig(c=>({...c,counter:c.counter+1,items:[...c.items,{id,type:'metric-widget',namespace:'default',data:{kind}}],layout:[...c.layout,{...meta,i:id,x:0,y:Math.max(0,...c.layout.map(l=>l.y+l.h))}]}));
    setModal('');notify('Виджет добавлен на дашборд');
  };
  const duplicate=(id:string)=>{const item=config.items.find(i=>i.id===id);if(item)add(item.data.kind as Kind)};
  const exportData=()=>{const csv='\uFEFFЗаказ;Клиент;Продукт;Сумма;Статус\n'+businessData.map(o=>[o.id,o.name,o.product,o.amount,o.status].join(';')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='metric-orders-june-2025.csv';a.click();URL.revokeObjectURL(url);notify('Отчёт CSV скачан')};
  const navigate=(id:string)=>{if(id==='dashboard'){setActiveNav(id);return}setModal(id==='analytics'?'Аналитика':id==='reports'?'Отчёты':'Источники данных')};
  const visibleConfig=useMemo(()=>small?{...config,layout:config.layout.map((l,i)=>({...l,x:0,y:i*16,w:36,h:['revenue','orders','visitors','conversion'].includes(String(config.items.find(item=>item.id===l.i)?.data.kind))?7:15,minW:1}))}:config,[config,small]);
  const ctx={period,compare,editing,remove,duplicate,details:setModal};
  const openCatalog=()=>{setQuery('');setModal('Добавить виджет')};
  const content=<main className="main">
    <header className="topbar"><div className="breadcrumbs"><span>Рабочее пространство</span><Icon data={ChevronRight} size={12}/><strong>Дашборды</strong></div><div className="topbar-right"><span className="demo-indicator"><i/>Демо-данные</span><Button view="flat" aria-label="Поиск" onClick={()=>{setQuery('');setModal('Поиск')}}><Icon data={Magnifier} size={18}/></Button><Button view="flat" className="notification-button" aria-label="Уведомления" onClick={()=>setModal('Уведомления')}><Icon data={Bell} size={18}/><span className="notification-dot"/></Button><span className="topbar-divider"/><DropdownMenu renderSwitcher={props=><Button {...props} view="flat" className="profile-button"><span className="profile-avatar">АК</span></Button>} items={[{text:'Алексей Козлов · Владелец',action:()=>setModal('Профиль')},{text:'Настройки пространства',action:()=>setModal('Настройки')}]} /></div></header>
    <div className="page-content"><div className="title-row"><div><div className="eyebrow">ВАШ БИЗНЕС В ЦИФРАХ</div><Text variant="display-1" as="h1">Обзор бизнеса <span className="title-dot"/></Text><p className="page-description">Всё важное в одном месте. Ваш дашборд — ваши правила.</p></div><div className="title-actions">{editing?<><Button size="l" onClick={()=>{setConfig(snapshot.current);setEditing(false);notify('Изменения отменены')}}>Отмена</Button><Button size="l" view="action" onClick={()=>{setEditing(false);notify('Расположение виджетов сохранено')}}><Icon data={Check} size={16}/>Сохранить</Button></>:<><Button size="l" view="outlined" onClick={edit}><Icon data={Sliders} size={16}/>Настроить</Button><Button size="l" view="action" onClick={openCatalog}><Icon data={Plus} size={17}/>Добавить виджет</Button></>}</div></div>
    <div className="dashboard-tabs"><Button view="flat" className="dashboard-tab active" onClick={()=>setActiveNav('dashboard')}><Icon data={LayoutCellsLarge} size={15}/>Основной дашборд</Button><span className="tab-count">{config.items.length}</span><Button view="flat" className="add-dashboard" aria-label="Добавить виджет" onClick={openCatalog}><Icon data={Plus} size={16}/></Button><div className="saved-status"><Icon data={saveError?CircleInfo:Check} size={13}/>{editing?'Режим редактирования':saveError?'Не удалось сохранить в браузере':'Все изменения сохранены'}</div></div>
    <div className="filter-row"><div className="filters"><div className="date-filter"><Icon data={Calendar} size={15}/><Select aria-label="Период данных" size="m" value={[period]} onUpdate={v=>setPeriod(v[0])} options={[{value:'7',content:'24–30 июня 2025'},{value:'30',content:'1–30 июня 2025'},{value:'90',content:'1 апреля – 30 июня 2025'}]}/></div><Button view="flat-secondary" onClick={()=>setPeriod(period==='30'?'7':'30')}>{period==='7'?'Последние 7 дней':period==='90'?'Последние 90 дней':'Последние 30 дней'}<Icon data={ChevronDown} size={12}/></Button><span className="filter-divider"/><Button view={compare?'flat':'flat-secondary'} selected={compare} className="compare-button" onClick={()=>setCompare(v=>!v)}><Icon data={ChartLine} size={15}/>Сравнить с прошлым периодом</Button></div><Button view="flat-secondary" onClick={exportData}><Icon data={ArrowDownToLine} size={15}/>Экспорт</Button></div>
    {editing&&<div className="edit-banner"><Icon data={Grip} size={17}/><span>Перетаскивайте виджеты за значок <b>⠿</b> и меняйте размер за нижний правый угол.</span><Button size="s" view="flat" onClick={()=>setConfig(structuredClone(initialConfig))}>Сбросить сетку</Button></div>}
    <DashboardContext.Provider value={ctx}><div className={`dashboard-grid ${editing?'is-editing':''}`}><DashKit config={visibleConfig} editMode={editing&&!small} noOverlay draggableHandleClassName="widget-handle" onChange={({config:next})=>{if(!small)setConfig(next)}}/>{config.items.length===0&&<div className="empty-state"><Icon data={LayoutCellsLarge} size={36}/><Text variant="header-1">Здесь начинается ваш дашборд</Text><p>Добавьте показатели, которые важны именно вам.</p><Button view="action" onClick={openCatalog}>Добавить первый виджет</Button></div>}</div></DashboardContext.Provider>
    <Button view="flat" className="add-widget-area" onClick={openCatalog}><span className="add-widget-icon"><Icon data={Plus} size={18}/></span><span>Есть место для большего <span className="muted">— добавьте свой виджет</span></span></Button>
    <footer className="page-footer"><span><i className="live-dot"/>Данные обновлены {updated}<Button view="flat-secondary" size="s" aria-label="Обновить данные" onClick={()=>{setUpdated(new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}));notify('Демонстрационные данные актуальны')}}><Icon data={ArrowRotateRight} size={12}/></Button></span><span>Создано для ваших решений <span className="footer-brand">metric</span></span></footer>
    </div>
  </main>;
  return <><AsideHeader className="app-navigation" compact={compact} onChangeCompact={setCompact} hideCollapseButton={small} logo={{text:()=> <span className="brand-name">metric<span>®</span></span>,icon:BrandIcon,iconSize:28,href:'#',onClick:()=>setActiveNav('dashboard')}} aboveMenuContent={<div className={`workspace ${compact?'compact':''}`}>{!compact&&<><DropdownMenu renderSwitcher={props=><Button {...props} size="xl" view="outlined" className="workspace-switch"><span className="workspace-avatar">S</span><span className="workspace-label">Студия Studio<small>Рабочее пространство</small></span><Icon data={ChevronDown} size={13}/></Button>} items={[{text:'Студия Studio ✓',action:()=>notify('Вы в рабочем пространстве «Студия Studio»')},{text:'Настройки пространства',action:()=>setModal('Настройки')}]} /><div className="nav-section-label">РАБОЧЕЕ ПРОСТРАНСТВО</div></>}</div>} menuItems={[{id:'dashboard',title:'Дашборды',icon:LayoutCellsLarge,current:activeNav==='dashboard',rightAdornment:<span className="nav-count">1</span>},{id:'analytics',title:'Аналитика',icon:ChartLine},{id:'reports',title:'Отчёты',icon:FileText},{id:'sources',title:'Источники данных',icon:Database}].map(item=>({...item,onItemClick:()=>navigate(item.id)}))} renderFooter={({compact:isCompact})=><div className={`sidebar-footer ${isCompact?'compact':''}`}>{!isCompact&&<div className="workspace-tip"><span className="tip-symbol">✧</span><strong>Пространство для идей</strong><p>Соберите дашборд, который<br/>работает на вас.</p><Button view="flat" size="s" onClick={()=>setModal('Как настроить дашборд')}>Узнать больше <Icon data={ArrowUpRight} size={14}/></Button></div>}<Button view="flat-secondary" className="sidebar-footer-button" onClick={()=>setModal('Настройки')}><Icon data={Gear} size={18}/>{!isCompact&&'Настройки'}</Button><Button view="flat-secondary" className="sidebar-footer-button" onClick={()=>setModal('Как настроить дашборд')}><Icon data={CircleQuestion} size={18}/>{!isCompact&&'Помощь и поддержка'}</Button>{!isCompact&&<div className="sidebar-profile"><span className="profile-avatar">АК</span><div>Алексей Козлов<small>Личный аккаунт</small></div><Button view="flat" size="s" aria-label="Профиль" onClick={()=>setModal('Профиль')}><Icon data={ChevronDown} size={13}/></Button></div>}</div>} renderContent={()=>content}/>
    <Modal open={!!modal} onOpenChange={open=>{if(!open)setModal('')}} contentClassName={`app-modal ${modal==='Добавить виджет'?'catalog-modal':''}`} aria-label={modal}><div className="modal-header"><Text variant="header-1">{modal}</Text><Button view="flat" aria-label="Закрыть" onClick={()=>setModal('')}><Icon data={Xmark} size={20}/></Button></div><ModalBody modal={modal} query={query} setQuery={setQuery} add={add} exportData={exportData} setModal={setModal} notify={notify} reset={()=>{setConfig(structuredClone(initialConfig));setModal('');notify('Исходный дашборд восстановлен')}}/></Modal>
    {toast&&<div className="toast" role="status"><span><Icon data={Check} size={16}/></span>{toast}<Button view="flat" size="s" aria-label="Скрыть уведомление" onClick={()=>setToast('')}><Icon data={Xmark} size={14}/></Button></div>}
  </>;
}
function ModalBody({modal,query,setQuery,add,exportData,setModal,notify,reset}:{modal:string;query:string;setQuery:(v:string)=>void;add:(k:Kind)=>void;exportData:()=>void;setModal:(s:string)=>void;notify:(s:string)=>void;reset:()=>void}) {
  if(modal==='Добавить виджет'||modal==='Поиск') return <><p className="muted">Выберите, какие данные вы хотите видеть на дашборде.</p><TextInput value={query} onUpdate={setQuery} placeholder="Найти виджет…" size="l" startContent={<Icon data={Magnifier} size={17}/>} autoFocus/><div className="catalog-grid">{catalog.filter(c=>`${c.title} ${c.description}`.toLowerCase().includes(query.toLowerCase())).map(c=><div className="catalog-item" key={c.kind}><span className="catalog-icon"><Icon data={c.icon} size={24}/></span><Text variant="subheader-2">{c.title}</Text><p>{c.description}</p><Button view="outlined" onClick={()=>add(c.kind)}><Icon data={Plus} size={14}/>Добавить</Button></div>)}</div>{!catalog.some(c=>`${c.title} ${c.description}`.toLowerCase().includes(query.toLowerCase()))&&<p className="empty-search">Ничего не найдено. Попробуйте другой запрос.</p>}</>;
  if(modal==='Все заказы'||modal.startsWith('Заказ ')) {const rows=modal==='Все заказы'?businessData:businessData.filter(o=>`Заказ ${o.id}`===modal);return <><p className="muted">Демонстрационные заказы · 30 июня 2025</p><Table data={rows} columns={[{id:'id',name:'Заказ'},{id:'name',name:'Клиент'},{id:'product',name:'Подписка'},{id:'amount',name:'Сумма',template:i=>`${format(i.amount)} ₽`},{id:'status',name:'Статус'}]}/><Button className="modal-action" view="action" onClick={exportData}><Icon data={ArrowDownToLine} size={16}/>Скачать CSV</Button></>}
  if(modal==='Источники данных')return <><p className="muted">Дашборд работает на встроенном наборе демонстрационных данных.</p><div className="source-row"><Icon data={Database} size={28}/><div><strong>Studio Demo</strong><p>Продажи, посетители и источники трафика</p></div><span className="status paid">Подключён</span></div><p className="modal-note">Внешние сервисы не подключены. Все данные доступны локально и не требуют авторизации.</p></>;
  if(modal==='Отчёты')return <><p className="muted">Готовые отчёты по вашему бизнесу</p><div className="source-row"><Icon data={FileText} size={28}/><div><strong>Заказы · Июнь 2025</strong><p>5 заказов · CSV</p></div><Button view="action" onClick={exportData}>Скачать</Button></div></>;
  if(modal==='Уведомления')return <div className="notice"><span className="catalog-icon"><Icon data={Check} size={25}/></span><div><strong>Дашборд готов к работе</strong><p>8 виджетов помогут следить за бизнесом. Настройте расположение под свои задачи.</p><small className="muted">Только что</small></div></div>;
  if(modal==='Настройки')return <><p>Расположение и состав виджетов сохраняются в этом браузере.</p><div className="settings-row"><div><strong>Восстановить исходный дашборд</strong><p className="muted">Вернуть восемь стандартных виджетов и их расположение.</p></div><Button view="outlined" onClick={reset}>Восстановить</Button></div></>;
  if(modal==='Новый дашборд')return <><p>Добавьте нужные виджеты в ваш основной дашборд. Можно добавить несколько экземпляров любого виджета и расположить их по-своему.</p><Button view="action" onClick={()=>setModal('Добавить виджет')}>Открыть каталог виджетов</Button></>;
  if(modal==='Профиль')return <div className="profile-details"><span className="profile-avatar">АК</span><div><Text variant="subheader-3">Алексей Козлов</Text><p>Владелец · Студия Studio</p><span className="muted">Локальный демонстрационный аккаунт</span></div></div>;
  if(modal==='Как настроить дашборд')return <ol className="help-list"><li><strong>Добавьте нужные показатели.</strong><p>Откройте каталог кнопкой «Добавить виджет».</p></li><li><strong>Настройте расположение.</strong><p>Нажмите «Настроить» и перетащите виджет за значок ⠿. Потяните за нижний правый угол, чтобы изменить размер.</p></li><li><strong>Сохраните результат.</strong><p>Нажмите «Сохранить». Ваша сетка останется после обновления страницы. На телефоне виджеты выстраиваются в одну колонку.</p></li></ol>;
  const spec=catalog.find(c=>c.title===modal);
  return <><p className="muted">{spec?.description||'Ключевые показатели вашего бизнеса'} · Июнь 2025</p><div className="detail-metrics"><div><span>Выручка</span><strong>1 245 800 ₽</strong><small className="positive">+12,8% к маю</small></div><div><span>Заказы</span><strong>384</strong><small className="positive">+8,2% к маю</small></div><div><span>Посетители</span><strong>24 680</strong><small className="positive">+16,4% к маю</small></div></div><p className="modal-note">Показатели рассчитаны на демонстрационном наборе данных. Динамика выручки и распределение трафика доступны в виджетах основного дашборда.</p></>;
}
