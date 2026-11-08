import {Button, Card, Flex, Text} from '@gravity-ui/uikit';
import {House} from '@gravity-ui/icons';

type HomePageProps = {
    onNavigate: (page: 'projects' | 'settings') => void;
};

export function HomePage({onNavigate}: HomePageProps) {
    return (
        <>
            <div className="hero">
                <Flex direction="column" gap="2">
                    <Text variant="header-1" color="primary">
                        Gravity Workspace
                    </Text>
                    <Text variant="body-1" color="secondary">
                        Небольшое приложение с навигацией, карточками и переключателем темы.
                    </Text>
                </Flex>
                <Flex className="hero-actions" gap="3" wrap>
                    <Button view="action" size="l" onClick={() => onNavigate('projects')}>
                        Открыть проекты
                    </Button>
                    <Button view="outlined" size="l" onClick={() => onNavigate('settings')}>
                        Настройки
                    </Button>
                </Flex>
            </div>
            <div className="card-grid">
                {[
                    {
                        title: 'Навигация',
                        description: 'Три страницы соединены вкладками и состояниями приложения.',
                    },
                    {
                        title: 'Темы',
                        description: 'Светлая и тёмная темы переключаются и сохраняются в браузере.',
                    },
                    {
                        title: 'Дизайн-система',
                        description: 'Интерфейс собран на компонентах Gravity UI и токенах.',
                    },
                ].map((item) => (
                    <Card key={item.title} type="container" view="filled" size="l">
                        <div className="card-content">
                            <Text variant="header-2">{item.title}</Text>
                            <Text variant="body-2" color="secondary">
                                {item.description}
                            </Text>
                            <Button view="flat-action" size="s" onClick={() => onNavigate('projects')}>
                                Подробнее
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
}

export {House as HomeIcon};
