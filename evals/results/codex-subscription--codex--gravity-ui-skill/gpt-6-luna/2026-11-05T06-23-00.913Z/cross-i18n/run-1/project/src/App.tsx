import {useEffect, useState} from 'react';
import {I18N} from '@gravity-ui/i18n';
import {Button, Text, configure} from '@gravity-ui/uikit';
import './App.css';

type Language = 'en' | 'ru';

const translations = {
    en: {
        app: {
            product: 'Northstar',
            documentTitle: 'Northstar — Workspace settings',
            workspace: 'Workspace',
            settings: 'Settings',
            account: 'Account',
            preferences: 'Preferences',
            title: 'Make it yours',
            description: 'Choose how Northstar looks and feels when you work.',
            languageLabel: 'Interface language',
            languageDescription: 'Select the language used across the application.',
            english: 'English',
            russian: 'Русский',
            saved: 'Your preference is saved automatically.',
            preview: 'A little preview',
            previewTitle: 'Everything in your language',
            previewDescription: 'Menus, buttons, and helpful messages will follow your choice.',
            currentLanguage: 'Current language',
        },
    },
    ru: {
        app: {
            product: 'Northstar',
            documentTitle: 'Northstar — Настройки пространства',
            workspace: 'Рабочее пространство',
            settings: 'Настройки',
            account: 'Аккаунт',
            preferences: 'Предпочтения',
            title: 'Настройте под себя',
            description: 'Выберите, как будет выглядеть Northstar во время работы.',
            languageLabel: 'Язык интерфейса',
            languageDescription: 'Выберите язык, который будет использоваться в приложении.',
            english: 'English',
            russian: 'Русский',
            saved: 'Выбор сохраняется автоматически.',
            preview: 'Предварительный просмотр',
            previewTitle: 'Всё на вашем языке',
            previewDescription: 'Меню, кнопки и подсказки будут отображаться на выбранном языке.',
            currentLanguage: 'Текущий язык',
        },
    },
} as const;

const i18n = new I18N();
i18n.registerKeysets('en', translations.en);
i18n.registerKeysets('ru', translations.ru);
const t = i18n.keyset('app');

function getInitialLanguage(): Language {
    const savedLanguage = window.localStorage.getItem('northstar-language');
    const initialLanguage = savedLanguage === 'en' || savedLanguage === 'ru'
        ? savedLanguage
        : window.navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
    i18n.setLang(initialLanguage);
    configure({lang: initialLanguage});
    document.documentElement.lang = initialLanguage;
    return initialLanguage;
}

export function App() {
    const [language, setLanguage] = useState<Language>(getInitialLanguage);

    useEffect(() => {
        i18n.setLang(language);
        configure({lang: language});
        document.documentElement.lang = language;
        document.title = t('documentTitle');
        window.localStorage.setItem('northstar-language', language);
    }, [language, t]);

    const changeLanguage = (nextLanguage: Language) => {
        i18n.setLang(nextLanguage);
        configure({lang: nextLanguage});
        setLanguage(nextLanguage);
    };

    return (
        <div className="app-shell">
            <header className="topbar">
                <a className="brand" href="#workspace" aria-label={t('product')}>
                    <span className="brand-mark" aria-hidden="true">N</span>
                    <span>{t('product')}</span>
                </a>
                <nav className="topbar-nav" aria-label={t('workspace')}>
                    <a className="nav-link nav-link-active" href="#workspace">{t('workspace')}</a>
                    <a className="nav-link" href="#account">{t('account')}</a>
                </nav>
                <div className="topbar-end">
                    <span className="avatar" aria-hidden="true">A</span>
                </div>
            </header>

            <main className="page-content" id="workspace">
                <div className="breadcrumb">{t('workspace')} <span aria-hidden="true">/</span> {t('settings')}</div>
                <section className="page-heading" aria-labelledby="page-title">
                    <div>
                        <Text variant="header-1" className="page-title" id="page-title">{t('title')}</Text>
                        <Text variant="body-2" className="page-description">{t('description')}</Text>
                    </div>
                    <span className="heading-orbit" aria-hidden="true"><span /></span>
                </section>

                <div className="settings-layout">
                    <aside className="settings-sidebar" aria-label={t('settings')}>
                        <div className="sidebar-label">{t('settings')}</div>
                        <div className="sidebar-item sidebar-item-active">
                            <span className="sidebar-dot" aria-hidden="true" />
                            {t('preferences')}
                        </div>
                    </aside>

                    <div className="settings-main">
                        <section className="settings-card" aria-labelledby="language-title">
                            <div className="card-heading">
                                <div>
                                    <Text variant="subheader-1" className="card-title" id="language-title">{t('languageLabel')}</Text>
                                    <Text variant="body-2" className="card-description">{t('languageDescription')}</Text>
                                </div>
                                <span className="language-glyph" aria-hidden="true">文</span>
                            </div>

                            <div className="language-options" role="group" aria-label={t('languageLabel')}>
                                <Button
                                    className="language-option"
                                    view={language === 'en' ? 'outlined-action' : 'outlined'}
                                    selected={language === 'en'}
                                    aria-pressed={language === 'en'}
                                    onClick={() => changeLanguage('en')}
                                >
                                    <span className="language-code">EN</span>
                                    <span>{t('english')}</span>
                                    {language === 'en' && <span className="selected-mark" aria-hidden="true">✓</span>}
                                </Button>
                                <Button
                                    className="language-option"
                                    view={language === 'ru' ? 'outlined-action' : 'outlined'}
                                    selected={language === 'ru'}
                                    aria-pressed={language === 'ru'}
                                    onClick={() => changeLanguage('ru')}
                                >
                                    <span className="language-code">RU</span>
                                    <span>{t('russian')}</span>
                                    {language === 'ru' && <span className="selected-mark" aria-hidden="true">✓</span>}
                                </Button>
                            </div>
                            <div className="save-note"><span className="save-dot" aria-hidden="true" />{t('saved')}</div>
                        </section>

                        <section className="preview-card" aria-labelledby="preview-title">
                            <div className="preview-copy">
                                <div className="preview-eyebrow">{t('preview')}</div>
                                <Text variant="subheader-1" className="preview-title" id="preview-title">{t('previewTitle')}</Text>
                                <Text variant="body-2" className="preview-description">{t('previewDescription')}</Text>
                            </div>
                            <div className="preview-locale">
                                <span className="preview-locale-label">{t('currentLanguage')}</span>
                                <span className="preview-locale-value"><span className="locale-dot" />{language.toUpperCase()}</span>
                            </div>
                            <div className="preview-decoration" aria-hidden="true"><span /><span /><span /></div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
