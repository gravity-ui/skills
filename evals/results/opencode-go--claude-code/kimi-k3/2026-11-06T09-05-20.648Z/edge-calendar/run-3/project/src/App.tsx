import React from 'react';
import {Card, Text} from '@gravity-ui/uikit';

import {Calendar} from './Calendar';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {dateStyle: 'long'});

export function App() {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                padding: 24,
            }}
        >
            <Card type="container" size="l">
                <Calendar value={selectedDate} onChange={setSelectedDate} />
            </Card>

            <Text variant="body-2" color="secondary">
                {selectedDate
                    ? `Выбранная дата: ${dateFormatter.format(selectedDate)}`
                    : 'Дата не выбрана'}
            </Text>
        </div>
    );
}
