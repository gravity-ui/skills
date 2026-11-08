import {useState} from 'react';
import {I18N} from '@gravity-ui/i18n';
import {Button, configure} from '@gravity-ui/uikit';

import './App.css';

const translations = new I18N({
    lang: 'en',
    data: {
        en: {
            app: {
                eyebrow: 'LANGUAGE SETTINGS',
                title: 'Choose your language',
                description: 'The interface language can be changed at any time.',
                label: 'Interface language',
                english: 'English',
                russian: 'Russian',
                current: 'Current language',
                footer: 'Your preference applies to the entire interface.',
            },
        },
        ru: {
            app: {
                eyebrow: 'НАСТРОЙКИ ЯЗЫКА',
                title: 'Выберите язык',
                description: 'Язык интерфейса можно изменить в любое время.',
                label: 'Язык интерфейса',
                english: 'Английский',
                russian: 'Русский',
                current: 'Текущий язык',
                footer: 'Выбранный язык применяется ко всему интерфейсу.',
            },
        },
    },
});

export function App() {
    const [lang, setLang] = useState<'en' | 'ru'>(() => {
        const savedLang = window.localStorage.getItem('interface-language');
        return savedLang === 'ru' ? 'ru' : 'en';
    });
    const t = translations.keyset('app');

    const changeLanguage = (nextLang: 'en' | 'ru') => {
        setLang(nextLang);
        translations.setLang(nextLang);
        configure({lang: nextLang});
        window.localStorage.setItem('interface-language', nextLang);
    };

    return (
        <main className="language-page" lang={lang}>
            <section className="language-card" aria-labelledby="language-title">
                <div className="language-card__topline">
                    <span className="language-card__mark" aria-hidden="true">文</span>
                    <span className="language-card__eyebrow">{t('eyebrow')}</span>
                </div>

                <h1 id="language-title" className="language-card__title">{t('title')}</h1>
                <p className="language-card__description">{t('description')}</p>

                <div className="language-control">
                    <span className="language-control__label">{t('label')}</span>
                    <div className="language-control__options" role="group" aria-label={t('label')}>
                        <Button
                            className="language-control__button"
                            view={lang === 'en' ? 'outlined-action' : 'outlined'}
                            selected={lang === 'en'}
                            aria-pressed={lang === 'en'}
                            onClick={() => changeLanguage('en')}
                        >
                            English
                        </Button>
                        <Button
                            className="language-control__button"
                            view={lang === 'ru' ? 'outlined-action' : 'outlined'}
                            selected={lang === 'ru'}
                            aria-pressed={lang === 'ru'}
                            onClick={() => changeLanguage('ru')}
                        >
                            Русский
                        </Button>
                    </div>
                </div>

                <div className="language-status" aria-live="polite">
                    <span className="language-status__label">{t('current')}</span>
                    <span className="language-status__value">{lang === 'en' ? t('english') : t('russian')}</span>
                </div>

                <p className="language-card__footer">{t('footer')}</p>
            </section>
        </main>
    );
}
