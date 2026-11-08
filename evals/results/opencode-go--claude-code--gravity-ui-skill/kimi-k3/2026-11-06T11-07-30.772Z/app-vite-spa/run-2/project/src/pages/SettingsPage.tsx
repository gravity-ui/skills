import {Box, Card, Flex, Icon, Label, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import {CircleInfo, Moon, Sun} from '@gravity-ui/icons';

import type {AppTheme} from '../theme';

interface SettingsPageProps {
    theme: AppTheme;
    onChangeTheme: (theme: AppTheme) => void;
}

export function SettingsPage({theme, onChangeTheme}: SettingsPageProps) {
    return (
        <Flex direction="column" gap={5}>
            <Text variant="header-1">Настройки</Text>

            <Card view="outlined" size="l">
                <Box spacing={{p: 5}}>
                    <Flex direction="column" gap={4}>
                        <Flex direction="column" gap={1}>
                            <Text variant="subheader-2">Тема оформления</Text>
                            <Text variant="body-2" color="secondary">
                                Выбранная тема сохраняется между сессиями. Переключать её можно
                                также кнопкой внизу боковой панели.
                            </Text>
                        </Flex>
                        <SegmentedRadioGroup<AppTheme>
                            size="l"
                            value={theme}
                            onUpdate={onChangeTheme}
                            options={[
                                {
                                    value: 'light',
                                    content: (
                                        <Flex alignItems="center" gap={2}>
                                            <Icon data={Sun} size={16} />
                                            Светлая
                                        </Flex>
                                    ),
                                },
                                {
                                    value: 'dark',
                                    content: (
                                        <Flex alignItems="center" gap={2}>
                                            <Icon data={Moon} size={16} />
                                            Тёмная
                                        </Flex>
                                    ),
                                },
                            ]}
                        />
                    </Flex>
                </Box>
            </Card>

            <Card view="filled" size="l">
                <Box spacing={{p: 5}}>
                    <Flex direction="column" gap={3}>
                        <Flex alignItems="center" gap={2}>
                            <Icon data={CircleInfo} size={18} />
                            <Text variant="subheader-2">О приложении</Text>
                        </Flex>
                        <Text variant="body-2" color="secondary">
                            Демо-приложение собрано на дизайн-системе Gravity UI: каркас —
                            AsideHeader из @gravity-ui/navigation, страницы — компоненты
                            @gravity-ui/uikit, маршрутизация — react-router.
                        </Text>
                        <Flex gap={2}>
                            <Label theme="utility">uikit 7</Label>
                            <Label theme="utility">navigation 3</Label>
                            <Label theme="success">v1.0</Label>
                        </Flex>
                    </Flex>
                </Box>
            </Card>
        </Flex>
    );
}
