import {useState} from 'react';
import {Flex, Icon, SegmentedRadioGroup, ThemeProvider} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';
import {Display, Moon, Sun} from '@gravity-ui/icons';

import {MonitoringPage} from './monitoring/MonitoringPage';

const THEME_OPTIONS: {value: Theme; label: string; icon: typeof Sun}[] = [
    {value: 'light', label: 'Светлая', icon: Sun},
    {value: 'dark', label: 'Тёмная', icon: Moon},
    {value: 'system', label: 'Системная', icon: Display},
];

export function App() {
    const [theme, setTheme] = useState<Theme>('light');

    return (
        <ThemeProvider theme={theme}>
            <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
                <Flex justifyContent="flex-end">
                    <SegmentedRadioGroup<Theme>
                        value={theme}
                        onUpdate={setTheme}
                        size="m"
                        aria-label="Тема оформления"
                    >
                        {THEME_OPTIONS.map((option) => (
                            <SegmentedRadioGroup.Option key={option.value} value={option.value}>
                                <Flex alignItems="center" gap={1}>
                                    <Icon data={option.icon} size={14} />
                                    {option.label}
                                </Flex>
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                </Flex>

                <MonitoringPage />
            </Flex>
        </ThemeProvider>
    );
}
