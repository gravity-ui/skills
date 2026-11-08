import {useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Clock, Folder, House} from '@gravity-ui/icons';
import {Button, Switch, Text, ThemeProvider, type Theme} from '@gravity-ui/uikit';

import './app.css';

type PageId = 'overview' | 'projects' | 'activity';

const pageTitles: Record<PageId, string> = {
    overview: 'Обзор',
    projects: 'Проекты',
    activity: 'Активность',
};

const projects = [
    {name: 'Обновление платформы', team: 'Продукт · 8 участников', progress: 72, color: 'brand', date: 'До 24 ноября'},
    {name: 'Новый сайт компании', team: 'Маркетинг · 5 участников', progress: 48, color: 'utility', date: 'До 2 декабря'},
    {name: 'Мобильное приложение', team: 'Разработка · 12 участников', progress: 91, color: 'positive', date: 'До 18 ноября'},
];

const activities = [
    {initials: 'АК', name: 'Анна Кузнецова', action: 'завершила задачу', target: '«Обновить главную страницу»', time: '10 минут назад', tone: 'tone-brand'},
    {initials: 'МП', name: 'Марк Петров', action: 'добавил комментарий в', target: '«Мобильное приложение»', time: '42 минуты назад', tone: 'tone-utility'},
    {initials: 'ЕС', name: 'Елена Смирнова', action: 'создала проект', target: '«Новый сайт компании»', time: '2 часа назад', tone: 'tone-positive'},
];

function OverviewPage({onOpenProjects}: {onOpenProjects: () => void}) {
    return (
        <>
            <section className="welcome-panel">
                <div className="welcome-copy">
                    <Text as="span" variant="body-2" color="secondary">СРЕДА, 5 НОЯБРЯ</Text>
                    <Text as="h1" variant="display-2">Доброе утро, Алексей <span className="wave">✦</span></Text>
                    <Text as="p" variant="body-2" color="secondary">Вот что происходит в вашей команде сегодня.</Text>
                </div>
                <div className="welcome-art" aria-hidden="true">
                    <span className="orbit orbit-one" />
                    <span className="orbit orbit-two" />
                    <span className="art-spark">✳</span>
                    <span className="art-dot" />
                </div>
            </section>

            <section className="metric-grid" aria-label="Сводка команды">
                <article className="metric-card">
                    <div className="metric-head"><span className="metric-icon metric-icon-brand">↗</span><Text variant="body-2" color="secondary">Активные проекты</Text></div>
                    <div className="metric-value">12</div>
                    <Text variant="body-2" color="secondary"><span className="positive-text">+2</span> за эту неделю</Text>
                </article>
                <article className="metric-card">
                    <div className="metric-head"><span className="metric-icon metric-icon-positive">✓</span><Text variant="body-2" color="secondary">Задачи выполнены</Text></div>
                    <div className="metric-value">38</div>
                    <Text variant="body-2" color="secondary"><span className="positive-text">+18%</span> к прошлой неделе</Text>
                </article>
                <article className="metric-card">
                    <div className="metric-head"><span className="metric-icon metric-icon-utility">◷</span><Text variant="body-2" color="secondary">В работе</Text></div>
                    <div className="metric-value">7</div>
                    <Text variant="body-2" color="secondary">Задач требуют внимания</Text>
                </article>
            </section>

            <section className="content-grid">
                <div className="panel project-panel">
                    <div className="panel-heading">
                        <div><Text as="h2" variant="subheader-2">Ваши проекты</Text><Text variant="body-2" color="secondary">Следите за прогрессом команды</Text></div>
                        <Button view="flat" size="s" onClick={onOpenProjects}>Все проекты <span aria-hidden="true">→</span></Button>
                    </div>
                    <div className="project-list">
                        {projects.slice(0, 2).map((project) => <ProjectRow key={project.name} project={project} />)}
                    </div>
                </div>
                <div className="panel activity-panel">
                    <div className="panel-heading">
                        <div><Text as="h2" variant="subheader-2">Последние события</Text><Text variant="body-2" color="secondary">Обновления команды</Text></div>
                        <span className="live-indicator"><span /> В эфире</span>
                    </div>
                    <ActivityList />
                </div>
            </section>
        </>
    );
}

function ProjectRow({project}: {project: (typeof projects)[number]}) {
    return (
        <article className="project-row">
            <div className="project-mark"><Folder /></div>
            <div className="project-info">
                <div className="project-name-line"><Text variant="body-2" color="primary">{project.name}</Text><Text variant="body-2" color="secondary">{project.progress}%</Text></div>
                <Text variant="caption-2" color="secondary">{project.team}</Text>
                <div className={`progress-track progress-${project.color}`}><span style={{width: `${project.progress}%`}} /></div>
            </div>
        </article>
    );
}

