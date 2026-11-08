import React from 'react';

import {Calendar} from '@gravity-ui/date-components';
import {dateTime, settings} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Button, Card, Text, configure} from '@gravity-ui/uikit';

import './App.css';

configure({lang: 'ru'});

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function App() {
    const [localeReady, setLocaleReady] = React.useState(settings.getLocale() === 'ru');
    const [value, setValue] = React.useState<DateTime | null>(null);
    const [focusedValue, setFocusedValue] = React.useState<DateTime | null>(dateTime());

    React.useEffect(() => {
        let active = true;
        settings
            .loadLocale('ru')
            .then(() => settings.setLocale('ru'))
            .catch(() => undefined)
            .finally(() => {
                if (active) {
                    setLocaleReady(true);
                }
            });
        return () => {
            active = false;
        };
    }, []);

    const handleToday = () => {
        const today = dateTime();
        setValue(today);
        setFocusedValue(today);
    };

    const handleReset = () => {
        setValue(null);
    };

    return (
        <div className="page">
            <Text variant="display-1" as="h1">
                Выбор даты
            </Text>

            <Card view="raised" className="calendar-card">
                {localeReady ? (
                    <Calendar
                        value={value}
                        onUpdate={setValue}
                        focusedValue={focusedValue}
                        onFocusUpdate={setFocusedValue}
                        size="l"
                        autoFocus
                    />
                ) : null}
                <div className="calendar-card__actions">
                    <Button view="outlined" size="l" onClick={handleToday}>
                        Сегодня
                    </Button>
                    <Button view="flat" size="l" disabled={!value} onClick={handleReset}>
                        Сбросить
                    </Button>
                </div>
            </Card>

            <Text variant="body-2" color="secondary">
                {value
                    ? `Выбрана дата: ${capitalize(value.format('dddd, D MMMM YYYY'))} г.`
                    : 'Дата не выбрана — нажмите на день в календаре'}
            </Text>
        </div>
    );
}
