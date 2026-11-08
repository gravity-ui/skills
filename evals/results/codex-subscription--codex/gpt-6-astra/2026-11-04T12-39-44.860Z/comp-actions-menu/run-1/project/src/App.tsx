import {useEffect, useState} from 'react';
import {DropdownMenu, Modal} from '@gravity-ui/uikit';
import './styles.css';

type IconName = 'grid'|'file'|'star'|'archive'|'search'|'plus'|'chevron'|'arrow'|'edit'|'copy'|'download'|'trash'|'check'|'close'|'help'|'clock'|'folder';
function Icon({name, size = 20}: {name: IconName; size?: number}) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></>,
    star: <path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-3-5.6 3 1-6.2L3 9.6l6.3-.9z"/>,
    archive: <><rect x="3" y="3" width="18" height="5" rx="1.5"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 12h4"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, chevron: <path d="m8 10 4 4 4-4"/>, arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    edit: <><path d="m15 4 5 5M4 20l5-1L20 8a3.5 3.5 0 0 0-5-5L4 14z"/></>,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/></>,
    trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></>,
    check: <path d="m5 12 4 4L19 6"/>, close: <path d="m6 6 12 12M6 18 18 6"/>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1-1.5 2M12 16h.01"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    folder: <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
type Doc = {id: string; name: string; category: string; color: string; date: string; favorite: boolean; archived: boolean; content: string};
const initialDocs: Doc[] = [
  {id:'strategy', name:'Стратегия развития', category:'Планирование', color:'mint', date:'Сегодня, 12:40', favorite:true, archived:false, content:'Стратегия развития\n\nНаша цель — создавать полезные продукты и делать сложное простым.\n\nПриоритеты\n• Развитие продукта\n• Забота о клиентах\n• Рост команды'},
  {id:'brand', name:'Бренд-платформа', category:'Маркетинг', color:'lilac', date:'Сегодня, 10:15', favorite:false, archived:false, content:'Бренд-платформа\n\nМы объединяем людей и идеи.\n\nНаши ценности: открытость, внимание к деталям и простота.'},
  {id:'report', name:'Отчёт за октябрь', category:'Аналитика', color:'peach', date:'Вчера, 18:30', favorite:false, archived:false, content:'Отчёт за октябрь\n\nРезультаты месяца\n• Завершили исследование пользователей\n• Обновили визуальный стиль\n• Запустили новый проект'},
  {id:'meeting', name:'Заметки со встречи', category:'Команда', color:'blue', date:'Вчера, 14:00', favorite:false, archived:false, content:'Заметки со встречи\n\nОбсудили планы на следующий месяц.\n\nСледующие шаги: собрать обратную связь и подготовить план работы.'},
  {id:'ideas', name:'Идеи для нового проекта', category:'Продукт', color:'sand', date:'2 ноября, 16:20', favorite:true, archived:false, content:'Идеи для нового проекта\n\nМесто для новых мыслей.\n\n• Личный кабинет\n• Библиотека шаблонов\n• Совместная работа'},
];
export function App() {
  const [docs, setDocs] = useState<Doc[]>(() => {try {const saved=localStorage.getItem('kontur-documents'); return saved ? JSON.parse(saved) : initialDocs;} catch {return initialDocs;}});
  const [tab,setTab] = useState('all');
  const [openMenu,setOpenMenu] = useState<string|null>(null);
  const [query,setQuery] = useState('');
  const [toast,setToast] = useState('');
  const [dialog,setDialog] = useState<{type:'rename'|'delete'|'create'|'view'|'help'; doc?:Doc}|null>(null);
  const [name,setName] = useState('');
  useEffect(()=>{localStorage.setItem('kontur-documents',JSON.stringify(docs));},[docs]);
  useEffect(()=>{if(!toast)return; const timer=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(timer);},[toast]);
  const update = (id:string, changes:Partial<Doc>)=>setDocs(list=>list.map(d=>d.id===id?{...d,...changes}:d));
  const notify = (message:string)=>setToast(message);
  const openDialog=(type:'rename'|'delete'|'create'|'view',doc?:Doc)=>{setName(doc?.name??'');setDialog({type,doc});};
  const download=(doc:Doc)=>{const url=URL.createObjectURL(new Blob([doc.content],{type:'text/plain;charset=utf-8'})); const a=document.createElement('a');a.href=url;a.download=doc.name+'.txt';a.click();URL.revokeObjectURL(url);notify('Документ скачан');};
  const actions=(doc:Doc)=>[
    [
      {text:'Переименовать',iconStart:<Icon name="edit" size={18}/>,action:()=>openDialog('rename',doc)},
      {text:'Создать копию',iconStart:<Icon name="copy" size={18}/>,action:()=>{setDocs(list=>[{...doc,id:crypto.randomUUID(),name:doc.name+' — копия',date:'Только что',favorite:false},...list]);notify('Копия документа создана');}},
      {text:'Скачать документ',iconStart:<Icon name="download" size={18}/>,action:()=>download(doc)},
    ],[
      {text:doc.favorite?'Убрать из избранного':'Добавить в избранное',iconStart:<Icon name="star" size={18}/>,action:()=>{update(doc.id,{favorite:!doc.favorite});notify(doc.favorite?'Документ убран из избранного':'Документ добавлен в избранное');}},
      {text:doc.archived?'Восстановить из архива':'Переместить в архив',iconStart:<Icon name="archive" size={18}/>,action:()=>{update(doc.id,{archived:!doc.archived});notify(doc.archived?'Документ восстановлен':'Документ перемещён в архив');}},
    ],[
      {text:'Удалить',theme:'danger' as const,iconStart:<Icon name="trash" size={18}/>,action:()=>openDialog('delete',doc)},
    ]
  ];
  const filtered=docs.filter(d=>(tab==='archive'?d.archived:!d.archived)&&(tab!=='favorites'||d.favorite)&&d.name.toLowerCase().includes(query.toLowerCase()));
  const recent=docs.filter(d=>!d.archived).slice(0,3);
  const counts={all:docs.filter(d=>!d.archived).length,favorites:docs.filter(d=>d.favorite&&!d.archived).length,archive:docs.filter(d=>d.archived).length};
  const tabs=[{id:'all',label:'Все документы',icon:'file'},{id:'favorites',label:'Избранное',icon:'star'},{id:'archive',label:'Архив',icon:'archive'}] as const;
  function submit(event:React.FormEvent){event.preventDefault();if(!name.trim())return;if(dialog?.type==='rename'&&dialog.doc){update(dialog.doc.id,{name:name.trim()});notify('Название документа изменено');}else{setDocs(list=>[{id:crypto.randomUUID(),name:name.trim(),category:'Без категории',color:'mint',date:'Только что',favorite:false,archived:false,content:name.trim()+'\n\nНовый документ.'},...list]);setTab('all');setQuery('');notify('Документ создан');}setDialog(null);}
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" aria-label="Контур — главная" onClick={e=>{e.preventDefault();setTab('all');setQuery('');}}><span className="brand-mark"><i/><i/><i/><i/></span>контур<span className="brand-dot">.</span></a>
      <div className="workspace"><span className="workspace-avatar">С</span><div><strong>Моё пространство</strong><span>Личный аккаунт</span></div><span className="workspace-status"/></div>
      <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav>{tabs.map(t=><button key={t.id} className={`nav-item ${tab===t.id?'active':''}`} onClick={()=>{setTab(t.id);setQuery('');}}><Icon name={t.icon}/><span>{t.label}</span><small>{counts[t.id]}</small></button>)}</nav>
      <div className="sidebar-bottom"><div className="space-note"><span className="note-symbol">✳</span><strong>Место для ваших идей</strong><p>Сохраняйте важное.<br/>Создавайте новое.</p><span className="note-line"/></div><button className="help-button" onClick={()=>setDialog({type:'help'})}><Icon name="help" size={19}/>Помощь и поддержка<Icon name="arrow" size={16}/></button><div className="profile"><span className="avatar">АК</span><div><strong>Алексей К.</strong><span>Личное пространство</span></div><span className="online"/></div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb"><Icon name="folder" size={17}/><span>Рабочее пространство</span><span className="slash">/</span><strong>Документы</strong></div><div className="private-label"><span/>Только для вас</div></header>
      <main>
        <div className="page-heading"><div><div className="eyebrow">ВАШИ ИДЕИ. В ПОРЯДКЕ.</div><h1>Документы<span>.</span></h1><p>Все важные мысли, планы и файлы — в одном месте.</p></div><button className="button primary create-button" onClick={()=>openDialog('create')}><Icon name="plus" size={19}/>Создать документ</button></div>
        <section className="recent-section"><div className="section-heading"><h2>Недавние документы</h2><span><Icon name="clock" size={14}/>Всегда под рукой</span></div><div className="recent-grid">{recent.map((doc,i)=><button key={doc.id} className="recent-card" onClick={()=>openDialog('view',doc)}><div className={`card-art art-${doc.color}`}><span className="art-tag">{doc.category}</span>{i%3===0?<div className="orbit-art"><span/><span/><span/><span/><i/></div>:i%3===1?<div className="tile-art"><span/><span/><span/><span/></div>:<div className="chart-art"><span/><span/><span/><span/><span/></div>}<span className="art-number">0{i+1} /</span></div><div className="card-info"><span className={`file-icon ${doc.color}`}><Icon name="file" size={20}/></span><div><strong>{doc.name}</strong><span>{doc.date}</span></div><Icon name="arrow" size={17}/></div></button>)}</div></section>
        <section className="documents-section"><div className="list-toolbar"><div className="tabs" role="tablist" aria-label="Фильтр документов">{tabs.map(t=><button key={t.id} role="tab" aria-selected={tab===t.id} className={tab===t.id?'selected':''} onClick={()=>setTab(t.id)}>{t.label}<span>{counts[t.id]}</span></button>)}</div><label className="search"><Icon name="search" size={18}/><input placeholder="Найти документ..." aria-label="Найти документ" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Очистить поиск" onClick={()=>setQuery('')}><Icon name="close" size={15}/></button>}</label></div>
        <div className="table-wrap"><table><thead><tr><th>Название<Icon name="chevron" size={14}/></th><th>Категория</th><th>Изменён</th><th><span className="sr-only">Действия</span></th></tr></thead><tbody>{filtered.map(doc=><tr key={doc.id}><td><div className="document-name"><span className={`file-icon ${doc.color}`}><Icon name="file" size={20}/></span><button onClick={()=>openDialog('view',doc)}>{doc.name}</button>{doc.favorite&&<span className="favorite-mark" title="В избранном"><Icon name="star" size={14}/></span>}</div></td><td><span className={`category ${doc.color}`}>{doc.category}</span></td><td className="date-cell">{doc.date}</td><td><DropdownMenu open={openMenu===doc.id} onOpenToggle={(open:boolean)=>setOpenMenu(open?doc.id:null)} items={actions(doc)} size="l" popupProps={{placement:'bottom-end',className:'actions-popup'}} renderSwitcher={props=><button {...props} className="action-button" aria-label={`Действия: ${doc.name}`} aria-haspopup="menu" aria-expanded={openMenu===doc.id}>Действия<Icon name="chevron" size={16}/></button>}/></td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty-state"><Icon name={tab==='archive'?'archive':'search'} size={30}/><h3>{query?'Ничего не найдено':tab==='favorites'?'Пока нет избранных документов':tab==='archive'?'Архив пока пуст':'Здесь появятся ваши документы'}</h3><p>{query?'Попробуйте изменить поисковый запрос.':'Создавайте документы и управляйте ими через меню «Действия».'}</p></div>}</div><div className="table-footer"><span>Показано {filtered.length} из {counts[tab as keyof typeof counts]}</span><span><span className="small-dot"/>Все изменения сохранены</span></div></section>
        <footer className="page-footer"><span>Немного порядка. Больше пространства для главного.</span><span>Сделано для ваших идей <span className="footer-spark">✳</span></span></footer>
      </main>
    </div>
    <Modal open={!!dialog} onClose={()=>setDialog(null)} aria-label={dialog?.type==='delete'?'Удалить документ':dialog?.type==='view'?dialog.doc?.name:'Документ'}><div className="dialog"><button className="dialog-close" aria-label="Закрыть" onClick={()=>setDialog(null)}><Icon name="close"/></button>{dialog?.type==='delete'?<><span className="dialog-icon"><Icon name="trash" size={24}/></span><h2>Удалить документ?</h2><p>Документ «{dialog.doc?.name}» будет удалён. Это действие нельзя отменить.</p><div className="dialog-actions"><button className="button secondary" onClick={()=>setDialog(null)}>Отмена</button><button className="button danger" onClick={()=>{setDocs(list=>list.filter(d=>d.id!==dialog.doc?.id));setDialog(null);notify('Документ удалён');}}>Удалить</button></div></>:dialog?.type==='view'?<><span className={`file-icon ${dialog.doc?.color}`}><Icon name="file"/></span><h2>{dialog.doc?.name}</h2><div className="document-content">{dialog.doc?.content.split('\n').slice(1).join('\n')}</div><button className="button secondary" onClick={()=>dialog.doc&&download(dialog.doc)}><Icon name="download" size={18}/>Скачать документ</button></>:dialog?.type==='help'?<><h2>Всё под рукой</h2><p>Нажмите «Создать документ», чтобы добавить новый файл.</p><p>Меню «Действия» рядом с документом позволяет переименовать, скопировать, скачать, добавить в избранное или переместить его в архив.</p><p>Документы сохраняются в этом браузере. Для навигации по меню используйте стрелки, для выбора — Enter, для закрытия — Escape.</p></>:<form onSubmit={submit}><h2>{dialog?.type==='rename'?'Переименовать документ':'Новый документ'}</h2><p>{dialog?.type==='rename'?'Дайте документу понятное название.':'Хорошие идеи начинаются с чистого листа.'}</p><label className="name-label" htmlFor="document-title">Название документа</label><input id="document-title" autoFocus className="name-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Например, Планы на ноябрь" maxLength={100}/><div className="dialog-actions"><button type="button" className="button secondary" onClick={()=>setDialog(null)}>Отмена</button><button disabled={!name.trim()} className="button primary" type="submit">{dialog?.type==='rename'?'Сохранить':'Создать документ'}</button></div></form>}</div></Modal>
    {toast&&<div className="toast" role="status"><span><Icon name="check" size={17}/></span>{toast}<button aria-label="Закрыть уведомление" onClick={()=>setToast('')}><Icon name="close" size={16}/></button></div>}
  </div>;
}
