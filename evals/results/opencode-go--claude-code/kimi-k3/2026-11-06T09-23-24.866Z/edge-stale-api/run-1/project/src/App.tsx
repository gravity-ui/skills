import {Button, Icon, Text} from '@gravity-ui/uikit';
import {getThemeType, useThemeValue} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

interface AppProps {
    onToggleTheme: () => void;
}

export function App({onToggleTheme}: AppProps) {
    // Gravity UI v7: useThemeValue() returns the resolved RealTheme
    // ('light' | 'dark' | 'light-hc' | 'dark-hc'); getThemeType() folds the
    // high-contrast variants into 'light' | 'dark'.
    const themeValue = useThemeValue();
    const isDark = getThemeType(themeValue) === 'dark';

    return (
        <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <Text variant="header-1">Gravity UI</Text>
                <Button view="outlined" onClick={onToggleTheme} aria-label="Переключить тему">
                    <Icon data={isDark ? Sun : Moon} size={16} />
                    {isDark ? 'Светлая тема' : 'Тёмная тема'}
                </Button>
            </div>
            <Text variant="body-2" color="secondary">
                Текущая тема: {themeValue}
            </Text>
        </div>
    );
}
