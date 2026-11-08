import {Card, Flex, SegmentedRadioGroup, Text, useThemeValue} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

import {useThemeState} from './theme/ThemeStateProvider';

export function App() {
    const {theme, setTheme} = useThemeState();
    // Resolved ("real") theme — when `theme` is 'system' this is 'light' or 'dark'.
    const themeValue = useThemeValue();

    return (
        <Flex
            direction="column"
            gap="4"
            style={{padding: 24, maxWidth: 480, margin: '0 auto'}}
        >
            <Text variant="header-1">Переключатель темы</Text>
            <Card style={{padding: 16}}>
                <Flex direction="column" gap="3">
                    <SegmentedRadioGroup<Theme>
                        value={theme}
                        onUpdate={setTheme}
                        size="l"
                        aria-label="Тема оформления"
                    >
                        <SegmentedRadioGroup.Option value="light">
                            Светлая
                        </SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value="dark">
                            Тёмная
                        </SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value="system">
                            Системная
                        </SegmentedRadioGroup.Option>
                    </SegmentedRadioGroup>
                    <Text color="secondary">
                        Активная тема: {themeValue === 'dark' ? 'тёмная' : 'светлая'} (
                        {themeValue})
                    </Text>
                </Flex>
            </Card>
        </Flex>
    );
}
