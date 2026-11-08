import React from 'react';
import { Calendar, DatePicker } from '@gravity-ui/date-components';
import { dateTime, settings } from '@gravity-ui/date-utils';
import type { DateTime } from '@gravity-ui/date-utils';
import { Card, Flex, Text, configure } from '@gravity-ui/uikit';

const DATE_FORMAT = 'DD.MM.YYYY';
const LANG = 'ru';

export function App() {
  const [date, setDate] = React.useState<DateTime | null>(null);
  const [lang, setLang] = React.useState<'en' | typeof LANG>('en');

  // Русская локаль подключается асинхронно. Язык uikit переключаем только после
  // её загрузки: иначе DatePicker попытается прочитать ещё не загруженные
  // данные локали и упадёт. До загрузки компоненты работают на английском.
  React.useEffect(() => {
    let cancelled = false;
    settings
      .loadLocale(LANG)
      .then(() => {
        if (cancelled) return;
        settings.setLocale(LANG);
        configure({ lang: LANG });
        setLang(LANG);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const today = React.useMemo(() => dateTime(), []);

  return (
    <Flex direction="column" gap={6} style={{ padding: 24, maxWidth: 480 }}>
      <Text variant="header-2" as="h1">
        Выбор даты
      </Text>

      <Flex direction="column" gap={2}>
        <Text variant="subheader-2" as="label" htmlFor="date-picker">
          Дата
        </Text>
        <DatePicker
          id="date-picker"
          name="date"
          size="l"
          format={DATE_FORMAT}
          placeholder={DATE_FORMAT}
          hasClear
          value={date}
          onUpdate={setDate}
          aria-label="Выбор даты"
        />
      </Flex>

      <Card view="outlined" style={{ padding: 16, alignSelf: 'flex-start' }}>
        <Calendar
          size="l"
          value={date}
          onUpdate={setDate}
          defaultFocusedValue={today}
          aria-label="Календарь"
        />
      </Card>

      <Text variant="body-2" color={date ? 'primary' : 'secondary'}>
        {date
          ? `Выбрана дата: ${date.locale(lang).format('D MMMM YYYY')} (${date.format(DATE_FORMAT)})`
          : 'Дата не выбрана'}
      </Text>
    </Flex>
  );
}
