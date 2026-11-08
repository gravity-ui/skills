import {Switch, Text} from '@gravity-ui/uikit';

interface SettingsPageProps {
  compact: boolean;
  onChangeCompact: (compact: boolean) => void;
}

export function SettingsPage({compact, onChangeCompact}: SettingsPageProps) {
  return (
    <div className="page">
      <div className="page__header">
        <Text variant="header-1">Настройки</Text>
        <Text variant="body-1" color="secondary">
          Параметры интерфейса администратора.
        </Text>
      </div>
      <Switch
        size="m"
        checked={compact}
        onUpdate={onChangeCompact}
        content="Сворачивать боковую навигацию в иконки"
      />
    </div>
  );
}
