import {useMemo, useState} from 'react';
import {Icon, SegmentedRadioGroup, Tab, TabList, Text} from '@gravity-ui/uikit';
import {House, Moon, Sun} from '@gravity-ui/icons';

import {HomePage} from './pages/HomePage';
import {ProjectsPage} from './pages/ProjectsPage';
import {SettingsPage} from './pages/SettingsPage';
import {useAppTheme} from './theme';
import './App.css';

type PageId = 'home' | 'projects' | 'settings';

const pageTitles: Record<PageId, string> = {
    home: 'Обзор',
    projects: 'Проекты',
    settings: 'Настройки',
};

export function App() {
    const [page, setPage] = useState<PageId>('home');
    const {theme, setTheme} = useAppTheme();
    const pageContent = useMemo(() => {
        switch (page) {
            case 'projects':
                return <ProjectsPage />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <HomePage onNavigate={setPage} />;
        }
    }, [page]);

    return (
        <div className="app">
            <header className="app-header">
                <div className="app-brand">
                    <Icon data={House} size={20} />
                    <Text variant="subheader-3" color="primary">
                        Gravity Workspace
                    </Text>
                </div>
                <TabList
                    className="app-nav"
                    size="l"
                    value={page}
                    onUpdate={(value) => setPage(value as PageId)}
                    aria-label="Основная навигация"
                >
                    <Tab value="home">Обзор</Tab>
                    <Tab value="projects">Проекты</Tab>
                    <Tab value="settings">Настройки</Tab>
                </TabList>
                <SegmentedRadioGroup
                    value={theme}
                    onUpdate={(value) => setTheme(value as typeof theme)}
                    aria-label="Тема интерфейса"
                >
                    <SegmentedRadioGroup.Option
                        value="light"
                        title="Светлая тема"
                        content={<Icon data={Sun} size={16} />}
                    />
                    <SegmentedRadioGroup.Option
                        value="dark"
                        title="Тёмная тема"
                        content={<Icon data={Moon} size={16} />}
                    />
                </SegmentedRadioGroup>
            </header>
            <main className="app-main">{pageContent}</main>
            <footer className="app-footer">
                <Text variant="caption-2" color="secondary">
                    {pageTitles[page]} · Gravity UI · {new Date().getFullYear()}
                </Text>
            </footer>
        </div>
    );
}
