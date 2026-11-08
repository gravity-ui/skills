import {useEffect, useRef, useState, type ReactNode} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Button, Checkbox, Icon, Label, Modal, Progress, Switch, Text, TextArea, TextInput, ThemeProvider} from '@gravity-ui/uikit';
import {ArrowRight, ArrowUpRight, Bell, Check, ChevronDown, CircleCheck, CircleQuestion, Clock, Ellipsis, FileText, Folder, House, Layers, Magnifier, Moon, Plus, Rocket, Sparkles, Sun, Xmark} from '@gravity-ui/icons';
import './styles.css';

type Page = 'overview' | 'projects' | 'notes';
type Project = {id: string; title: string; description: string; category: string; color: string; progress: number; total: number; date: string; members: string[]};
type Note = {id: string; title: string; content: string; tag: string; date: string};
type Task = {id: number; title: string; project: string; color: string; done: boolean; time: string};
const initialProjects: Project[] = [
  {id:'1', title:'Редизайн сайта', description:'Новый взгляд на наш цифровой дом', category:'Дизайн', color:'purple', progress:65, total:20, date:'12 ноя', members:['АК','МС','ДВ']},
  {id:'2', title:'Мобильное приложение', description:'Полезный продукт всегда под рукой', category:'Разработка', color:'blue', progress:40, total:15, date:'24 ноя', members:['МС','ЕН']},
  {id:'3', title:'Маркетинговая стратегия', description:'Большие идеи для роста бренда', category:'Маркетинг', color:'orange', progress:85, total:12, date:'8 ноя', members:['АК','ЕН','МС']},
];
const initialNotes: Note[] = [
  {id:'1', title:'Идеи для нового сайта', content:'Больше воздуха, меньше лишнего.\n\n— Сделать акцент на типографике\n— Добавить живые истории команды\n— Использовать мягкие цвета и простую навигацию\n\nХороший дизайн помогает сосредоточиться на главном.', tag:'Дизайн', date:'4 ноября'},
  {id:'2', title:'Итоги встречи с командой', content:'Обсудили планы на ноябрь и распределили задачи.\n\nВ приоритете — прототип мобильного приложения и новая главная страница. Следующая встреча в пятницу.\n\nНе забыть собрать обратную связь по макетам.', tag:'Команда', date:'3 ноября'},
  {id:'3', title:'Маленькие шаги, большой результат', content:'Не обязательно делать всё сразу.\n\nВыбери одну важную задачу на день. Отключи уведомления, налей кофе и начни. Иногда это всё, что нужно.\n\nМесто для будущих идей ✨', tag:'Личное', date:'2 ноября'},
];
const initialTasks: Task[] = [
  {id:1,title:'Подготовить макеты главной страницы',project:'Редизайн сайта',color:'purple',done:false,time:'Сегодня'},
  {id:2,title:'Обсудить прототип с командой',project:'Мобильное приложение',color:'blue',done:false,time:'14:00'},
  {id:3,title:'Собрать референсы для кампании',project:'Маркетинговая стратегия',color:'orange',done:false,time:'Сегодня'},
  {id:4,title:'Обновить бриф проекта',project:'Редизайн сайта',color:'purple',done:true,time:'Готово'},
];
function useStored<T,>(key: string, initial: T) {
  const [value,setValue] = useState<T>(()=>{try {return JSON.parse(localStorage.getItem(key) || 'null') ?? initial;} catch {return initial;}});
  useEffect(()=>{try {localStorage.setItem(key,JSON.stringify(value));}catch {}},[key,value]);
  return [value,setValue] as const;
}
function Glyph({data,size=18}: {data: typeof House;size?:number}) {return <Icon data={data} size={size}/>;}
function OrbitLogo() {return <span className="orbit-logo"><span/><span/></span>;}
function Avatars({members}: {members:string[]}) {return <div className="avatars">{members.map((m,i)=><span className={`avatar avatar-${i}`} key={m} title={m==='АК'?'Александр Ковалёв':m==='МС'?'Мария Смирнова':m==='ЕН'?'Елена Новикова':'Дмитрий Волков'}>{m}</span>)}</div>;}
function pageFromHash(): Page {const p=window.location.hash.slice(1);return p==='projects'||p==='notes'?p:'overview';}

