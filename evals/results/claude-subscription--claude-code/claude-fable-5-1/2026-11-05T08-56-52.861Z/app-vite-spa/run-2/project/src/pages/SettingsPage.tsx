import { RadioGroup, Switch, Text } from '@gravity-ui/uikit';
import type { AppTheme } from '../theme';

interface SettingsPageProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  return (
    <div className="page">
      <Text variant="display-2" as="h1">
        Настройки
      </Text>
      <Text variant="body-2" color="secondary" as="p">
        Выберите оформление приложения.
      </Text>

      <section className="settings__section">
        <Switch
          size="l"
          checked={theme === 'dark'}
          onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
          content="Тёмная тема"
        />
      </section>

      <section className="settings__section">
        <Text variant="subheader-1" as="h2">
          Или явно
        </Text>
        <RadioGroup
          value={theme}
          onUpdate={(value) => onThemeChange(value as AppTheme)}
          direction="vertical"
          options={[
            { value: 'light', content: 'Светлая' },
            { value: 'dark', content: 'Тёмная' },
          ]}
        />
      </section>
    </div>
  );
}
