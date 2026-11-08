import { useEffect, useState } from 'react';
import { Button, Flex, Text } from '@gravity-ui/uikit';
import { Calendar } from '@gravity-ui/date-components';
import { settings, type DateTime } from '@gravity-ui/date-utils';

export function App() {
  const [date, setDate] = useState<DateTime | null>(null);
  const [localeReady, setLocaleReady] = useState(settings.getLocale() === 'ru');

  useEffect(() => {
    if (localeReady) return;
    let cancelled = false;
    settings
      .loadLocale('ru')
      .then(() => {
        settings.setLocale('ru');
        if (!cancelled) setLocaleReady(true);
      })
      .catch(() => {
        // Russian locale is optional: fall back to the default locale.
      });
    return () => {
      cancelled = true;
    };
  }, [localeReady]);

  return (
    <Flex direction="column" gap={4} style={{ padding: 24, maxWidth: 360 }}>
      <Text variant="header-1" as="h1">
        Выбор даты
      </Text>

      <Calendar
        key={localeReady ? 'ru' : 'default'}
        value={date}
        onUpdate={setDate}
        aria-label="Календарь для выбора даты"
      />

      <Flex alignItems="center" gap={3}>
        <Text variant="body-2" data-testid="selected-date">
          {date ? `Выбрана дата: ${date.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
        </Text>
        {date && (
          <Button view="flat" size="s" onClick={() => setDate(null)}>
            Сбросить
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
