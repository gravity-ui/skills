import {useEffect, useMemo, useState} from 'react';
import {I18N} from '@gravity-ui/i18n';
import {Button, configure, Text} from '@gravity-ui/uikit';
import './App.css';

type Language = 'en' | 'ru';

const translations = {
    en: {
        app: {
            eyebrow: 'PREFERENCES',
            title: 'Language',
            description: 'Choose the language you want to use across the interface.',
            currentLanguage: 'Current language',
            english: 'English',
            russian: 'Russian',
            selected: 'English is selected',
            note: 'Your choice is saved on this device and applied the next time you visit.',
            preview: 'Interface preview',
            welcome: 'Welcome back',
            welcomeDescription: 'Your workspace is ready when you are.',
            action: 'Explore workspace',
            footer: 'LANGUAGE SETTINGS',
        },
    },
    ru: {
        app: {
            eyebrow: 'НАСТРОЙКИ',
            title: 'Язык интерфейса',
            description: 'Выберите язык, на котором будет отображаться интерфейс.',
            currentLanguage: 'Текущий язык',
            english: 'Английский',
            russian: 'Русский',
            selected: 'Выбран русский язык',
            note: 'Выбор сохранится на этом устройстве и применится при следующем визите.',
            preview: 'Предпросмотр интерфейса',
            welcome: 'С возвращением',
            welcomeDescription: 'Ваше рабочее пространство уже готово.',
            action: 'Открыть пространство',
            footer: 'НАСТРОЙКИ ЯЗЫКА',
        },
    },
} as const;

function getInitialLanguage(): Language {
    try {
        const language = window.localStorage.getItem('interface-language') === 'ru' ? 'ru' : 'en';
        configure({lang: language});
        return language;
    } catch {
        configure({lang: 'en'});
        return 'en';
    }
}

export function App() {
    const [language, setLanguage] = useState<Language>(getInitialLanguage);
    const i18n = useMemo(() => {
        const instance = new I18N({lang: language, fallbackLang: 'en'});
        instance.registerKeysets('en', translations.en);
        instance.registerKeysets('ru', translations.ru);
        return instance;
    }, []);
    const t = i18n.keyset('app');

    useEffect(() => {
        i18n.setLang(language);
        configure({lang: language});
        document.documentElement.lang = language;
        try {
            window.localStorage.setItem('interface-language', language);
        } catch {
            // The language switch still works when browser storage is unavailable.
        }
    }, [i18n, language]);

    return (
        <main className="language-page">
            <div className="language-page__topbar">
                <a className="language-page__brand" href="#home" aria-label="Gravity home">
                    <span className="language-page__brand-mark" aria-hidden="true">g</span>
                    <span>gravity</span>
                </a>
                <span className="language-page__topbar-label">{t('eyebrow')}</span>
            </div>

            <div className="language-page__content">
                <section className="language-card" aria-labelledby="language-title">
                    <div className="language-card__icon" aria-hidden="true">文</div>
                    <Text id="language-title" variant="header-1" className="language-card__title">
                        {t('title')}
                    </Text>
                    <Text variant="body-1" color="secondary" className="language-card__description">
                        {t('description')}
                    </Text>

                    <div className="language-card__field">
                        <Text variant="subheader-2" className="language-card__label">
                            {t('currentLanguage')}
                        </Text>
                        <div className="language-switch" role="group" aria-label={t('currentLanguage')}>
                            <Button
                                view={language === 'en' ? 'outlined' : 'flat'}
                                aria-pressed={language === 'en'}
                                onClick={() => setLanguage('en')}
                            >
                                <span className="language-switch__flag" aria-hidden="true">🇬🇧</span>
                                English
                            </Button>
                            <Button
                                view={language === 'ru' ? 'outlined' : 'flat'}
                                aria-pressed={language === 'ru'}
                                onClick={() => setLanguage('ru')}
                            >
                                <span className="language-switch__flag" aria-hidden="true">🇷🇺</span>
                                Русский
                            </Button>
                        </div>
                    </div>

                    <div className="language-card__status" role="status" aria-live="polite">
                        <span className="language-card__status-dot" aria-hidden="true" />
                        {t('selected')}
                    </div>
                    <Text variant="caption-1" color="secondary" className="language-card__note">
                        {t('note')}
                    </Text>
                </section>

                <section className="preview-card" aria-label={t('preview')}>
                    <div className="preview-card__header">
                        <Text variant="caption-1" color="secondary">{t('preview')}</Text>
                        <span className="preview-card__dots" aria-hidden="true"><i /><i /><i /></span>
                    </div>
                    <div className="preview-card__body">
                        <div className="preview-card__avatar" aria-hidden="true">G</div>
                        <div className="preview-card__copy">
                            <Text variant="subheader-2">{t('welcome')}</Text>
                            <Text variant="body-2" color="secondary">{t('welcomeDescription')}</Text>
                        </div>
                    </div>
                    <Button view="action" size="m" style={{width: '100%', justifyContent: 'space-between'}}>
                        {t('action')} <span aria-hidden="true">↗</span>
                    </Button>
                </section>
            </div>
            <footer className="language-page__footer">GRAVITY UI <span>·</span> {t('footer')}</footer>
        </main>
    );
}
