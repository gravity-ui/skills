import { useEffect, useState } from 'react';
import { DatePicker } from '@gravity-ui/date-components';
import { Text } from '@gravity-ui/uikit';
import { dateTime, settings } from '@gravity-ui/date-utils';

const DATE_FORMAT = 'DD.MM.YYYY';

export function App() {
    const [value, setValue] = useState<ReturnType<typeof dateTime> | null>(null);
    const [localeReady, setLocaleReady] = useState(false);

    useEffect(() => {
        settings.loadLocale('ru').then(() => setLocaleReady(true));
    }, []);

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
            <Text variant="header-1">Выбор даты</Text>
            <DatePicker
                value={value}
                onUpdate={setValue}
                format={DATE_FORMAT}
                timeZone="default"
                placeholder="Выберите дату"
                hasClear
            />
            {value && (
                <Text color="secondary">
                    Выбрано: {localeReady ? value.format(DATE_FORMAT) : value.toISOString()}
                </Text>
            )}
        </div>
    );
}