export function App() {
  const [theme,setTheme]=useStored<'light'|'dark'>('orbita-theme','light');
  const [page,setPage]=useState<Page>(pageFromHash);
  const [compact,setCompact]=useState(window.innerWidth<800);
  const [projects,setProjects]=useStored('orbita-projects',initialProjects);
  const [notes,setNotes]=useStored('orbita-notes',initialNotes);
  const [tasks,setTasks]=useStored('orbita-tasks',initialTasks);
  const [query,setQuery]=useState('');
  const searchRef=useRef<HTMLInputElement>(null);
  const [filter,setFilter]=useState('Все проекты');
  const [modal,setModal]=useState<'project'|'note'|'notifications'|'help'|'workspace'|null>(null);
  const [selectedProject,setSelectedProject]=useState<Project|null>(null);
  const [editingNote,setEditingNote]=useState<string|null>(null);
  const [title,setTitle]=useState(''); const [description,setDescription]=useState('');
  const [error,setError]=useState(false);
  const [notificationRead,setNotificationRead]=useStored('orbita-notification-read',false);
  const [toast,setToast]=useState('');
  useEffect(()=>{const f=()=>{setPage(pageFromHash());setQuery('');};window.addEventListener('hashchange',f);return ()=>window.removeEventListener('hashchange',f);},[]);
  useEffect(()=>{const f=()=>setCompact(window.innerWidth<800);window.addEventListener('resize',f);return ()=>window.removeEventListener('resize',f);},[]);
  useEffect(()=>{const f=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();searchRef.current?.focus();}};window.addEventListener('keydown',f);return ()=>window.removeEventListener('keydown',f);},[]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3500);return ()=>clearTimeout(t);},[toast]);
  const navigate=(p:Page)=>{window.location.hash=p;setPage(p);setQuery('');};
  const openCreate=(kind:'project'|'note')=>{setTitle('');setDescription('');setEditingNote(null);setError(false);setModal(kind);};
  const openNote=(note:Note)=>{setTitle(note.title);setDescription(note.content);setEditingNote(note.id);setError(false);setModal('note');};
  const save=()=>{
    if(!title.trim()){setError(true);return;}
    if(modal==='project')setProjects(prev=>[...prev,{id:crypto.randomUUID(),title:title.trim(),description:description.trim()||'Здесь начинается что-то новое',category:'Личное',color:'green',progress:0,total:10,date:'Без срока',members:['АК']}]);
    else setNotes(prev=>editingNote?prev.map(n=>n.id===editingNote?{...n,title:title.trim(),content:description}:n):[{id:crypto.randomUUID(),title:title.trim(),content:description,tag:'Личное',date:'Только что'},...prev]);
    setModal(null);setToast(modal==='project'?'Проект создан':editingNote?'Заметка сохранена':'Заметка создана');
  };
  const projectMatches=projects.filter(p=>(p.title+' '+p.description).toLowerCase().includes(query.toLowerCase())&&(page!=='projects'||filter!=='Активные'||p.progress<100)&&(page!=='projects'||filter!=='Завершённые'||p.progress===100));
  const noteMatches=notes.filter(n=>(n.title+' '+n.content).toLowerCase().includes(query.toLowerCase()));
  const completedTasks=tasks.filter(t=>t.done).length;
  const activeProjects=projects.filter(p=>p.progress<100).length;
  const pageTitle={overview:'Обзор',projects:'Проекты',notes:'Заметки'}[page];
  const sectionHeading=(heading:string,action:ReactNode)=><div className="section-heading"><Text variant="subheader-3">{heading}</Text>{action}</div>;
  const projectCard=(p:Project)=><article className={`project-card ${p.color}`} key={p.id}>
    <div className="project-top"><span className="project-icon"><Glyph data={p.color==='blue'?Layers:p.color==='orange'?Rocket:Folder} size={23}/></span><Button view="flat" size="s" aria-label={`Открыть проект ${p.title}`} onClick={()=>setSelectedProject(p)}><Glyph data={Ellipsis}/></Button></div>
    <Button className="project-title" view="flat" onClick={()=>setSelectedProject(p)}>{p.title}</Button>
    <p className="project-description">{p.description}</p>
    <Label theme={p.color==='purple'?'utility':p.color==='blue'?'info':p.color==='orange'?'warning':'success'} size="xs">{p.category}</Label>
    <div className="project-progress-label"><span>{p.progress===100?'Завершён':'Прогресс'}</span><strong>{p.progress}%</strong></div>
    <Progress className={`project-progress ${p.color}`} value={p.progress} size="xs"/>
    <div className="project-footer"><Avatars members={p.members}/><span><Glyph data={Clock} size={13}/>{p.date}</span></div>
  </article>;
  const empty=(message:string)=><div className="empty"><Glyph data={Magnifier} size={28}/><Text variant="subheader-2">{message}</Text><p>Попробуйте другой запрос или создайте новую запись.</p></div>;
  const activity=<div className="activity-list">
    <div className="activity-item"><span className="activity-symbol purple"><Glyph data={Folder} size={16}/></span><div><p>Вы обновили проект <strong>«Редизайн сайта»</strong></p><span>Сегодня, 10:42</span></div></div>
    <div className="activity-item"><span className="activity-symbol green"><Glyph data={Check} size={16}/></span><div><p>Задача <strong>«Обновить бриф»</strong> завершена</p><span>Сегодня, 09:15</span></div></div>
    <div className="activity-item"><span className="activity-symbol orange"><Glyph data={FileText} size={16}/></span><div><p>Добавлена заметка <strong>«Идеи для нового сайта»</strong></p><span>Вчера, 18:30</span></div></div>
  </div>;

  return <ThemeProvider theme={theme} lang="ru"><AsideHeader className="app-shell" compact={compact} onChangeCompact={setCompact} hideCollapseButton hideSectionDividers
    logo={{text:()=> <span className="wordmark">орбита<span>workspace</span></span>,icon:OrbitLogo,iconSize:34,onClick:()=>navigate('overview'),'aria-label':'Орбита — на главную'}}
    aboveMenuContent={!compact?<div className="sidebar-intro"><Button className="workspace-picker" view="outlined" size="xl" width="max" onClick={()=>setModal('workspace')}><span className="workspace-avatar">A</span><span>Моё пространство</span><Glyph data={ChevronDown} size={13}/></Button><div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div></div>:<div className="compact-spacer"/>}
    menuItems={[
      {id:'overview',title:'Обзор',icon:House,current:page==='overview',onItemClick:()=>navigate('overview'),className:'nav-item'},
      {id:'projects',title:'Проекты',icon:Folder,current:page==='projects',onItemClick:()=>navigate('projects'),rightAdornment:!compact?<span className="nav-count">{projects.length}</span>:undefined,className:'nav-item'},
      {id:'notes',title:'Заметки',icon:FileText,current:page==='notes',onItemClick:()=>navigate('notes'),className:'nav-item'},
    ]}
    renderFooter={()=> <div className={`sidebar-footer ${compact?'is-compact':''}`}>
      {!compact&&<div className="sidebar-tip"><span className="tip-icon"><Glyph data={Sparkles} size={20}/></span><Text variant="subheader-1">Место для больших идей</Text><p>Всё важное — в одном<br/>пространстве. В вашем ритме.</p><Button view="flat" className="tip-link" onClick={()=>openCreate('project')}>Создать проект <Glyph data={ArrowUpRight} size={15}/></Button><span className="tip-orbit"/></div>}
      <Button view="flat" className="help-button" onClick={()=>setModal('help')} aria-label="Помощь и поддержка"><Glyph data={CircleQuestion} size={18}/>{!compact&&'Помощь и поддержка'}</Button>
      <div className="theme-control"><Glyph data={theme==='dark'?Moon:Sun} size={18}/>{!compact&&<span>Тёмная тема</span>}<Switch checked={theme==='dark'} onUpdate={v=>setTheme(v?'dark':'light')} size="m" controlProps={{'aria-label':'Тёмная тема'}}/></div>
      <div className="user-profile"><span className="user-avatar">АК</span>{!compact&&<div><strong>Александр Ковалёв</strong><span>Личное пространство</span></div>}<span className="online-dot"/></div>
    </div>}
    renderContent={()=> <div className="page-shell"><header className="topbar"><div className="breadcrumb"><span>Моё пространство</span><span className="breadcrumb-slash">/</span><strong>{pageTitle}</strong></div><div className="topbar-actions"><TextInput className="global-search" controlRef={searchRef} placeholder="Поиск в пространстве" value={query} onUpdate={setQuery} hasClear startContent={<Glyph data={Magnifier} size={16}/>} endContent={<span className="search-key">⌘ K</span>} controlProps={{'aria-label':'Поиск в пространстве'}}/><span className="topbar-divider"/><Button className="notification-button" view="flat" aria-label="Уведомления" onClick={()=>{setModal('notifications');setNotificationRead(true);}}><Glyph data={Bell} size={20}/>{!notificationRead&&<span className="notification-dot"/>}</Button><span className="header-avatar">АК</span></div></header>
      <main className="main-content"><div className="page-heading"><div><div className="eyebrow">ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО</div><Text variant="display-1" as="h1">{page==='overview'?'Всё начинается с идеи':pageTitle}<span className="heading-dot">.</span></Text><p>{page==='overview'?'Планы, проекты и мысли. Всё на своей орбите.':page==='projects'?'От первой идеи до последнего штриха.':'Сохраняйте мысли. Освобождайте место для новых.'}</p></div><Button view="action" size="l" className="create-button" onClick={()=>openCreate(page==='notes'?'note':'project')}><Glyph data={Plus} size={18}/>{page==='notes'?'Новая заметка':'Новый проект'}</Button></div>
      {page==='overview'&&!query&&<>
        <section className="welcome-banner"><div className="welcome-copy"><span className="welcome-kicker"><span className="little-spark">✦</span> СРЕДА, 4 НОЯБРЯ</span><Text variant="header-1" as="h2">Хороший день, чтобы<br/>сделать шаг вперёд</Text><p>Сфокусируйтесь на важном.<br/>Мы поможем держать всё под рукой.</p><Button view="outlined" className="welcome-button" onClick={()=>navigate('projects')}>К моим проектам <Glyph data={ArrowRight} size={16}/></Button></div><div className="orbit-art" aria-hidden="true"><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="orbit-ring ring-three"/><div className="orbit-core"/><span className="planet planet-one"/><span className="planet planet-two"/><span className="planet planet-three"/><span className="art-star star-one">✦</span><span className="art-star star-two">✧</span><span className="art-tiny-dot"/><span className="orbit-caption">БОЛЬШИЕ ИДЕИ ПРИТЯГИВАЮТСЯ</span></div></section>
        <section className="stats-grid"><div className="stat-card"><span className="stat-icon purple"><Glyph data={Folder} size={21}/></span><div><span>Активные проекты</span><div className="stat-value">{activeProjects}<span className="stat-caption">Всё идёт по плану</span></div></div><Glyph data={ArrowUpRight} size={17}/></div><div className="stat-card"><span className="stat-icon green"><Glyph data={CircleCheck} size={22}/></span><div><span>Выполнено задач</span><div className="stat-value">{23+completedTasks}<span className="stat-trend">↗ +{completedTasks+7} за неделю</span></div></div><Glyph data={ArrowUpRight} size={17}/></div><div className="stat-card"><span className="stat-icon orange"><Glyph data={FileText} size={21}/></span><div><span>Заметки и идеи</span><div className="stat-value">{notes.length}<span className="stat-caption">Ни одна мысль не потеряется</span></div></div><Glyph data={ArrowUpRight} size={17}/></div></section>
        <section className="projects-section">{sectionHeading('В работе',<Button view="flat" className="text-link" onClick={()=>navigate('projects')}>Все проекты <Glyph data={ArrowRight} size={15}/></Button>)}<div className="projects-grid">{projectMatches.slice(0,3).map(projectCard)}</div>{!projectMatches.length&&empty('Проекты не найдены')}</section>
        <div className="bottom-grid"><section className="panel tasks-panel">{sectionHeading('Задачи на сегодня',<span className="small-count">{tasks.length-completedTasks}</span>)}<div className="tasks-list">{tasks.map(t=><div className={`task-row ${t.done?'task-done':''}`} key={t.id}><Checkbox checked={t.done} onUpdate={done=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,done}:x))} controlProps={{'aria-label':t.title}} size="l"/><div className="task-copy"><span>{t.title}</span><small><i className={`color-dot ${t.color}`}/>{t.project}</small></div><span className="task-time">{t.done?'Готово':t.time}</span></div>)}</div><div className="tasks-summary"><Glyph data={CircleCheck} size={15}/>{completedTasks} из {tasks.length} задач выполнено<span>Так держать!</span></div></section><section className="panel activity-panel">{sectionHeading('Последняя активность',<span className="activity-live"/>)}{activity}</section></div>
      </>}
      {page==='overview'&&query&&<section className="search-results">{sectionHeading('Результаты поиска',<span className="result-count">По запросу «{query}»</span>)}{projectMatches.length>0&&<><Text variant="subheader-2" className="search-section-label">Проекты</Text><div className="projects-grid">{projectMatches.map(projectCard)}</div></>}{noteMatches.length>0&&<><Text variant="subheader-2" className="search-section-label">Заметки</Text><div className="search-note-list">{noteMatches.map(n=><Button key={n.id} view="outlined" size="xl" onClick={()=>openNote(n)}><Glyph data={FileText}/>{n.title}<Glyph data={ArrowUpRight} size={16}/></Button>)}</div></>}{!projectMatches.length&&!noteMatches.length&&empty('Ничего не найдено')}</section>}
      {page==='projects'&&<><div className="page-toolbar"><div className="filter-tabs">{['Все проекты','Активные','Завершённые'].map(f=><Button key={f} view="flat" selected={filter===f} onClick={()=>setFilter(f)}>{f}{f==='Все проекты'&&<span className="small-count">{projects.length}</span>}</Button>)}</div><span className="result-count">{projectMatches.length} {projectMatches.length===1?'проект':'проекта'}</span></div><div className="projects-grid all-projects">{projectMatches.map(projectCard)}{!query&&filter!=='Завершённые'&&<Button className="add-project-card" view="outlined" onClick={()=>openCreate('project')}><span className="add-circle"><Glyph data={Plus} size={24}/></span><strong>Новая большая идея</strong><span>Создайте проект и начните действовать</span></Button>}</div>{!projectMatches.length&&empty(filter==='Завершённые'?'Завершённых проектов пока нет':'Проекты не найдены')}</>}
      {page==='notes'&&<><div className="page-toolbar"><Text variant="subheader-2">Все заметки <span className="small-count">{notes.length}</span></Text><span className="result-count">Ваши идеи всегда рядом</span></div><div className="notes-grid">{noteMatches.map((n,i)=><article className={`note-card note-${i%3}`} key={n.id}><div className="note-card-top"><Glyph data={FileText} size={22}/><Button view="flat" size="s" aria-label={`Редактировать ${n.title}`} onClick={()=>openNote(n)}><Glyph data={ArrowUpRight}/></Button></div><Button view="flat" className="note-title" onClick={()=>openNote(n)}>{n.title}</Button><p>{n.content}</p><div className="note-footer"><Label theme={i%3===0?'utility':i%3===1?'info':'warning'} size="xs">{n.tag}</Label><span>{n.date}</span></div></article>)}</div>{!noteMatches.length&&empty('Заметки не найдены')}</>}
      <footer className="page-footer"><span><OrbitLogo/> Пространство для вашего следующего шага</span><span>Сделано с заботой о фокусе <span className="footer-spark">✦</span></span></footer>
      </main></div>}/>
    <Modal open={modal!==null} onOpenChange={open=>{if(!open)setModal(null);}} aria-label={modal==='project'?'Новый проект':modal==='note'?'Заметка':'Информация'}><div className="modal-body"><div className="modal-heading"><Text variant="header-1">{modal==='project'?'Начнём новый проект':modal==='note'?(editingNote?'Ваша заметка':'Есть идея? Запишите.'):modal==='notifications'?'Уведомления':modal==='workspace'?'Моё пространство':'Добро пожаловать в Орбиту'}</Text><Button view="flat" aria-label="Закрыть" onClick={()=>setModal(null)}><Glyph data={Xmark}/></Button></div>
      {(modal==='project'||modal==='note')?<form onSubmit={e=>{e.preventDefault();save();}}><p className="modal-description">{modal==='project'?'Большие дела начинаются с маленького шага.':'Пусть важные мысли останутся под рукой.'}</p><label className="field-label" htmlFor="entry-title">Название</label><TextInput id="entry-title" size="l" value={title} onUpdate={v=>{setTitle(v);setError(false);}} placeholder={modal==='project'?'Например, сайт мечты':'О чём вы думаете?'} autoFocus validationState={error?'invalid':undefined} errorMessage={error?'Добавьте название':undefined}/><label className="field-label" htmlFor="entry-description">{modal==='project'?'Описание':'Ваши мысли'}</label><TextArea id="entry-description" size="l" rows={modal==='note'?9:4} value={description} onUpdate={setDescription} placeholder={modal==='project'?'Что вы хотите сделать?':'Идеи, планы, вдохновение…'}/><div className="modal-actions">{editingNote&&<Button view="flat-danger" onClick={()=>{setNotes(prev=>prev.filter(n=>n.id!==editingNote));setModal(null);setToast('Заметка удалена');}}>Удалить</Button>}<Button view="outlined" onClick={()=>setModal(null)}>Отмена</Button><Button view="action" type="submit">{modal==='project'?'Создать проект':'Сохранить заметку'}</Button></div></form>:modal==='notifications'?<><p className="modal-description">Последние события в вашем пространстве</p>{activity}<div className="notification-end"><Glyph data={Check}/> Вы в курсе всех событий</div></>:modal==='workspace'?<><div className="workspace-detail"><span className="user-avatar">АК</span><div><strong>Личное пространство Александра</strong><p>{projects.length} проекта · {notes.length} заметки</p></div><Label theme="success">Активно</Label></div><p>Ваше место для планов, идей и небольших побед. Все изменения автоматически сохраняются в этом браузере.</p><Button view="action" onClick={()=>{setModal(null);openCreate('project');}}>Создать проект</Button></>:<div className="help-content"><p>Орбита помогает сосредоточиться на том, что важно.</p><div><Glyph data={House}/><p><strong>Обзор</strong><br/>Планируйте день и отмечайте выполненные задачи.</p></div><div><Glyph data={Folder}/><p><strong>Проекты</strong><br/>Создавайте проекты, следите за прогрессом и завершайте начатое.</p></div><div><Glyph data={FileText}/><p><strong>Заметки</strong><br/>Сохраняйте и редактируйте идеи в любой момент.</p></div><p className="muted">Проекты, заметки и выбранная тема сохраняются в вашем браузере.</p></div>}
    </div></Modal>
    <Modal open={!!selectedProject} onOpenChange={open=>{if(!open)setSelectedProject(null);}} aria-label="Детали проекта">{selectedProject&&<div className="modal-body"><div className="modal-heading"><Text variant="header-1">{selectedProject.title}</Text><Button view="flat" aria-label="Закрыть" onClick={()=>setSelectedProject(null)}><Glyph data={Xmark}/></Button></div><p className="modal-description">{selectedProject.description}</p><Label theme="utility">{selectedProject.category}</Label><div className="detail-progress"><span>Прогресс проекта <strong>{selectedProject.progress}%</strong></span><Progress value={selectedProject.progress} size="s"/></div><div className="detail-members"><Avatars members={selectedProject.members}/><span>Команда проекта</span><span><Glyph data={Clock} size={15}/> {selectedProject.date}</span></div><div className="modal-actions"><Button view="outlined" onClick={()=>setSelectedProject(null)}>Закрыть</Button><Button view="action" onClick={()=>{const next=selectedProject.progress===100?0:100;setProjects(prev=>prev.map(p=>p.id===selectedProject.id?{...p,progress:next}:p));setSelectedProject(null);setToast(next===100?'Проект завершён. Отличная работа!':'Проект снова в работе');}}><Glyph data={Check} size={16}/>{selectedProject.progress===100?'Вернуть в работу':'Завершить проект'}</Button></div></div>}</Modal>
    {toast&&<div className="toast" role="status"><Glyph data={CircleCheck} size={20}/>{toast}<Button view="flat" size="s" aria-label="Закрыть сообщение" onClick={()=>setToast('')}><Glyph data={Xmark} size={14}/></Button></div>}
  </ThemeProvider>;
}
