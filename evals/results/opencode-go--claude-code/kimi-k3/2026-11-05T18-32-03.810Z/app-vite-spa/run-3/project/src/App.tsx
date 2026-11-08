import {useEffect, useState} from 'react';
import {Button, Icon, Text, ThemeProvider} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import {HomePage} from './pages/Home';
import {AboutPage} from './pages/About';
import {ContactsPage} from './pages/Contacts';

type Theme = 'light' | 'dark';

const ROUTES = [
    {path: '/', label: 'Главная', component: HomePage},
    {path: '/about', label: 'О проекте', component: AboutPage},
    {path: '/contacts', label: 'Контакты', component: ContactsPage},
];

function getHashPath(): string {
    return window.location.hash.replace(/^#/, '') || '/';
}

function useHashRoute(): string {
    const [path, setPath] = useState(getHashPath);

    useEffect(() => {
        const onHashChange = () => setPath(getHashPath());
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    return path;
}

function getInitialTheme(): Theme {
    const saved = window.localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    const path = useHashRoute();

    useEffect(() => {
        window.localStorage.setItem('theme', theme);
    }, [theme]);

    const route = ROUTES.find((r) => r.path === path) ?? ROUTES[0];
    const Page = route.component;
    const isDark = theme === 'dark';

    return (
        <ThemeProvider theme={theme}>
            <div
                style={{
                    minHeight: '100vh',
                    background: 'var(--g-color-base-background)',
                    color: 'var(--g-color-text-primary)',
                }}
            >
                <header
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 24,
                        padding: '12px 24px',
                        borderBottom: '1px solid var(--g-color-line-generic)',
                        flexWrap: 'wrap',
                    }}
                >
                    <Text variant="subheader-3">Мини-приложение</Text>
                    <nav style={{display: 'flex', gap: 4, flexGrow: 1}}>
                        {ROUTES.map((r) => (
                            <Button
                                key={r.path}
                                view={r.path === route.path ? 'normal' : 'flat'}
                                href={`#${r.path}`}
                            >
                                {r.label}
                            </Button>
                        ))}
                    </nav>
                    <Button
                        view="outlined"
                        onClick={() => setTheme(isDark ? 'light' : 'dark')}
                        title={isDark ? 'Светлая тема' : 'Тёмная тема'}
                    >
                        <Icon data={isDark ? Sun : Moon} size={16} />
                        {isDark ? 'Светлая' : 'Тёмная'}
                    </Button>
                </header>
                <main style={{padding: 24, maxWidth: 900, margin: '0 auto'}}>
                    <Page />
                </main>
            </div>
        </ThemeProvider>
    );
}
