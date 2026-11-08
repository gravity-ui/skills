import {Card, Switch, Text} from '@gravity-ui/uikit';

import type {Theme} from '../theme';

interface SettingsPageProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function SettingsPage({theme, onThemeChange}: SettingsPageProps) {
  return (
    <div className="page">
      <Text variant="header-1">Настройки</Text>
      <Text variant="body-2" color="secondary">
        Выбор темы сохраняется в браузере и применяется при следующем визите.
      </Text>

      <Card view="raised" className="page__card">
        <div className="settings__row">
          <div>
            <Text variant="subheader-2">Тёмная тема</Text>
            <Text variant="body-2" color="secondary">
              Сейчас активна: {theme === 'dark' ? 'тёмная 🌙' : 'светлая ☀️'}
            </Text>
          </div>
          <Switch
            size="l"
            checked={theme === 'dark'}
            onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
            aria-label="Переключить тёмную тему"
          />
        </div>
      </Card>
    </div>
  );
}
