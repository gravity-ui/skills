import React from 'react';
import {BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {ThemeProvider, useThemeValue} from '@gravity-ui/uikit';
import {AsideHeader, FooterItem, type MenuItem} from '@gravity-ui/navigation';
import {Gear, House, LayoutList, Moon, Rocket, Sun} from '@gravity-ui/icons';

import {HomePage} from './pages/HomePage';
import {TasksPage} from './pages/TasksPage';
import {SettingsPage} from './pages/SettingsPage';
import {useAppTheme, type AppTheme} from './theme';

interface ShellProps {
    theme: AppTheme;
    onChangeTheme: (theme: AppTheme) => void;
}

function Shell({theme, onChangeTheme}: ShellProps) {
    const [compact, setCompact] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const themeValue = useThemeValue();

    const menuItems: MenuItem[] = [
        {
            id: 'home',
            title: 'Главная',
            icon: House,
            link: '/',
            current: location.pathname === '/',
            onItemClick: () => navigate('/'),
        },
        {
            id: 'tasks',
            title: 'Задачи',
            icon: LayoutList,
            link: '/tasks',
            current: location.pathname === '/tasks',
            onItemClick: () => navigate('/tasks'),
        },
        {
            id: 'settings',
            title: 'Настройки',
            icon: Gear,
            link: '/settings',
            current: location.pathname === '/settings',
            onItemClick: () => navigate('/settings'),
        },
    ];

    const isDark = themeValue === 'dark';

    return (
        <AsideHeader
            logo={{text: 'Гравити Демо', icon: Rocket}}
            compact={compact}
            onChangeCompact={setCompact}
            menuItems={menuItems}
            renderContent={() => (
                <div style={{height: '100vh', overflowY: 'auto'}}>
                    <div style={{maxWidth: 960, margin: '0 auto', padding: 'var(--g-spacing-6) var(--g-spacing-8)'}}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/tasks" element={<TasksPage />} />
                            <Route
                                path="/settings"
                                element={<SettingsPage theme={theme} onChangeTheme={onChangeTheme} />}
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </div>
            )}
            renderFooter={({compact: footerCompact}) => (
                <FooterItem
                    compact={footerCompact}
                    item={{
                        id: 'theme-switcher',
                        title: isDark ? 'Светлая тема' : 'Тёмная тема',
                        icon: isDark ? Sun : Moon,
                        onItemClick: () => onChangeTheme(isDark ? 'light' : 'dark'),
                    }}
                />
            )}
        />
    );
}

export function App() {
    const [theme, setTheme] = useAppTheme();

    return (
        <ThemeProvider theme={theme} lang="ru">
            <BrowserRouter>
                <Shell theme={theme} onChangeTheme={setTheme} />
            </BrowserRouter>
        </ThemeProvider>
    );
}
