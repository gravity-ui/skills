import {useState} from 'react';
import {Button, Switch, Text, ThemeProvider} from '@gravity-ui/uikit';
import {Tabs} from '@gravity-ui/uikit/legacy';
import './app.css';

type Page = 'overview' | 'projects' | 'about';

const pageCopy: Record<Page, {eyebrow: string; title: string; description: string}> = {
  overview: {eyebrow: 'THURSDAY, NOVEMBER 5', title: 'Good morning, Alex.', description: 'A clear view of what’s moving across your workspace.'},
  projects: {eyebrow: 'YOUR WORKSPACE', title: 'Projects', description: 'A little momentum, one thoughtful step at a time.'},
  about: {eyebrow: 'A CALMER WAY TO WORK', title: 'Make room for good work.', description: 'Atlas brings your plans, people, and progress into one considered space.'},
};

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('atlas-theme') === 'dark' ? 'dark' : 'light');
  const [page, setPage] = useState<Page>('overview');
  const changeTheme = (checked: boolean) => {
    const next = checked ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('atlas-theme', next);
  };
  const content = pageCopy[page];

  return <ThemeProvider theme={theme}>
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#overview" onClick={(e) => {e.preventDefault(); setPage('overview');}}><span className="brand-mark">a</span> atlas</a>
        <nav className="nav-tabs" aria-label="Main navigation">
          <Tabs size="m" activeTab={page} onSelectTab={(id) => setPage(id as Page)} items={[
            {id: 'overview', title: 'Overview'}, {id: 'projects', title: 'Projects'}, {id: 'about', title: 'About'},
          ]}/>
        </nav>
        <div className="theme-toggle"><span className="theme-label">Dark mode</span><Switch size="m" checked={theme === 'dark'} onUpdate={changeTheme} aria-label="Toggle dark mode" /></div>
      </header>

      <main className="main-content">
        <section className="intro">
          <Text className="eyebrow" variant="caption-2">{content.eyebrow}</Text>
          <Text className="page-title" as="h1" variant="display-2">{content.title}</Text>
          <Text className="page-description" variant="body-2">{content.description}</Text>
        </section>

        {page === 'overview' && <>
          <section className="feature-card"><div className="feature-copy"><Text className="eyebrow" variant="caption-2">YOUR WEEK AT A GLANCE</Text><Text className="feature-title" as="h2" variant="header-1">Small steps add up.</Text><Text className="muted" variant="body-2">You’ve made steady progress. Here’s what’s on your plate today.</Text><Button view="action" size="l" onClick={() => setPage('projects')}>View your projects</Button></div><div className="sun-art" aria-hidden="true"><div className="sun"/><div className="hill hill-back"/><div className="hill hill-front"/><span className="art-caption">A GOOD DAY TO BEGIN</span></div></section>
          <section className="stats-grid" aria-label="Workspace summary"><article className="stat-card"><span className="stat-icon lilac">✳</span><Text className="stat-label" variant="caption-2">IN PROGRESS</Text><Text className="stat-value" variant="header-2">04</Text><Text className="muted" variant="body-2">Projects moving forward</Text></article><article className="stat-card"><span className="stat-icon peach">↗</span><Text className="stat-label" variant="caption-2">THIS WEEK</Text><Text className="stat-value" variant="header-2">12</Text><Text className="muted" variant="body-2">Thoughtful little wins</Text></article><article className="stat-card quote-card"><Text className="quote-mark">“</Text><Text variant="body-2">Almost everything will work again if you unplug it for a few minutes, including you.</Text><Text className="muted quote-author" variant="caption-2">ANNE LAMOTT</Text></article></section>
        </>}

        {page === 'projects' && <section className="project-list">{[['01','Brand refresh','Make the little details feel like us.','In progress','mint'],['02','Spring collection','A fresh chapter, taking shape.','In progress','lilac'],['03','Studio notes','Gather the good ideas in one place.','Planning','peach']].map(([n,title,desc,status,color]) => <article className="project-row" key={title}><span className={`project-number ${color}`}>{n}</span><div className="project-info"><Text as="h2" className="project-title" variant="subheader-2">{title}</Text><Text className="muted" variant="body-2">{desc}</Text></div><span className="status"><i/> {status}</span><span className="row-arrow">↗</span></article>)}</section>}

        {page === 'about' && <section className="about-card"><div className="about-orbit"><span>✳</span></div><div><Text className="feature-title" as="h2" variant="header-1">Less busywork, more meaning.</Text><Text className="muted about-text" variant="body-2">Atlas is a small home for the work that matters. Keep projects close, notice your progress, and leave a little space for the next good idea.</Text><Button view="outlined" size="l" onClick={() => setPage('overview')}>Back to your overview</Button></div></section>}
      </main>
      <footer className="footer"><span>© 2026 ATLAS STUDIO</span><span>Made for the work that matters <i>✳</i></span></footer>
    </div>
  </ThemeProvider>;
}
