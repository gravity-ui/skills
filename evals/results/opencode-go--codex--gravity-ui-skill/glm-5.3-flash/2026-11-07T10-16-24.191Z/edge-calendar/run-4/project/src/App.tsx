import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTimeParse} from '@gravity-ui/date-utils';

const today = dateTimeParse(new Date());

export function App() {
  const [selectedDate, setSelectedDate] = useState(today);

  return (
    <main style={{padding: 24}}>
      <h1>Выбор даты</h1>
      <p>Выбранная дата: {selectedDate?.format('DD MMMM YYYY')}</p>
      <Calendar value={selectedDate} defaultValue={today} onUpdate={setSelectedDate} aria-label="Выбор даты" />
    </main>
  );
}
