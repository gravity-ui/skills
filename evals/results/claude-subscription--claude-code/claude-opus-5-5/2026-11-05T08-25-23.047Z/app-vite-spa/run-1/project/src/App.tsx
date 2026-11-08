import * as React from 'react';
import {CircleInfo, House, ListUl, Moon, Sun} from '@gravity-ui/icons';
import {Button, Icon, Text, ThemeProvider} from '@gravity-ui/uikit';

import {AboutPage} from './pages/AboutPage';
import {HomePage} from './pages/HomePage';
import {NotFoundPage} from './pages/NotFoundPage';
import {type Note, NotesPage} from './pages/NotesPage';
import {toHref, useHashPath} from './router';
import {useAppTheme} from './theme';

import './App.css';

const NAV_ITEMS = [
    {path: '/', title: 'Главная', icon: House},
    {path: '/notes', title: 'Заметки', icon: ListUl},
    {path: '/about', title: 'О приложении', icon: CircleInfo},
];

export function App() {
    const {theme, toggleTheme} = useAppTheme();
    const path = useHashPath();

    // Notes live here so they survive switching between pages.
    const [notes, setNotes] = React.useState<Note[]>([
        {id: 1, text: 'Попробовать тёмную тему'},
        {id: 2, text: 'Перейти на страницу «О приложении»'},
    ]);
    const addNote = React.useCallback((text: string) => {
        setNotes((prev) => [...prev, {id: Date.now(), text}]);
    }, []);
    const removeNote = React.useCallback((id: number) => {
        setNotes((prev) => prev.filter((note) => note.id !== id));
    }, []);

    let page: React.ReactNode;
    switch (path) {
        case '/':
            page = <HomePage theme={theme} notesCount={notes.length} />;
            break;
        case '/notes':
            page = <NotesPage notes={notes} onAdd={addNote} onRemove={removeNote} />;
            break;
        case '/about':
            page = <AboutPage />;
            break;
        default:
            page = <NotFoundPage />;
    }

    const isDark = theme === 'dark';
    const themeLabel = isDark ? 'Включить светлую тему' : 'Включить тёмную тему';

    return (
        <ThemeProvider theme={theme}>
            <div className="app">
                <header className="app__header">
                    <Text variant="subheader-3" className="app__logo">
                        Мини-приложение
                    </Text>
                    <nav className="app__nav" aria-label="Основная навигация">
                        {NAV_ITEMS.map((item) => {
                            const active = item.path === path;
                            return (
                                <Button
                                    key={item.path}
                                    view="flat"
                                    size="l"
                                    selected={active}
                                    href={toHref(item.path)}
                                    extraProps={{
                                        'aria-current': active ? 'page' : undefined,
                                        'aria-label': item.title,
                                    }}
                                >
                                    <Icon data={item.icon} />
                                    <span className="app__nav-label">{item.title}</span>
                                </Button>
                            );
                        })}
                    </nav>
                    <Button
                        view="outlined"
                        size="l"
                        onClick={toggleTheme}
                        title={themeLabel}
                        extraProps={{'aria-label': themeLabel}}
                    >
                        <Icon data={isDark ? Sun : Moon} />
                    </Button>
                </header>
                <main className="app__content">{page}</main>
            </div>
        </ThemeProvider>
    );
}
