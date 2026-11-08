import {I18N} from '@gravity-ui/i18n';

const en = {
    app: {
        title: 'Interface language',
        description: 'Switch the application interface between English and Russian.',
        language: 'Language',
        note: 'Gravity UI components update their built-in labels automatically.',
        cta: 'Open settings',
        select_placeholder: 'Choose a value',
    },
};

const ru = {
    app: {
        title: 'Язык интерфейса',
        description: 'Переключите интерфейс приложения между английским и русским языком.',
        language: 'Язык',
        note: 'Встроенные надписи компонентов Gravity UI обновляются автоматически.',
        cta: 'Открыть настройки',
        select_placeholder: 'Выберите значение',
    },
};

export const i18n = new I18N({
    lang: 'en',
    fallbackLang: 'en',
    data: {
        en,
        ru,
    },
});

export const app = i18n.keyset('app');
