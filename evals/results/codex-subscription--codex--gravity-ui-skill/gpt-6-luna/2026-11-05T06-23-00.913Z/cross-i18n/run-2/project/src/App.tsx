import {useState} from 'react';
import {I18N} from '@gravity-ui/i18n';
import {Button, configure} from '@gravity-ui/uikit';

import './App.css';

type Language = 'en' | 'ru';

const translations = {
    en: {
        app: {
            documentTitle: 'Language settings',
            eyebrow: 'LANGUAGE SETTINGS',
            title: 'Choose your language',
            description: 'Select the language you want to use across the interface.',
            current: 'Current language',
            english: 'English',
            russian: 'Russian',
            englishNative: 'English',
            russianNative: 'Русский',
            note: 'Your choice is saved on this device.',
        },
    },
    ru: {
        app: {
            documentTitle: 'Настройки языка',
            eyebrow: 'НАСТРОЙКИ ЯЗЫКА',
            title: 'Выберите язык',
            description: 'Выберите язык, на котором будет отображаться интерфейс.',
            current: 'Текущий язык',
            english: 'Английский',
            russian: 'Русский',
            englishNative: 'English',
            russianNative: 'Русский',
            note: 'Выбор сохранится на этом устройстве.',
        },
    },
} satisfies Record<Language, {app: Record<string, string>}>;

function getInitialLanguage(): Language {
    const savedLanguage = window.localStorage.getItem('interface-language');
    if (savedLanguage === 'en' || savedLanguage === 'ru') {
        return savedLanguage;
    }

    return window.navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

const initialLanguage = getInitialLanguage();
const i18n = new I18N({lang: initialLanguage, fallbackLang: 'en'});
i18n.registerKeysets('en', translations.en);
i18n.registerKeysets('ru', translations.ru);
configure({lang: initialLanguage});
document.documentElement.lang = initialLanguage;
document.title = translations[initialLanguage].app.documentTitle;

export function App() {
    const [language, setLanguage] = useState<Language>(initialLanguage);

    const t = i18n.keyset('app');
    const selectLanguage = (nextLanguage: Language) => {
        i18n.setLang(nextLanguage);
        configure({lang: nextLanguage});
        window.localStorage.setItem('interface-language', nextLanguage);
        document.documentElement.lang = nextLanguage;
        document.title = translations[nextLanguage].app.documentTitle;
        setLanguage(nextLanguage);
    };

    return (
        <main className="language-page">
            <section className="language-card" aria-labelledby="language-title">
                <div className="language-card__topline">
                    <span className="language-mark" aria-hidden="true">A</span>
                    <span className="language-eyebrow">{t('eyebrow')}</span>
                </div>

                <h1 className="language-title" id="language-title">{t('title')}</h1>
                <p className="language-description">{t('description')}</p>

                <div className="language-options" role="group" aria-label={t('current')}>
                    <Button
                        className="language-option"
                        view={language === 'en' ? 'outlined-action' : 'outlined'}
                        selected={language === 'en'}
                        aria-pressed={language === 'en'}
                        onClick={() => selectLanguage('en')}
                    >
                        <span className="language-option__code">EN</span>
                        <span className="language-option__name">{t('englishNative')}</span>
                    </Button>
                    <Button
                        className="language-option"
                        view={language === 'ru' ? 'outlined-action' : 'outlined'}
                        selected={language === 'ru'}
                        aria-pressed={language === 'ru'}
                        onClick={() => selectLanguage('ru')}
                    >
                        <span className="language-option__code">RU</span>
                        <span className="language-option__name">{t('russianNative')}</span>
                    </Button>
                </div>

                <div className="language-footer">
                    <span>{t('current')}</span>
                    <strong>{language === 'en' ? t('english') : t('russian')}</strong>
                </div>
                <p className="language-note">{t('note')}</p>
            </section>
        </main>
    );
}
