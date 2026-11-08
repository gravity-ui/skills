import {Button, Card, Flex, Text} from '@gravity-ui/uikit';
import {ChartColumn, Clock, Person} from '@gravity-ui/icons';

const benefits = [
    {
        icon: Clock,
        title: 'Таймер в один клик',
        text: 'Сотрудник нажимает «Старт» — и время пошло. Никаких таблиц и ручных записей в конце дня.',
    },
    {
        icon: ChartColumn,
        title: 'Прозрачные отчёты',
        text: 'Смотрите, сколько часов уходит на каждый проект и задачу, и находите, где команда теряет время.',
    },
    {
        icon: Person,
        title: 'Без микроменеджмента',
        text: 'Команда сама ведёт учёт за пару минут в день — никакой слежки, скриншотов и лишнего контроля.',
    },
];

export function App() {
    return (
        <Flex direction="column" alignItems="center" gap={0} style={{padding: '0 24px 96px'}}>
            {/* Hero */}
            <Flex
                direction="column"
                alignItems="center"
                gap={5}
                style={{maxWidth: 720, textAlign: 'center', padding: '96px 0 80px'}}
            >
                <Text variant="display-3" as="h1">
                    Учёт времени команды без лишней возни
                </Text>
                <Text variant="body-3" color="secondary">
                    ТаймТрек — простой инструмент, который показывает, куда уходят часы вашей
                    команды, и помогает планировать загрузку без догадок.
                </Text>
            </Flex>

            {/* Преимущества */}
            <Flex
                gap={5}
                style={{
                    maxWidth: 960,
                    width: '100%',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    paddingBottom: 80,
                }}
            >
                {benefits.map(({icon: Icon, title, text}) => (
                    <Card
                        key={title}
                        view="outlined"
                        style={{flex: '1 1 260px', maxWidth: 300, padding: 24}}
                    >
                        <Flex direction="column" gap={3}>
                            <Icon width={24} height={24} />
                            <Text variant="subheader-2">{title}</Text>
                            <Text variant="body-2" color="secondary">
                                {text}
                            </Text>
                        </Flex>
                    </Card>
                ))}
            </Flex>

            {/* CTA */}
            <Flex direction="column" alignItems="center" gap={5} style={{textAlign: 'center'}}>
                <Text variant="display-1" as="h2">
                    Попробуйте ТаймТрек бесплатно
                </Text>
                <Text variant="body-2" color="secondary" style={{maxWidth: 480}}>
                    14 дней полного доступа, без привязки карты.
                </Text>
                <Button view="action" size="xl" href="#">
                    Начать бесплатно
                </Button>
            </Flex>
        </Flex>
    );
}
