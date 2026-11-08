import {Card, Flex, Icon, Text} from '@gravity-ui/uikit';
import {CircleInfo, Layers, Palette} from '@gravity-ui/icons';

const SECTIONS = [
    {
        icon: CircleInfo,
        title: 'Что это за приложение',
        text: 'Небольшое демо из трёх страниц: навигация между ними реализована вкладками TabProvider и TabList из @gravity-ui/uikit, а вся страница обёрнута в ThemeProvider.',
    },
    {
        icon: Layers,
        title: 'Как устроена навигация',
        text: 'Состояние активной страницы хранится в корневом компоненте App. Вкладки в шапке переключают TabPanel, поэтому переходы мгновенные и без перезагрузки.',
    },
    {
        icon: Palette,
        title: 'Как работает тема',
        text: 'Тема переключается через ThemeProvider: значение light или dark хранится в состоянии приложения и сохраняется в localStorage, так что выбор не теряется после перезагрузки.',
    },
];

export function AboutPage() {
    return (
        <Flex direction="column" gap={6}>
            <Flex direction="column" gap={3}>
                <Text variant="header-2">О проекте</Text>
                <Text variant="body-2" color="secondary">
                    Немного подробностей о том, из чего собрано это приложение.
                </Text>
            </Flex>
            <Flex direction="column" gap={4}>
                {SECTIONS.map((section) => (
                    <Card key={section.title} type="container" view="outlined" size="l" spacing={{p: 2}}>
                        <Flex gap={3} alignItems="flex-start">
                            <Icon data={section.icon} size={20} color="brand" style={{flexShrink: 0}} />
                            <Flex direction="column" gap={2} style={{flex: 1, minWidth: 0}}>
                                <Text variant="subheader-2">{section.title}</Text>
                                <Text variant="body-1" color="secondary">
                                    {section.text}
                                </Text>
                            </Flex>
                        </Flex>
                    </Card>
                ))}
            </Flex>
        </Flex>
    );
}
