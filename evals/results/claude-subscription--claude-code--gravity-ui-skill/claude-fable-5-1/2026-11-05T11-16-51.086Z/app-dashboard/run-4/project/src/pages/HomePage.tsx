import {Text} from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <div className="page">
      <div className="page__header">
        <Text variant="header-1">Главная</Text>
        <Text variant="body-1" color="secondary">
          Добро пожаловать в панель администратора. Выберите раздел в боковой навигации.
        </Text>
      </div>
    </div>
  );
}
