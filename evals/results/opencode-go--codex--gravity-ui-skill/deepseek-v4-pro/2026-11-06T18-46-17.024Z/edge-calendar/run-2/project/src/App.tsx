import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTime} from '@gravity-ui/date-utils';

export function App() {
    const [selectedDate, setSelectedDate] = useState(() => dateTime());

    return (
        <div style={{padding: 24}}>
            <h2>Выберите дату</h2>
            <Calendar
                value={selectedDate}
                onUpdate={(value) => {
                    if (value) setSelectedDate(value);
                }}
            />
            <p style={{marginTop: 16}}>Выбрано: {selectedDate.format('DD.MM.YYYY')}</p>
        </div>
    );
}
