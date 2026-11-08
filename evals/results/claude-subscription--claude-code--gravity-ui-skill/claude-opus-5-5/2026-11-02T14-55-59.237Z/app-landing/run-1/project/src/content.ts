import {
    BannerBlockModel,
    BlockType,
    ExtendedFeaturesBlockModel,
    HeaderBlockModel,
    PageContent,
} from '@gravity-ui/page-constructor';

const hero: HeaderBlockModel = {
    type: BlockType.HeaderBlock,
    overtitle: 'TimeTrack',
    title: 'Учёт рабочего времени команды без лишней рутины',
    description:
        'Сотрудники отмечают время в пару кликов, а вы видите загрузку команды и затраты по проектам в одном отчёте.',
    width: 'm',
    centered: true,
};

const benefits: ExtendedFeaturesBlockModel = {
    type: BlockType.ExtendedFeaturesBlock,
    title: {text: 'Почему команды выбирают TimeTrack'},
    items: [
        {
            title: 'Старт за 5 минут',
            text: 'Пригласите коллег по почте и создайте проекты — без настройки и обучения.',
        },
        {
            title: 'Прозрачная загрузка',
            text: 'Отчёты по людям и проектам показывают, где команда тратит время и кто перегружен.',
        },
        {
            title: 'Точные счета клиентам',
            text: 'Почасовые ставки и выгрузка отчётов для выставления счетов без ручных подсчётов.',
        },
    ],
};

const cta: BannerBlockModel = {
    type: BlockType.BannerBlock,
    title: 'Попробуйте TimeTrack бесплатно',
    subtitle: '14 дней без ограничений и без привязки карты.',
    color: 'var(--g-color-base-generic)',
    button: {text: 'Начать бесплатно', url: '/signup', theme: 'action'},
};

export const content: PageContent = {
    animated: false,
    blocks: [hero, benefits, cta],
};
