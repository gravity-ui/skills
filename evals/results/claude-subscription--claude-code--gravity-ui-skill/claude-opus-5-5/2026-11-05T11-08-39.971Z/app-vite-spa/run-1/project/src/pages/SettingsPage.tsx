import { useState } from 'react';
import { Card, Divider, Flex, SegmentedRadioGroup, Switch, Text } from '@gravity-ui/uikit';

import type { AppTheme } from '../theme';

interface SettingsPageProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  const [notifications, setNotifications] = useState(true);
  const [digest, setDigest] = useState(false);

  return (
    <Flex className="app-page" direction="column" gap={6}>
      <Text variant="header-1">Настройки</Text>

      <Card view="outlined" size="l">
        <Flex direction="column" gap={5} spacing={{ p: 5 }}>
          <Flex direction="column" gap={3}>
            <Text variant="subheader-3">Оформление</Text>
            <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
              <Flex direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
                <Text variant="body-2">Тема интерфейса</Text>
                <Text variant="body-1" color="secondary">
                  Выбор сохраняется в браузере
                </Text>
              </Flex>
              <SegmentedRadioGroup<AppTheme>
                size="l"
                value={theme}
                onUpdate={onThemeChange}
                aria-label="Тема интерфейса"
                style={{ flexShrink: 0 }}
              >
                <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
                <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
              </SegmentedRadioGroup>
            </Flex>
          </Flex>

          <Divider />

          <Flex direction="column" gap={3}>
            <Text variant="subheader-3">Уведомления</Text>
            <Switch
              size="l"
              checked={notifications}
              onUpdate={setNotifications}
              content="Уведомления о новых задачах"
            />
            <Switch
              size="l"
              checked={digest}
              onUpdate={setDigest}
              content="Еженедельная сводка на почту"
            />
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
