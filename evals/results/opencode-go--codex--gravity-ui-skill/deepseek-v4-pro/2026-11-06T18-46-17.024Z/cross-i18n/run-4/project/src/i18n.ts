import { addComponentKeysets } from '@gravity-ui/uikit/i18n';

export type AppLang = 'en' | 'ru';

export const t = addComponentKeysets(
    {
        en: {
            title: 'Interface language',
            hint: 'Choose the language for interface texts',
            english: 'English',
            russian: 'Russian',
            heading: 'Welcome',
            body: 'This interface text is translated between English and Russian.',
        },
        ru: {
            title: 'Язык интерфейса',
            hint: 'Выберите язык текстов интерфейса',
            english: 'Английский',
            russian: 'Русский',
            heading: 'Добро пожаловать',
            body: 'Этот текст интерфейса переводится между русским и английским языками.',
        },
    },
    'app',
);
