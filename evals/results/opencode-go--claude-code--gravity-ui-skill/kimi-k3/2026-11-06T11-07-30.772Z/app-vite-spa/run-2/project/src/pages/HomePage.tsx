import {useNavigate} from 'react-router-dom';
import {Box, Button, Card, Flex, Text} from '@gravity-ui/uikit';

const stats = [
    {value: '3', label: 'страницы с навигацией'},
    {value: '2', label: 'темы оформления'},
    {value: '100%', label: 'компонентов Gravity UI'},
];

export function HomePage() {
    const navigate = useNavigate();

    return (
        <Flex direction="column" gap={6}>
            <Flex direction="column" gap={2}>
                <Text variant="header-1">Добро пожаловать</Text>
                <Text variant="body-2" color="secondary">
                    Небольшое демо-приложение на Gravity UI: три страницы, боковая навигация
                    и переключение между светлой и тёмной темой.
                </Text>
            </Flex>

            <Flex gap={4} wrap="wrap">
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        view="filled"
                        size="l"
                        style={{flex: '1 1 200px', minWidth: 0}}
                    >
                        <Box spacing={{p: 4}}>
                            <Flex direction="column" gap={1}>
                                <Text variant="display-1">{stat.value}</Text>
                                <Text variant="body-1" color="secondary">
                                    {stat.label}
                                </Text>
                            </Flex>
                        </Box>
                    </Card>
                ))}
            </Flex>

            <Flex gap={3} wrap="wrap">
                <Button view="action" size="l" onClick={() => navigate('/tasks')}>
                    Перейти к задачам
                </Button>
                <Button view="outlined" size="l" onClick={() => navigate('/settings')}>
                    Открыть настройки
                </Button>
            </Flex>
        </Flex>
    );
}