function ActivityList() {
    return <div className="activity-list">{activities.map((item) => (
        <article className="activity-row" key={item.name}>
            <div className={`avatar ${item.tone}`}>{item.initials}</div>
            <div className="activity-copy"><Text as="p" variant="body-2"><strong>{item.name}</strong> {item.action} <span>{item.target}</span></Text><Text variant="caption-2" color="secondary">{item.time}</Text></div>
        </article>
    ))}</div>;
}

function ProjectsPage() {
    return (
        <>
            <section className="page-intro"><Text as="h1" variant="display-2">Проекты</Text><Text as="p" variant="body-2" color="secondary">Все проекты команды и их текущий прогресс.</Text></section>
            <section className="project-cards">
                {projects.map((project, index) => <article className="panel project-card" key={project.name}>
                    <div className="project-card-top"><div className={`project-mark project-mark-${project.color}`}><Folder /></div><span className="project-number">0{index + 1}</span></div>
                    <Text as="h2" variant="subheader-2">{project.name}</Text>
                    <Text variant="body-2" color="secondary">{project.team}</Text>
                    <div className="project-card-progress"><div className="project-name-line"><Text variant="body-2" color="secondary">Прогресс</Text><Text variant="body-2">{project.progress}%</Text></div><div className={`progress-track progress-${project.color}`}><span style={{width: `${project.progress}%`}} /></div></div>
                    <div className="project-card-footer"><span className="avatar-stack"><i>АК</i><i>МП</i><i>ЕС</i><i>+3</i></span><Text variant="caption-2" color="secondary">{project.date}</Text></div>
                </article>)}
            </section>
        </>
    );
}

function ActivityPage() {
    return (
        <>
            <section className="page-intro"><Text as="h1" variant="display-2">Активность</Text><Text as="p" variant="body-2" color="secondary">Свежие обновления по всем рабочим пространствам.</Text></section>
            <section className="panel full-activity-panel">
                <div className="panel-heading"><div><Text as="h2" variant="subheader-2">Сегодня</Text><Text variant="body-2" color="secondary">Последние действия команды</Text></div><span className="activity-date">5 ноября</span></div>
                <ActivityList />
                <div className="activity-note"><span>✦</span><Text variant="body-2" color="secondary">Вы в курсе всех обновлений. Отличная работа!</Text></div>
            </section>
        </>
    );
}

export function App() {
    const [theme, setTheme] = useState<Theme>('light');
    const [page, setPage] = useState<PageId>('overview');
    const [compact, setCompact] = useState(false);

    const menuItems = [
        {id: 'overview', title: 'Обзор', icon: House, current: page === 'overview', onItemClick: () => setPage('overview')},
        {id: 'projects', title: 'Проекты', icon: Folder, current: page === 'projects', onItemClick: () => setPage('projects')},
        {id: 'activity', title: 'Активность', icon: Clock, current: page === 'activity', onItemClick: () => setPage('activity')},
    ];

    return <ThemeProvider theme={theme}>
        <div className="app-frame">
            <AsideHeader
                logo={{text: 'пульс', href: '#overview'}}
                compact={compact}
                onChangeCompact={setCompact}
                menuItems={menuItems}
                renderContent={() => <main className="workspace">
                    <header className="topbar">
                        <div className="breadcrumb"><Text variant="body-2" color="secondary">Рабочее пространство</Text><span>/</span><Text variant="body-2">{pageTitles[page]}</Text></div>
                        <div className="topbar-actions">
                            <div className="theme-control"><span className="theme-symbol" aria-hidden="true">{theme === 'dark' ? '☾' : '☼'}</span><span className="theme-label"><Text variant="body-2" color="secondary">Тёмная тема</Text></span><Switch size="s" checked={theme === 'dark'} onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')} />
                            </div>
                            <span className="topbar-divider" />
                            <Button view="flat" size="m" className="profile-button" aria-label="Профиль Алексей Ковалёв"><span className="profile-avatar">АК</span><span className="profile-name"><Text variant="body-2">Алексей</Text></span><span className="chevron">⌄</span></Button>
                        </div>
                    </header>
                    <div className="page-content">
                        {page === 'overview' && <OverviewPage onOpenProjects={() => setPage('projects')} />}
                        {page === 'projects' && <ProjectsPage />}
                        {page === 'activity' && <ActivityPage />}
                    </div>
                </main>}
            />
        </div>
    </ThemeProvider>;
}
