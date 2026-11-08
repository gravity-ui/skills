import {Box, Button, Card, Flex, Icon, Text} from '@gravity-ui/uikit';
import {Rocket, Star, Thunderbolt} from '@gravity-ui/icons';

import type {Page} from '../App';

interface HomePageProps {
    onNavigate: (page: Page) => void;
}

const FEATURES = [
    {
        icon: Rocket,
        title: 'Быстрый старт',
        description: 'Проект собран на Vite и стартует за секунды — можно сразу писать код.',
    },
    {
        icon: Star,
        title: 'Готовые компоненты',
        description: 'Кнопки, карточки, вкладки и типографика из @gravity-ui/uikit уже настроены.',
    },
    {
        icon: Thunderbolt,
        title: 'Светлая и тёмная темы',
        description: 'Переключение темы работает на всех страницах и сохраняется между визитами.',
    },
];

export function HomePage({onNavigate}: HomePageProps) {
    return (
        <Flex direction="column" gap={8}>
            <Flex direction="column" gap={4}>
                <Text variant="display-1">Добро пожаловать!</Text>
                <Text variant="body-2" color="secondary">
                    Это небольшое демо-приложение на Gravity UI: три страницы, навигация по вкладкам
                    и переключатель светлой и тёмной темы.
                </Text>
                <Box>
                    <Button view="action" size="l" onClick={() => onNavigate('about')}>
                        Узнать больше
                    </Button>
                </Box>
            </Flex>
            <Flex gap={4} wrap="wrap">
                {FEATURES.map((feature) => (
                    <Card
                        key={feature.title}
                        type="container"
                        view="raised"
                        size="l"
                        spacing={{p: 2}}
                        style={{flex: '1 1 240px', minWidth: 0}}
                    >
                        <Flex direction="column" gap={3}>
                            <Icon data={feature.icon} size={24} color="brand" />
                            <Text variant="subheader-2">{feature.title}</Text>
                            <Text variant="body-1" color="secondary">
                                {feature.description}
                            </Text>
                        </Flex>
                    </Card>
                ))}
            </Flex>
        </Flex>
    );
}
