import {
    BlockType,
    PageConstructor,
    PageConstructorProvider,
    PageContent,
    Theme,
} from '@gravity-ui/page-constructor';
import '@gravity-ui/page-constructor/styles/styles.scss';

import './App.css';

const SIGNUP_URL = '/signup';

const content: PageContent = {
    animated: false,
    blocks: [
        {
            type: BlockType.HeaderBlock,
            overtitle: 'Учёт времени для команд',
            title: 'Знайте, куда уходит рабочее время команды',
            description:
                'Простой трекер, который показывает загрузку людей и проектов без таблиц и ручных отчётов.',
            width: 'm',
            centered: true,
        },
        {
            type: BlockType.ExtendedFeaturesBlock,
            title: {text: 'Почему команды выбирают нас'},
            items: [
                {
                    title: 'Старт за минуту',
                    text: 'Пригласите коллег по ссылке и запускайте таймер — без настройки и обучения.',
                },
                {
                    title: 'Прозрачная загрузка',
                    text: 'Видно, сколько часов ушло на каждый проект и задачу, по дням и по людям.',
                },
                {
                    title: 'Отчёты в один клик',
                    text: 'Выгрузите отчёт для клиента или руководителя за любой период в CSV или PDF.',
                },
            ],
        },
        {
            type: BlockType.BannerBlock,
            title: 'Начните учитывать время уже сегодня',
            subtitle: '14 дней бесплатно, без привязки карты.',
            color: 'var(--g-color-base-generic)',
            button: {text: 'Попробовать бесплатно', url: SIGNUP_URL, theme: 'action'},
        },
    ],
};

export function App() {
    return (
        <PageConstructorProvider theme={Theme.Light} locale={{lang: 'ru'}}>
            <PageConstructor content={content} />
        </PageConstructorProvider>
    );
}
