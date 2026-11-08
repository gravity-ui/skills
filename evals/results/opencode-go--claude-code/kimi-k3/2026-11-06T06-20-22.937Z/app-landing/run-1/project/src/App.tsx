import {Button, Card, Flex, Icon, Text} from '@gravity-ui/uikit';
import {ChartColumn, Clock, Persons} from '@gravity-ui/icons';

const benefits = [
    {
        icon: Clock,
        title: 'Таймер в один клик',
        text: 'Запускайте учёт времени прямо из задачи — без обязательных полей и сложных настроек.',
    },
    {
        icon: ChartColumn,
        title: 'Отчёты за секунды',
        text: 'Сводки по проектам, людям и периодам — для планирования загрузки и выставления счетов.',
    },
    {
        icon: Persons,
        title: 'Прозрачность без контроля',
        text: 'Видно, кто над чем работает, — без микроменеджмента и ручных статусов в чатах.',
    },
];

export function App() {
    return (
        <div style={{maxWidth: 960, margin: '0 auto', padding: '0 24px'}}>
            {/* Hero */}
            <Flex
                direction="column"
                alignItems="center"
                gap={6}
                style={{padding: '96px 0', textAlign: 'center'}}
            >
                <Text variant="display-3">Учёт времени команды без лишних усилий</Text>
                <Text variant="body-3" color="secondary" style={{maxWidth: 560}}>
                    Хроно — простой трекер времени для небольших команд: запускайте таймер,
                    собирайте отчёты и понимайте, куда уходят часы.
                </Text>
                <Button view="action" size="xl" href="#cta">
                    Начать бесплатно
                </Button>
            </Flex>

            {/* Преимущества */}
            <Flex gap={5} wrap="wrap" style={{paddingBottom: 96}}>
                {benefits.map(({icon, title, text}) => (
                    <Card
                        key={title}
                        view="outlined"
                        style={{flex: '1 1 240px', padding: 24}}
                    >
                        <Flex direction="column" gap={3}>
                            <Icon data={icon} size={24} />
                            <Text variant="subheader-3">{title}</Text>
                            <Text variant="body-2" color="secondary">
                                {text}
                            </Text>
                        </Flex>
                    </Card>
                ))}
            </Flex>

            {/* CTA */}
            <Flex
                id="cta"
                direction="column"
                alignItems="center"
                gap={6}
                style={{padding: '64px 0 96px', textAlign: 'center'}}
            >
                <Text variant="display-1">Начните учитывать время уже сегодня</Text>
                <Button view="action" size="xl" href="#">
                    Попробовать бесплатно
                </Button>
            </Flex>
        </div>
    );
}
